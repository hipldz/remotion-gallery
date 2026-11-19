import { AbsoluteFill } from 'remotion';
import { C } from '../data/theme';
import { clamp, linear } from '../lib/motion';

export const impactCues = {
  D01: { at: 22, color: C.red },
};
export function SpeedLines({ f, start = 0, duration = 18, dark = false }: { f: number; start?: number; duration?: number; dark?: boolean }) {
  const p = (f - start) / duration;
  if (p < 0 || p > 1) return null;
  return (
    <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, opacity: Math.sin(p * Math.PI) * 0.5, pointerEvents: 'none' }}>
      {Array.from({ length: 40 }, (_, i) => {
        const a = (i * Math.PI * 2) / 40;
        const r = 400 + (i % 4) * 45;
        return (
          <line
            key={i}
            x1={960 + Math.cos(a) * r}
            y1={540 + Math.sin(a) * r * 0.6}
            x2={960 + Math.cos(a) * 1500}
            y2={540 + Math.sin(a) * 1500}
            stroke={dark ? '#fff' : C.ink}
            strokeWidth={i % 3 === 0 ? 3 : 1}
            opacity={0.3}
          />
        );
      })}
    </svg>
  );
}
export function Impact({ f, id }: { f: number; id: string }) {
  const cue = impactCues[id as keyof typeof impactCues];
  if (!cue || f < cue.at || f >= cue.at + 2) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <SpeedLines f={f} start={cue.at - 5} duration={14} />
    </AbsoluteFill>
  );
}
export function shakeAt(f: number, id: string) {
  const cue = impactCues[id as keyof typeof impactCues];
  if (!cue) return { x: 0, y: 0 };
  const p = clamp((f - cue.at) / 8);
  const amount = f >= cue.at && p < 1 ? (1 - p) * 6 : 0;
  return { x: Math.sin(f * 2.1) * amount, y: Math.cos(f * 2.8) * amount };
}
export const Ripple = ({ f, start = 0, color = '#fff', reverse = false }: { f: number; start?: number; color?: string; reverse?: boolean }) => {
  const p = linear(f, start, start + 20);
  const r = reverse ? (1 - p) * 2400 : p * 2400;
  return (
    <div
      style={{ position: 'absolute', left: 960 - r, top: 540 - r, width: r * 2, height: r * 2, borderRadius: '50%', background: color, pointerEvents: 'none' }}
    />
  );
};
