import { defineVoiceoverProject } from "remotion-voiceover/core";
import { DURATION, FPS } from "./data/theme";
import { shots } from "./data/timeline";

export const voiceoverProject = defineVoiceoverProject({
  fps: FPS,
  durationInFrames: DURATION,
  scenes: shots.map((shot) => ({
    id: shot.id,
    title: shot.title.replace("★ ", ""),
    from: Math.round(shot.start * FPS),
    durationInFrames: Math.round(shot.end * FPS) - Math.round(shot.start * FPS),
    recordable: shot.subtitles.length > 0,
  })),
  captions: shots.flatMap((shot) =>
    shot.subtitles.map((cue) => ({
      startFrame: Math.round(cue.start * FPS),
      endFrame: Math.round(cue.end * FPS),
      text: cue.text.replaceAll("**", ""),
      sceneId: shot.id,
    })),
  ),
});
