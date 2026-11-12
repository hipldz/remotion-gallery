import { clamp } from './motion';
import type { TimedShot } from './timeline';

export type Camera = { x: number; y: number; z: number; r: number };
type Cue = [progress: number, x: number, y: number, z: number, r?: number];
// All cues belong to ONE global track. Insert scenes never create a second camera.
export const cameraCues: Record<string, Cue[]> = {
  P01: [
    [0, 15538, 0, 1],
    [1, 15538, 0, 1.02],
  ],
  P02: [[1, 15538, 0, 1.02]],
  P06: [
    [0.21, 15000, 0, 0.35, -2],
    [0.77, 3200, 0, 0.35, -1],
    [1, 2925, -100, 1],
  ],
  P07: [[1, 2925, -100, 1]],
  Z00: [[1, 6200, 0, 0.11]],
  Z04: [
    [0, 6200, 0, 0.11],
    [1, 7000, 0, 0.12],
  ],
  A00: [[1, 2925, -100, 1]],
  A01: [[1, 2925, -100, 1.08]],
  A03: [
    [0.3, 1333, -300, 1],
    [1, 1333, -300, 1],
  ],
  B00: [[1, 4200, -100, 0.8]],
  B04: [
    [0.12, 3733, -300, 1],
    [0.5, 3733, -300, 1],
    [1, 4800, -300, 0.9],
  ],
  C00: [[1, 6933, -300, 1]],
  C04: [
    [0.2, 9067, -300, 1],
    [1, 9067, -300, 1],
  ],
  C05: [
    [0.25, 6400, 100, 0.5],
    [1, 6400, 100, 0.5],
  ],
  D00: [[1, 9100, 0, 0.6]],
  D01: [
    [0.18, 9600, 0, 0.9],
    [1, 9600, 0, 0.9],
  ],
  D03: [
    [0.12, 10072, -300, 1],
    [1, 10072, -300, 1],
  ],
  D06: [
    [0.1, 11100, -300, 1],
    [1, 11100, -300, 0.6],
  ],
  D07: [[1, 10133, -100, 1]],
  D08: [[1, 9867, -100, 1]],
  D09: [[1, 11200, -100, 1]],
  D10: [[1, 12520, -300, 1]],
  F00: [[1, 12898, -100, 1]],
  F02: [
    [0.51, 12898, -100, 1],
    [0.7, 13058, -100, 1],
    [1, 13058, -100, 1],
  ],
  F03: [
    [0.25, 13076, -300, 1],
    [1, 13076, -300, 1],
  ],
  F05: [
    [0.1, 13700, -100, 0.7],
    [1, 13700, -100, 0.76],
  ],
  F07: [
    [0.15, 13974, 300, 1],
    [0.51, 13974, 300, 1],
    [1, 14774, 300, 1],
  ],
  G01: [
    [0.25, 7700, 0, 0.11],
    [1, 7700, 0, 0.11],
  ],
  G06: [[1, 7700, 0, 0.11]],
};

export function buildCameraTrack(timeline: TimedShot[]) {
  const result: (Camera & { frame: number })[] = [];
  for (const shot of timeline) {
    for (const [p, x, y, z, r = 0] of cameraCues[shot.id] ?? []) {
      result.push({ frame: shot.from + Math.round(p * (shot.duration - 1)), x, y, z, r });
    }
    const last = result[result.length - 1];
    const end = shot.from + shot.duration - 1;
    // Unspecified beats hold the last pose instead of drifting toward a later shot.
    if (last && last.frame < end) result.push({ ...last, frame: end });
  }
  return result;
}

export function cameraAt(frame: number, track: ReturnType<typeof buildCameraTrack>): Camera {
  const index = track.findIndex((cue) => cue.frame > frame);
  if (index === -1) return track[track.length - 1];
  if (index === 0) return track[0];
  const a = track[index - 1];
  const b = track[index];
  const dt = b.frame - a.frame;
  const t = clamp((frame - a.frame) / dt),
    t2 = t * t,
    t3 = t2 * t;
  const prev = track[index - 2],
    next = track[index + 1];
  const pose = {} as Camera;
  for (const key of ['x', 'y', 'z', 'r'] as const) {
    const slope = (b[key] - a[key]) / dt;
    const before = prev ? (a[key] - prev[key]) / (a.frame - prev.frame) : slope;
    const after = next ? (next[key] - b[key]) / (next.frame - b.frame) : slope;
    // Monotone Hermite: continuous velocity through a whip, zero at a hold.
    const m0 = before * slope > 0 ? (2 * before * slope) / (before + slope) : 0;
    const m1 = after * slope > 0 ? (2 * after * slope) / (after + slope) : 0;
    pose[key] = (2 * t3 - 3 * t2 + 1) * a[key] + (t3 - 2 * t2 + t) * m0 * dt + (-2 * t3 + 3 * t2) * b[key] + (t3 - t2) * m1 * dt;
  }
  return pose;
}
export const worldToScreen = (x: number, y: number, cam: Camera) => ({ x: (x - cam.x) * cam.z + 960, y: (y - cam.y) * cam.z + 540 });
