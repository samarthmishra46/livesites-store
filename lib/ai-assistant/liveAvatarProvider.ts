import type { ElevenLabsAgentSession } from "@heygen/liveavatar-web-sdk";
import { runAgentTool } from "@/lib/agent/tools";
import { createEventBus } from "./eventBus";
import type { ActionHandler, AssistantEvents, AssistantProvider, AssistantStatus } from "./types";

/** LiveKit and the avatar SDK are large, so they load on idle instead of with the page. */
export const loadLiveAvatarSdk = () => import("@heygen/liveavatar-web-sdk");

async function fetchSessionToken() {
  const res = await fetch("/api/agent/avatar-session", { method: "POST" });
  const data = (await res.json().catch(() => ({}))) as { sessionToken?: string; error?: string };
  if (!res.ok || !data.sessionToken) throw new Error(data.error ?? "Couldn't start the avatar session.");
  return data.sessionToken;
}

interface ToolCall {
  tool_name?: string;
  tool_call_id?: string;
  parameters?: unknown;
}

/**
 * The same ElevenLabs agent, with a live lip-synced face: LiveAvatar runs a worker
 * that talks to our agent and streams avatar video over WebRTC, and forwards the
 * agent's tool calls to us on the LiveKit data channel. Voice, prompt, tools and
 * validation are unchanged — only the transport and the picture are different.
 */
export function createLiveAvatarProvider(): AssistantProvider {
  const bus = createEventBus<AssistantEvents>();
  let session: ElevenLabsAgentSession | null = null;
  let pending: Promise<void> | null = null;
  let handler: ActionHandler | null = null;
  let video: HTMLVideoElement | null = null;
  let micEnabled = true;
  let ending = false;
  let seq = 0;
  // latency bookkeeping
  let userTurnAt = 0;
  let awaitingReply = false;
  let recentTyped: { text: string; at: number } | null = null;
  // output level for the speaking ring
  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let meteredStream: MediaStream | null = null;
  let levels: Uint8Array<ArrayBuffer> | null = null;

  const status = (s: AssistantStatus, detail?: string) => bus.emit("status", { status: s, detail });
  const liveStatus = () => status(micEnabled ? "live" : "muted");
  const say = (role: "assistant" | "user", text: string) => bus.emit("message", { id: `la${++seq}`, role, text });

  /** Meters the avatar's audio so the card's speaking ring follows its voice. */
  function meter() {
    const stream = video?.srcObject as MediaStream | null;
    if (!stream || stream === meteredStream || stream.getAudioTracks().length === 0) return;
    try {
      audioContext ??= new AudioContext();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      audioContext.createMediaStreamSource(stream).connect(analyser);
      levels = new Uint8Array(analyser.frequencyBinCount);
      meteredStream = stream;
    } catch {
      analyser = null;
    }
  }

  async function start() {
    status("connecting");
    try {
      const [sdk, token] = await Promise.all([loadLiveAvatarSdk(), fetchSessionToken()]);
      const { ElevenLabsAgentSession, AgentEventsEnum, SessionEvent } = sdk;
      ending = false;
      const s = new ElevenLabsAgentSession(token, { autoKeepAlive: true, voiceChat: { defaultMuted: !micEnabled } });
      session = s;

      s.on(AgentEventsEnum.AVATAR_TRANSCRIPTION, ({ text }) => text && say("assistant", text));
      s.on(AgentEventsEnum.USER_TRANSCRIPTION, ({ text }) => {
        if (!text) return;
        if (recentTyped && recentTyped.text === text.trim() && performance.now() - recentTyped.at < 5000) return;
        userTurnAt = performance.now();
        awaitingReply = true;
        say("user", text);
      });
      s.on(AgentEventsEnum.USER_SPEAK_ENDED, () => {
        userTurnAt = performance.now();
        awaitingReply = true;
      });
      s.on(AgentEventsEnum.AVATAR_SPEAK_STARTED, () => {
        bus.emit("speaking", true);
        meter();
        if (awaitingReply && userTurnAt) {
          awaitingReply = false;
          bus.emit("metrics", { turnLatencyMs: Math.round(performance.now() - userTurnAt) });
        }
      });
      s.on(AgentEventsEnum.AVATAR_SPEAK_ENDED, () => bus.emit("speaking", false));

      // The agent's tool calls arrive wrapped in the raw ElevenLabs protocol.
      s.on(AgentEventsEnum.ELEVENLABS_AGENT_EVENT, ({ elevenlabs_event_type, data }) => {
        if (elevenlabs_event_type !== "client_tool_call") return;
        const call = ((data as { client_tool_call?: ToolCall })?.client_tool_call ?? data) as ToolCall;
        const args = typeof call.parameters === "string" ? safeParse(call.parameters) : call.parameters;
        const result = handler ? runAgentTool(call.tool_name ?? "", args, handler) : "Error: the page isn't ready yet.";
        if (call.tool_call_id) {
          s.sendClientToolResult({ toolCallId: call.tool_call_id, result, isError: result.startsWith("Error:") });
        }
      });

      s.on(SessionEvent.SESSION_DISCONNECTED, (reason) => {
        session = null;
        bus.emit("speaking", false);
        if (ending) status("disconnected");
        else status("error", `Avatar disconnected (${reason}). Tap to reconnect.`);
      });
      s.on(AgentEventsEnum.SESSION_STOPPED, () => {
        session = null;
        bus.emit("speaking", false);
        status("disconnected", "Session ended. Tap to start again.");
      });

      await s.start();
      if (video) s.attach(video);
      meter();
      bus.emit("inputMode", "voice");
      liveStatus();
    } catch (err) {
      session = null;
      console.warn("[assistant] avatar connect failed", err);
      status("error", err instanceof Error && err.message.length < 90 ? err.message : "Couldn't connect. Tap to retry.");
    }
  }

  return {
    name: "liveavatar",
    posterSrc: "/images/assistant-portrait.jpg",
    requiresGesture: true,
    hasVideo: true,
    connect() {
      if (session) return Promise.resolve();
      pending ??= start().finally(() => {
        pending = null;
      });
      return pending;
    },
    async disconnect() {
      await pending;
      const s = session;
      if (!s) return status("disconnected");
      ending = true;
      session = null;
      await s.stop().catch(() => {});
      status("disconnected");
    },
    attachVideo(element) {
      video = element;
      if (element && session) {
        session.attach(element);
        meter();
      }
    },
    setMicrophoneEnabled(enabled) {
      micEnabled = enabled;
      if (!session) return;
      void (enabled ? session.voiceChat.unmute() : session.voiceChat.mute());
      liveStatus();
    },
    setCameraEnabled() {
      // The card hides the video itself; the session keeps running so audio continues.
    },
    async sendUserMessage(text) {
      const message = text.trim();
      if (!message) return;
      if (!session) await this.connect();
      if (!session) return;
      recentTyped = { text: message, at: performance.now() };
      say("user", message);
      userTurnAt = performance.now();
      awaitingReply = true;
      session.sendUserMessage(message);
    },
    sendContext(text) {
      session?.sendContextualUpdate(text);
    },
    getOutputLevel() {
      if (!analyser || !levels) return 0;
      analyser.getByteFrequencyData(levels);
      const sum = levels.reduce((total, v) => total + v, 0);
      return Math.min(1, sum / levels.length / 96);
    },
    setActionHandler(next) {
      handler = next;
    },
    on: bus.on,
  };
}

function safeParse(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return {};
  }
}
