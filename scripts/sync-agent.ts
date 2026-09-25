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
import { requestJson } from "@/lib/server/requestJson";

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

/**
 * ElevenLabs voice ids are 20 characters of base62 (e.g. cjVigY5qzO86Huf0OWal). A UUID
 * here is usually an id copied from the avatar provider, and ElevenLabs would reject the
 * whole agent update over it — so say so and keep the agent's current voice instead.
 */
function elevenLabsVoiceId() {
  const value = env("ELEVENLABS_VOICE_ID", false);
  if (!value || /^[A-Za-z0-9]{20}$/.test(value)) return value;
  console.warn(`  ELEVENLABS_VOICE_ID "${value}" is not an ElevenLabs voice id — leaving the agent's voice unchanged.`);
  return "";
}

const apiKey = env("ELEVENLABS_API_KEY");
const publicUrl = env("AGENT_PUBLIC_URL").replace(/\/+$/, "");
const llmSecret = env("AGENT_LLM_SECRET");
const agentId = env("ELEVENLABS_AGENT_ID", false);
const model = env("OPENAI_MODEL", false) || "gpt-4.1-mini";
let secretId = env("ELEVENLABS_LLM_SECRET_ID", false);

async function api<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await requestJson(`${API}${path}`, { method, headers: { "xi-api-key": apiKey }, body });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}\n${res.text}`);
  return (res.text ? JSON.parse(res.text) : {}) as T;
}

const systemTool = (name: string) => ({ type: "system", name, description: "", params: { system_tool_type: name } });

async function main() {
  if (!publicUrl.startsWith("https://")) throw new Error("AGENT_PUBLIC_URL must be a public https URL (a tunnel in development).");

  // A Voice Library voice not yet added to My Voices would fail the whole update.
  let voiceId = elevenLabsVoiceId();
  if (voiceId && !(await api("GET", `/v1/voices/${voiceId}`).then(() => true, () => false))) {
    console.warn(`  ELEVENLABS_VOICE_ID ${voiceId} isn't in this account's My Voices — leaving the agent's voice unchanged.`);
    voiceId = "";
  }

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
      // ElevenLabs requires a v2 model for English agents; Hindi needs v2.5, set per language below.
      // Flash is the lowest-latency voice model; 3 is the most streaming optimisation that
      // still keeps ElevenLabs' text normaliser (4 drops it and mangles prices and sizes).
      tts: {
        model_id: "eleven_flash_v2",
        ...(voiceId ? { voice_id: voiceId } : {}),
        // The browser forwards this audio straight to the avatar, which lip-syncs
        // 16 kHz mono PCM; matching here avoids resampling on the way through.
        agent_output_audio_format: "pcm_16000",
        optimize_streaming_latency: 3,
      },
      asr: { user_input_audio_format: "pcm_16000" },
      conversation: {
        // Everything the card needs and nothing it doesn't. `client_tool_call` is the
        // one that matters most: without it the agent's tools never reach the page.
        client_events: [
          "conversation_initiation_metadata",
          "ping",
          "audio",
          "interruption",
          "user_transcript",
          "agent_response",
          "agent_response_correction",
          "internal_tentative_agent_response",
          "agent_response_complete",
          "client_tool_call",
        ],
      },
      // The assistant sits in the corner of a shop while people browse, so it waits
      // instead of asking "are you still there?" every few seconds. Those nudge turns
      // also arrive between a typed question and its answer and displace it.
      turn: { turn_timeout: -1 },
      language_presets: {
        hi: {
          overrides: {
            agent: { first_message: FIRST_MESSAGE_HI },
            tts: { model_id: "eleven_flash_v2_5" },
          },
        },
      },
    },
    platform_settings: {
      // Sessions need a token from /api/agent/session; text-only is used when the mic is blocked.
      auth: { enable_auth: true },
      // The app sends ELEVENLABS_VOICE_ID with each session, so the voice changes without a sync.
      overrides: { conversation_config_override: { conversation: { text_only: true }, tts: { voice_id: true } } },
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
