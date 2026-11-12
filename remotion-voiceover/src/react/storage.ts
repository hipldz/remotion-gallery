import {parseVoiceManifest, voiceManifestSrc, type VoiceoverProject, type VoiceoverStorage} from '../core/index.js';

export type HttpVoiceoverOptions = {endpoint?: string; fetch?: typeof globalThis.fetch};
export const createHttpVoiceoverStorage = (project: VoiceoverProject, options: HttpVoiceoverOptions = {}): VoiceoverStorage => {
  const request = options.fetch ?? ((...args: Parameters<typeof fetch>) => globalThis.fetch(...args));
  const endpoint = options.endpoint ?? '/api/voiceover';
  const read = async (response: Response) => {
    const text = await response.text();
    let value: unknown;
    try {value = JSON.parse(text);}
    catch {throw new Error('保存接口不可用。请启动接入配音插件的本地服务，也可以先下载 WAV。');}
    if (!response.ok) throw new Error((value as {error?: string}).error ?? '无法读取或保存配音，可先下载 WAV。');
    return parseVoiceManifest(value, project);
  };
  const scoped = (scope: string) => `${endpoint}${endpoint.includes('?') ? '&' : '?'}scope=${encodeURIComponent(scope)}`;
  return {
    load: async () => {
      try {return await read(await request(endpoint, {cache: 'no-store'}));}
      catch (error) {
        const fallback = await request(`/${voiceManifestSrc(project)}`, {cache: 'no-store'});
        if (fallback.status === 404) return {version: 1, tracks: []};
        if (!fallback.ok) throw error;
        return read(fallback);
      }
    },
    save: async (scope, wav, options) => {
      if (!options?.timeline) return read(await request(scoped(scope), {method: 'POST', headers: {'Content-Type': 'audio/wav'}, body: wav}));
      const body = new FormData();
      body.set('audio', wav, 'voiceover.wav');
      body.set('timeline', JSON.stringify(options.timeline));
      if (options.expectedTimeline) body.set('expectedTimeline', JSON.stringify(options.expectedTimeline));
      return read(await request(scoped(scope), {method: 'POST', body}));
    },
    remove: async scope => read(await request(scoped(scope), {method: 'DELETE'})),
    saveTimeline: async (timeline, expectedTimeline) => read(await request(endpoint, {method: 'PATCH',
      headers: {'Content-Type': 'application/json'}, body: JSON.stringify({timeline, expectedTimeline})})),
  };
};
