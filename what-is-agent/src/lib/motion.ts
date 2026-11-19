import { Easing, interpolate, spring } from "remotion";
import { FPS } from "../theme";

export const clamp = (x: number, min = 0, max = 1) => Math.max(min, Math.min(max, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * clamp(t);

export const ease = (value: number, from = 0, duration = 1) =>
  Easing.inOut(Easing.cubic)(clamp((value - from) / Math.max(0.0001, duration)));

export const easeOut = (value: number, from = 0, duration = 1) =>
  Easing.out(Easing.cubic)(clamp((value - from) / Math.max(0.0001, duration)));

export const easeIn = (value: number, from = 0, duration = 1) =>
  Easing.in(Easing.cubic)(clamp((value - from) / Math.max(0.0001, duration)));

export const range = (value: number, input: number[], output: number[]) =>
  interpolate(value, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

/** 本地帧 → 带阻尼的入场值，用于卡片、节点和文字。 */
export const springIn = (
  frame: number,
  delay = 0,
  config: Partial<{ damping: number; stiffness: number; mass: number }> = {},
) =>
  spring({
    frame: Math.max(0, frame - delay),
    fps: FPS,
    config: { damping: 18, stiffness: 130, mass: 0.8, ...config },
  });

/** 绝对帧窗口的淡入淡出，返回 0–1。 */
export const fadeWindow = (frame: number, from: number, to: number, edge = 8) =>
  Math.min(clamp((frame - from) / edge), clamp((to - frame) / edge));

/** 用于 SVG 描边：返回 0–1 的绘制进度。 */
export const draw = (frame: number, start: number, duration: number) =>
  easeOut(frame, start, duration);

export const blink = (frame: number, period = 18) => 0.5 + 0.5 * Math.sin((frame / period) * Math.PI * 2);

export const stagger = (frame: number, index: number, gap = 3) => springIn(frame, index * gap);
