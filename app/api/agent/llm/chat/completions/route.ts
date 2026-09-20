import { timingSafeEqual } from "node:crypto";
import { buildSystemPrompt } from "@/lib/agent/knowledge";

export const dynamic = "force-dynamic";

/**
 * OpenAI-compatible "custom LLM" endpoint that the ElevenLabs agent calls on every
 * turn. It adds the Livesites system prompt, forwards the conversation and tool
 * definitions to OpenAI with our key, and streams OpenAI's SSE straight back.
 */

const SYSTEM_PROMPT = buildSystemPrompt();

interface ChatMessage {
  role: string;
  content?: unknown;
  [key: string]: unknown;
}

interface IncomingBody {
  messages?: ChatMessage[];
  tools?: unknown[];
  tool_choice?: unknown;
  parallel_tool_calls?: boolean;
  max_tokens?: number;
}

function authorized(header: string | null) {
  const secret = process.env.AGENT_LLM_SECRET;
  if (!secret || !header) return false;
  const given = Buffer.from(header.replace(/^Bearer\s+/i, ""));
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

const textOf = (content: unknown) =>
  typeof content === "string"
    ? content
    : Array.isArray(content)
      ? content.map((part) => (part && typeof part === "object" && "text" in part ? String(part.text) : "")).join("")
      : "";

/** Our prompt goes first (a stable, cacheable prefix); anything ElevenLabs put in its own system message follows it. */
function withSystemPrompt(messages: ChatMessage[]): ChatMessage[] {
  const [first, ...rest] = messages;
  if (first?.role === "system") {
    const extra = textOf(first.content).trim();
    return [{ role: "system", content: extra ? `${SYSTEM_PROMPT}\n\n${extra}` : SYSTEM_PROMPT }, ...rest];
  }
  return [{ role: "system", content: SYSTEM_PROMPT }, ...messages];
}

function json(status: number, message: string) {
  return Response.json({ error: { message } }, { status });
}

export async function POST(req: Request) {
  if (!authorized(req.headers.get("authorization"))) return json(401, "Unauthorized");
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return json(503, "OPENAI_API_KEY is not set");

  let body: IncomingBody;
  try {
    body = (await req.json()) as IncomingBody;
  } catch {
    return json(400, "Invalid JSON");
  }

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const tools = Array.isArray(body.tools) && body.tools.length > 0 ? body.tools : undefined;
  const payload = {
    model,
    messages: withSystemPrompt(Array.isArray(body.messages) ? body.messages : []),
    stream: true,
    max_completion_tokens: Math.min(Math.max(body.max_tokens ?? 400, 64), 800),
    ...(tools ? { tools, tool_choice: body.tool_choice ?? "auto", parallel_tool_calls: body.parallel_tool_calls ?? true } : {}),
    // non-reasoning models: a little warmth; reasoning models: keep thinking minimal for latency
    ...(model.startsWith("gpt-4") ? { temperature: 0.6 } : {}),
    ...(process.env.OPENAI_REASONING_EFFORT ? { reasoning_effort: process.env.OPENAI_REASONING_EFFORT } : {}),
  };

  const started = performance.now();
  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
  const upstream = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: req.signal,
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text();
    console.error(`[agent-llm] OpenAI ${upstream.status}: ${detail}`);
    return json(upstream.status || 502, "Upstream LLM error");
  }

  // Log time to first token so latency can be tracked per turn.
  const decoder = new TextDecoder();
  let firstTokenAt = 0;
  const timing = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      if (!firstTokenAt) {
        const text = decoder.decode(chunk, { stream: true });
        if (/"content":"[^"]|"tool_calls"/.test(text)) firstTokenAt = performance.now();
      }
      controller.enqueue(chunk);
    },
    flush() {
      const ttft = firstTokenAt ? Math.round(firstTokenAt - started) : -1;
      console.info(`[agent-llm] model=${model} ttft=${ttft}ms total=${Math.round(performance.now() - started)}ms`);
    },
  });

  return new Response(upstream.body.pipeThrough(timing), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
