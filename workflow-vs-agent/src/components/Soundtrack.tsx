import { Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { voiceoverVolume, type VoiceTrack } from "remotion-voiceover/core";
import { DURATION, FPS } from "../data/theme";
import { clamp } from "../lib/motion";
import { voiceoverProject } from "../voiceover.config";

// Adjust this value to change the background level (0 = silent, 1 = original).
const MUSIC_VOLUME = 0.12;
const VOICE_MUSIC_VOLUME = 0.045;
// sb_reverie.mp3: 223.672925 seconds, verified with ffprobe; round down to frames.
const MUSIC_FRAMES = 6710;
const CROSSFADE = 4 * FPS;
const MUSIC_STEP = MUSIC_FRAMES - CROSSFADE;
const musicClips = Array.from(
  { length: Math.ceil((DURATION - CROSSFADE) / MUSIC_STEP) },
  (_, index) => {
    const from = index * MUSIC_STEP;
    return { from, duration: Math.min(MUSIC_FRAMES, DURATION - from) };
  },
);

const cues: [number, string, number?][] = [
  [11.3, "swell"],
  [20.8, "click"],
  [22, "click"],
  [23.2, "click"],
  [49.5, "pop", 1],
  [59.5, "pop", 1.12],
  [69.5, "pop", 1.26],
  [79.5, "pop", 1.4],
  [89.5, "pop", 1.6],
  [91.8, "stamp"],
  [98.5, "swell"],
  [119.5, "click"],
  [128, "stamp"],
  [129.5, "stamp"],
  [131, "stamp"],
  [139.3, "guard"],
  [141.3, "guard"],
  [143.3, "guard"],
  [145.3, "guard"],
  [149.3, "stamp"],
  [160.9, "guard"],
  [171, "click"],
  [212.8, "guard"],
  [217.2, "click"],
  [229, "swipe"],
  [240.3, "swipe"],
  [265.6, "swell"],
  [281.1, "click"],
  [293, "click"],
  [296, "click"],
  [300, "swipe"],
  [311.4, "stamp"],
  [313.6, "swell"],
  [338.7, "pop", 1],
  [338.9, "pop", 1.2],
  [339.1, "pop", 1.4],
  [339.3, "pop", 1.6],
];
const soundDuration: Record<string, number> = {
  click: 0.15,
  pop: 0.26,
  stamp: 0.6,
  swipe: 0.4,
  guard: 0.85,
  swell: 1.4,
};

function BackgroundMusic({
  from,
  duration,
  voiceTracks,
}: {
  from: number;
  duration: number;
  voiceTracks: readonly VoiceTrack[];
}) {
  const frame = useCurrentFrame();
  const fadeInFrames = from === 0 ? 3 * FPS : CROSSFADE;
  const fadeOutFrames = from + duration === DURATION ? 5 * FPS : CROSSFADE;
  const fadeIn = Math.sin((clamp(frame / fadeInFrames) * Math.PI) / 2);
  const fadeOut = Math.sin(
    (clamp((duration - frame) / fadeOutFrames) * Math.PI) / 2,
  );
  const volume = voiceoverVolume(from + frame, voiceTracks, voiceoverProject, {
    normal: MUSIC_VOLUME,
    ducked: VOICE_MUSIC_VOLUME,
    fadeFrames: Math.round(FPS * 0.4),
  });
  return (
    <Audio
      name="Reverie · Scott Buckley"
      src={staticFile("audio/sb_reverie.mp3")}
      volume={volume * fadeIn * fadeOut}
    />
  );
}

export function Soundtrack({
  voiceTracks,
}: {
  voiceTracks: readonly VoiceTrack[];
}) {
  return (
    <>
      {musicClips.map(({ from, duration }, index) => (
        <Sequence
          key={from}
          name={`Music · Reverie / ${index + 1}`}
          from={from}
          durationInFrames={duration}
        >
          <BackgroundMusic
            from={from}
            duration={duration}
            voiceTracks={voiceTracks}
          />
        </Sequence>
      ))}
      {cues.map(([seconds, file, speed], i) => (
        <Sequence
          key={i}
          name={`SFX · ${file}`}
          from={Math.round(seconds * FPS)}
          durationInFrames={Math.min(
            Math.ceil((soundDuration[file] / (speed ?? 1)) * FPS),
            Math.round((340 - seconds) * FPS),
          )}
        >
          <Audio
            src={staticFile(`audio/${file}.wav`)}
            volume={0.15}
            playbackRate={speed ?? 1}
          />
        </Sequence>
      ))}
    </>
  );
}
