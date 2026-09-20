/**
 * Pushes the Livesites agent configuration to ElevenLabs so it lives in git rather
 * than in dashboard clicks: tools, first message, languages, voice model and the
 * custom-LLM endpoint.
 *
 *   npm run agent:sync
 *
 * Reads .env.local, then .env (like Next.js). On the first run it creates the LLM
 * secret and the agent and writes their ids into that env file; later runs update
 * them in place.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { FIRST_MESSAGE, FIRST_MESSAGE_HI } from "@/lib/agent/knowledge";
import { agentTools, toElevenLabsToolConfig } from "@/lib/agent/tools";

const API = "https://api.elevenlabs.io";

const envFiles = [".env.local", ".env"].filter((f) => existsSync(f));
for (const file of envFiles) process.loadEnvFile(file);

/** Stores a generated id in the env file so the app and later syncs pick it up. */
function saveEnv(name: string, value: string) {
  const file = envFiles[0];
  if (!file) {
    console.log(`Add to your env file:\n  ${name}=${value}`);
    return;
  }
  const text = readFileSync(file, "utf8");
  const line = `${name}=${value}`;
  const next = new RegExp(`^${name}=.*$`, "m").test(text) ? text.replace(new RegExp(`^${name}=.*$`, "m"), line) : `${text.trimEnd()}\n${line}\n`;
  writeFileSync(file, next);
  console.log(`Saved ${name} to ${file}.`);
}

function env(name: string, required = true) {
  const value = process.env[name]?.trim();
  if (required && !value) {
    console.error(`Missing ${name} in .env.local or .env (see .env.example).`);
    process.exit(1);
  }
  return value ?? "";
}

const apiKey = env("ELEVENLABS_API_KEY");
const publicUrl = env("AGENT_PUBLIC_URL").replace(/\/+$/, "");
const llmSecret = env("AGENT_LLM_SECRET");
const agentId = env("ELEVENLABS_AGENT_ID", false);
const voiceId = env("ELEVENLABS_VOICE_ID", false);
const model = env("OPENAI_MODEL", false) || "gpt-4.1-mini";
let secretId = env("ELEVENLABS_LLM_SECRET_ID", false);

async function api<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}\n${text}`);
  return (text ? JSON.parse(text) : {}) as T;
}

const systemTool = (name: string) => ({ type: "system", name, description: "", params: { system_tool_type: name } });

async function main() {
  if (!publicUrl.startsWith("https://")) throw new Error("AGENT_PUBLIC_URL must be a public https URL (a tunnel in development).");

  // 1. The secret ElevenLabs sends as the bearer token to our LLM endpoint.
  if (!secretId) {
    const created = await api<{ secret_id: string }>("POST", "/v1/convai/secrets", {
      type: "new",
      name: "livesites-agent-llm-secret",
      value: llmSecret,
    });
    secretId = created.secret_id;
    saveEnv("ELEVENLABS_LLM_SECRET_ID", secretId);
  }

  // 2. Client tools — update by name, create if missing.
  const { tools: existing = [] } = await api<{ tools?: { id: string; tool_config: { name: string } }[] }>("GET", "/v1/convai/tools");
  const toolIds: string[] = [];
  for (const tool of agentTools) {
    const tool_config = toElevenLabsToolConfig(tool);
    const match = existing.find((t) => t.tool_config?.name === tool.name);
    if (match) {
      await api("PATCH", `/v1/convai/tools/${match.id}`, { tool_config });
      toolIds.push(match.id);
    } else {
      const created = await api<{ id: string }>("POST", "/v1/convai/tools", { tool_config });
      toolIds.push(created.id);
    }
    console.log(`  tool ${tool.name} ✓`);
  }

  // 3. The agent itself.
  const config = {
    name: "Livesites — Live Sites agent",
    conversation_config: {
      agent: {
        first_message: FIRST_MESSAGE,
        language: "en",
        prompt: {
          // The full prompt is added by our LLM endpoint (lib/agent/knowledge.ts).
          prompt: "You are the Live Sites agent for the Livesites fashion store.",
          llm: "custom-llm",
          custom_llm: { url: `${publicUrl}/api/agent/llm`, model_id: model, api_key: { secret_id: secretId } },
          tool_ids: toolIds,
          built_in_tools: { language_detection: systemTool("language_detection"), end_call: systemTool("end_call") },
        },
      },
      // Flash v2.5 is the lowest-latency model that also speaks Hindi.
      tts: { model_id: "eleven_flash_v2_5", ...(voiceId ? { voice_id: voiceId } : {}), agent_output_audio_format: "pcm_24000" },
      asr: { user_input_audio_format: "pcm_24000" },
      language_presets: { hi: { overrides: { agent: { first_message: FIRST_MESSAGE_HI } } } },
    },
    platform_settings: {
      // Sessions need a token from /api/agent/session; text-only is used when the mic is blocked.
      auth: { enable_auth: true },
      overrides: { conversation_config_override: { conversation: { text_only: true } } },
    },
  };

  if (agentId) {
    await api("PATCH", `/v1/convai/agents/${agentId}`, config);
    console.log(`\nUpdated agent ${agentId}.`);
  } else {
    const created = await api<{ agent_id: string }>("POST", "/v1/convai/agents/create", config);
    console.log(`\nCreated agent ${created.agent_id}.`);
    saveEnv("ELEVENLABS_AGENT_ID", created.agent_id);
  }
  console.log(`Custom LLM endpoint: ${publicUrl}/api/agent/llm (model ${model})`);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
