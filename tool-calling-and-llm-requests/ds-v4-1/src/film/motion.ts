// 所有动画都是时间 t（秒）的纯函数：给定 t 就能算出画面，
// 不依赖 React state，所以 Studio 里可以任意拖动、任意跳帧。

export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a: number, b: number, p: number): number => a + (b - a) * p;

/** t 在 [start, start+dur] 内的归一化进度（0…1），未开始为 0，结束后为 1 */
export const prog = (t: number, start: number, dur: number): number => {
  if (dur <= 0) return t >= start ? 1 : 0;
  return clamp01((t - start) / dur);
};

export const inOut = (p: number): number =>
  p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

export const easeInOut = inOut;

export const outCubic = (p: number): number => 1 - Math.pow(1 - p, 3);

export const outQuint = (p: number): number => 1 - Math.pow(1 - p, 5);

export const inCubic = (p: number): number => p * p * p;

/** 带回弹的进入：0 → 1 稍微冲过头再落回 */
export const outBack = (p: number, s = 1.34): number => {
  const x = p - 1;
  return 1 + (s + 1) * x * x * x + s * x * x;
};

/** 时间窗渐入渐出：用于区域明暗、段落级叠加 */
export const fadeIO = (
  t: number,
  start: number,
  end: number,
  fadeIn: number,
  fadeOut: number,
): number => {
  if (t < start || t > end) return 0;
  const a = clamp01((t - start) / Math.max(0.001, fadeIn));
  const b = clamp01((end - t) / Math.max(0.001, fadeOut));
  return Math.min(a, b);
};

/** 单次脉冲：center 处为 1，向两侧衰减 */
export const pulse = (t: number, center: number, width = 0.45): number => {
  const d = Math.abs(t - center) / width;
  return d >= 1 ? 0 : Math.cos((d * Math.PI) / 2) ** 2;
};

/** 最近一次事件之后经过的时间（用于计数器"跳一下"） */
export const since = (t: number, events: number[]): number => {
  let last = -Infinity;
  for (const e of events) if (e <= t && e > last) last = e;
  return t - last;
};

export const bezier = (
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  p: number,
): [number, number] => {
  const u = 1 - p;
  const x =
    u * u * u * p0[0] + 3 * u * u * p1[0] + 3 * u * p2[0] + p * p * p * p3[0];
  const y =
    u * u * u * p0[1] + 3 * u * u * p1[1] + 3 * u * p2[1] + p * p * p * p3[1];
  return [x, y];
};

export const bezierPath = (
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
): string =>
  `M ${p0[0]} ${p0[1]} C ${p1[0]} ${p1[1]}, ${p2[0]} ${p2[1]}, ${p3[0]} ${p3[1]}`;
