import assert from 'node:assert/strict';
import { parseVoiceManifest, resolveVoiceSegments, type VoiceTrack } from 'remotion-voiceover/core';
import { baseTimeline, captionsFor, resolveTiming, totalFrames } from '../src/lib/timeline';
import { musicMix, musicVolumeAt } from '../src/lib/music';
import { createVoiceoverProject, withImportedVoiceTracks } from '../src/voiceover.config';

const project = createVoiceoverProject(baseTimeline);
assert.equal(project.durationInFrames, totalFrames(baseTimeline));
assert.equal(project.scenes!.filter((scene) => scene.recordable).length, 31);
assert.deepEqual(
  project.captions!.map((cue) => cue.text),
  baseTimeline.flatMap(captionsFor).map((cue) => cue.text),
);
assert.ok(project.scenes!.filter((scene) => !scene.recordable).every((scene) => !project.captions!.some((cue) => cue.sceneId === scene.id)));

const full: VoiceTrack = {
  id: 'full',
  scope: 'full',
  src: 'narration/full.wav',
  startFrame: 0,
  durationInFrames: project.durationInFrames,
  recordedAt: 'test',
};
const shot = baseTimeline.find((entry) => entry.id === 'Z04')!;
const retake: VoiceTrack = { id: 'retake', scope: shot.id, src: 'narration/retake.wav', startFrame: shot.from, durationInFrames: 30, recordedAt: 'test' };
const segments = resolveVoiceSegments([full, retake], project);
assert.equal(resolveVoiceSegments([full], project).length, 1, 'Full-film audio must remain continuous across cuts');
assert.equal(segments.find((segment) => segment.from === shot.from)!.id, retake.id);
assert.ok(
  !segments.some((segment) => segment.from > shot.from && segment.from < shot.from + shot.duration),
  'A short retake leaves silence for the rest of the shot',
);
assert.equal(segments.find((segment) => segment.from === shot.from + shot.duration)!.trimBefore, shot.from + shot.duration);
parseVoiceManifest({ version: 1, tracks: [full, retake] }, project);

const importedTimeline = resolveTiming({ P06: 10 }, ['vo/P06.wav']);
assert.ok(totalFrames(importedTimeline) > totalFrames(baseTimeline));
const extended = createVoiceoverProject(importedTimeline);
assert.equal(extended.scenes!.find((scene) => scene.id === 'Z04')!.from, importedTimeline.find((entry) => entry.id === 'Z04')!.from);
const imported = withImportedVoiceTracks(importedTimeline, []);
assert.equal(imported[0].startFrame, importedTimeline.find((entry) => entry.id === 'P06')!.from + 9);
const replacement = { ...retake, scope: 'P06', startFrame: importedTimeline.find((entry) => entry.id === 'P06')!.from };
assert.deepEqual(withImportedVoiceTracks(importedTimeline, [replacement]), [replacement]);
assert.deepEqual(withImportedVoiceTracks(importedTimeline, [full]), [full]);
parseVoiceManifest({ version: 1, tracks: imported }, extended);

const card = baseTimeline.find((entry) => entry.id === 'Z00')!;
const cardFrame = card.from + 20;
assert.ok(musicVolumeAt(cardFrame, baseTimeline) > musicMix.narration);
assert.equal(
  musicVolumeAt(cardFrame, baseTimeline, resolveVoiceSegments([full], project)),
  musicMix.narration,
  'Music also ducks for voice over chapter cards',
);
console.log('PASS: 31 recording slots, shared prompts, elastic timing, imported audio fallback, retake silence/source offsets, and music ducking.');
