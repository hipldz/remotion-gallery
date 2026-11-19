import type { CalculateMetadataFunction } from "remotion";
import { loadVoiceoverState } from "remotion-voiceover/react";
import type { FilmProps } from "./Film";
import { voiceoverProject } from "./voiceover.config";

// 渲染时读取 public/narration/manifest.json：总时长与音轨都以保存的录音为准。
export const calculateVoiceoverMetadata: CalculateMetadataFunction<
  FilmProps
> = async ({ props, abortSignal }) => {
  const saved = await loadVoiceoverState(voiceoverProject, {
    signal: abortSignal,
  });
  return {
    durationInFrames: saved.project.durationInFrames,
    props: {
      ...props,
      voiceProject: saved.project,
      voiceTracks: saved.manifest.tracks,
    },
  };
};
