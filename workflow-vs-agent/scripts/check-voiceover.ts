import assert from "node:assert/strict";
import {
  parseVoiceManifest,
  resolveVoiceSegments,
  type VoiceTrack,
} from "remotion-voiceover/core";
import { DURATION, FPS } from "../src/data/theme";
import { shots } from "../src/data/timeline";
import { voiceoverProject } from "../src/voiceover.config";

assert.equal(voiceoverProject.durationInFrames, DURATION);
assert.equal(
  voiceoverProject.scenes!.filter((scene) => scene.recordable).length,
  39,
);
assert.equal(voiceoverProject.captions!.length, 107);
for (const shot of shots) {
  const scene = voiceoverProject.scenes!.find((item) => item.id === shot.id)!;
  assert.equal(scene.from, shot.start * FPS);
  assert.equal(scene.durationInFrames, (shot.end - shot.start) * FPS);
  assert.equal(scene.recordable, shot.subtitles.length > 0);
  assert.deepEqual(
    voiceoverProject
      .captions!.filter((cue) => cue.sceneId === shot.id)
      .map((cue) => ({
        start: cue.startFrame,
        end: cue.endFrame,
        text: cue.text,
      })),
    shot.subtitles.map((cue) => ({
      start: Math.round(cue.start * FPS),
      end: Math.round(cue.end * FPS),
      text: cue.text.replaceAll("**", ""),
    })),
  );
}

const full: VoiceTrack = {
  id: "full",
  scope: "full",
  src: "narration/full.wav",
  startFrame: 0,
  durationInFrames: DURATION,
  recordedAt: "test",
};
const scene = voiceoverProject.scenes!.find((item) => item.id === "S1-2")!;
const retake: VoiceTrack = {
  id: "retake",
  scope: scene.id,
  src: "narration/retake.wav",
  startFrame: scene.from,
  durationInFrames: FPS,
  recordedAt: "test",
};
parseVoiceManifest({ version: 1, tracks: [full, retake] }, voiceoverProject);
assert.equal(resolveVoiceSegments([full], voiceoverProject).length, 1);
const segments = resolveVoiceSegments([full, retake], voiceoverProject);
assert.equal(
  segments.find((segment) => segment.from === scene.from)!.id,
  retake.id,
);
assert.ok(
  !segments.some(
    (segment) =>
      segment.from > scene.from &&
      segment.from < scene.from + scene.durationInFrames,
  ),
);
assert.equal(
  segments.find(
    (segment) => segment.from === scene.from + scene.durationInFrames,
  )!.trimBefore,
  scene.from + scene.durationInFrames,
);
console.log(
  "PASS: 39 recording slots, 107 shared prompts, absolute frame conversion, continuous full-film audio and silent tails after short retakes.",
);
