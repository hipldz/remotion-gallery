import type {CalculateMetadataFunction} from 'remotion';
import {loadVoiceoverState} from 'remotion-voiceover/react';
import type {FilmProps} from './Film';
import {voiceoverProject} from './voiceover.config';

export const calculateVoiceoverMetadata: CalculateMetadataFunction<FilmProps> = async ({props, abortSignal}) => {
  const saved = await loadVoiceoverState(voiceoverProject, {signal: abortSignal});
  return {durationInFrames: saved.project.durationInFrames,
    props: {...props, voiceProject: saved.project, voiceTracks: saved.manifest.tracks}};
};
