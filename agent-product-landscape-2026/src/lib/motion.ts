import { Easing, interpolate, spring } from 'remotion';

export const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));
export const emphasized = Easing.bezier(0.2, 0, 0, 1);
export const decel = Easing.bezier(0.05, 0.7, 0.1, 1);
export const accel = Easing.bezier(0.3, 0, 0.8, 0.15);
export const tween = (f: number, from: number, to: number, a = 0, b = 1) =>
  interpolate(f, [from, to], [a, b], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: emphasized });
export const linear = (f: number, from: number, to: number, a = 0, b = 1) =>
  interpolate(f, [from, to], [a, b], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
export const pop = (f: number, delay = 0) => spring({ frame: f - delay, fps: 30, config: { damping: 12, mass: 0.6, stiffness: 180 } });
export const soft = (f: number, delay = 0) => spring({ frame: f - delay, fps: 30, config: { damping: 200 } });
export const onTwos = (f: number) => Math.floor(f / 2) * 2;
export const entrance = (f: number, delay = 0) => ({
  opacity: linear(f, delay, delay + 12),
  transform: `translateY(${(1 - decel(clamp((f - delay) / 24))) * 35}px)`,
});

export const jump = (f: number, start: number, end: number, height: number) => {
  const p = clamp((onTwos(f) - start) / (end - start));
  return -Math.sin(p * Math.PI) * height;
};
