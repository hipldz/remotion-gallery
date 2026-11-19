import { Audio, staticFile, useCurrentFrame } from "remotion";
import {
  voiceoverVolume,
  type VoiceoverProject,
  type VoiceTrack,
} from "remotion-voiceover/core";
import { FPS } from "./theme";

// public/audio/calming-ambient-technology.mp3 约 178 秒，覆盖整片，无需循环。
const MUSIC_SRC = "audio/calming-ambient-technology.mp3";
const NORMAL_VOLUME = 0.16;
const DUCKED_VOLUME = 0.055;
const START_FADE = 3 * FPS;
const END_FADE = 5 * FPS;

/** 背景纯音乐：开头淡入、结尾淡出，人声出现时自动压低。 */
export function Soundtrack({
  project,
  tracks,
}: {
  project: VoiceoverProject;
  tracks: readonly VoiceTrack[];
}) {
  const frame = useCurrentFrame();
  const fadeIn = Math.min(1, frame / START_FADE);
  const fadeOut = Math.min(1, (project.durationInFrames - frame) / END_FADE);
  const volume = voiceoverVolume(frame, tracks, project, {
    normal: NORMAL_VOLUME,
    ducked: DUCKED_VOLUME,
    fadeFrames: Math.round(FPS * 0.4),
  });
  return (
    <Audio
      name="Calming Ambient Technology"
      src={staticFile(MUSIC_SRC)}
      volume={volume * Math.max(0, fadeIn) * Math.max(0, fadeOut)}
    />
  );
}
