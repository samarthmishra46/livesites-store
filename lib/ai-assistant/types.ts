import type { AssistantAction, DispatchResult } from "@/lib/actions/types";

export type AssistantStatus = "idle" | "connecting" | "live" | "muted" | "disconnected" | "error";

export interface AssistantMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
}

/** Everything a provider reports back to the UI. */
export interface AssistantEvents {
  status: { status: AssistantStatus; detail?: string };
  message: AssistantMessage;
  /** The assistant's voice is playing. */
  speaking: boolean;
  /** "text" when the microphone is unavailable and the session runs as typed chat. */
  inputMode: "voice" | "text";
  /** Time from the shopper finishing a sentence to the assistant starting to speak. */
  metrics: { turnLatencyMs: number };
}

/** Runs an action the assistant asked for, through the same dispatcher as the UI. */
export type ActionHandler = (action: AssistantAction) => DispatchResult;

/**
 * Boundary between the floating assistant UI and whatever powers it (the mock, the
 * ElevenLabs voice agent, later a LiveAvatar video agent). The UI and the ecommerce
 * components never import a provider directly.
 */
export interface AssistantProvider {
  readonly name: string;
  /** Portrait/poster shown while video is unavailable. */
  readonly posterSrc: string;
  /** Audio providers can only start after a user gesture (browser autoplay rules). */
  readonly requiresGesture: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  setMicrophoneEnabled(enabled: boolean): void;
  setCameraEnabled(enabled: boolean): void;
  sendUserMessage(text: string): Promise<void>;
  /** Silent context (current page, bag…) that informs the assistant without prompting a reply. */
  sendContext(text: string): void;
  /** Loudness of the assistant's voice right now, 0–1. */
  getOutputLevel(): number;
  setActionHandler(handler: ActionHandler | null): void;
  on<K extends keyof AssistantEvents>(event: K, cb: (value: AssistantEvents[K]) => void): () => void;
}

/** Persisted UI preferences for the floating panel (never product state). */
export interface AssistantUIState {
  open: boolean;
  micEnabled: boolean;
  cameraEnabled: boolean;
  chatOpen: boolean;
  /** Top-left corner in viewport px; null = default anchor over the hero. */
  position: { x: number; y: number } | null;
}
