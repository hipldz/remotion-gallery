import test from 'node:test';
import assert from 'node:assert/strict';
import {defineVoiceoverProject, getVoiceCaptions, parseVoiceManifest, previewVoiceTracks,
  alignVoiceRecording, applyVoiceTimeline, mapVoiceFrame, resizeVoiceRange, retimeVoiceCaption, retimeVoiceTracks,
  resolveVoiceSegments, voiceCaptionsToSrt, voiceCoverage, voiceoverVolume, voiceSeconds, voiceTimeline} from '../dist/core/index.js';

const track = (scope, startFrame, durationInFrames, id = scope) =>
  ({id, scope, startFrame, durationInFrames, src: `narration/${id}.wav`, recordedAt: '2026-11-09'});

test('a project without scenes can record and play a continuous full-film voice', () => {
  const project = defineVoiceoverProject({fps: 24, durationInFrames: 240});
  const full = track('full', 0, 240);
  assert.deepEqual(resolveVoiceSegments([full], project), [{...full, from: 0, duration: 240, trimBefore: 0}]);
  assert.equal(voiceSeconds(full, project), '10.0');
  assert.equal(voiceCoverage([full], project), 1);
  assert.equal(voiceCoverage([], project), 0);
  assert.equal(parseVoiceManifest({version: 1, tracks: [full]}, project).tracks.length, 1);
});

for (const fps of [24, 30, 60, 29.97]) {
  test(`a short scene retake replaces the entire slot at ${fps} fps, preserving full source offsets`, () => {
    const second = Math.round(fps);
    const project = defineVoiceoverProject({fps, durationInFrames: second * 6, scenes: [
      {id: '开场', title: '开场', from: 0, durationInFrames: second},
      {id: 'chapter/b', title: '其他编号', from: second * 2, durationInFrames: second * 2},
    ]});
    const full = track('full', 0, second * 6);
    const retake = track('chapter/b', second * 2, Math.floor(second / 2), 'retake');
    const segments = resolveVoiceSegments([full, retake], project);
    assert.deepEqual(segments.map(item => [item.id, item.from, item.duration, item.trimBefore]), [
      ['full', 0, second * 2, 0],
      ['retake', second * 2, Math.floor(second / 2), 0],
      ['full', second * 4, second * 2, second * 4],
    ]);
    assert.equal(resolveVoiceSegments([full], project).length, 1, 'Scene gaps must not remove full-film narration');
    for (let i = 1; i < segments.length; i++) assert.ok(segments[i].from >= segments[i - 1].from + segments[i - 1].duration);
    parseVoiceManifest({version: 1, tracks: [full, retake]}, project);
  });
}

test('configuration validates frame bounds, overlaps, reserved IDs, and public paths', () => {
  assert.throws(() => defineVoiceoverProject({fps: 0, durationInFrames: 60}));
  assert.throws(() => defineVoiceoverProject({fps: 30, durationInFrames: 1.5}));
  assert.throws(() => defineVoiceoverProject({fps: 30, durationInFrames: 60, manifestSrc: '../outside.json'}));
  assert.throws(() => defineVoiceoverProject({fps: 30, durationInFrames: 60, scenes: [{id: 'full', title: 'bad', from: 0, durationInFrames: 60}]}));
  assert.throws(() => defineVoiceoverProject({fps: 30, durationInFrames: 60, scenes: [
    {id: 'a', title: 'a', from: 0, durationInFrames: 40}, {id: 'b', title: 'b', from: 30, durationInFrames: 30},
  ]}));
});

