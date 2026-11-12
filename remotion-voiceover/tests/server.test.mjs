import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, readFile, readdir, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve, sep} from 'node:path';
import {Readable, Writable} from 'node:stream';
import {defineVoiceoverProject, resizeVoiceRange, voiceTimeline} from '../dist/core/index.js';
import {createVoiceoverMiddleware, inspectVoiceWave, voiceoverPlugin} from '../dist/server/index.js';

const wave = (seconds = 1, rate = 8000) => {
  const body = Buffer.alloc(44 + Math.round(seconds * rate) * 2);
  body.write('RIFF', 0); body.writeUInt32LE(body.length - 8, 4); body.write('WAVEfmt ', 8);
  body.writeUInt32LE(16, 16); body.writeUInt16LE(1, 20); body.writeUInt16LE(1, 22);
  body.writeUInt32LE(rate, 24); body.writeUInt32LE(rate * 2, 28); body.writeUInt16LE(2, 32); body.writeUInt16LE(16, 34);
  body.write('data', 36); body.writeUInt32LE(body.length - 44, 40);
  return body;
};
const invoke = async (handler, method, scope, body = Buffer.alloc(0), headers = {}) => {
  const request = Readable.from([body]);
  request.method = method;
  request.headers = headers;
  request.url = scope === undefined ? '/' : `/?scope=${encodeURIComponent(scope)}`;
  const response = {statusCode: 200, headers: {}, setHeader(name, value) {this.headers[name] = value;}, end(value) {this.body = value;}};
  await handler(request, response);
  return {status: response.statusCode, value: JSON.parse(response.body)};
};
const temporary = async work => {
  const base = resolve(tmpdir());
  const directory = await mkdtemp(join(base, 'remotion-voiceover-test-'));
  try {await work(directory);}
  finally {
    const checked = resolve(directory);
    assert.ok(checked.startsWith(base + sep) && checked !== base);
    await rm(checked, {recursive: true, force: true});
  }
};

test('WAV validation rejects truncated, stereo and inconsistent headers', () => {
  assert.equal(inspectVoiceWave(wave()).duration, 1);
  assert.throws(() => inspectVoiceWave(Buffer.from('not audio')));
  const stereo = wave(); stereo.writeUInt16LE(2, 22); assert.throws(() => inspectVoiceWave(stereo));
  const block = wave(); block.writeUInt16LE(4, 32); assert.throws(() => inspectVoiceWave(block));
  const rate = wave(); rate.writeUInt32LE(1, 28); assert.throws(() => inspectVoiceWave(rate));
});

test('an overlong take saves its entire WAV and timeline together, including later audio offsets', () => temporary(async root => {
  const project = defineVoiceoverProject({fps: 30, durationInFrames: 360, scenes: [
    {id: 'a', title: 'a', from: 0, durationInFrames: 240}, {id: 'b', title: 'b', from: 240, durationInFrames: 120},
  ], captions: [{startFrame: 0, endFrame: 240, text: 'eight seconds', sceneId: 'a'}]});
  const handler = createVoiceoverMiddleware({project, projectRoot: root});
  const full = await invoke(handler, 'POST', 'full', wave(12));
  const originalPath = join(root, 'public', full.value.tracks[0].src);
  const original = await readFile(originalPath);
  const extended = resizeVoiceRange(project, 'a', 300);
  const form = new FormData();
  const recording = wave(10);
  form.set('audio', new Blob([recording], {type: 'audio/wav'}), 'take.wav');
  form.set('timeline', JSON.stringify(voiceTimeline(extended)));
  form.set('expectedTimeline', JSON.stringify(voiceTimeline(project)));
  const upload = new Request('http://localhost/upload', {method: 'POST', body: form});
  const saved = await invoke(handler, 'POST', 'a', Buffer.from(await upload.arrayBuffer()), {'content-type': upload.headers.get('content-type')});
  assert.equal(saved.status, 200, JSON.stringify(saved.value));
  assert.equal(saved.value.timeline.durationInFrames, 420);
  const take = saved.value.tracks.find(track => track.scope === 'a');
  assert.equal(take.durationInFrames, 300);
  assert.deepEqual(await readFile(join(root, 'public', take.src)), recording);
  assert.deepEqual(await readFile(originalPath), original);
  assert.equal(saved.value.tracks.find(track => track.scope === 'full').spans[1].trimBefore, 240);
  const restarted = createVoiceoverMiddleware({project, projectRoot: root});
  assert.deepEqual((await invoke(restarted, 'GET')).value, saved.value);
  const stale = await invoke(handler, 'PATCH', undefined, Buffer.from(JSON.stringify({timeline: voiceTimeline(project), expectedTimeline: voiceTimeline(project)})));
  assert.equal(stale.status, 400);
  assert.match(stale.value.error, /另一窗口/);
  assert.deepEqual((await invoke(handler, 'GET')).value, saved.value);
  const removed = await invoke(handler, 'DELETE', 'a');
  assert.deepEqual(removed.value.timeline, saved.value.timeline);
  assert.deepEqual(await readFile(join(root, 'public', take.src)), recording);
}));

