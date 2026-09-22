import type { Conversation } from "@elevenlabs/client";
import { agentTools, runAgentTool } from "@/lib/agent/tools";
import { createEventBus } from "./eventBus";
import type { ActionHandler, AssistantEvents, AssistantProvider, AssistantStatus } from "./types";

/** The SDK (with LiveKit) is large, so it loads on idle instead of with the page. */
export const loadElevenLabsSdk = () => import("@elevenlabs/client");

async function fetchConversationToken() {
  const res = await fetch("/api/agent/session", { method: "POST" });
  const data = (await res.json().catch(() => ({}))) as { token?: string; error?: string };
  if (!res.ok || !data.token) throw new Error(data.error ?? "Couldn't start a voice session.");
  return data.token;
}

/** True when the browser can and may use the microphone. Asking here shows the permission prompt. */
async function microphoneAvailable() {
  if (!navigator.mediaDevices?.getUserMedia) return false;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    return true;
  } catch {
    return false;
  }
}

/**
 * Voice agent on the ElevenLabs Agents platform. ElevenLabs handles speech-to-text,
 * turn-taking and the voice; each turn's reply comes from our OpenAI-backed endpoint.
 * Tool calls arrive here as client tools and run through the shared action dispatcher.
 */
export function createElevenLabsProvider(): AssistantProvider {
  const bus = createEventBus<AssistantEvents>();
  let conversation: Conversation | null = null;
  let pending: Promise<void> | null = null;
  let handler: ActionHandler | null = null;
  let micEnabled = true;
  let ending = false;
  let seq = 0;
  // latency bookkeeping: when the shopper last made sound / finished a sentence
  let lastVoiceAt = 0;
  let userTurnAt = 0;
  let awaitingReply = false;
  let recentTyped: { text: string; at: number } | null = null;

  const status = (s: AssistantStatus, detail?: string) => bus.emit("status", { status: s, detail });
  const liveStatus = () => status(micEnabled ? "live" : "muted");

  const clientTools = Object.fromEntries(
    agentTools.map((tool) => [
      tool.name,
      (params: unknown) => (handler ? runAgentTool(tool.name, params, handler) : "Error: the page isn't ready yet."),
    ]),
  );

  async function start() {
    status("connecting");
    try {
      const [{ Conversation }, token, hasMic] = await Promise.all([loadElevenLabsSdk(), fetchConversationToken(), microphoneAvailable()]);
      const textOnly = !hasMic;
      ending = false;
      conversation = await Conversation.startSession({
        conversationToken: token,
        connectionType: "webrtc",
        textOnly,
        overrides: textOnly ? { conversation: { textOnly: true } } : undefined,
        clientTools,
        onMessage: ({ message, role }) => {
          if (role === "user") {
            // typed messages are already shown; skip their echo
            if (recentTyped && recentTyped.text === message.trim() && performance.now() - recentTyped.at < 5000) return;
            userTurnAt = performance.now();
            awaitingReply = true;
          }
          bus.emit("message", { id: `el${++seq}`, role: role === "agent" ? "assistant" : "user", text: message });
        },
        onModeChange: ({ mode }) => {
          const speaking = mode === "speaking";
          bus.emit("speaking", speaking);
          if (speaking && awaitingReply) {
            awaitingReply = false;
            const from = lastVoiceAt > userTurnAt - 3000 ? lastVoiceAt : userTurnAt;
            if (from) bus.emit("metrics", { turnLatencyMs: Math.round(performance.now() - from) });
          }
        },
        onVadScore: ({ vadScore }) => {
          if (vadScore > 0.5) lastVoiceAt = performance.now();
        },
        onDisconnect: (details) => {
          conversation = null;
          bus.emit("speaking", false);
          if (ending || details.reason === "user") status("disconnected");
          else if (details.reason === "agent") status("disconnected", "Call ended. Tap to talk again.");
          else status("error", "Connection lost. Tap to reconnect.");
        },
        onError: (message) => console.warn("[assistant]", message),
      });
      bus.emit("inputMode", textOnly ? "text" : "voice");
      if (!textOnly) conversation.setMicMuted(!micEnabled);
      liveStatus();
    } catch (err) {
      conversation = null;
      console.warn("[assistant] connect failed", err);
      status("error", err instanceof Error && err.message.length < 90 ? err.message : "Couldn't connect. Tap to retry.");
    }
  }

  return {
    name: "elevenlabs",
    posterSrc: "/images/assistant-portrait.jpg",
    requiresGesture: true,
    hasVideo: false,
    connect() {
      if (conversation) return Promise.resolve();
      pending ??= start().finally(() => {
        pending = null;
      });
      return pending;
    },
    async disconnect() {
      await pending;
      const c = conversation;
      if (!c) return status("disconnected");
      ending = true;
      conversation = null;
      await c.endSession();
      status("disconnected");
    },
    setMicrophoneEnabled(enabled) {
      micEnabled = enabled;
      if (!conversation) return;
      conversation.setMicMuted(!enabled);
      liveStatus();
    },
    setCameraEnabled() {
      // Voice-only; the Anam provider keeps its session running when video is paused.
    },
    async sendUserMessage(text) {
      const message = text.trim();
      if (!message) return;
      if (!conversation) await this.connect();
      if (!conversation) return;
      recentTyped = { text: message, at: performance.now() };
      bus.emit("message", { id: `el${++seq}`, role: "user", text: message });
      userTurnAt = performance.now();
      awaitingReply = true;
      conversation.sendUserMessage(message);
    },
    sendContext(text) {
      conversation?.sendContextualUpdate(text);
    },
    getOutputLevel() {
      if (!conversation) return 0;
      try {
        return Math.min(1, conversation.getOutputVolume() * 1.6);
      } catch {
        return 0;
      }
    },
    setActionHandler(next) {
      handler = next;
    },
    on: bus.on,
  };
}