test('legacy version 1 manifests stay readable; duplicate or out-of-slot takes are rejected', () => {
  const project = defineVoiceoverProject({fps: 30, durationInFrames: 120, scenes: [{id: 'S02', title: 'existing', from: 30, durationInFrames: 60}]});
  const old = track('S02', 30, 45, 'S02-older-uuid');
  assert.deepEqual(parseVoiceManifest({version: 1, tracks: [old]}, project).tracks, [old]);
  assert.throws(() => parseVoiceManifest({version: 2, tracks: [old]}, project));
  assert.throws(() => parseVoiceManifest({tracks: [old, {...old, id: 'another'}]}, project));
  assert.throws(() => parseVoiceManifest({tracks: [{...old, startFrame: 0}]}, project));
  assert.throws(() => parseVoiceManifest({tracks: [{...old, durationInFrames: 100}]}, project));
});

test('optional subtitles are selected by scene ID or intersecting absolute time', () => {
  const project = defineVoiceoverProject({fps: 60, durationInFrames: 180, scenes: [
    {id: 'a', title: 'a', from: 0, durationInFrames: 90}, {id: 'b', title: 'b', from: 90, durationInFrames: 90},
  ], captions: [
    {startFrame: 10, endFrame: 70, text: 'first'},
    {startFrame: 100, endFrame: 150, text: 'second', sceneId: 'b'},
  ]});
  assert.deepEqual(getVoiceCaptions('a', project).map(cue => cue.text), ['first']);
  assert.deepEqual(getVoiceCaptions('b', project).map(cue => cue.text), ['second']);
  assert.equal(getVoiceCaptions('full', project).length, 2);
});

test('draft audition overlays only its scope and leaves the saved manifest untouched', () => {
  const full = track('full', 0, 120), scene = track('a', 30, 30), draft = {...scene, id: 'draft', src: 'blob:local'};
  const manifest = {version: 1, tracks: [full, scene]};
  assert.deepEqual(previewVoiceTracks(manifest, draft), [full, draft]);
  assert.deepEqual(previewVoiceTracks(manifest, {...full, id: 'draft'}), [{...full, id: 'draft'}]);
  assert.deepEqual(manifest.tracks, [full, scene]);
});

test('music stays ducked across adjacent takes and returns to normal in silent retake gaps', () => {
  const project = defineVoiceoverProject({fps: 60, durationInFrames: 360, scenes: [{id: 'middle', title: 'middle', from: 120, durationInFrames: 120}]});
  const full = track('full', 0, 360), complete = track('middle', 120, 120);
  for (const frame of [110, 119, 120, 121, 239, 240, 250]) assert.ok(Math.abs(voiceoverVolume(frame, [full, complete], project) - .2) < 1e-9);
  assert.equal(voiceoverVolume(200, [full, {...complete, durationInFrames: 30}], project), .75);
  assert.equal(voiceoverVolume(0, [], project), .75);
});

for (const fps of [24, 30, 60, 29.97]) {
  test(`an eight-second sentence can take ten seconds and ripple later scenes at ${fps} fps`, () => {
    const eight = Math.round(8 * fps), ten = Math.round(10 * fps), four = Math.round(4 * fps);
    const project = defineVoiceoverProject({fps, durationInFrames: eight + four, scenes: [
      {id: 'a', title: 'first', from: 0, durationInFrames: eight},
      {id: 'b', title: 'later', from: eight, durationInFrames: four},
    ], captions: [
      {startFrame: 0, endFrame: eight, text: 'read slowly', sceneId: 'a'},
      {startFrame: eight, endFrame: eight + four, text: 'later', sceneId: 'b'},
    ]});
    const original = structuredClone(project);
    const edited = alignVoiceRecording(project, 'a', ten, [{index: 0, startFrame: 0, endFrame: ten}]);
    assert.equal(edited.durationInFrames, ten + four);
    assert.equal(edited.scenes[0].durationInFrames, ten);
    assert.equal(edited.scenes[1].from, ten);
    assert.deepEqual(edited.captions.map(cue => [cue.startFrame, cue.endFrame]), [[0, ten], [ten, ten + four]]);
    assert.deepEqual(project, original, 'Draft timing must not mutate the saved project');
    assert.equal(mapVoiceFrame(ten, edited, project), eight);
    assert.deepEqual(applyVoiceTimeline(project, voiceTimeline(edited)), edited);
  });
}

