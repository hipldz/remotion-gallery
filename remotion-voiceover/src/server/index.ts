import {randomUUID} from 'node:crypto';
import {mkdir, readFile, rename, writeFile} from 'node:fs/promises';
import type {IncomingMessage, ServerResponse} from 'node:http';
import {dirname, isAbsolute, relative, resolve, sep} from 'node:path';
import sirv from 'sirv';
import type {Plugin} from 'vite';
import {applyVoiceTimeline, defineVoiceoverProject, EMPTY_VOICE_MANIFEST, getVoiceRange, isVoiceScope, parseVoiceManifest,
  retimeVoiceTracks, voiceManifestSrc, voiceTimeline, type VoiceManifest, type VoiceoverProject, type VoiceTimeline} from '../core/index.js';

export type VoiceoverServerOptions = {
  project: VoiceoverProject;
  projectRoot: string;
  publicDir?: string;
  endpoint?: string;
  maxBytes?: number;
  onChange?: () => void;
};

export const inspectVoiceWave = (body: Buffer) => {
  if (body.length < 44 || body.toString('ascii', 0, 4) !== 'RIFF' || body.toString('ascii', 8, 12) !== 'WAVE' ||
    body.toString('ascii', 12, 16) !== 'fmt ' || body.readUInt32LE(16) !== 16 || body.readUInt16LE(20) !== 1 ||
    body.readUInt16LE(22) !== 1 || body.readUInt16LE(32) !== 2 || body.readUInt16LE(34) !== 16 ||
    body.toString('ascii', 36, 40) !== 'data' || body.readUInt32LE(4) !== body.length - 8 ||
    body.readUInt32LE(40) !== body.length - 44) throw new Error('请保存浏览器生成的单声道 WAV 录音');
  const sampleRate = body.readUInt32LE(24), samples = (body.length - 44) / 2;
  if (sampleRate < 8000 || sampleRate > 96000 || body.readUInt32LE(28) !== sampleRate * 2 ||
    !Number.isInteger(samples) || samples / sampleRate < .1) throw new Error('录音太短或采样率不正确，请重新录制');
  return {sampleRate, samples, duration: samples / sampleRate};
};

