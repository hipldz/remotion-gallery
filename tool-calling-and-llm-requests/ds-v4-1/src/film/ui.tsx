import React from "react";
import {C, FONT, alpha, glass} from "./theme";
import {clamp01, outCubic} from "./motion";

/* ---------------------------------- 容器 --------------------------------- */

export const Panel: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
  radius?: number;
  glow?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({x, y, w, h, color = C.line, radius = 16, glow, style, children}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: radius,
      ...glass(color, glow),
      ...style,
    }}
  >
    {children}
  </div>
);

export const Caps: React.FC<{
  children: React.ReactNode;
  color?: string;
  size?: number;
  style?: React.CSSProperties;
}> = ({children, color = C.muted, size = 11, style}) => (
  <div
    style={{
      fontFamily: FONT.sans,
      fontSize: size,
      fontWeight: 600,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Mono: React.FC<{
  children: React.ReactNode;
  color?: string;
  size?: number;
  weight?: number;
  style?: React.CSSProperties;
}> = ({children, color = C.soft, size = 13, weight = 400, style}) => (
  <span
    style={{
      fontFamily: FONT.mono,
      fontSize: size,
      fontWeight: weight,
      color,
      letterSpacing: "0.01em",
      ...style,
    }}
  >
    {children}
  </span>
);

export const Chip: React.FC<{
  children: React.ReactNode;
  color?: string;
  mono?: boolean;
  size?: number;
  filled?: boolean;
  style?: React.CSSProperties;
}> = ({children, color = C.blue, mono = true, size = 11, filled = false, style}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "4px 9px",
      borderRadius: 7,
      fontFamily: mono ? FONT.mono : FONT.sans,
      fontSize: size,
      fontWeight: 500,
      lineHeight: 1.2,
      color: filled ? C.bg : alpha(color, 0.92),
      background: filled ? color : alpha(color, 0.12),
      border: `1px solid ${alpha(color, filled ? 0.9 : 0.32)}`,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </span>
);

export const Dot: React.FC<{color?: string; size?: number; glow?: boolean}> = ({
  color = C.blue,
  size = 7,
  glow = false,
}) => (
  <span
    style={{
      display: "inline-block",
      width: size,
      height: size,
      borderRadius: size,
      background: color,
      boxShadow: glow ? `0 0 12px ${alpha(color, 0.85)}` : undefined,
      flex: "none",
    }}
  />
);

/* ---------------------------------- 图标 --------------------------------- */

export type IconName =
  | "file"
  | "terminal"
  | "globe"
  | "search"
  | "fn"
  | "cube"
  | "agent"
  | "check"
  | "cross"
  | "chevron"
  | "arrow"
  | "spark"
  | "list"
  | "clock";

const PATHS: Record<IconName, React.ReactNode> = {
  file: (
    <>
      <path d="M5 2.5h6l4 4v11H5z" />
      <path d="M11 2.5v4h4" />
    </>
  ),
  terminal: (
    <>
      <rect x="2.5" y="3.5" width="15" height="13" rx="2" />
      <path d="M6 8l2.6 2.4L6 12.8M10.4 13h3.4" />
    </>
  ),
  globe: (
    <>
      <circle cx="10" cy="10" r="7.2" />
      <path d="M2.8 10h14.4M10 2.8c2 2.2 2 12.2 0 14.4M10 2.8c-2 2.2-2 12.2 0 14.4" />
    </>
  ),
  search: (
    <>
      <circle cx="8.8" cy="8.8" r="5.6" />
      <path d="M13 13l3.8 3.8" />
    </>
  ),
  fn: (
    <>
      <path d="M5 3h10M5 17h10M8.5 3v14" />
      <path d="M12 8.6c1.6-1.4 3-.4 3 1.2 0 2.2-2.2 3.4-2.6 5.2" />
    </>
  ),
  cube: (
    <>
      <path d="M10 2.6l6.4 3.6v7.6L10 17.4 3.6 13.8V6.2z" />
      <path d="M3.6 6.2L10 9.8l6.4-3.6M10 9.8v7.6" />
    </>
  ),
  agent: (
    <>
      <rect x="4" y="6" width="12" height="9" rx="2.4" />
      <path d="M10 3v3M7.5 10.4v.9M12.5 10.4v.9" />
    </>
  ),
  check: <path d="M4 10.4l4 4 8-8.6" />,
  cross: <path d="M5 5l10 10M15 5L5 15" />,
  chevron: <path d="M6 8l4 4 4-4" />,
  arrow: <path d="M3.5 10h12M11 5.6l4.4 4.4L11 14.4" />,
  spark: <path d="M10 2.6l1.9 5.5 5.5 1.9-5.5 1.9L10 17.4l-1.9-5.5L2.6 10l5.5-1.9z" />,
  list: (
    <>
      <path d="M4 6h12M4 10h12M4 14h8" />
    </>
  ),
  clock: (
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 5.8v4.6l3.2 1.9" />
    </>
  ),
};

export const Icon: React.FC<{
  name: IconName;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({name, size = 16, color = C.soft, style}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    stroke={color}
    strokeWidth={1.55}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{flex: "none", ...style}}
  >
    {PATHS[name]}
  </svg>
);

/* ------------------------------- 描边路径 -------------------------------- */

export const Path: React.FC<{
  d: string;
  color?: string;
  width?: number;
  /** 0…1，用虚线偏移模拟"画出来" */
  draw?: number;
  dashed?: boolean;
  opacity?: number;
  arrow?: boolean;
  markerId?: string;
}> = ({d, color = C.line, width = 1.5, draw = 1, dashed = false, opacity = 1, arrow = false}) => {
  const dash = dashed ? "5 7" : draw >= 1 ? undefined : `${draw * 1000} 1000`;
  const fade = dashed ? clamp01(draw * 3.5) : 1;
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeDasharray={dash}
      opacity={opacity * fade}
      markerEnd={arrow ? "url(#arrowhead)" : undefined}
    />
  );
};

export const ArrowDefs: React.FC<{color: string; id?: string}> = ({color, id = "arrowhead"}) => (
  <defs>
    <marker
      id={id}
      markerWidth="7"
      markerHeight="7"
      refX="5.2"
      refY="3.2"
      orient="auto"
      markerUnits="strokeWidth"
    >
      <path d="M0,0.6 L5.6,3.2 L0,5.8 z" fill={color} />
    </marker>
  </defs>
);

export const Svg: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({x, y, w, h, children, style}) => (
  <svg
    width={w}
    height={h}
    viewBox={`0 0 ${w} ${h}`}
    style={{position: "absolute", left: x, top: y, overflow: "visible", ...style}}
  >
    {children}
  </svg>
);

/* -------------------------------- 数字滚动 ------------------------------- */

export const countAt = (t: number, events: number[]): number =>
  events.reduce((n, e) => (e <= t ? n + 1 : n), 0);

export const RollingNumber: React.FC<{
  t: number;
  events: number[];
  from?: number;
  color?: string;
  size?: number;
  weight?: number;
  pad?: number;
}> = ({t, events, from = 0, color = C.ink, size = 46, weight = 600, pad = 0}) => {
  const n = from + countAt(t, events);
  let last = -Infinity;
  for (const e of events) if (e <= t && e > last) last = e;
  const since = t - last;
  const pop = since >= 0 && since < 1.4 ? 1 + 0.22 * Math.exp(-since * 6.5) : 1;
  const flash = since >= 0 && since < 1.4 ? Math.exp(-since * 3.2) : 0;
  const text = String(n).padStart(pad, "0");
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: FONT.sans,
        fontSize: size,
        fontWeight: weight,
        color,
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "-0.02em",
        transform: `scale(${pop})`,
        textShadow: flash > 0.02 ? `0 0 ${18 * flash}px ${alpha(color, 0.7)}` : undefined,
        transition: "none",
      }}
    >
      {text}
    </span>
  );
};

/* --------------------------------- 进度条 -------------------------------- */

export const Bar: React.FC<{
  x: number;
  y: number;
  w: number;
  h?: number;
  p: number;
  color?: string;
  track?: string;
  radius?: number;
}> = ({x, y, w, h = 4, p, color = C.green, track = "rgba(255,255,255,0.08)", radius = 2}) => (
  <>
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: radius,
        background: track,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: Math.max(0, w * clamp01(p)),
        height: h,
        borderRadius: radius,
        background: color,
        boxShadow: `0 0 10px ${alpha(color, 0.5)}`,
      }}
    />
  </>
);

/* -------------------------------- 文字浮现 ------------------------------- */

export const FadeIn: React.FC<{
  t: number;
  at: number;
  dur?: number;
  y?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({t, at, dur = 0.5, y = 8, children, style}) => {
  const p = clamp01((t - at) / Math.max(0.001, dur));
  return (
    <div
      style={{
        opacity: outCubic(p),
        transform: `translateY(${(1 - outCubic(p)) * y}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
