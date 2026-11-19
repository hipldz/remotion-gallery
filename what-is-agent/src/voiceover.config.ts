import { defineVoiceoverProject } from "remotion-voiceover/core";
import { FPS } from "./theme";
import { CAPTIONS, SCENES, TOTAL_FRAMES } from "./timeline";

// 一条口播对应一个镜头；分镜表就是配音区间，字幕表就是提词。
export const voiceoverProject = defineVoiceoverProject({
  fps: FPS,
  durationInFrames: TOTAL_FRAMES,
  scenes: SCENES.map((scene) => ({
    id: scene.id,
    title: scene.title,
    from: scene.from,
    durationInFrames: scene.duration,
  })),
  captions: CAPTIONS.map((cue) => ({
    startFrame: cue.from,
    endFrame: cue.to,
    text: cue.text,
    sceneId: cue.scene,
  })),
});
