import { defineVoiceoverProject, getVoiceCaptions, retimeVoiceTracks, type VoiceoverProject, type VoiceTrack } from 'remotion-voiceover/core';
import { captionsFor, FPS, totalFrames, type TimedShot } from './lib/timeline';
import { matchScriptCues } from './lib/cue-match';

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

// Preserve the shot choreography while using the recorder's edited cut points.
// Captions stay in the voice project so added/deleted sentences remain exact.
export function resolveVoiceTimeline(timeline: TimedShot[], project: VoiceoverProject): TimedShot[] {
  return timeline.map((shot) => {
    const scene = project.scenes!.find((entry) => entry.id === shot.id)!;
    const captions = getVoiceCaptions(shot.id, project);
    const assignments = matchScriptCues(shot.cues, captions);
    return {
      ...shot,
      from: scene.from,
      duration: scene.durationInFrames,
      narration: captions.map((cue) => cue.text).join('／'),
      captionCues: captions.map((cue, index) => ({ text: cue.text, from: cue.startFrame, to: cue.endFrame, shotId: shot.id, scriptIndex: assignments[index] })),
    };
  });
}

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

export function resolveFilmVoiceTracks(timeline: TimedShot[], project: VoiceoverProject, recorded: readonly VoiceTrack[]): VoiceTrack[] {
  if (recorded.some((track) => track.scope === 'full')) return [...recorded];
  const imported = retimeVoiceTracks(withImportedVoiceTracks(timeline, []), createVoiceoverProject(timeline), project);
  const replaced = new Set(recorded.map((track) => track.scope));
  return [...imported.filter((track) => !replaced.has(track.scope)), ...recorded];
}
