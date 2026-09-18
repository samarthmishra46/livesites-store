import type { AssistantAction } from "@/lib/actions/types";
import type { AssistantMessage, AssistantProvider, AssistantStatus } from "./types";

type Listener<T> = (value: T) => void;

function emitter<T>() {
  const listeners = new Set<Listener<T>>();
  return {
    on: (cb: Listener<T>) => {
      listeners.add(cb);
      return () => void listeners.delete(cb);
    },
    emit: (value: T) => listeners.forEach((cb) => cb(value)),
  };
}

const GREETING = "How can I help you today?";

/**
 * Phase 1 stand-in for a realtime avatar service: "connects", greets the shopper
 * and reflects microphone state. It never emits actions.
 */
export function createMockAssistantProvider(): AssistantProvider {
  const status = emitter<AssistantStatus>();
  const messages = emitter<AssistantMessage>();
  const actions = emitter<AssistantAction>();
  let mic = true;
  let connected = false;
  let pending: Promise<void> | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let seq = 0;

  const say = (text: string) => messages.emit({ id: `m${++seq}`, role: "assistant", text });

  return {
    name: "mock",
    posterSrc: "/images/assistant-portrait.jpg",
    connect() {
      if (connected) return Promise.resolve();
      pending ??= (async () => {
        status.emit("connecting");
        await new Promise<void>((resolve) => {
          timer = setTimeout(resolve, 700);
        });
        connected = true;
        pending = null;
        status.emit(mic ? "live" : "muted");
        say(GREETING);
      })();
      return pending;
    },
    async disconnect() {
      clearTimeout(timer);
      connected = false;
      pending = null;
      status.emit("disconnected");
    },
    setMicrophoneEnabled(enabled) {
      mic = enabled;
      if (!connected) return;
      status.emit(enabled ? "live" : "muted");
      say(enabled ? "I'm listening — ask me anything." : "Mic is off. Tap the mic when you're ready to talk.");
    },
    setCameraEnabled() {
      // The mock has no outgoing video; the UI reflects the toggle on its own.
    },
    async sendUserMessage(text) {
      messages.emit({ id: `m${++seq}`, role: "user", text });
      say("I'd love to help with that — live styling arrives in the next release.");
    },
    onStatus: status.on,
    onAssistantMessage: messages.on,
    onAction: actions.on,
  };
}
