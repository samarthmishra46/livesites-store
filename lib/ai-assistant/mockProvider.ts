import { createEventBus } from "./eventBus";
import type { AssistantEvents, AssistantProvider } from "./types";

const GREETING = "How can I help you today?";

/**
 * Offline stand-in for the voice agent (used when NEXT_PUBLIC_ASSISTANT_PROVIDER is
 * not "elevenlabs"): "connects", greets the shopper and reflects microphone state.
 * It never emits actions.
 */
export function createMockAssistantProvider(): AssistantProvider {
  const bus = createEventBus<AssistantEvents>();
  let mic = true;
  let connected = false;
  let pending: Promise<void> | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let seq = 0;

  const say = (text: string) => bus.emit("message", { id: `m${++seq}`, role: "assistant", text });
  const status = (s: AssistantEvents["status"]["status"]) => bus.emit("status", { status: s });

  return {
    name: "mock",
    posterSrc: "/images/assistant-portrait.jpg",
    requiresGesture: false,
    connect() {
      if (connected) return Promise.resolve();
      pending ??= (async () => {
        status("connecting");
        await new Promise<void>((resolve) => {
          timer = setTimeout(resolve, 700);
        });
        connected = true;
        pending = null;
        status(mic ? "live" : "muted");
        say(GREETING);
      })();
      return pending;
    },
    async disconnect() {
      clearTimeout(timer);
      connected = false;
      pending = null;
      status("disconnected");
    },
    setMicrophoneEnabled(enabled) {
      mic = enabled;
      if (!connected) return;
      status(enabled ? "live" : "muted");
      say(enabled ? "I'm listening — ask me anything." : "Mic is off. Tap the mic when you're ready to talk.");
    },
    setCameraEnabled() {
      // The mock has no outgoing video; the UI reflects the toggle on its own.
    },
    async sendUserMessage(text) {
      bus.emit("message", { id: `m${++seq}`, role: "user", text });
      say("The live agent isn't switched on for this preview, so I can't answer yet.");
    },
    sendContext() {},
    getOutputLevel: () => 0,
    setActionHandler() {},
    on: bus.on,
  };
}
