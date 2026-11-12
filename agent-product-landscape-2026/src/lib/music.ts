import { linear } from './motion';
import { totalFrames, type TimedShot } from './timeline';

export const musicMix = {
  bed: 0.1,
  narration: 0.06,
  fadeInFrames: 60,
  fadeOutFrames: 90,
  duckAttackFrames: 12,
  duckReleaseFrames: 24,
} as const;

export function musicVolumeAt(frame: number, timeline: TimedShot[], voiceSegments: readonly { from: number; duration: number }[] = []) {
  const duration = totalFrames(timeline);
  const fadeIn = linear(frame, 0, musicMix.fadeInFrames);
  const fadeOut = 1 - linear(frame, duration - musicMix.fadeOutFrames, duration - 1);
  let duck = 0;

  // Keep space for the planned narration before recordings have been added.
  for (const shot of timeline) {
    if (!shot.narration && !shot.vo) continue;
    const start = shot.from + shot.voOffset;
    const end = Math.min(shot.from + shot.duration, start + (shot.voFrames ?? shot.duration - shot.voOffset));
    const attack = linear(frame, start - musicMix.duckAttackFrames, start);
    const release = 1 - linear(frame, end, end + musicMix.duckReleaseFrames);
    duck = Math.max(duck, Math.min(attack, release));
  }

  // Full-film recordings also cover chapter cards and the gaps between lines.
  for (const segment of voiceSegments) {
    const attack = linear(frame, segment.from - musicMix.duckAttackFrames, segment.from);
    const release = 1 - linear(frame, segment.from + segment.duration, segment.from + segment.duration + musicMix.duckReleaseFrames);
    duck = Math.max(duck, Math.min(attack, release));
  }

  return (musicMix.bed + (musicMix.narration - musicMix.bed) * duck) * fadeIn * fadeOut;
}
