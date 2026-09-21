"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useActionDispatcher } from "@/lib/actions/useActionDispatcher";
import { describePage } from "@/lib/agent/pageContext";
import { runAgentTool } from "@/lib/agent/tools";
import { createStore, useStore } from "@/lib/store/createStore";
import { createElevenLabsProvider, loadElevenLabsSdk } from "./elevenLabsProvider";
import { createLiveAvatarProvider, loadLiveAvatarSdk } from "./liveAvatarProvider";
import { createMockAssistantProvider } from "./mockProvider";
import type { AssistantMessage, AssistantProvider, AssistantStatus, AssistantUIState } from "./types";

const defaultUI: AssistantUIState = {
  open: true,
  micEnabled: true,
  cameraEnabled: true,
  chatOpen: false,
  position: null,
};

export const assistantUIStore = createStore<AssistantUIState>(defaultUI, {
  persistKey: "livesites:assistant",
  parse: (v) => (v && typeof v === "object" ? { ...defaultUI, ...(v as Partial<AssistantUIState>), chatOpen: false } : null),
});

interface SessionState {
  status: AssistantStatus;
  /** Why the session is offline, shown in the bubble. */
  detail: string | null;
  /** Latest assistant line, shown in the bubble. */
  message: AssistantMessage | null;
  transcript: AssistantMessage[];
  speaking: boolean;
  inputMode: "voice" | "text";
  latencyMs: number | null;
}

const sessionStore = createStore<SessionState>({
  status: "idle",
  detail: null,
  message: null,
  transcript: [],
  speaking: false,
  inputMode: "voice",
  latencyMs: null,
});

/** "liveavatar" = voice + lip-synced video, "elevenlabs" = voice only, anything else = offline mock. */
const providerName = process.env.NEXT_PUBLIC_ASSISTANT_PROVIDER;

function createProvider() {
  if (providerName === "liveavatar") return createLiveAvatarProvider();
  if (providerName === "elevenlabs") return createElevenLabsProvider();
  return createMockAssistantProvider();
}

let provider: AssistantProvider | null = null;
const getProvider = () => (provider ??= createProvider());

const preloadSdk = () => void (providerName === "liveavatar" ? loadLiveAvatarSdk() : loadElevenLabsSdk());

const isConnected = () => {
  const { status } = sessionStore.get();
  return status === "live" || status === "muted";
};

export const assistantUI = {
  open: () => {
    assistantUIStore.set((s) => ({ ...s, open: true }));
    // opening is itself a click, so audio may start
    if (!isConnected()) void getProvider().connect();
  },
  close: () => {
    assistantUIStore.set((s) => ({ ...s, open: false, chatOpen: false }));
    void getProvider().disconnect();
  },
  reconnect: () => void getProvider().connect(),
  toggleMic: () => {
    const micEnabled = !assistantUIStore.get().micEnabled;
    assistantUIStore.set((s) => ({ ...s, micEnabled }));
    getProvider().setMicrophoneEnabled(micEnabled);
  },
  toggleCamera: () => {
    const cameraEnabled = !assistantUIStore.get().cameraEnabled;
    assistantUIStore.set((s) => ({ ...s, cameraEnabled }));
    getProvider().setCameraEnabled(cameraEnabled);
  },
  toggleChat: () => assistantUIStore.set((s) => ({ ...s, chatOpen: !s.chatOpen })),
  sendText: (text: string) => void getProvider().sendUserMessage(text),
  setPosition: (position: AssistantUIState["position"]) => assistantUIStore.set((s) => ({ ...s, position })),
};

export const getAssistantOutputLevel = () => getProvider().getOutputLevel();

/** The card hands its <video> element to providers that stream avatar video. */
export const attachAssistantVideo = (element: HTMLVideoElement | null) => getProvider().attachVideo?.(element);

/** Connects the provider, routes its actions and keeps it informed about the page. */
export function useAssistant() {
  const ui = useStore(assistantUIStore);
  const session = useStore(sessionStore);
  const dispatch = useActionDispatcher();
  const pathname = usePathname();
  const connected = session.status === "live" || session.status === "muted";

  // provider events → session state
  useEffect(() => {
    const p = getProvider();
    const offs = [
      p.on("status", ({ status, detail }) => sessionStore.set((s) => ({ ...s, status, detail: detail ?? null }))),
      p.on("message", (message) =>
        sessionStore.set((s) => ({
          ...s,
          message: message.role === "assistant" ? message : s.message,
          transcript: [...s.transcript, message].slice(-40),
        })),
      ),
      p.on("speaking", (speaking) => sessionStore.set((s) => ({ ...s, speaking }))),
      p.on("inputMode", (inputMode) => {
        sessionStore.set((s) => ({ ...s, inputMode }));
        if (inputMode === "text") assistantUIStore.set((s) => ({ ...s, chatOpen: true }));
      }),
      p.on("metrics", ({ turnLatencyMs }) => sessionStore.set((s) => ({ ...s, latencyMs: turnLatencyMs }))),
    ];
    p.setMicrophoneEnabled(assistantUIStore.get().micEnabled);
    return () => offs.forEach((off) => off());
  }, []);

  useEffect(() => {
    const p = getProvider();
    p.setActionHandler(dispatch);
    // Development aid: drive the site like the agent does, from the browser console, e.g.
    // livesitesAgent.run("highlight_section", { section_id: "global.footer" })
    if (process.env.NODE_ENV === "development") {
      (window as unknown as { livesitesAgent: unknown }).livesitesAgent = {
        run: (name: string, args?: unknown) => runAgentTool(name, args, dispatch),
        context: describePage,
      };
    }
    return () => p.setActionHandler(null);
  }, [dispatch]);

  // Start: the mock connects right away; the voice agent on the first click or key press anywhere.
  useEffect(() => {
    if (!ui.open || session.status !== "idle") return;
    const p = getProvider();
    if (!p.requiresGesture) {
      void p.connect();
      return;
    }
    const idle = window.requestIdleCallback?.(preloadSdk) ?? window.setTimeout(preloadSdk, 1500);
    const start = (e: Event) => {
      // closing the card is not an invitation to talk
      if ((e.target as Element | null)?.closest?.("[data-assistant-close]")) return;
      if (e instanceof KeyboardEvent && (e.key === "Escape" || e.key === "Tab" || e.metaKey || e.ctrlKey)) return;
      stop();
      void p.connect();
    };
    const stop = () => {
      window.removeEventListener("pointerdown", start, { capture: true });
      window.removeEventListener("keydown", start, { capture: true });
    };
    window.addEventListener("pointerdown", start, { capture: true });
    window.addEventListener("keydown", start, { capture: true });
    return () => {
      stop();
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, [ui.open, session.status]);

  // Keep the agent aware of the page, section on screen, bag and wishlist.
  useEffect(() => {
    if (!connected) return;
    let last = "";
    const send = () => {
      const context = describePage();
      if (context === last) return;
      last = context;
      getProvider().sendContext(context);
    };
    const settle = window.setTimeout(send, 250); // after the new route renders
    const interval = window.setInterval(send, 1500);
    return () => {
      window.clearTimeout(settle);
      window.clearInterval(interval);
    };
  }, [connected, pathname]);

  return { ui, session, posterSrc: getProvider().posterSrc, hasVideo: getProvider().hasVideo };
}
