"use client";

import { Mic, MicOff, Monitor, MonitorUp, Video, VideoOff, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function ControlButton({
  active,
  onClick,
  label,
  icon: Icon,
  filled,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: LucideIcon;
  filled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-[2.4em] shrink-0 items-center justify-center rounded-full transition-[background-color,color,transform] duration-200 ease-soft active:scale-90",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
        active
          ? "bg-white text-ink shadow-[0_1px_3px_rgb(0_0_0/0.15)] hover:bg-white/90"
          : "bg-[#55535a]/55 text-white hover:bg-[#55535a]/70",
      )}
    >
      <Icon
        className="size-[1.15em]"
        strokeWidth={filled ? 0 : 2}
        fill={filled ? "currentColor" : "none"}
        aria-hidden
      />
    </button>
  );
}

export function AIAssistantControls({
  micEnabled,
  cameraEnabled,
  screenShared,
  onToggleMic,
  onToggleCamera,
  onToggleScreen,
}: {
  micEnabled: boolean;
  cameraEnabled: boolean;
  screenShared: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreen: () => void;
}) {
  return (
    <div
      role="toolbar"
      aria-label="Call controls"
      className="absolute inset-x-0 bottom-0 flex h-[3.5em] items-center justify-center gap-[0.85em] border-t border-white/25 bg-[#d9d4d0]/35 backdrop-blur-xl backdrop-saturate-150"
    >
      <ControlButton
        active={micEnabled}
        onClick={onToggleMic}
        label={micEnabled ? "Mute microphone" : "Unmute microphone"}
        icon={micEnabled ? Mic : MicOff}
      />
      <ControlButton
        active={cameraEnabled}
        onClick={onToggleCamera}
        label={cameraEnabled ? "Turn video off" : "Turn video on"}
        icon={cameraEnabled ? Video : VideoOff}
        filled={cameraEnabled}
      />
      <ControlButton
        active={screenShared}
        onClick={onToggleScreen}
        label={screenShared ? "Stop sharing screen" : "Share your screen with the stylist"}
        icon={screenShared ? MonitorUp : Monitor}
      />
    </div>
  );
}