test('sentence markers extend a cue within a longer scene and preserve unread text', () => {
  const project = defineVoiceoverProject({fps: 30, durationInFrames: 660, scenes: [
    {id: 'a', title: 'two sentences and a tail', from: 0, durationInFrames: 540},
    {id: 'b', title: 'next scene', from: 540, durationInFrames: 120},
  ], captions: [
    {startFrame: 30, endFrame: 270, text: 'first', sceneId: 'a'},
    {startFrame: 270, endFrame: 510, text: 'second', sceneId: 'a'},
  ]});
  const partial = alignVoiceRecording(project, 'a', 330, [{index: 0, startFrame: 30, endFrame: 330}]);
  assert.deepEqual(partial.captions.map(cue => [cue.startFrame, cue.endFrame]), [[30, 330], [330, 570]]);
  assert.equal(partial.scenes[0].durationInFrames, 600);
  const complete = alignVoiceRecording(project, 'a', 630, [
    {index: 0, startFrame: 30, endFrame: 330}, {index: 1, startFrame: 330, endFrame: 630},
  ]);
  assert.equal(complete.scenes[0].durationInFrames, 660, 'The original silent tail remains');
  assert.equal(complete.scenes[1].from, 660);
  assert.throws(() => alignVoiceRecording(project, 'a', 330, [{index: 0, startFrame: 30, endFrame: 400}]));
});

for (const fps of [24, 30, 60, 29.97]) {
  test(`editing the first sentence shifts the next sentence and scene while preserving gaps at ${fps} fps`, () => {
    const frame = seconds => Math.round(seconds * fps);
    const total = frame(15) + frame(4);
    const project = defineVoiceoverProject({fps, durationInFrames: total, scenes: [
      {id: 'a', title: 'two sentences and a tail', from: 0, durationInFrames: frame(14)},
      {id: 'b', title: 'after a gap', from: frame(15), durationInFrames: frame(4)},
    ], captions: [
      {sceneId: 'a', startFrame: frame(1), endFrame: frame(9), text: 'eight seconds'},
      {sceneId: 'a', startFrame: frame(10), endFrame: frame(13), text: 'three seconds'},
      {sceneId: 'b', startFrame: frame(15), endFrame: frame(18), text: 'next scene'},
    ]});
    const original = structuredClone(project), ten = frame(10), extra = ten - (frame(9) - frame(1));
    const edited = retimeVoiceCaption(project, 0, {durationInFrames: ten});
    assert.equal(edited.captions[1].startFrame, frame(10) + extra);
    assert.equal(edited.captions[1].endFrame, frame(13) + extra);
    assert.equal(edited.scenes[0].durationInFrames, frame(14) + extra);
    assert.equal(edited.scenes[1].from, frame(15) + extra);
    assert.equal(edited.scenes[1].from - edited.scenes[0].durationInFrames, frame(15) - frame(14));
    assert.equal(edited.scenes[0].durationInFrames - edited.captions[1].endFrame, frame(14) - frame(13));
    assert.equal(edited.durationInFrames, total + extra);
    assert.deepEqual(edited.captions.map(cue => cue.sceneId), ['a', 'a', 'b']);
    assert.deepEqual(retimeVoiceCaption(edited, 0, {durationInFrames: frame(9) - frame(1)}), project);
    assert.deepEqual(project, original);
  });
}

