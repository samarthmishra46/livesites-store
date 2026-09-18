import type { AssistantAction } from "@/lib/actions/types";

export type AssistantStatus = "idle" | "connecting" | "live" | "muted" | "disconnected" | "error";

export interface AssistantMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
}

/**
 * Boundary between the floating assistant UI and whatever powers it.
 * Phase 1 ships a mock; Phase 2 swaps in a realtime voice/avatar provider
 * without touching the UI or the ecommerce components.
 */
export interface AssistantProvider {
  readonly name: string;
  /** Portrait/poster shown while video is unavailable. */
  readonly posterSrc: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  setMicrophoneEnabled(enabled: boolean): void;
  setCameraEnabled(enabled: boolean): void;
  sendUserMessage(text: string): Promise<void>;
  onStatus(cb: (status: AssistantStatus) => void): () => void;
  onAssistantMessage(cb: (message: AssistantMessage) => void): () => void;
  onAction(cb: (action: AssistantAction) => void): () => void;
}

/** Persisted UI preferences for the floating panel (never product state). */
export interface AssistantUIState {
  open: boolean;
  micEnabled: boolean;
  cameraEnabled: boolean;
  screenShared: boolean;
  /** Top-left corner in viewport px; null = default anchor over the hero. */
  position: { x: number; y: number } | null;
}
