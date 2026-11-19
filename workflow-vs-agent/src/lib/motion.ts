import { Easing, interpolate, spring } from "remotion";
import { FPS } from "../data/theme";

export const clamp = (x: number, min = 0, max = 1) => Math.max(min, Math.min(max, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * clamp(t);
export const ease = (t: number, start = 0, duration = 1) => Easing.inOut(Easing.cubic)(clamp((t - start) / duration));
export const enter = (t: number, delay = 0) => spring({ frame: Math.max(0, (t - delay) * FPS), fps: FPS, config: { damping: 19, stiffness: 140, mass: 0.8 } });
export const fade = (t: number, start: number, end: number, duration = 0.2) => Math.min(clamp((t - start) / duration), clamp((end - t) / duration));
export const range = (t: number, times: number[], values: number[]) =>
  interpolate(t, times, values, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
export type Point = [number, number];
export const bezier = (p: [Point, Point, Point, Point], t: number): Point =>
  [0, 1].map((axis) => (1 - t) ** 3 * p[0][axis] + 3 * (1 - t) ** 2 * t * p[1][axis] + 3 * (1 - t) * t ** 2 * p[2][axis] + t ** 3 * p[3][axis]) as Point;
