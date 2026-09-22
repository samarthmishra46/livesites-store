import type { AnamClient } from "@anam-ai/js-sdk";
import type { AgentAudioInputStream } from "@anam-ai/js-sdk";
import { runAgentTool } from "@/lib/agent/tools";
import { connectAgentSocket, type AgentSocket } from "./elevenLabsSocket";
import { createEventBus } from "./eventBus";
import type { ActionHandler, AssistantEvents, AssistantProvider, AssistantStatus } from "./types";

/** WebRTC and the avatar SDK are large, so they load on idle instead of with the page. */
export const loadAnamSdk = () => import("@anam-ai/js-sdk");

/** Anam attaches its stream by element id, so the card's <video> carries this one. */
export const ANAM_VIDEO_ELEMENT_ID = "assistant-avatar-video";

/**
 * The avatar's own still, shown until its stream arrives. Anam serves it publicly
 * from the avatar id, and the landscape crop is the same 3:2 frame Cara 4 renders
 * live — so the face doesn't jump closer the moment the video starts.
 */
const avatarId = process.env.NEXT_PUBLIC_ANAM_AVATAR_ID;
const POSTER_SRC = avatarId
  ? `https://lab.anam.ai/api/avatars/${avatarId}/image/landscape`
  : "/images/assistant-portrait.jpg";

/** A session token lasts an hour, but the agent's signed URL alongside it is short-lived. */
const TOKEN_MAX_AGE_MS = 4 * 60_000;

interface AvatarSession {
  sessionToken: string;
  signedUrl: string;
}

async function fetchSession(): Promise<AvatarSession> {
  const res = await fetch("/api/agent/avatar-session", { method: "POST" });
  const data = (await res.json().catch(() => ({}))) as Partial<AvatarSession> & { error?: string };
  if (!res.ok || !data.sessionToken || !data.signedUrl) {
    throw new Error(data.error ?? "Couldn't start the avatar session.");
  }
  return { sessionToken: data.sessionToken, signedUrl: data.signedUrl };
}

/**
 * Fetched while the shopper is still reading the page, so connecting costs a
 * WebRTC handshake rather than two upstream API calls as well.
 */
let warm: { at: number; session: Promise<AvatarSession> } | null = null;

function avatarSession() {
  if (warm && performance.now() - warm.at < TOKEN_MAX_AGE_MS) return warm.session;
  const session = fetchSession();
  const entry = { at: performance.now(), session };
  warm = entry;
  // a failed prefetch must not be cached, or every retry replays it
  session.catch(() => void (warm === entry && (warm = null)));
  return session;
}

/**
 * The ElevenLabs voice agent with a lip-synced face.
 *
 * The browser holds the agent conversation (see `elevenLabsSocket`) and pipes its
 * voice into Anam, which renders the avatar and sends back video with that audio
 * in sync. Prompt, tools, validation and the OpenAI brain are untouched; the
 * assistant gains a face and nothing else changes.
 */
