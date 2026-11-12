import { defineVoiceoverProject, type VoiceTrack } from 'remotion-voiceover/core';
import { captionsFor, FPS, totalFrames, type TimedShot } from './lib/timeline';

// Use the resolved edit, including any shots extended by imported voice files.
export const createVoiceoverProject = (timeline: TimedShot[]) =>
  defineVoiceoverProject({
    fps: FPS,
    durationInFrames: totalFrames(timeline),
    scenes: timeline.map((shot) => ({
      id: shot.id,
      title: shot.title,
      from: shot.from,
      durationInFrames: shot.duration,
      recordable: Boolean(shot.narration),
    })),
    captions: timeline.flatMap(captionsFor).map((cue) => ({
      startFrame: cue.from,
      endFrame: cue.to,
      text: cue.text,
      sceneId: cue.shotId,
    })),
  });

// Browser takes replace the whole shot. A full-film take replaces imported VO;
// otherwise, untouched shots continue to use their existing public/vo files.
export function withImportedVoiceTracks(timeline: TimedShot[], recorded: readonly VoiceTrack[]): VoiceTrack[] {
  if (recorded.some((track) => track.scope === 'full')) return [...recorded];
  const replaced = new Set(recorded.map((track) => track.scope));
  const imported = timeline.flatMap((shot): VoiceTrack[] =>
    shot.vo && !replaced.has(shot.id)
      ? [
          {
            id: `imported-${shot.id}`,
            scope: shot.id,
            src: shot.vo,
            startFrame: shot.from + shot.voOffset,
            durationInFrames: Math.min(shot.voFrames ?? shot.duration - shot.voOffset, shot.duration - shot.voOffset),
            recordedAt: 'imported',
          },
        ]
      : [],
  );
  return [...imported, ...recorded];
}
