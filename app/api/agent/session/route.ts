import { NextResponse, type NextRequest } from "next/server";
import { clientIp, rateLimit } from "@/lib/server/rateLimit";
import { agentVoiceId } from "@/lib/server/agentVoice";
import { requestJson } from "@/lib/server/requestJson";

export const dynamic = "force-dynamic";

const ELEVENLABS_API = "https://api.elevenlabs.io";

/**
 * Issues a short-lived ElevenLabs conversation token for the browser's WebRTC
 * session, so the API key never leaves the server.
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  if (!apiKey || !agentId) {
    return NextResponse.json({ error: "The voice agent isn't configured on this server yet." }, { status: 503 });
  }
  if (!rateLimit(`session:${clientIp(req.headers)}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many sessions started. Try again in a minute." }, { status: 429 });
  }

  const [res, voiceId] = await Promise.all([
    requestJson(`${ELEVENLABS_API}/v1/convai/conversation/token?agent_id=${encodeURIComponent(agentId)}`, {
      headers: { "xi-api-key": apiKey },
    }).catch((err: Error) => {
      console.error(`[agent-session] ${err.message}`);
      return null;
    }),
    agentVoiceId(),
  ]);
  if (!res?.ok) {
    if (res) console.error(`[agent-session] ElevenLabs token request failed: ${res.status} ${res.text}`);
    return NextResponse.json({ error: "Couldn't start a voice session." }, { status: 502 });
  }
  const { token } = JSON.parse(res.text) as { token?: string };
  if (!token) return NextResponse.json({ error: "Couldn't start a voice session." }, { status: 502 });
  return NextResponse.json({ token, voiceId }, { headers: { "Cache-Control": "no-store" } });
}