test('caption edits infer unassigned scenes, move later captions without scenes, and reject invalid starts', () => {
  const project = defineVoiceoverProject({fps: 30, durationInFrames: 360, scenes: [
    {id: 'a', title: 'a', from: 0, durationInFrames: 240}, {id: 'b', title: 'b', from: 240, durationInFrames: 120},
  ], captions: [{startFrame: 0, endFrame: 240, text: 'first'}, {startFrame: 240, endFrame: 360, text: 'next'}]});
  const edited = retimeVoiceCaption(project, 0, {startFrame: 30, durationInFrames: 300});
  assert.equal(edited.scenes[1].from, 330);
  assert.equal(edited.captions[1].startFrame, 330);
  const withoutScenes = defineVoiceoverProject({...project, scenes: []});
  assert.equal(retimeVoiceCaption(withoutScenes, 0, {durationInFrames: 300}).durationInFrames, 420);
  assert.throws(() => retimeVoiceCaption(project, 1, {startFrame: 200}));
  assert.throws(() => retimeVoiceCaption(project, 0, {durationInFrames: 0}));
  assert.throws(() => retimeVoiceCaption(project, -1, {durationInFrames: 30}));
});

test('ripple edits preserve full-recording WAV offsets, later retakes and repeated edits', () => {
  const project = defineVoiceoverProject({fps: 30, durationInFrames: 360, scenes: [
    {id: 'a', title: 'a', from: 0, durationInFrames: 240}, {id: 'b', title: 'b', from: 240, durationInFrames: 120},
  ]});
  const full = track('full', 0, 360), later = track('b', 240, 120);
  const extended = resizeVoiceRange(project, 'a', 300);
  const shifted = retimeVoiceTracks([full, later], project, extended);
  assert.equal(shifted[1].startFrame, 300);
  assert.deepEqual(shifted[0].spans, [
    {from: 0, duration: 240, trimBefore: 0}, {from: 300, duration: 120, trimBefore: 240},
  ]);
  const repeated = resizeVoiceRange(extended, 'a', 360);
  const twice = retimeVoiceTracks(shifted, extended, repeated);
  assert.equal(twice[0].spans[1].from, 360);
  assert.equal(twice[0].spans[1].trimBefore, 240);
  const retake = track('a', 0, 360, 'new-a');
  const segments = resolveVoiceSegments([twice[0], retake], repeated);
  assert.deepEqual(segments.map(segment => [segment.from, segment.duration, segment.trimBefore]), [[0, 360, 0], [360, 120, 240]]);
  assert.ok(Math.abs(voiceoverVolume(370, [twice[0], retake], repeated) - .2) < 1e-9);
  assert.deepEqual(parseVoiceManifest({version: 1, timeline: voiceTimeline(repeated), tracks: [...twice, retake]}, project).tracks, [...twice, retake]);
  const shortened = resizeVoiceRange(project, 'a', 180);
  const trimmed = retimeVoiceTracks([full], project, shortened)[0];
  assert.deepEqual(trimmed.spans, [{from: 0, duration: 180, trimBefore: 0}, {from: 180, duration: 120, trimBefore: 240}]);
});

test('saved timeline validates identity and audio source spans, and SRT uses edited timestamps', () => {
  const project = defineVoiceoverProject({fps: 30, durationInFrames: 240,
    scenes: [{id: 'a', title: 'a', from: 0, durationInFrames: 240}],
    captions: [{startFrame: 0, endFrame: 240, text: '原稿', sceneId: 'a'}]});
  const edited = resizeVoiceRange(project, 'a', 300);
  edited.captions.push({startFrame: 299, endFrame: 300, text: '补充字幕', sceneId: 'a'});
  assert.match(voiceCaptionsToSrt(edited), /00:00:00,000 --> 00:00:10,000\n原稿/);
  assert.match(voiceCaptionsToSrt(edited), /00:00:09,967 --> 00:00:10,000\n补充字幕/);
  assert.throws(() => applyVoiceTimeline(project, {...voiceTimeline(edited), fps: 60}));
  assert.throws(() => applyVoiceTimeline(project, {...voiceTimeline(edited), scenes: []}));
  assert.throws(() => parseVoiceManifest({version: 1, timeline: voiceTimeline(edited), tracks: [{...track('full', 0, 300),
    spans: [{from: 0, duration: 300, trimBefore: 1}]}]}, project));
});
