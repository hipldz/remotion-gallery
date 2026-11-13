import assert from 'node:assert/strict';
import { parseVoiceManifest, resizeVoiceRange, resolveVoiceSegments, retimeVoiceTracks, type VoiceTrack } from 'remotion-voiceover/core';
import { baseTimeline, captionsFor, resolveTiming, totalFrames } from '../src/lib/timeline';
import { musicMix, musicVolumeAt } from '../src/lib/music';
import { createVoiceoverProject, resolveVoiceTimeline, withImportedVoiceTracks } from '../src/voiceover.config';

const project = createVoiceoverProject(baseTimeline);
assert.equal(project.durationInFrames, totalFrames(baseTimeline));
assert.equal(project.scenes!.filter((scene) => scene.recordable).length, 35);
assert.equal(project.durationInFrames, 7920);
for (const chapter of new Set(baseTimeline.map((entry) => entry.chapterKey))) {
  const chapterShots = baseTimeline.filter((entry) => entry.chapterKey === chapter);
  assert.equal(
    chapterShots.at(-1)!.from + chapterShots.at(-1)!.duration - chapterShots[0].from,
    totalFrames(chapterShots),
    'Chapter playback requires a contiguous selection',
  );
}
for (const entry of baseTimeline.filter((entry) => entry.narration)) {
  assert.ok(captionsFor(entry).at(-1)!.to <= entry.from + entry.duration - entry.tailFrames, 'Captions must leave the planned pause before a cut');
}
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

const card = baseTimeline.find((entry) => entry.id === 'A00')!;
const cardFrame = card.from + 20;
for (const frame of [cardFrame, shot.from + 60, baseTimeline.find((entry) => entry.id === 'F07')!.from + 120]) {
  assert.equal(musicVolumeAt(frame, baseTimeline), musicMix.volume, 'Music stays at the same level during narration and chapter gaps');
}
assert.equal(musicVolumeAt(0, baseTimeline), 0);
assert.equal(musicVolumeAt(totalFrames(baseTimeline) - 1, baseTimeline), 0);
const edited = resizeVoiceRange(project, 'P01', baseTimeline[0].duration + 90);
const retimed = resolveVoiceTimeline(baseTimeline, edited);
assert.equal(totalFrames(retimed), project.durationInFrames + 90);
assert.equal(retimed[1].from, baseTimeline[1].from + 90);
assert.equal(retimed[0].animationFrames, baseTimeline[0].animationFrames, 'Shot choreography survives edited timing');
const moved = retimeVoiceTracks([retake], project, edited)[0];
assert.equal(moved.startFrame, retake.startFrame + 90, 'Later voice tracks follow the edited cut');
const script = { ...edited, captions: [{ text: '新的一句字幕', startFrame: 0, endFrame: 60 }] };
assert.equal(resolveVoiceTimeline(baseTimeline, script)[0].narration, '新的一句字幕', 'Whole-film edits may omit sceneId');
console.log('PASS: 35 recording slots, 4:24 timeline, chapter offsets, prompt pauses, elastic timing, retakes, and constant music.');
