import {Easing, interpolate, spring} from 'remotion';

export const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));
export const ease = (frame: number, start: number, end: number, from = 0, to = 1) =>
  interpolate(frame, [start, Math.max(end, start + 1)], [from, to], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });
export const smooth = (n: number) => {const t = clamp(n); return t * t * (3 - 2 * t);};
export const arrive = (frame: number, delay = 0, duration = 45) => spring({
  frame: frame - delay, fps: 30, durationInFrames: duration,
  config: {damping: 24, stiffness: 105, mass: 1.2},
});
export const appear = (frame: number, start = 0, duration = 24) => ease(frame, start, start + duration);
export const hold = (frame: number, start: number, end: number, ramp = 18) =>
  appear(frame, start, ramp) * (1 - appear(frame, end - ramp, ramp));
export const seeded = (index: number, salt = 0) => {
  const v = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
export const fmtTime = (frame: number) => {
  const secs = Math.floor(frame / 30);
  return `${Math.floor(secs / 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`;
};