test('script-only edits persist added captions and reject invalid timing without changing existing files', () => temporary(async root => {
  const project = defineVoiceoverProject({fps: 24, durationInFrames: 192,
    scenes: [{id: 'a', title: 'a', from: 0, durationInFrames: 192}]});
  const handler = createVoiceoverMiddleware({project, projectRoot: root});
  const edited = {...resizeVoiceRange(project, 'a', 240), captions: [
    {startFrame: 0, endFrame: 192, text: '修改正文', sceneId: 'a'}, {startFrame: 192, endFrame: 240, text: '增加一句', sceneId: 'a'},
  ]};
  const saved = await invoke(handler, 'PATCH', undefined, Buffer.from(JSON.stringify({timeline: voiceTimeline(edited), expectedTimeline: voiceTimeline(project)})));
  assert.equal(saved.status, 200, JSON.stringify(saved.value));
  assert.deepEqual(saved.value.timeline.captions, edited.captions);
  const invalid = await invoke(handler, 'PATCH', undefined, Buffer.from(JSON.stringify({timeline: {...voiceTimeline(edited), fps: 60}})));
  assert.equal(invalid.status, 400);
  assert.deepEqual((await invoke(handler, 'GET')).value, saved.value);
  assert.deepEqual((await readdir(join(root, 'public/narration'))), ['manifest.json']);
}));

test('a partial final audio frame is retained in adaptive recording and playback duration', () => temporary(async root => {
  const project = defineVoiceoverProject({fps: 30, durationInFrames: 240});
  const extended = resizeVoiceRange(project, 'full', 301);
  const audio = wave(10.02);
  const form = new FormData();
  form.set('audio', new Blob([audio], {type: 'audio/wav'}), 'take.wav');
  form.set('timeline', JSON.stringify(voiceTimeline(extended)));
  const upload = new Request('http://localhost/upload', {method: 'POST', body: form});
  const handler = createVoiceoverMiddleware({project, projectRoot: root});
  const result = await invoke(handler, 'POST', 'full', Buffer.from(await upload.arrayBuffer()), {'content-type': upload.headers.get('content-type')});
  assert.equal(result.status, 200, JSON.stringify(result.value));
  assert.equal(result.value.tracks[0].durationInFrames, 301, 'Round up so the last spoken samples can play');
  assert.deepEqual(await readFile(join(root, 'public', result.value.tracks[0].src)), audio);
}));

test('save/retake/remove preserve original WAVs, legacy manifest and custom paths without listening on a port', () => temporary(async root => {
  const project = defineVoiceoverProject({fps: 24, durationInFrames: 96,
    manifestSrc: 'voice/film-a.json', scenes: [{id: 'chapter/第一段', title: 'chapter', from: 24, durationInFrames: 48}]});
  const directory = join(root, 'static', 'voice'); await mkdir(directory, {recursive: true});
  const legacy = {id: 'old-full', scope: 'full', src: 'voice/old-full.wav', startFrame: 0, durationInFrames: 96, recordedAt: '2026-11-09'};
  const original = wave(4); await writeFile(join(directory, 'old-full.wav'), original);
  await writeFile(join(directory, 'film-a.json'), JSON.stringify({version: 1, tracks: [legacy]}));
  const handler = createVoiceoverMiddleware({project, projectRoot: root, publicDir: 'static'});
  let result = await invoke(handler, 'POST', 'chapter/第一段', wave());
  assert.equal(result.status, 200); assert.equal(result.value.tracks.length, 2);
  const first = result.value.tracks.find(track => track.scope !== 'full');
  assert.equal(first.startFrame, 24); assert.equal(first.durationInFrames, 24);
  assert.match(first.src, /^voice\/voice-[a-f0-9-]+\.wav$/);
  result = await invoke(handler, 'POST', 'chapter/第一段', wave(.5));
  assert.equal(result.status, 200); assert.equal(result.value.tracks.length, 2);
  assert.notEqual(result.value.tracks.find(track => track.scope !== 'full').id, first.id);
  assert.equal((await readdir(directory)).filter(name => name.endsWith('.wav')).length, 3);
  result = await invoke(handler, 'DELETE', 'chapter/第一段');
  assert.equal(result.status, 200, JSON.stringify(result.value));
  assert.deepEqual(result.value.tracks, [legacy]);
  assert.equal((await readdir(directory)).filter(name => name.endsWith('.wav')).length, 3);
  assert.deepEqual(await readFile(join(directory, 'old-full.wav')), original);
  assert.deepEqual((await invoke(handler, 'GET')).value.tracks, [legacy]);
  assert.equal((await invoke(handler, 'POST', '../../outside', wave())).status, 400);
  assert.equal((await invoke(handler, 'POST', 'chapter/第一段', wave(3))).status, 400);
  assert.equal((await invoke(handler, 'PUT', 'full')).status, 405);
}));

