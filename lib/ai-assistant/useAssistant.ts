"use client";

import { useEffect } from "react";
import { useActionDispatcher } from "@/lib/actions/useActionDispatcher";
import { createStore, useStore } from "@/lib/store/createStore";
import { createMockAssistantProvider } from "./mockProvider";
import type { AssistantMessage, AssistantProvider, AssistantStatus, AssistantUIState } from "./types";

const defaultUI: AssistantUIState = {
  open: true,
  micEnabled: true,
  cameraEnabled: true,
  screenShared: false,
  position: null,
};

export const assistantUIStore = createStore<AssistantUIState>(defaultUI, {
  persistKey: "livesites:assistant",
  parse: (v) => (v && typeof v === "object" ? { ...defaultUI, ...(v as Partial<AssistantUIState>) } : null),
});

interface SessionState {
  status: AssistantStatus;
  message: AssistantMessage | null;
}

const sessionStore = createStore<SessionState>({ status: "idle", message: null });

// Swap this line for a real provider in Phase 2.
let provider: AssistantProvider | null = null;
const getProvider = () => (provider ??= createMockAssistantProvider());

export const assistantUI = {
  open: () => assistantUIStore.set((s) => ({ ...s, open: true })),
  close: () => assistantUIStore.set((s) => ({ ...s, open: false })),
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
  toggleScreenShare: () => assistantUIStore.set((s) => ({ ...s, screenShared: !s.screenShared })),
  setPosition: (position: AssistantUIState["position"]) => assistantUIStore.set((s) => ({ ...s, position })),
};

/** Connects the provider for the lifetime of the floating panel and routes its actions. */
export function useAssistant() {
  const ui = useStore(assistantUIStore);
  const session = useStore(sessionStore);
  const dispatch = useActionDispatcher();

  useEffect(() => {
    const p = getProvider();
    const offStatus = p.onStatus((status) => sessionStore.set((s) => ({ ...s, status })));
    const offMessage = p.onAssistantMessage((message) => {
      if (message.role === "assistant") sessionStore.set((s) => ({ ...s, message }));
    });
    const offAction = p.onAction((action) => dispatch(action));
    p.setMicrophoneEnabled(assistantUIStore.get().micEnabled);
    void p.connect();
    return () => {
      offStatus();
      offMessage();
      offAction();
    };
  }, [dispatch]);

  return { ui, session, posterSrc: getProvider().posterSrc };
}
