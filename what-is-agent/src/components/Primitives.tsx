import type { CSSProperties, ReactNode } from "react";
import { C, CJK, MONO } from "../theme";
import { clamp, springIn } from "../lib/motion";

export const At = ({
  x = 0,
  y = 0,
  children,
  style,
}: {
  x?: number;
  y?: number;
  children?: ReactNode;
  style?: CSSProperties;
}) => <div style={{ position: "absolute", left: x, top: y, ...style }}>{children}</div>;

export const Reveal = ({
  frame,
  delay = 0,
  children,
  style,
}: {
  frame: number;
  delay?: number;
  children: ReactNode;
  style?: CSSProperties;
}) => {
  const k = springIn(frame, delay, { damping: 20, stiffness: 120 });
  return (
    <div
      style={{
        opacity: clamp(k * 1.15),
        transform: `translateY(${(1 - k) * 16}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Rule = ({
  color = C.blue,
  width = 44,
  height = 4,
  style,
}: {
  color?: string;
  width?: number;
  height?: number;
  style?: CSSProperties;
}) => (
  <span
    style={{
      display: "block",
      width,
      height,
      borderRadius: height,
      background: color,
      ...style,
    }}
  />
);

export const Pill = ({
  children,
  color = C.blue,
  soft = `${color}14`,
  filled = false,
  style,
}: {
  children: ReactNode;
  color?: string;
  soft?: string;
  filled?: boolean;
  style?: CSSProperties;
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      height: 34,
      padding: "0 13px",
      borderRadius: 999,
      border: filled ? `1px solid ${color}` : `1px solid ${color}2E`,
      background: filled ? color : soft,
      color: filled ? "#fff" : color,
      fontFamily: CJK,
      fontSize: 17,
      fontWeight: 500,
      lineHeight: 1,
      letterSpacing: 0.2,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </span>
);

export const Label = ({
  children,
  color = C.muted,
  size = 14,
  tracking = 1.7,
  style,
}: {
  children: ReactNode;
  color?: string;
  size?: number;
  tracking?: number;
  style?: CSSProperties;
}) => (
  <div
    style={{
      color,
      fontFamily: MONO,
      fontSize: size,
      fontWeight: 500,
      letterSpacing: tracking,
      lineHeight: 1.3,
      textTransform: "uppercase",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Paper = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) => (
  <div className="paper-surface" style={{ borderRadius: 22, ...style }}>
    {children}
  </div>
);

export const HArrow = ({
  x = 0,
  y = 0,
  width = 140,
  color = C.faint,
  progress = 1,
  thickness = 2,
  dashed = false,
}: {
  x?: number;
  y?: number;
  width?: number;
  color?: string;
  progress?: number;
  thickness?: number;
  dashed?: boolean;
}) => {
  const p = clamp(progress);
  return (
    <svg
      width={width + 4}
      height={22}
      viewBox={`0 0 ${width + 4} 22`}
      style={{ position: "absolute", left: x, top: y - 11, overflow: "visible" }}
    >
      <path
        d={`M2 11H${width - 11}M${width - 19} 4L${width - 10} 11L${width - 19} 18`}
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={dashed ? "0.028 0.022" : 1}
        strokeDashoffset={dashed ? 0 : 1 - p}
        opacity={dashed ? clamp(p * 1.4) : 1}
      />
    </svg>
  );
};

export const VArrow = ({
  x = 0,
  y = 0,
  height = 100,
  color = C.faint,
  progress = 1,
  dashed = false,
}: {
  x?: number;
  y?: number;
  height?: number;
  color?: string;
  progress?: number;
  dashed?: boolean;
}) => {
  const p = clamp(progress);
  return (
    <svg
      width={22}
      height={height + 4}
      viewBox={`0 0 22 ${height + 4}`}
      style={{ position: "absolute", left: x - 11, top: y, overflow: "visible" }}
    >
      <path
        d={`M11 2V${height - 11}M4 ${height - 19}L11 ${height - 10}L18 ${height - 19}`}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={dashed ? "0.032 0.024" : 1}
        strokeDashoffset={dashed ? 0 : 1 - p}
        opacity={dashed ? clamp(p * 1.4) : 1}
      />
    </svg>
  );
};

export const StatusDot = ({ color = C.green, size = 8 }: { color?: string; size?: number }) => (
  <span
    style={{
      display: "inline-block",
      width: size,
      height: size,
      borderRadius: "50%",
      background: color,
      boxShadow: `0 0 0 4px ${color}16`,
      flex: "0 0 auto",
    }}
  />
);

export const QuoteMark = ({ color = C.blue, size = 36 }: { color?: string; size?: number }) => (
  <div
    style={{
      color,
      fontFamily: "Georgia, serif",
      fontSize: size,
      lineHeight: 0.9,
      opacity: 0.55,
      height: size * 0.7,
    }}
  >
    “
  </div>
);

export const FigTag = ({
  children,
  color = C.muted,
}: {
  children: ReactNode;
  color?: string;
}) => (
  <span
    style={{
      fontFamily: MONO,
      fontSize: 11,
      letterSpacing: 1.4,
      color,
      border: `1px solid ${color}35`,
      borderRadius: 4,
      padding: "3px 7px",
      lineHeight: 1,
      textTransform: "uppercase",
    }}
  >
    {children}
  </span>
);
