import {defineVoiceoverProject} from 'remotion-voiceover/core';
import {CAPTIONS, DURATION, FPS, SHOTS} from './data/story';

// The recording tool has no dependency on story.ts; this adapter supplies film data.
export const voiceoverProject = defineVoiceoverProject({
  fps: FPS,
  durationInFrames: DURATION,
  scenes: SHOTS.map(shot => ({
    id: shot.id, title: shot.title, from: shot.start, durationInFrames: shot.duration,
    recordable: shot.captions.length > 0,
  })),
  captions: CAPTIONS.map(cue => ({
    startFrame: cue.start, endFrame: cue.end, text: cue.text, sceneId: cue.shot,
  })),
});
