import { createContext, useContext } from 'react';
import { Easing, interpolate, spring } from 'remotion';
import type { Camera } from './camera';
import type { TimedShot } from './timeline';

export const limit = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const smooth = Easing.bezier(0.65, 0, 0.35, 1);
export const fade = (f: number, start = 0, duration = 18) => limit((f - start) / duration);
export const move = (f: number, start: number, duration: number, a = 0, b = 1) => mix(a, b, ease(fade(f, start, duration)));
export const settle = (f: number, start = 0, bounce = false) =>
  spring({ frame: f - start, fps: 30, config: bounce ? { mass: 0.6, damping: 12, stiffness: 180 } : { damping: 30, stiffness: 140, mass: 1 } });
export const drift = (f: number, amount = 4, phase = 0) => Math.sin(f / 85 + phase) * amount;
export const arc = (p: number, height = 180) => -4 * height * limit(p) * (1 - limit(p));
export const f2 = (f: number) => Math.floor(f / 2) * 2;
export const pathValue = (f: number, stops: number[], values: number[]) =>
  interpolate(f, stops, values, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: smooth });

export type CinemaState = { frame: number; f: number; shot: TimedShot; timeline: TimedShot[]; camera: Camera; velocity: number; dark: boolean };
export const CinemaContext = createContext<CinemaState | null>(null);
export const useCinema = () => {
  const value = useContext(CinemaContext);
  if (!value) throw new Error('Cinematic actors must be inside the film rig.');
  return value;
};

// Semantic vertical zoom keeps the four routes legible in the full atlas.
// The same projection is shared by rails, pins, screenshot lifts and the final fold.
export function projectMap(x: number, y: number, cam: Camera, elevation = 0) {
  const pitch = ((cam.z < 0.55 ? 16 : 7) * Math.PI) / 180;
  const vx = (x - cam.x) * cam.z;
  const vy = (y - cam.y) * Math.max(0.68, Math.sqrt(cam.z));
  const zz = Math.sin(pitch) * vy - elevation;
  const perspective = 2100 / (2100 + zz);
  const xx = vx * perspective;
  const yy = (vy * Math.cos(pitch) - elevation * 0.32) * perspective;
  const r = (cam.r * Math.PI) / 180;
  return { x: 960 + xx * Math.cos(r) - yy * Math.sin(r), y: 550 + xx * Math.sin(r) + yy * Math.cos(r), scale: perspective };
}

export const assetPositions: Record<string, [number, number]> = {
  chatgpt: [2925, -100],
  copilot: [1333, -300],
  cursor: [3733, -300],
  aider: [4800, -300],
  devin: [6933, -300],
  windsurf: [9067, -300],
  cline: [9067, -300],
  n8n: [-9600, 100],
  dify: [6400, 100],
  coze: [6667, 100],
  trae: [9600, -300],
  'claude-code': [10072, -300],
  'codex-web': [13076, -300],
  manus: [10133, -100],
  'deep-research': [9867, -100],
  'chatgpt-agent': [11200, -100],
  'pi-agent': [12520, -300],
  cowork: [12898, -100],
  openclaw: [13058, -100],
  'codex-agents': [13076, -300],
  workbuddy: [13404, -100],
  dumate: [13520, -100],
  qoderwork: [12800, -100],
  doubao: [14881, -100],
  harness: [14774, -100],
};

export const focalAssets: Record<string, string[]> = {
  A01: ['chatgpt'],
  A03: ['copilot'],
  B04: ['cursor', 'aider'],
  C02: ['devin'],
  C04: ['windsurf', 'cline'],
  C05: ['n8n', 'dify', 'coze'],
  D03: ['claude-code'],
  D07: ['manus'],
  D08: ['deep-research'],
  D09: ['chatgpt-agent'],
  D10: ['pi-agent'],
  F02: ['cowork', 'openclaw'],
  F03: ['codex-web'],
  F05: ['workbuddy', 'doubao'],
  F07: ['harness'],
};
