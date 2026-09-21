import { NextResponse, type NextRequest } from "next/server";
import { clientIp, rateLimit } from "@/lib/server/rateLimit";
import { requestJson } from "@/lib/server/requestJson";

export const dynamic = "force-dynamic";

const LIVEAVATAR_API = "https://api.liveavatar.com";
/** The only avatar sandbox sessions may use (free, and about a minute long). */
const SANDBOX_AVATAR_ID = "dd73ea75-1218-4ef3-92ce-606d5f7fbc0a";

/**
 * Creates a LiveAvatar session token for the browser. LiveAvatar runs the avatar
 * video and connects to our ElevenLabs agent itself (LITE mode), so the agent,
 * prompt and tools stay exactly as they are for the voice-only provider.
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.LIVEAVATAR_API_KEY;
  const secretId = process.env.LIVEAVATAR_SECRET_ID;
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  const sandbox = process.env.LIVEAVATAR_SANDBOX === "1";
  const avatarId = sandbox ? SANDBOX_AVATAR_ID : process.env.LIVEAVATAR_AVATAR_ID;

  if (!apiKey || !secretId || !agentId || !avatarId) {
    return NextResponse.json({ error: "The avatar isn't configured on this server yet." }, { status: 503 });
  }
  if (!rateLimit(`avatar:${clientIp(req.headers)}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many sessions started. Try again in a minute." }, { status: 429 });
  }

  const res = await requestJson(`${LIVEAVATAR_API}/v1/sessions/token`, {
    method: "POST",
    headers: { "X-API-KEY": apiKey },
    body: {
      mode: "LITE",
      avatar_id: avatarId,
      is_sandbox: sandbox,
      elevenlabs_agent_config: { secret_id: secretId, agent_id: agentId },
      video_settings: { quality: "high", encoding: "H264" },
    },
  }).catch((err: Error) => {
    console.error(`[avatar-session] ${err.message}`);
    return null;
  });

  if (!res?.ok) {
    if (res) console.error(`[avatar-session] LiveAvatar token request failed: ${res.status} ${res.text}`);
    return NextResponse.json({ error: "Couldn't start the avatar session." }, { status: 502 });
  }

  const { data } = JSON.parse(res.text) as { data?: { session_token?: string; session_id?: string } };
  if (!data?.session_token) return NextResponse.json({ error: "Couldn't start the avatar session." }, { status: 502 });
  return NextResponse.json({ sessionToken: data.session_token, sandbox }, { headers: { "Cache-Control": "no-store" } });
}
