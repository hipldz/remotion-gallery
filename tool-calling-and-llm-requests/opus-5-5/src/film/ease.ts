// 所有动画都是时间 t（秒）的纯函数，逐帧确定，可任意跳帧预览。

export type Pt = {x: number; y: number};
export type Rect = {x: number; y: number; w: number; h: number};

export const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, p: number): number => a + (b - a) * p;

/** t 在 [start, start+dur] 内的线性进度 0..1 */
export const prog = (t: number, start: number, dur: number): number =>
  dur <= 0 ? (t >= start ? 1 : 0) : clamp01((t - start) / dur);

export const inOut = (x: number): number =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
export const out = (x: number): number => 1 - Math.pow(1 - x, 3);
export const outBack = (x: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
/** 轻微回弹（约 8% 过冲），用于“从模型里弹出来”的东西 */
export const spring = (x: number): number => {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return 1 - Math.exp(-6.5 * x) * Math.cos(8 * x);
};

export const ease = (t: number, start: number, dur: number, fn: (x: number) => number = inOut): number =>
  fn(prog(t, start, dur));

/** 在 [a, b] 区间内淡入淡出 */
export const fadeIO = (t: number, a: number, b: number, fin = 0.4, fout = 0.4): number =>
  Math.min(prog(t, a, fin), 1 - prog(t, b - fout, fout));

/** 0 → 1 → 0 的脉冲 */
export const pulse = (t: number, at: number, dur = 0.6): number => {
  const p = prog(t, at, dur);
  return p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p);
};

/** 按时间表分段插值：keys = [[t0, v0], [t1, v1], ...] */
export const keyed = (t: number, keys: Array<[number, number]>, fn: (x: number) => number = inOut): number => {
  if (keys.length === 0) return 0;
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    const [t0, v0] = keys[i - 1];
    if (t < t1) return lerp(v0, v1, fn(prog(t, t0, t1 - t0)));
  }
  return keys[keys.length - 1][1];
};

export const mixPt = (a: Pt, b: Pt, p: number): Pt => ({x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p)});
export const mixRect = (a: Rect, b: Rect, p: number): Rect => ({
  x: lerp(a.x, b.x, p),
  y: lerp(a.y, b.y, p),
  w: lerp(a.w, b.w, p),
  h: lerp(a.h, b.h, p),
});

export const quad = (p0: Pt, p1: Pt, p2: Pt, u: number): Pt => {
  const a = (1 - u) * (1 - u);
  const b = 2 * (1 - u) * u;
  const c = u * u;
  return {x: a * p0.x + b * p1.x + c * p2.x, y: a * p0.y + b * p1.y + c * p2.y};
};

export const cubic = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, u: number): Pt => {
  const m = 1 - u;
  const a = m * m * m;
  const b = 3 * m * m * u;
  const c = 3 * m * u * u;
  const d = u * u * u;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
};

/** 沿折线按长度比例取点 */
export const alongPolyline = (pts: Pt[], p: number): Pt => {
  if (pts.length === 1) return pts[0];
  const segs: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    segs.push(l);
    total += l;
  }
  let d = clamp01(p) * total;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i] || i === segs.length - 1) {
      const u = segs[i] === 0 ? 0 : Math.min(1, d / segs[i]);
      return mixPt(pts[i], pts[i + 1], u);
    }
    d -= segs[i];
  }
  return pts[pts.length - 1];
};

export const polyD = (pts: Pt[]): string =>
  pts.map((q, i) => `${i === 0 ? "M" : "L"}${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(" ");

/** 确定性伪随机（同一输入永远同一输出） */
export const hash = (n: number): number => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
