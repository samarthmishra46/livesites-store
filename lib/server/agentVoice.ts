import { requestJson } from "./requestJson";

/** How long a lookup is trusted. A voice added in the dashboard is picked up within this. */
const CHECK_TTL_MS = 10 * 60_000;

let cached: { id: string; at: number; usable: Promise<boolean> } | null = null;

async function isUsable(voiceId: string, apiKey: string) {
  const res = await requestJson(`https://api.elevenlabs.io/v1/voices/${voiceId}`, { headers: { "xi-api-key": apiKey } }).catch(
    () => null,
  );
  // A network blip shouldn't cost the shopper their voice: let ElevenLabs decide.
  if (!res) return true;
  if (res.ok) return true;
  console.error(
    res.status === 404
      ? `[agent-voice] ELEVENLABS_VOICE_ID ${voiceId} isn't in this account's My Voices. A Voice Library voice must be added there first. Using the agent's default voice.`
      : `[agent-voice] Couldn't check ELEVENLABS_VOICE_ID ${voiceId}: ${res.status} ${res.text}. Using the agent's default voice.`,
  );
  return false;
}

/**
 * The voice for this session, read from the environment on every request so
 * editing ELEVENLABS_VOICE_ID takes effect without re-syncing the agent. The agent
 * allows a per-conversation voice override (set once by `npm run agent:sync`).
 *
 * Returns undefined — the agent's own voice — when unset or not usable, because
 * ElevenLabs ends a conversation outright over an unknown voice.
 */
export async function agentVoiceId(): Promise<string | undefined> {
  const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim();
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!voiceId || !apiKey) return undefined;
  if (!/^[A-Za-z0-9]{20}$/.test(voiceId)) {
    console.error(`[agent-voice] ELEVENLABS_VOICE_ID "${voiceId}" is not an ElevenLabs voice id. Using the agent's default voice.`);
    return undefined;
  }

  if (!cached || cached.id !== voiceId || performance.now() - cached.at > CHECK_TTL_MS) {
    cached = { id: voiceId, at: performance.now(), usable: isUsable(voiceId, apiKey) };
  }
  return (await cached.usable) ? voiceId : undefined;
}
