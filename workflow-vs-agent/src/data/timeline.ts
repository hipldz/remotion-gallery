import data from "./storyboard.json";
import { FPS } from "./theme";
import { getVoiceCaptions, type VoiceoverProject } from "remotion-voiceover/core";

export type Shot = (typeof data.shots)[number];
export type Chapter = (typeof data.chapters)[number];
export const shots = data.shots;
export const chapters = data.chapters;
export function resolveWorkflowTimeline(project: VoiceoverProject) {
  const scenes = new Map((project.scenes ?? []).map(scene => [scene.id, scene]));
  const editedShots: Shot[] = shots.map(shot => {
    const scene = scenes.get(shot.id);
    if (!scene) throw new Error(`配音时间轴缺少分镜 ${shot.id}`);
    return {...shot, start: scene.from / FPS, end: (scene.from + scene.durationInFrames) / FPS,
      subtitles: getVoiceCaptions(shot.id, project).map(cue => ({start: cue.startFrame / FPS, end: cue.endFrame / FPS,
        text: shot.subtitles.find(original => original.text.replaceAll('**', '') === cue.text)?.text ?? cue.text}))};
  });
  const editedChapters: Chapter[] = chapters.map(chapter => {
    const selection = editedShots.filter(shot => shot.act === chapter.index);
    return {...chapter, start: selection[0].start, end: selection.at(-1)!.end};
  });
  return {shots: editedShots, chapters: editedChapters,
    shotAt: (frame: number) => editedShots.find(shot => frame >= Math.round(shot.start * FPS) && frame < Math.round(shot.end * FPS)) ?? editedShots.at(-1)!};
}
export const shotAt = (frame: number) => shots.find((s) => frame >= Math.round(s.start * FPS) && frame < Math.round(s.end * FPS)) ?? shots.at(-1)!;
export const timecode = (frame: number) => `${String(Math.floor(frame / FPS / 60)).padStart(2, "0")}:${String(Math.floor(frame / FPS) % 60).padStart(2, "0")}`;
export const actColor = (act: number) => (act < 3 ? "#4285F4" : act < 5 ? "#EA4335" : act < 8 ? "#34A853" : act === 10 ? "#4285F4" : "#EA4335");
