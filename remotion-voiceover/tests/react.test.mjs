import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {defineVoiceoverProject, resizeVoiceRange, voiceTimeline} from '../dist/core/index.js';
import {VoiceRecorder, createHttpVoiceoverStorage, loadVoiceoverState} from '../dist/react/index.js';
import {encodeMonoWave, recordingToWave} from '../dist/react/audio.js';

const noop = () => {};
test('the recorder renders without a movie-specific script or microphone access', () => {
  const project = defineVoiceoverProject({fps: 60, durationInFrames: 90});
  const html = renderToStaticMarkup(React.createElement(VoiceRecorder, {project, player: {current: null}, frame: 0,
    manifest: {version: 1, tracks: []}, onManifest: noop, onBusy: noop, onDraft: noop, onSeek: noop}));
  assert.match(html, /1.5 秒/); assert.match(html, /没有提词稿/); assert.match(html, /value="full"/);
  assert.doesNotMatch(html, /S02|S20|2 分 58/);
});

test('arbitrary scene names and optional captions appear in the reusable recorder', () => {
  const project = defineVoiceoverProject({fps: 24, durationInFrames: 96, scenes: [
    {id: 'quiet', title: '留白', from: 0, durationInFrames: 24, recordable: false},
    {id: 'intro', title: '新影片', from: 24, durationInFrames: 72},
  ], captions: [{startFrame: 30, endFrame: 90, text: '新的台词', sceneId: 'intro'}]});
  const html = renderToStaticMarkup(React.createElement(VoiceRecorder, {project, player: {current: null}, frame: 30,
    manifest: {version: 1, tracks: []}, onManifest: noop, onBusy: noop, onDraft: noop, onSeek: noop}));
  assert.match(html, /value="intro" selected/); assert.match(html, /新的台词/);
  assert.doesNotMatch(html, /value="quiet"/);
});

test('WAV conversion averages channels and clips audio to the selected slot', async () => {
  const a = new Float32Array(1000).fill(.6), b = new Float32Array(1000).fill(-.2);
  const result = encodeMonoWave({length: 1000, sampleRate: 8000, numberOfChannels: 2, getChannelData: index => index ? b : a}, .1);
  const body = Buffer.from(await result.blob.arrayBuffer());
  assert.equal(result.seconds, .1); assert.equal(body.length, 44 + 800 * 2);
  assert.equal(body.toString('ascii', 0, 4), 'RIFF'); assert.equal(body.readUInt16LE(22), 1);
  assert.ok(Math.abs(body.readInt16LE(44) - .2 * 32767) < 2);
});

test('decoding failure still closes the temporary AudioContext', async () => {
  const original = globalThis.AudioContext; let closes = 0;
  globalThis.AudioContext = class {async decodeAudioData() {throw new Error('decode failed');} async close() {closes++;}};
  try {await assert.rejects(recordingToWave(new Blob(['bad']), 1)); assert.equal(closes, 1);}
  finally {if (original) globalThis.AudioContext = original; else delete globalThis.AudioContext;}
});

test('HTTP storage encodes arbitrary scope IDs and falls back to the project manifest', async () => {
  const project = defineVoiceoverProject({fps: 30, durationInFrames: 90, manifestSrc: 'voice/custom.json',
    scenes: [{id: 'chapter/第一段', title: 'chapter', from: 0, durationInFrames: 90}]});
  const calls = [];
  const storage = createHttpVoiceoverStorage(project, {endpoint: '/local-recordings', fetch: async (url, init) => {
    calls.push([url, init?.method ?? 'GET']);
    if (url === '/local-recordings') return new Response('<html>static fallback</html>', {status: 404});
    return new Response(JSON.stringify({version: 1, tracks: []}));
  }});
  await storage.load(); await storage.save('chapter/第一段', new Blob(['wav'])); await storage.remove('chapter/第一段');
  assert.deepEqual(calls, [
    ['/local-recordings', 'GET'], ['/voice/custom.json', 'GET'],
    [`/local-recordings?scope=${encodeURIComponent('chapter/第一段')}`, 'POST'],
    [`/local-recordings?scope=${encodeURIComponent('chapter/第一段')}`, 'DELETE'],
  ]);
});

test('unlimited WAV conversion retains speech past the original eight-second cue', async () => {
  const samples = new Float32Array(80000).fill(.25);
  const result = encodeMonoWave({length: samples.length, sampleRate: 8000, numberOfChannels: 1, getChannelData: () => samples});
  const body = Buffer.from(await result.blob.arrayBuffer());
  assert.equal(result.seconds, 10);
  assert.equal(body.length, 44 + 80000 * 2);
  assert.ok(body.readInt16LE(body.length - 2) > 0, 'The last spoken samples must survive');
});

test('HTTP storage uses multipart for audio plus timing, and metadata restores the same edited project', async () => {
  const project = defineVoiceoverProject({fps: 30, durationInFrames: 240,
    scenes: [{id: 'a', title: 'a', from: 0, durationInFrames: 240}]});
  const edited = resizeVoiceRange(project, 'a', 300);
  const manifest = {version: 1, timeline: voiceTimeline(edited), tracks: [{id: 'a', scope: 'a', src: 'a.wav',
    startFrame: 0, durationInFrames: 300, recordedAt: 'test'}]};
  const calls = [];
  const storage = createHttpVoiceoverStorage(project, {fetch: async (url, init) => {
    calls.push({url, init}); return new Response(JSON.stringify(manifest));
  }});
  await storage.save('a', new Blob(['wave']), {timeline: voiceTimeline(edited), expectedTimeline: voiceTimeline(project)});
  assert.ok(calls[0].init.body instanceof FormData);
  assert.equal(await calls[0].init.body.get('audio').text(), 'wave');
  assert.deepEqual(JSON.parse(calls[0].init.body.get('timeline')), voiceTimeline(edited));
  await storage.saveTimeline(voiceTimeline(edited), voiceTimeline(project));
  assert.equal(calls[1].init.method, 'PATCH');
  const restored = await loadVoiceoverState(project, {resolveSrc: src => `/${src}`,
    fetch: async () => new Response(JSON.stringify(manifest))});
  assert.deepEqual(restored.project, edited);
  assert.equal(restored.manifest.tracks[0].durationInFrames, 300);
});
