/**
 * Direct connection to the ElevenLabs agent from the browser.
 *
 * Anam's server-side connector bridges audio and nothing else — text sent through
 * its SDK lands in Anam's own transcript and never reaches the agent — so we hold
 * the conversation ourselves and hand Anam only the audio to lip-sync. That keeps
 * contextual updates, typed turns and client tools working exactly as they do on
 * the voice-only provider.
 */

/** 64 ms of 16 kHz mono audio per message: small enough to keep turn-taking crisp. */
const CAPTURE_FRAMES = 1024;
const SAMPLE_RATE = 16_000;

/** Buffers microphone input into fixed frames on the audio thread. */
const CAPTURE_WORKLET = `
class PcmCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(${CAPTURE_FRAMES});
    this.at = 0;
  }
  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (channel) {
      for (let i = 0; i < channel.length; i++) {
        this.buffer[this.at++] = channel[i];
        if (this.at === this.buffer.length) {
          this.port.postMessage(this.buffer.slice(0));
          this.at = 0;
        }
      }
    }
    return true;
  }
}
registerProcessor("pcm-capture", PcmCapture);
`;

export interface AgentSocketHandlers {
  /** The agent's voice, base64 PCM, in the format the agent is configured to emit. */
  onAudio(base64: string): void;
  /** `final` is false for the streaming partials that make captions appear as they're spoken. */
  onAgentText(text: string, final: boolean): void;
  onUserText(text: string): void;
  /** The shopper talked over the agent: drop whatever is still queued. */
  onInterruption(): void;
  /** The agent finished its turn; no more audio is coming for it. */
  onTurnEnd(): void;
  onToolCall(name: string, args: unknown): string;
  onOpen(): void;
  onClose(reason: "agent" | "network"): void;
}

export interface AgentSocket {
  sendUserMessage(text: string): void;
  sendContext(text: string): void;
  /** True once the microphone is capturing; false when the shopper refused it. */
  startMicrophone(): Promise<boolean>;
  setMicrophoneEnabled(enabled: boolean): void;
  close(): void;
}

const toBase64 = (bytes: Uint8Array) => {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
};

interface ServerMessage {
  type?: string;
  audio_event?: { audio_base_64?: string };
  agent_response_event?: { agent_response?: string };
  agent_response_correction_event?: { corrected_agent_response?: string };
  tentative_agent_response_internal_event?: { tentative_agent_response?: string };
  user_transcription_event?: { user_transcript?: string };
  ping_event?: { event_id?: number };
  client_tool_call?: { tool_name?: string; tool_call_id?: string; parameters?: unknown };
}

export function connectAgentSocket(signedUrl: string, handlers: AgentSocketHandlers): AgentSocket {
  const ws = new WebSocket(signedUrl);
  let closedCleanly = false;

  // microphone
  let media: MediaStream | null = null;
  let context: AudioContext | null = null;
  let capture: AudioWorkletNode | null = null;
  let micEnabled = true;

  const send = (payload: object) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
  };

  ws.onopen = () => handlers.onOpen();

  ws.onmessage = (event: MessageEvent<string>) => {
    let message: ServerMessage;
    try {
      message = JSON.parse(event.data) as ServerMessage;
    } catch {
      return;
    }
    switch (message.type) {
      case "audio": {
        const audio = message.audio_event?.audio_base_64;
        if (audio) handlers.onAudio(audio);
        break;
      }
      case "agent_response": {
        const text = message.agent_response_event?.agent_response;
        if (text) handlers.onAgentText(text, true);
        break;
      }
      case "agent_response_correction": {
        const text = message.agent_response_correction_event?.corrected_agent_response;
        if (text) handlers.onAgentText(text, true);
        break;
      }
      case "internal_tentative_agent_response": {
        const text = message.tentative_agent_response_internal_event?.tentative_agent_response;
        if (text) handlers.onAgentText(text, false);
        break;
      }
      case "user_transcript": {
        const text = message.user_transcription_event?.user_transcript;
        if (text) handlers.onUserText(text);
        break;
      }
      case "interruption":
        handlers.onInterruption();
        break;
      case "agent_response_complete":
        handlers.onTurnEnd();
        break;
      case "ping":
        send({ type: "pong", event_id: message.ping_event?.event_id });
        break;
      case "client_tool_call": {
        const call = message.client_tool_call;
        if (!call?.tool_call_id) break;
        const result = handlers.onToolCall(call.tool_name ?? "", call.parameters);
        send({
          type: "client_tool_result",
          tool_call_id: call.tool_call_id,
          result,
          is_error: result.startsWith("Error:"),
        });
        break;
      }
    }
  };

  ws.onclose = (event) => {
    stopMicrophone();
    if (closedCleanly) return;
    // 1000 is the agent hanging up; anything else is a connection we lost.
    handlers.onClose(event.code === 1000 ? "agent" : "network");
  };

  ws.onerror = () => {
    // onclose always follows, and carries the reason we report.
  };

  function stopMicrophone() {
    capture?.port.close();
    capture?.disconnect();
    media?.getTracks().forEach((track) => track.stop());
    void context?.close().catch(() => {});
    capture = null;
    media = null;
    context = null;
  }

  return {
    sendUserMessage(text) {
      send({ type: "user_message", text });
    },
    sendContext(text) {
      send({ type: "contextual_update", text });
    },
    async startMicrophone() {
      try {
        media = await navigator.mediaDevices.getUserMedia({
          audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        // Capturing at the rate the agent expects avoids resampling on the way out.
        context = new AudioContext({ sampleRate: SAMPLE_RATE });
        const url = URL.createObjectURL(new Blob([CAPTURE_WORKLET], { type: "text/javascript" }));
        await context.audioWorklet.addModule(url);
        URL.revokeObjectURL(url);

        capture = new AudioWorkletNode(context, "pcm-capture", { numberOfOutputs: 1, outputChannelCount: [1] });
        capture.port.onmessage = ({ data }: MessageEvent<Float32Array>) => {
          if (!micEnabled) return;
          const pcm = new Int16Array(data.length);
          for (let i = 0; i < data.length; i++) {
            const sample = Math.max(-1, Math.min(1, data[i]));
            pcm[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
          }
          send({ user_audio_chunk: toBase64(new Uint8Array(pcm.buffer)) });
        };
        context.createMediaStreamSource(media).connect(capture);
        // The node emits silence; it only needs a sink to keep the graph pulling.
        capture.connect(context.destination);
        return true;
      } catch {
        stopMicrophone();
        return false;
      }
    },
    setMicrophoneEnabled(enabled) {
      micEnabled = enabled;
      media?.getAudioTracks().forEach((track) => (track.enabled = enabled));
    },
    close() {
      closedCleanly = true;
      stopMicrophone();
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) ws.close(1000);
    },
  };
}
