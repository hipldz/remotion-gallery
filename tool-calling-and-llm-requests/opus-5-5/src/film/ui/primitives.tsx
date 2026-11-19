import React from "react";
import {C, FONT, alpha} from "../theme";
import {clamp01, out, prog} from "../ease";

/** 绝对定位盒子（所有布局都是显式坐标，不依赖自动排版） */
export const Box: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({x, y, w, h, style, children}) => (
  <div style={{position: "absolute", left: x, top: y, width: w, height: h, ...style}}>{children}</div>
);

/** 统一的玻璃卡片外观 */
export const cardStyle = (accent?: string, glow = 0): React.CSSProperties => ({
  background: "linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.02))",
  border: `1px solid ${accent ? alpha(accent, 0.38 + 0.4 * glow) : C.line}`,
  borderRadius: 18,
  boxShadow: [
    "0 24px 60px rgba(0,0,0,0.45)",
    "inset 0 1px 0 rgba(255,255,255,0.06)",
    accent && glow > 0 ? `0 0 ${40 * glow}px ${alpha(accent, 0.35 * glow)}` : "",
  ]
    .filter(Boolean)
    .join(", "),
});

export const solidPanel = (accent?: string): React.CSSProperties => ({
  background: `linear-gradient(180deg, ${C.panel2}, ${C.panel})`,
  border: `1px solid ${accent ? alpha(accent, 0.45) : C.line}`,
  borderRadius: 20,
  boxShadow: "0 30px 90px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)",
});