export function createAnamProvider(): AssistantProvider {
  const bus = createEventBus<AssistantEvents>();
  let client: AnamClient | null = null;
  let socket: AgentSocket | null = null;
  let audioIn: AgentAudioInputStream | null = null;
  let pending: Promise<void> | null = null;
  let handler: ActionHandler | null = null;
  let video: HTMLVideoElement | null = null;
  let micEnabled = true;
  /** Set when the microphone is refused: the session runs on as a typed chat. */
  let textOnly = false;
  let ending = false;
  /** Ids for the transcript: one per agent turn, one per shopper line. */
  let turn = 0;
  let seq = 0;

  // latency bookkeeping
  let userTurnAt = 0;
  let awaitingReply = false;
  let recentTyped: { text: string; at: number } | null = null;

  // the avatar's voice coming back from Anam, metered for the speaking ring
  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let levels: Uint8Array<ArrayBuffer> | null = null;

  // speaking state
  let speaking = false;
  let turnEnded = false;
  let quietSince = 0;
  let watchdog: ReturnType<typeof setInterval> | null = null;

  const status = (s: AssistantStatus, detail?: string) => bus.emit("status", { status: s, detail });
  const liveStatus = () => status(micEnabled && !textOnly ? "live" : "muted");

  function level() {
    if (!analyser || !levels) return 0;
    analyser.getByteFrequencyData(levels);
    const sum = levels.reduce((total, v) => total + v, 0);
    return Math.min(1, sum / levels.length / 96);
  }

  function setSpeaking(next: boolean) {
    if (speaking === next) return;
    speaking = next;
    bus.emit("speaking", next);
    if (!next && watchdog) {
      clearInterval(watchdog);
      watchdog = null;
    }
  }

  /** Holds "speaking" until the voice actually stops, which trails the last word. */
  function watchForSilence() {
    if (watchdog) return;
    quietSince = 0;
    watchdog = setInterval(() => {
      if (!speaking || !turnEnded) return;
      if (!analyser) return setSpeaking(false);
      if (level() > 0.02) {
        quietSince = 0;
        return;
      }
      quietSince ||= performance.now();
      if (performance.now() - quietSince > 400) setSpeaking(false);
    }, 120);
  }

  function meter(stream: MediaStream) {
    if (analyser || stream.getAudioTracks().length === 0) return;
    try {
      audioContext ??= new AudioContext();
      void audioContext.resume().catch(() => {});
      const node = audioContext.createAnalyser();
      node.fftSize = 256;
      audioContext.createMediaStreamSource(stream).connect(node);
      levels = new Uint8Array(node.frequencyBinCount);
      analyser = node;
    } catch {
      analyser = null;
    }
  }

  /** The SDK looks the element up by id, so wait for the card to render it. */
  async function videoElement() {
    for (let i = 0; i < 40 && !document.getElementById(ANAM_VIDEO_ELEMENT_ID); i++) {
      await new Promise((r) => setTimeout(r, 50));
    }
    return document.getElementById(ANAM_VIDEO_ELEMENT_ID);
  }

  function teardown() {
    socket?.close();
    socket = null;
    audioIn = null;
    if (watchdog) clearInterval(watchdog);
    watchdog = null;
    speaking = false;
    analyser = null;
    levels = null;
    bus.emit("speaking", false);
  }

  function startedSpeaking() {
    if (speaking) return;
    turnEnded = false;
    setSpeaking(true);
    if (awaitingReply && userTurnAt) {
      awaitingReply = false;
      bus.emit("metrics", { turnLatencyMs: Math.round(performance.now() - userTurnAt) });
    }
  }

  async function start() {
    status("connecting");
    try {
      const [sdk, session] = await Promise.all([loadAnamSdk(), avatarSession(), videoElement()]);
      const { createClient, AnamEvent } = sdk;
      ending = false;

      // 1. The face. It has no brain or voice of its own; we feed it audio.
      const anam = createClient(session.sessionToken, { disableInputAudio: true });
      client = anam;

      anam.addListener(AnamEvent.AUDIO_STREAM_STARTED, (stream) => meter(stream));
      anam.addListener(AnamEvent.VIDEO_STREAM_STARTED, () => {
        // The SDK assigns srcObject right after this fires, and that new load would
        // abort a play() started here — so nudge the element on the next tick.
        setTimeout(() => {
          const el = video ?? (document.getElementById(ANAM_VIDEO_ELEMENT_ID) as HTMLVideoElement | null);
          if (!el) return;
          // autoPlay can start muted; the avatar's voice needs an explicit play().
          el.muted = false;
          el.volume = 1;
          if (!el.paused) return;
          void el.play().catch((err: unknown) => {
            // AbortError just means a newer stream superseded this play, not a block.
            if (err instanceof DOMException && err.name === "AbortError") return;
            console.warn("[assistant] avatar audio blocked, tap the card to enable sound", err);
          });
        }, 0);
      });
      anam.addListener(AnamEvent.SERVER_WARNING, (message) => console.warn("[assistant]", message));
      anam.addListener(AnamEvent.CONNECTION_CLOSED, () => {
        client = null;
        teardown();
        if (!ending) status("error", "Avatar disconnected. Tap to reconnect.");
      });

      await anam.streamToVideoElement(ANAM_VIDEO_ELEMENT_ID);
      audioIn = anam.createAgentAudioInputStream({ encoding: "pcm_s16le", sampleRate: 16_000, channels: 1 });

      // 2. The conversation. Its voice becomes the avatar's.
      socket = connectAgentSocket(session.signedUrl, {
        onOpen: () => liveStatus(),
        onAudio: (base64) => {
          startedSpeaking();
          audioIn?.sendAudioChunk(base64);
        },
        // Tentative and final responses both carry the whole reply so far, so they
        // replace the line rather than extend it — the caption grows as it's spoken.
        onAgentText: (text) => bus.emit("message", { id: `a${turn}`, role: "assistant", text }),
        onUserText: (text) => {
          if (recentTyped && recentTyped.text === text.trim() && performance.now() - recentTyped.at < 5000) return;
          userTurnAt = performance.now();
          awaitingReply = true;
          bus.emit("message", { id: `u${++seq}`, role: "user", text });
        },
        onInterruption: () => {
          client?.interruptPersona();
          audioIn?.endSequence();
          setSpeaking(false);
        },
        onTurnEnd: () => {
          audioIn?.endSequence();
          turnEnded = true;
          turn++;
          watchForSilence();
        },
        onToolCall: (name, args) => (handler ? runAgentTool(name, args, handler) : "Error: the page isn't ready yet."),
        onClose: (reason) => {
          teardown();
          if (ending) return;
          status(reason === "agent" ? "disconnected" : "error", reason === "agent" ? "Call ended. Tap to talk again." : "Connection lost. Tap to reconnect.");
        },
      });

      // 3. The microphone. Refused is not fatal — the card becomes a typed chat.
      const hasMic = await socket.startMicrophone();
      textOnly = !hasMic;
      if (hasMic) socket.setMicrophoneEnabled(micEnabled);
      bus.emit("inputMode", textOnly ? "text" : "voice");
      liveStatus();
      warm = null; // the next session needs its own token and signed URL
    } catch (err) {
      client = null;
      teardown();
      warm = null;
      console.warn("[assistant] avatar connect failed", err);
      status("error", err instanceof Error && err.message.length < 90 ? err.message : "Couldn't connect. Tap to retry.");
    }
  }

  return {
    name: "anam",
    posterSrc: POSTER_SRC,
    posterPosition: "object-center",
    requiresGesture: true,
    hasVideo: true,
    warmUp() {
      void loadAnamSdk();
      void avatarSession().catch(() => {});
    },
    connect() {
      if (client) return Promise.resolve();
      pending ??= start().finally(() => {
        pending = null;
      });
      return pending;
    },
    async disconnect() {
      await pending;
      const anam = client;
      if (!anam) return status("disconnected");
      ending = true;
      client = null;
      teardown();
      await anam.stopStreaming().catch(() => {});
      status("disconnected");
    },
    attachVideo(element) {
      video = element;
    },
    setMicrophoneEnabled(enabled) {
      micEnabled = enabled;
      // Before a session exists this is just a stored preference: reporting "live"
      // here would tell the card it is connected and suppress the opening gesture.
      if (!socket) return;
      if (!textOnly) socket.setMicrophoneEnabled(enabled);
      liveStatus();
    },
    setCameraEnabled() {
      // The card hides the video itself; the session keeps running so audio continues.
    },
    async sendUserMessage(text) {
      const message = text.trim();
      if (!message) return;
      if (!socket) await this.connect();
      if (!socket) return;
      recentTyped = { text: message, at: performance.now() };
      bus.emit("message", { id: `u${++seq}`, role: "user", text: message });
      userTurnAt = performance.now();
      awaitingReply = true;
      socket.sendUserMessage(message);
    },
    sendContext(text) {
      socket?.sendContext(text);
    },
    getOutputLevel: level,
    setActionHandler(next) {
      handler = next;
    },
    on: bus.on,
  };
}
