import { linear } from './motion';
import { totalFrames, type TimedShot } from './timeline';

export const musicMix = {
  volume: 0.2,
  fadeInFrames: 60,
  fadeOutFrames: 90,
} as const;

export function musicVolumeAt(frame: number, timeline: TimedShot[]) {
  const duration = totalFrames(timeline);
  const fadeIn = linear(frame, 0, musicMix.fadeInFrames);
  const fadeOut = 1 - linear(frame, duration - musicMix.fadeOutFrames, duration - 1);
  return musicMix.volume * fadeIn * fadeOut;
}