const readBody = async (request: IncomingMessage, maxBytes: number) => {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const value of request) {
    const chunk = Buffer.from(value);
    size += chunk.length;
    if (size > maxBytes) throw new Error(`录音文件超过 ${Math.round(maxBytes / 1024 / 1024)} MB`);
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

const storagePaths = (options: VoiceoverServerOptions) => {
  const project = defineVoiceoverProject(options.project);
  const publicRoot = resolve(options.projectRoot, options.publicDir ?? 'public');
  const manifestPath = resolve(publicRoot, voiceManifestSrc(project));
  const checked = relative(publicRoot, manifestPath);
  if (checked === '..' || checked.startsWith('..' + sep) || isAbsolute(checked)) throw new Error('配音清单必须保存在 public 目录内');
  return {project, publicRoot, manifestPath, directory: dirname(manifestPath)};
};

/** Mount this middleware on a single route in an existing Node/Connect/Express server. */
export const createVoiceoverMiddleware = (options: VoiceoverServerOptions) => {
  const {project, publicRoot, manifestPath, directory} = storagePaths(options);
  const maxBytes = options.maxBytes ?? 64 * 1024 * 1024;
  const maxTimelineBytes = 1024 * 1024;
  let queue: Promise<unknown> = Promise.resolve();
  const readManifest = async () => {
    try {return parseVoiceManifest(JSON.parse(await readFile(manifestPath, 'utf8')), project);}
    catch (error) {if ((error as NodeJS.ErrnoException).code === 'ENOENT') return EMPTY_VOICE_MANIFEST; throw error;}
  };
  const mutate = <T,>(work: () => Promise<T>) => {
    const result = queue.then(work);
    queue = result.catch(() => undefined);
    return result;
  };
  const saveManifest = async (manifest: VoiceManifest) => {
    await mkdir(directory, {recursive: true});
    const temporary = resolve(directory, `manifest-${randomUUID()}.tmp`);
    await writeFile(temporary, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    await rename(temporary, manifestPath);
  };
  const editManifest = (current: VoiceManifest, timeline?: VoiceTimeline, expectedTimeline?: VoiceTimeline) => {
    if (!timeline) return current;
    const previous = applyVoiceTimeline(project, current.timeline);
    if (expectedTimeline && JSON.stringify(voiceTimeline(applyVoiceTimeline(project, expectedTimeline))) !==
      JSON.stringify(voiceTimeline(previous))) throw new Error('工程的字幕时间已在另一窗口更新，请刷新后再保存。录音仍可下载。');
    const next = applyVoiceTimeline(project, timeline);
    return {version: 1 as const, timeline: voiceTimeline(next), tracks: retimeVoiceTracks(current.tracks, previous, next)};
  };
  return async (request: IncomingMessage, response: ServerResponse) => {
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    const send = (status: number, value: unknown) => {response.statusCode = status; response.end(JSON.stringify(value));};
    try {
      if (request.method === 'GET') {send(200, await readManifest()); return;}
      if (request.method === 'PATCH') {
        const body = JSON.parse((await readBody(request, maxTimelineBytes)).toString('utf8')) as
          {timeline?: VoiceTimeline; expectedTimeline?: VoiceTimeline};
        if (!body.timeline) throw new Error('请提供需要保存的字幕时间轴');
        const manifest = await mutate(async () => {
          const next = editManifest(await readManifest(), body.timeline, body.expectedTimeline);
          await saveManifest(next);
          return next;
        });
        options.onChange?.(); send(200, manifest); return;
      }
      if (request.method !== 'POST' && request.method !== 'DELETE') {send(405, {error: '不支持此操作'}); return;}
      const scope = new URL(request.url ?? '/', 'http://localhost').searchParams.get('scope');
      if (!isVoiceScope(scope, project)) {send(400, {error: '请选择有效分镜或整片录音'}); return;}
      if (request.method === 'POST') {
        const multipart = request.headers?.['content-type']?.startsWith('multipart/form-data');
        let body = await readBody(request, maxBytes + (multipart ? maxTimelineBytes * 2 : 0));
        let timeline: VoiceTimeline | undefined, expectedTimeline: VoiceTimeline | undefined;
        if (multipart) {
          const form = await new Request('http://localhost/voiceover', {method: 'POST',
            headers: {'Content-Type': request.headers['content-type']!}, body: new Uint8Array(body)}).formData();
          const audio = form.get('audio'), timing = form.get('timeline'), expected = form.get('expectedTimeline');
          if (!(audio instanceof Blob) || typeof timing !== 'string' || timing.length > maxTimelineBytes ||
            (expected !== null && (typeof expected !== 'string' || expected.length > maxTimelineBytes))) throw new Error('录音或字幕时间轴格式不正确');
          body = Buffer.from(await audio.arrayBuffer());
          if (body.length > maxBytes) throw new Error('录音文件超过保存上限');
          timeline = JSON.parse(timing) as VoiceTimeline;
          if (typeof expected === 'string') expectedTimeline = JSON.parse(expected) as VoiceTimeline;
        }
        const audio = inspectVoiceWave(body);
        const manifest = await mutate(async () => {
          const current = editManifest(await readManifest(), timeline, expectedTimeline);
          const effective = applyVoiceTimeline(project, current.timeline);
          const range = getVoiceRange(scope, effective);
          const durationInFrames = timeline ? Math.ceil(audio.duration * project.fps - 1e-6) : Math.floor(audio.duration * project.fps + 1e-6);
          if (durationInFrames < 1 || audio.duration > range.durationInFrames / project.fps + .25) {
            throw new Error('录音长于片段，请先按实际朗读延长字幕时间，再保存。');
          }
          // Scene IDs are metadata; they are never used as filesystem paths.
          const id = `voice-${randomUUID()}`;
          const wavPath = resolve(directory, `${id}.wav`);
          await mkdir(directory, {recursive: true});
          await writeFile(wavPath, body);
          const next: VoiceManifest = {...current, tracks: [
            ...current.tracks.filter(track => track.scope !== scope),
            {id, scope, src: relative(publicRoot, wavPath).split(sep).join('/'), startFrame: range.from,
              durationInFrames: Math.min(durationInFrames, range.durationInFrames), recordedAt: new Date().toISOString()},
          ]};
          await saveManifest(next);
          return next;
        });
        options.onChange?.(); send(200, manifest); return;
      }
      const manifest = await mutate(async () => {
        const current = await readManifest();
        const next: VoiceManifest = {...current, tracks: current.tracks.filter(track => track.scope !== scope)};
        await saveManifest(next);
        return next;
      });
      // Only the active manifest changes; original WAV files remain on disk.
      options.onChange?.(); send(200, manifest);
    } catch (error) {send(400, {error: error instanceof Error ? error.message : '无法保存配音'});}
  };
};

export const voiceoverPlugin = (options: VoiceoverServerOptions): Plugin => {
  const {publicRoot, directory, manifestPath} = storagePaths(options);
  return {
    name: 'remotion-voiceover',
    config: () => ({server: {watch: {ignored: [manifestPath.split(sep).join('/'),
      directory.split(sep).join('/') + '/voice-*.wav', directory.split(sep).join('/') + '/manifest-*.tmp']}}}),
    configureServer(server) {
      const middleware = createVoiceoverMiddleware({...options, onChange: () => {
        options.onChange?.();
        server.ws.send({type: 'custom', event: 'voiceover:update', data: {}});
      }});
      server.middlewares.use(options.endpoint ?? '/api/voiceover', middleware);
      // Generated recordings are ignored by the watcher, so Vite's public-file
      // cache will not learn about them. Read this public directory on demand.
      const assetPath = relative(publicRoot, directory).split(sep).map(encodeURIComponent).join('/');
      server.middlewares.use(`${server.config.base}${assetPath}`, sirv(directory, {dev: true, extensions: []}));
    },
  };
};
