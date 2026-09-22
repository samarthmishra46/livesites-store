import { NextResponse, type NextRequest } from "next/server";
import { clientIp, rateLimit } from "@/lib/server/rateLimit";
import { requestJson } from "@/lib/server/requestJson";

export const dynamic = "force-dynamic";

const ELEVENLABS_API = "https://api.elevenlabs.io";
const ANAM_API = "https://api.anam.ai";

/**
 * Opens an avatar session: an Anam audio-passthrough token plus a signed URL for
 * our ElevenLabs agent.
 *
 * The browser holds the conversation itself, so a turn runs shopper's voice →
 * ElevenLabs (transcription, turn-taking, voice) → /api/agent/llm → OpenAI →
 * ElevenLabs voice → back to the browser → Anam lip-sync → the card's <video>.
 * Anam's own ElevenLabs connector would be one hop shorter but only bridges audio:
 * contextual updates and typed turns never reach the agent through it, and this
 * shop's assistant needs both.
 *
 * Neither API key leaves the server. The signed URL is a short-lived,
 * single-conversation credential meant for exactly this.
 */
export async function POST(req: NextRequest) {
  const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  const anamKey = process.env.ANAM_API_KEY;
  const avatarId = process.env.NEXT_PUBLIC_ANAM_AVATAR_ID;

  if (!elevenLabsKey || !agentId || !anamKey || !avatarId) {
    return NextResponse.json({ error: "The avatar isn't configured on this server yet." }, { status: 503 });
  }
  if (!rateLimit(`avatar:${clientIp(req.headers)}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many sessions started. Try again in a minute." }, { status: 429 });
  }

  // 1. The agent requires auth, so Anam needs a signed URL rather than a bare agent id.
  const signed = await requestJson(
    `${ELEVENLABS_API}/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`,
    { headers: { "xi-api-key": elevenLabsKey } },
  ).catch((err: Error) => {
    console.error(`[avatar-session] ${err.message}`);
    return null;
  });

  if (!signed?.ok) {
    if (signed) console.error(`[avatar-session] ElevenLabs signed URL failed: ${signed.status} ${signed.text}`);
    return NextResponse.json({ error: "Couldn't reach the voice agent." }, { status: 502 });
  }
  const { signed_url: signedUrl } = JSON.parse(signed.text) as { signed_url?: string };
  if (!signedUrl) return NextResponse.json({ error: "Couldn't reach the voice agent." }, { status: 502 });

  // 2. The avatar session itself. A signed URL is short-lived, so this follows straight on.
  const region = process.env.ANAM_REGION;
  const session = await requestJson(`${ANAM_API}/v1/auth/session-token`, {
    method: "POST",
    headers: { Authorization: `Bearer ${anamKey}` },
    body: {
      personaConfig: {
        avatarId,
        avatarModel: process.env.ANAM_AVATAR_MODEL || "cara-4",
        // The avatar speaks the audio we send it; Anam runs no brain or voice of its own.
        enableAudioPassthrough: true,
        // Warm and lightly expressive suits a stylist; only Cara 4 reads these.
        directorNotes: { presetStyle: "warm", expressivity: 0.45 },
      },
      sessionOptions: {
        // The card is ~170px wide, so adaptive bitrate starts sooner and stays smooth.
        videoQuality: "auto",
        // Don't record shoppers by default.
        sessionReplay: { enableSessionReplay: false },
        ...(region ? { region, regionPolicy: "preferred" } : {}),
      },
    },
  }).catch((err: Error) => {
    console.error(`[avatar-session] ${err.message}`);
    return null;
  });

  if (!session?.ok) {
    if (session) console.error(`[avatar-session] Anam token request failed: ${session.status} ${session.text}`);
    return NextResponse.json({ error: "Couldn't start the avatar session." }, { status: 502 });
  }

  const { sessionToken } = JSON.parse(session.text) as { sessionToken?: string };
  if (!sessionToken) return NextResponse.json({ error: "Couldn't start the avatar session." }, { status: 502 });
  return NextResponse.json({ sessionToken, signedUrl }, { headers: { "Cache-Control": "no-store" } });
}
