import { getAudioDurationInSeconds } from '@remotion/media-utils';
import { getStaticFiles, staticFile, type CalculateMetadataFunction } from 'remotion';
import { resolveTiming, shots, voiceFileFor, type FilmProps } from './timeline';
import assets from '../../production/assets.json';
import { loadVoiceoverState } from 'remotion-voiceover/react';
import { createVoiceoverProject } from '../voiceover.config';

export async function loadProjectMetadata(files: string[], signal?: AbortSignal): Promise<Pick<FilmProps, 'timeline' | 'availableFiles'>> {
  const missing = assets.filter((a) => !files.includes(`shots/${a.file}`));
  if (missing.length) throw new Error(`缺少已核对的源截图：${missing.map((a) => a.file).join('、')}。请运行 npm run assets:import。`);
  const durations: Record<string, number> = {};
  await Promise.all(
    shots
      .filter((s) => s.narration)
      .map(async (shot) => {
        const file = voiceFileFor(shot.id, files);
        if (!file) return;
        if (signal?.aborted) throw new Error('Metadata calculation cancelled');
        durations[shot.id] = await getAudioDurationInSeconds(staticFile(file));
      }),
  );
  return { timeline: resolveTiming(durations, files), availableFiles: files };
}

export const calculateFilmMetadata: CalculateMetadataFunction<FilmProps> = async ({ props, abortSignal }) => {
  const files = getStaticFiles().map((f) => f.name);
  const resolved = await loadProjectMetadata(files, abortSignal);
  const saved = await loadVoiceoverState(createVoiceoverProject(resolved.timeline), { signal: abortSignal });
  return {
    durationInFrames: saved.project.durationInFrames,
    props: { ...props, ...resolved, frameOffset: 0, voiceProject: saved.project, voiceTracks: saved.manifest.tracks },
  };
};
