import { clamp } from './motion';
import { motionSpansFor, type TimedShot } from './timeline';

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
  A00: [[1, 1333, -300, 1]],
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
    [0.4, 12898, -100, 1],
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
    [0.2, 14774, -100, 1],
    [1, 14774, -100, 1],
  ],
  F06: [[1, 14774, 0, 0.7]],
  G01: [
    [0.25, 7700, 0, 0.11],
    [1, 7700, 0, 0.11],
  ],
  G06: [[1, 7700, 0, 0.11]],
};

export function buildCameraTrack(timeline: TimedShot[]) {
  const result: (Camera & { frame: number })[] = [];
  for (const shot of timeline) {
    const hints = cameraCues[shot.id] ?? [];
    const push = (local: number, x: number, y: number, z: number, r = 0) => {
      const frame = shot.from + Math.max(0, Math.min(shot.duration - 1, Math.round(local)));
      const point = { frame, x, y, z, r };
      if (result.at(-1)?.frame === frame) result[result.length - 1] = point;
      else result.push(point);
    };
    if (shot.id === 'P06') {
      push(Math.min(18, shot.duration * 0.18), 15000, 0, 0.35, -2);
      push(Math.min(78, shot.duration * 0.64), 3200, 0, 0.35, -1);
      push(Math.min(104, shot.duration * 0.85), 2925, -100, 1);
    } else if (shot.id === 'B04' || shot.id === 'F02') {
      const switchAt = motionSpansFor(shot).find((span) => span.beat.cueIndex === 1)?.start ?? shot.duration / 2;
      const one = shot.id === 'B04' ? [3733, -300, 1] : [12898, -100, 1];
      const two = shot.id === 'B04' ? [4800, -300, 0.9] : [13058, -100, 1];
      push(Math.min(30, switchAt / 2), one[0], one[1], one[2]);
      push(Math.max(0, switchAt - 12), one[0], one[1], one[2]);
      push(switchAt + 36, two[0], two[1], two[2]);
    } else if (hints.length) {
      const [, x, y, z, r = 0] = hints.at(-1)!;
      // A camera move keeps its punch, then holds instead of stretching across speech.
      push(Math.min(36, shot.duration * 0.4), x, y, z, r);
    }
    const last = result[result.length - 1];
    const end = shot.from + shot.duration - 1;
    // Unspecified beats hold the last pose instead of drifting toward a later shot.
    if (last && last.frame < end) result.push({ ...last, frame: end });
  }
  // Very short edited ranges can collapse several cues to the same frame.
  return [...new Map(result.map((point) => [point.frame, point])).values()].sort((a, b) => a.frame - b.frame);
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
