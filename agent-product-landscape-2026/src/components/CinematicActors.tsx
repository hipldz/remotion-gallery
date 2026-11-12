import type { CSSProperties, ReactNode } from 'react';
import { C, fonts } from '../data/theme';
import { arc, drift, fade, f2, limit, mix, move, settle } from '../lib/cinematics';
import { At, Icon } from './Primitives';

export function KineticText({
  children,
  f,
  start = 0,
  size = 96,
  weight = 800,
  color = C.ink,
  style,
}: {
  children: ReactNode;
  f: number;
  start?: number;
  size?: number;
  weight?: number;
  color?: string;
  style?: CSSProperties;
}) {
  const p = move(f, start, 27);
  return (
    <div style={{ overflow: 'hidden', paddingBottom: 8, marginBottom: -8, ...style }}>
      <div
        style={{
          fontSize: size,
          lineHeight: 1.17,
          letterSpacing: size > 65 ? -3 : -0.8,
          fontWeight: weight,
          color,
          transform: `translateY(${(1 - p) * 115}%) rotate(${(1 - p) * 2}deg)`,
          transformOrigin: 'left bottom',
          opacity: fade(f, start, 9),
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function TitleBlock({
  f,
  eyebrow,
  lines,
  x = 110,
  y = 120,
  size = 88,
  width = 1650,
  color = C.ink,
  accent = C.blue,
  center = false,
  start = 0,
}: {
  f: number;
  eyebrow?: string;
  lines: ReactNode[];
  x?: number;
  y?: number;
  size?: number;
  width?: number;
  color?: string;
  accent?: string;
  center?: boolean;
  start?: number;
}) {
  return (
    <At x={x} y={y} style={{ width, textAlign: center ? 'center' : 'left', zIndex: 5 }}>
      {eyebrow && (
        <div
          style={{
            display: 'flex',
            justifyContent: center ? 'center' : 'flex-start',
            alignItems: 'center',
            gap: 18,
            marginBottom: 26,
            opacity: fade(f, start, 18),
          }}
        >
          <span style={{ height: 2, width: move(f, start, 25, 0, 40), background: accent }} />
          <span style={{ fontSize: 21, fontFamily: fonts.sans, fontWeight: 500, letterSpacing: 3, color: color === C.ink ? '#7B8089' : '#A0AAB9' }}>
            {eyebrow}
          </span>
        </div>
      )}
      {lines.map((line, i) => (
        <KineticText key={i} f={f} start={start + 5 + i * 7} size={size} color={color}>
          {line}
        </KineticText>
      ))}
    </At>
  );
}

export function Note({
  f,
  start = 0,
  children,
  x = 110,
  y = 820,
  color = C.gray,
  size = 30,
  width = 1650,
}: {
  f: number;
  start?: number;
  children: ReactNode;
  x?: number;
  y?: number;
  color?: string;
  size?: number;
  width?: number;
}) {
  return (
    <At
      x={x}
      y={y}
      style={{ width, fontSize: size, lineHeight: 1.55, color, opacity: fade(f, start, 16), transform: `translateY(${move(f, start, 26, 22, 0)}px)` }}
    >
      {children}
    </At>
  );
}

export function Orb({
  x,
  y,
  f = 100,
  start = 0,
  color = C.blue,
  size = 56,
  glow = false,
  squash = 0,
  shadow = true,
}: {
  x: number;
  y: number;
  f?: number;
  start?: number;
  color?: string;
  size?: number;
  glow?: boolean;
  squash?: number;
  shadow?: boolean;
}) {
  const p = settle(f2(f), start, true);
  return (
    <At x={x} y={y} style={{ width: 0, height: 0 }}>
      {shadow && (
        <div
          style={{
            position: 'absolute',
            width: size * 1.25,
            height: size * 0.2,
            left: -size * 0.625,
            top: size * 0.5 + 8,
            borderRadius: '50%',
            background: color,
            filter: 'blur(11px)',
            opacity: 0.16,
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          width: size,
          height: size,
          left: -size / 2,
          top: -size / 2,
          borderRadius: '50%',
          background: color,
          transform: `scale(${Math.max(0, p) * (1 + squash * 0.24)},${Math.max(0, p) * (1 - squash * 0.2)})`,
          boxShadow: glow ? `0 0 ${size}px ${color}55` : undefined,
        }}
      />
    </At>
  );
}

export function GlyphTile({
  x,
  y,
  icon,
  label,
  color = C.blue,
  f,
  start = 0,
  width = 240,
  height = 180,
  depth = 8,
  rotate = 0,
}: {
  x: number;
  y: number;
  icon: string;
  label?: string;
  color?: string;
  f: number;
  start?: number;
  width?: number;
  height?: number;
  depth?: number;
  rotate?: number;
}) {
  const p = move(f, start, 30);
  return (
    <At
      x={x}
      y={y + (1 - p) * 70 + drift(f, 2, x)}
      style={{
        width,
        height,
        opacity: fade(f, start, 14),
        transform: `perspective(1200px) rotateX(${mix(17, 4, p)}deg) rotateY(${rotate}deg) rotateZ(${(1 - p) * -5}deg)`,
        transformStyle: 'preserve-3d',
      }}
    >
      <div style={{ position: 'absolute', inset: `${depth}px -3px -${depth}px 3px`, background: '#DAE0E9', borderRadius: 25 }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#fff',
          border: `1px solid ${color}35`,
          borderRadius: 25,
          padding: 30,
          boxShadow: '0 24px 55px -30px #182B4B45',
        }}
      >
        <Icon name={icon} color={color} size={58} />
        {label && <div style={{ fontSize: 28, color: C.ink, marginTop: 20, fontWeight: 600 }}>{label}</div>}
      </div>
    </At>
  );
}

export const bezierPoint = (p: number, a: [number, number], b: [number, number], c: [number, number], d: [number, number]) => {
  const q = 1 - p;
  return {
    x: q * q * q * a[0] + 3 * q * q * p * b[0] + 3 * q * p * p * c[0] + p * p * p * d[0],
    y: q * q * q * a[1] + 3 * q * q * p * b[1] + 3 * q * p * p * c[1] + p * p * p * d[1],
  };
};

export function Signal({
  f,
  start = 0,
  duration = 55,
  a,
  b,
  color = C.blue,
  bend = 0,
  returning = false,
  label,
}: {
  f: number;
  start?: number;
  duration?: number;
  a: [number, number];
  b: [number, number];
  color?: string;
  bend?: number;
  returning?: boolean;
  label?: string;
}) {
  const p = move(f, start, duration);
  const c1: [number, number] = [a[0] + (b[0] - a[0]) * 0.35, a[1] + bend];
  const c2: [number, number] = [a[0] + (b[0] - a[0]) * 0.65, b[1] + bend];
  const point = bezierPoint(returning ? 1 - p : p, a, c1, c2, b);
  const d = `M${a}C${c1} ${c2} ${b}`;
  return (
    <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>
      <path d={d} fill="none" stroke={color} opacity={0.18} strokeWidth={2} />
      <path d={d} fill="none" stroke={color} opacity={0.8} strokeWidth={2.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      {p > 0 && p < 1 && (
        <>
          <circle cx={point.x} cy={point.y} r={13} fill={color} opacity={0.1} />
          <circle cx={point.x} cy={point.y} r={5} fill={color} />
        </>
      )}
      {label && (
        <text
          x={(a[0] + b[0]) / 2}
          y={(a[1] + b[1]) / 2 + bend * 0.75 - 17}
          fill={C.gray}
          opacity={fade(f, start, 18)}
          fontSize={23}
          textAnchor="middle"
          fontFamily={fonts.sans}
        >
          {label}
        </text>
      )}
    </svg>
  );
}

export function Burst({
  f,
  at,
  x,
  y,
  colors = [C.blue, C.green, C.yellow, C.red],
  count = 32,
  radius = 420,
}: {
  f: number;
  at: number;
  x: number;
  y: number;
  colors?: string[];
  count?: number;
  radius?: number;
}) {
  const p = limit((f2(f) - at) / 85);
  if (f < at || p >= 1) return null;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const angle = i * 2.399963;
        const distance = move(f2(f), at, 60, 0, radius * (0.4 + (i % 7) / 10));
        return (
          <At
            key={i}
            x={x + Math.cos(angle) * distance}
            y={y + Math.sin(angle) * distance * 0.7 + p * p * 120}
            style={{
              width: 8 + (i % 4) * 4,
              height: 5 + (i % 3) * 4,
              background: colors[i % colors.length],
              transform: `rotate(${angle * 90 + p * 220}deg)`,
              opacity: 1 - fade(f, at + 48, 37),
              borderRadius: i % 4 === 0 ? '50%' : 2,
            }}
          />
        );
      })}
    </>
  );
}

export function JumpingOrb({
  f,
  start,
  duration = 26,
  from,
  to,
  color = C.blue,
  height = 190,
  size = 56,
}: {
  f: number;
  start: number;
  duration?: number;
  from: [number, number];
  to: [number, number];
  color?: string;
  height?: number;
  size?: number;
}) {
  const p = limit((f2(f) - start) / duration);
  const x = mix(from[0], to[0], p),
    y = mix(from[1], to[1], p) + arc(p, height);
  const landing = f - start - duration;
  const squash = f < start ? fade(f, start - 7, 7) : landing >= 0 ? Math.sin(landing * 0.45) * Math.exp(-landing / 10) : -0.4;
  return (
    <>
      {p > 0 &&
        p < 1 &&
        [1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - size / 2 - ((i * (to[0] - from[0])) / duration) * 0.7,
              top: y - size / 2 + i * 5,
              width: size * 1.5,
              height: size * 0.7,
              borderRadius: '50%',
              background: color,
              opacity: 0.12 / i,
            }}
          />
        ))}
      <Orb x={x} y={y} f={100} color={color} size={size} squash={squash} />
    </>
  );
}