/** 小号大写标签，如 RESPONSE #1 */
export const Caps: React.FC<{color?: string; size?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({
  color = C.text2,
  size = 14,
  style,
  children,
}) => (
  <span
    style={{
      fontFamily: FONT.sans,
      fontSize: size,
      fontWeight: 700,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </span>
);

export const Mono: React.FC<{color?: string; size?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({
  color = C.text,
  size = 16,
  style,
  children,
}) => (
  <span style={{fontFamily: FONT.mono, fontSize: size, color, whiteSpace: "pre", ...style}}>{children}</span>
);

/** 带颜色的 ID 小牌子 */
export const Tag: React.FC<{color: string; children: React.ReactNode; size?: number; style?: React.CSSProperties}> = ({
  color,
  children,
  size = 14,
  style,
}) => (
  <span
    style={{
      display: "inline-block",
      fontFamily: FONT.mono,
      fontSize: size,
      lineHeight: 1,
      padding: "6px 10px",
      borderRadius: 8,
      color,
      background: alpha(color, 0.12),
      border: `1px solid ${alpha(color, 0.4)}`,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </span>
);

/** 逐步画出的 SVG 路径（pathLength=1 的描边动画） */
export const DrawPath: React.FC<{
  d: string;
  p: number;
  color: string;
  width?: number;
  opacity?: number;
  dashed?: boolean;
  glow?: boolean;
}> = ({d, p, color, width = 2.5, opacity = 1, dashed = false, glow = false}) => {
  if (p <= 0) return null;
  const common = {
    d,
    fill: "none",
    stroke: color,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <g opacity={opacity}>
      {glow && <path {...common} strokeWidth={width * 4} opacity={0.18} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp01(p)} />}
      {dashed ? (
        <path {...common} strokeWidth={width} strokeDasharray="8 8" opacity={clamp01(p * 3)} />
      ) : (
        <path {...common} strokeWidth={width} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp01(p)} />
      )}
    </g>
  );
};

/** 箭头头部（三角形），angle 为弧度 */
export const ArrowHead: React.FC<{x: number; y: number; angle: number; color: string; size?: number; opacity?: number}> = ({
  x,
  y,
  angle,
  color,
  size = 12,
  opacity = 1,
}) => {
  const a = angle;
  const p1 = `${x},${y}`;
  const p2 = `${x - size * Math.cos(a) + size * 0.6 * Math.sin(a)},${y - size * Math.sin(a) - size * 0.6 * Math.cos(a)}`;
  const p3 = `${x - size * Math.cos(a) - size * 0.6 * Math.sin(a)},${y - size * Math.sin(a) + size * 0.6 * Math.cos(a)}`;
  return <polygon points={`${p1} ${p2} ${p3}`} fill={color} opacity={opacity} />;
};

/** 数字滚动计数器：events 是每次 +1 的时间点 */
export const RollingNumber: React.FC<{t: number; events: number[]; size: number; color: string; base?: number}> = ({
  t,
  events,
  size,
  color,
  base = 0,
}) => {
  let n = base;
  let last = -999;
  for (const e of events) {
    if (t >= e) {
      n++;
      last = e;
    }
  }
  const p = out(prog(t, last, 0.32));
  const roll = n > base && p < 1;
  const h = size * 1.15;
  return (
    <span style={{position: "relative", display: "inline-block", height: h, minWidth: size * 0.62, overflow: "hidden", verticalAlign: "bottom"}}>
      {roll && (
        <span style={{position: "absolute", left: 0, top: 0, lineHeight: `${h}px`, transform: `translateY(${-p * h}px)`, opacity: 1 - p, color}}>
          {n - 1}
        </span>
      )}
      <span style={{position: "absolute", left: 0, top: 0, lineHeight: `${h}px`, transform: `translateY(${roll ? (1 - p) * h : 0}px)`, color}}>
        {n}
      </span>
      <span style={{visibility: "hidden", lineHeight: `${h}px`}}>{n}</span>
    </span>
  );
};

// ───────────────────────── 图标（线性，统一 2px 描边） ─────────────────────────
type IconProps = {size?: number; color?: string};
const svg = (size: number, children: React.ReactNode) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{display: "block", flexShrink: 0}}>
    {children}
  </svg>
);
export const IconTerminal: React.FC<IconProps> = ({size = 20, color = C.green}) =>
  svg(size, <path d="M5 7l4 5-4 5M12 17h7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />);
export const IconSpark: React.FC<IconProps> = ({size = 20, color = C.amber}) =>
  svg(size, <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" stroke={color} strokeWidth={2} strokeLinecap="round" />);
export const IconCheck: React.FC<IconProps> = ({size = 20, color = C.green}) =>
  svg(size, <><circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} /><path d="M8 12.5l2.6 2.6L16 9.6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></>);
export const IconBook: React.FC<IconProps> = ({size = 20, color = C.text2}) =>
  svg(size, <path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5V5.5zM12 6v13.5" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />);
export const IconChevron: React.FC<IconProps & {dir?: "down" | "right"}> = ({size = 18, color = C.text2, dir = "down"}) =>
  svg(size, <path d={dir === "down" ? "M6 9l6 6 6-6" : "M9 6l6 6-6 6"} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />);
export const IconFn: React.FC<IconProps> = ({size = 20, color = C.green}) =>
  svg(size, <><rect x={3} y={3} width={18} height={18} rx={5} stroke={color} strokeWidth={1.8} /><path d="M14.5 7.5h-1.2c-1.2 0-1.8.7-2 1.8L10 16.5M8.5 11h5" stroke={color} strokeWidth={1.8} strokeLinecap="round" /></>);
export const IconCube: React.FC<IconProps> = ({size = 20, color = C.violet}) =>
  svg(size, <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM12 12l8-4.5M12 12L4 7.5M12 12v9" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />);
export const IconBubble: React.FC<IconProps> = ({size = 20, color = C.blue}) =>
  svg(size, <path d="M5 6.5A2.5 2.5 0 017.5 4h9A2.5 2.5 0 0119 6.5v7a2.5 2.5 0 01-2.5 2.5H11l-4 3.5V16h0a2 2 0 01-2-2V6.5z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />);
export const IconShuffle: React.FC<IconProps> = ({size = 20, color = C.amber}) =>
  svg(size, <path d="M4 7h3.5c4.5 0 5.5 10 10 10H20M4 17h3.5c1.6 0 2.7-1.2 3.6-2.8M14 9.6C14.9 8 16 7 17.5 7H20M17.5 4.5L20 7l-2.5 2.5M17.5 14.5L20 17l-2.5 2.5" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />);
export const IconList: React.FC<IconProps> = ({size = 20, color = C.text3}) =>
  svg(size, <path d="M6 7h12M6 12h12M6 17h8" stroke={color} strokeWidth={1.8} strokeLinecap="round" />);
export const IconGlobe: React.FC<IconProps> = ({size = 20, color = C.text2}) =>
  svg(size, <><circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={1.6} /><path d="M3.5 12h17M12 3.5c2.6 2.6 2.6 14.4 0 17M12 3.5c-2.6 2.6-2.6 14.4 0 17" stroke={color} strokeWidth={1.4} /></>);
export const IconFile: React.FC<IconProps> = ({size = 20, color = C.text2}) =>
  svg(size, <path d="M7 3.5h7l4 4V20a.5.5 0 01-.5.5h-10.5A.5.5 0 016.5 20V4a.5.5 0 01.5-.5zM14 3.5V8h4M9.5 12.5h5M9.5 16h5" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />);
export const IconCode: React.FC<IconProps> = ({size = 20, color = C.text2}) =>
  svg(size, <path d="M9 7l-5 5 5 5M15 7l5 5-5 5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />);
export const IconWarn: React.FC<IconProps> = ({size = 20, color = C.red}) =>
  svg(size, <path d="M12 4l9 16H3l9-16zM12 10v4.5M12 17.2v.3" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />);

/** 旋转的加载圈 */
export const Spinner: React.FC<{t: number; size?: number; color?: string}> = ({t, size = 26, color = C.text2}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{transform: `rotate(${t * 300}deg)`, display: "block"}}>
    <circle cx={12} cy={12} r={9} stroke={alpha(C.text, 0.12)} strokeWidth={2.4} fill="none" />
    <path d="M12 3a9 9 0 019 9" stroke={color} strokeWidth={2.4} strokeLinecap="round" fill="none" />
  </svg>
);
