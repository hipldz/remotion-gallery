import {useLayoutEffect, useState} from 'react';
import {Audio, Sequence, staticFile, useDelayRender} from 'remotion';
import {applyVoiceTimeline, parseVoiceManifest, resolveVoiceSegments, voiceManifestSrc, type VoiceoverProject, type VoiceTrack} from '../core/index.js';

export type VoiceSrcResolver = (src: string) => string;
export const resolveVoiceSrc: VoiceSrcResolver = src => /^(blob:|data:|https?:\/\/|\/)/.test(src) ? src : staticFile(src);

export const loadVoiceoverState = async (project: VoiceoverProject,
  options: {fetch?: typeof globalThis.fetch; resolveSrc?: VoiceSrcResolver; signal?: AbortSignal} = {}) => {
  const response = await (options.fetch ?? globalThis.fetch)((options.resolveSrc ?? resolveVoiceSrc)(voiceManifestSrc(project)),
    {cache: 'no-store', signal: options.signal});
  if (response.status === 404) return {project, manifest: {version: 1 as const, tracks: [] as VoiceTrack[]}};
  if (!response.ok) throw new Error('无法读取配音与字幕时间轴');
  const manifest = parseVoiceManifest(await response.json(), project);
  return {project: applyVoiceTimeline(project, manifest.timeline), manifest};
};

export const useVoiceTracks = (project: VoiceoverProject, provided: VoiceTrack[] | undefined) => {
  const [diskTracks, setDiskTracks] = useState<VoiceTrack[]>([]);
  const {delayRender, continueRender, cancelRender} = useDelayRender();
  const manifestSrc = voiceManifestSrc(project);
  useLayoutEffect(() => {
    if (provided !== undefined) return;
    const handle = delayRender('读取本地配音清单');
    const abort = new AbortController();
    let active = true;
    fetch(staticFile(manifestSrc), {cache: 'no-store', signal: abort.signal})
      .then(response => {
        if (response.status === 404) return {version: 1, tracks: []};
        if (!response.ok) throw new Error('无法读取本地配音清单');
        return response.json();
      })
      .then(value => {if (active) setDiskTracks(parseVoiceManifest(value, project).tracks);})
      .catch(error => {if (active) cancelRender(error instanceof Error ? error : new Error(String(error)));})
      .finally(() => continueRender(handle));
    return () => {active = false; abort.abort(); continueRender(handle);};
  }, [project, manifestSrc, provided, delayRender, continueRender, cancelRender]);
  return provided ?? diskTracks;
};

export const Voiceover = ({tracks, project, resolveSrc = resolveVoiceSrc, volume = 1}: {
  tracks: readonly VoiceTrack[]; project: VoiceoverProject; resolveSrc?: VoiceSrcResolver; volume?: number;
}) => <>
  {resolveVoiceSegments(tracks, project).map(segment => <Sequence key={`${segment.id}-${segment.from}`} from={segment.from}
    durationInFrames={segment.duration} name={`配音 · ${segment.scope}`}>
    <Audio src={resolveSrc(segment.src)} trimBefore={segment.trimBefore} durationInFrames={segment.duration} volume={volume} />
  </Sequence>)}
</>;