test('parallel saves to different scopes are serialized without losing takes', () => temporary(async root => {
  const project = defineVoiceoverProject({fps: 60, durationInFrames: 240, scenes: [
    {id: 'a', title: 'a', from: 0, durationInFrames: 120}, {id: 'b', title: 'b', from: 120, durationInFrames: 120},
  ]});
  const handler = createVoiceoverMiddleware({project, projectRoot: root});
  const results = await Promise.all([invoke(handler, 'POST', 'a', wave()), invoke(handler, 'POST', 'b', wave())]);
  assert.ok(results.every(result => result.status === 200));
  const manifest = (await invoke(handler, 'GET')).value;
  assert.equal(manifest.tracks.length, 2);
  assert.deepEqual(manifest.tracks.map(track => [track.scope, track.startFrame, track.durationInFrames]), [['a', 0, 60], ['b', 120, 60]]);
}));

test('size limits and the Vite adapter work with a mocked host, without creating a dev server', () => temporary(async root => {
  const project = defineVoiceoverProject({fps: 30, durationInFrames: 90});
  const limited = createVoiceoverMiddleware({project, projectRoot: root, maxBytes: 100});
  assert.equal((await invoke(limited, 'POST', 'full', wave())).status, 400);
  let route, handler; const messages = [];
  const plugin = voiceoverPlugin({project, projectRoot: root, endpoint: '/recordings'});
  plugin.configureServer({config: {base: '/'},
    middlewares: {use(path, middleware) {if (path === '/recordings') {route = path; handler = middleware;}}},
    ws: {send(message) {messages.push(message);}}});
  assert.equal(route, '/recordings');
  assert.equal((await invoke(handler, 'POST', 'full', wave())).status, 200);
  assert.equal(messages[0].event, 'voiceover:update');
}));

test('new Vite recordings are immediately served with byte ranges, without watcher events or a restart', () => temporary(async root => {
  const project = defineVoiceoverProject({fps: 30, durationInFrames: 90, manifestSrc: 'voice/custom.json'});
  const routes = new Map();
  const plugin = voiceoverPlugin({project, projectRoot: root, publicDir: 'static'});
  plugin.configureServer({config: {base: '/preview/'},
    middlewares: {use(path, handler) {routes.set(path, handler);}}, ws: {send() {}}});

  const original = wave();
  const saved = await invoke(routes.get('/api/voiceover'), 'POST', 'full', original);
  assert.equal(saved.status, 200);
  const assets = routes.get('/preview/voice');
  assert.equal(typeof assets, 'function');
  const readAsset = (url, range) => new Promise((done, reject) => {
    const chunks = [], headers = {};
    const request = {method: 'GET', url, headers: range ? {range} : {}};
    const response = new Writable({write(chunk, _encoding, next) {chunks.push(Buffer.from(chunk)); next();}});
    response.statusCode = 200;
    response.setHeader = (name, value) => {headers[name.toLowerCase()] = value;};
    response.getHeader = name => headers[name.toLowerCase()];
    response.writeHead = (status, values) => {
      response.statusCode = status;
      for (const [name, value] of Object.entries(values)) response.setHeader(name, value);
    };
    response.once('error', reject);
    response.once('finish', () => done({status: response.statusCode, headers, body: Buffer.concat(chunks)}));
    assets(request, response, () => {response.statusCode = 404; response.end();});
  });

  const filename = '/' + saved.value.tracks[0].src.split('/').at(-1);
  const full = await readAsset(filename + '?download=1');
  assert.equal(full.status, 200);
  assert.deepEqual(full.body, original);
  assert.match(full.headers['content-type'], /audio\//);
  const partial = await readAsset(filename, 'bytes=10-21');
  assert.equal(partial.status, 206);
  assert.equal(partial.headers['content-range'], `bytes 10-21/${original.length}`);
  assert.deepEqual(partial.body, original.subarray(10, 22));
  const manifest = await readAsset('/custom.json');
  assert.equal(manifest.status, 200);
  assert.deepEqual(JSON.parse(manifest.body.toString('utf8')), saved.value);
  await writeFile(join(root, 'static', 'outside.txt'), 'outside narration');
  assert.equal((await readAsset('/../outside.txt')).status, 404);
}));
