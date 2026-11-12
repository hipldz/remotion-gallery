import { Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { mapVoiceFrame, voiceoverVolume, type VoiceoverProject, type VoiceTrack } from "remotion-voiceover/core";
import { FPS } from "../data/theme";
import { clamp } from "../lib/motion";
import { voiceoverProject } from "../voiceover.config";

// Adjust this value to change the background level (0 = silent, 1 = original).
const MUSIC_VOLUME = 0.12;
const VOICE_MUSIC_VOLUME = 0.045;
// sb_reverie.mp3: 223.672925 seconds, verified with ffprobe; round down to frames.
const MUSIC_FRAMES = 6710;
const CROSSFADE = 4 * FPS;
const MUSIC_STEP = MUSIC_FRAMES - CROSSFADE;
const musicClips = (durationInFrames: number) => Array.from(
  { length: Math.max(1, Math.ceil((durationInFrames - CROSSFADE) / MUSIC_STEP)) },
  (_, index) => {
    const from = index * MUSIC_STEP;
    return { from, duration: Math.min(MUSIC_FRAMES, durationInFrames - from) };
  },
);

const cues: [number, string, number?][] = [
  [27.3, "swell"],
  [54, "click"],
  [55.5, "click"],
  [58, "click"],
  [97.3, "pop", 1],
  [107.5, "pop", 1.12],
  [117.5, "pop", 1.26],
  [127.5, "pop", 1.4],
  [137.5, "pop", 1.6],
  [139.8, "stamp"],
  [146.5, "swell"],
  [167.5, "click"],
  [176, "stamp"],
  [177.5, "stamp"],
  [179, "stamp"],
  [187.3, "guard"],
  [189.3, "guard"],
  [191.3, "guard"],
  [193.3, "guard"],
  [197.3, "stamp"],
  [208.9, "guard"],
  [219, "click"],
  [260.8, "guard"],
  [265.2, "click"],
  [277, "swipe"],
  [288.3, "swipe"],
  [313.6, "swell"],
  [329.1, "click"],
  [341, "click"],
  [344, "click"],
  [348, "swipe"],
  [359.4, "stamp"],
  [361.6, "swell"],
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
  project,
}: {
  from: number;
  duration: number;
  voiceTracks: readonly VoiceTrack[];
  project: VoiceoverProject;
}) {
  const frame = useCurrentFrame();
  const fadeInFrames = from === 0 ? 3 * FPS : CROSSFADE;
  const fadeOutFrames = from + duration === project.durationInFrames ? 5 * FPS : CROSSFADE;
  const fadeIn = Math.sin((clamp(frame / fadeInFrames) * Math.PI) / 2);
  const fadeOut = Math.sin(
    (clamp((duration - frame) / fadeOutFrames) * Math.PI) / 2,
  );
  const volume = voiceoverVolume(from + frame, voiceTracks, project, {
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
  project = voiceoverProject,
}: {
  voiceTracks: readonly VoiceTrack[];
  project?: VoiceoverProject;
}) {
  return (
    <>
      {musicClips(project.durationInFrames).map(({ from, duration }, index) => (
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
            project={project}
          />
        </Sequence>
      ))}
      {cues.map(([seconds, file, speed], i) => (
        <Sequence
          key={i}
          name={`SFX · ${file}`}
          from={mapVoiceFrame(Math.round(seconds * FPS), voiceoverProject, project)}
          durationInFrames={Math.min(
            Math.ceil((soundDuration[file] / (speed ?? 1)) * FPS),
            project.durationInFrames - mapVoiceFrame(Math.round(seconds * FPS), voiceoverProject, project),
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
