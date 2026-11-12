import type { CSSProperties, ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { FONT } from "../lib/fonts";
import { COLORS, readableColor } from "../data/story";
import { appear, ease } from "../lib/motion";

export const AccentText = ({ children, style = {} }: { children: ReactNode; style?: CSSProperties }) => (
  <span style={{ color: COLORS.green, ...style }}>{children}</span>
);

export const ChapterLabel = ({ index, label, color, subtitle }: { index: string; label: string; color: string; subtitle?: string }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 116, top: 104, opacity: appear(f, 5), fontFamily: FONT.sans }}>
      <div style={{ display: "flex", alignItems: "center", gap: 19 }}>
        <span style={{ fontSize: 18, letterSpacing: 2, color: readableColor(color) }}>{index}</span>
        <span style={{ width: 40, height: 2, background: color, opacity: 0.8 }} />
        <span style={{ fontSize: 21, letterSpacing: 4, textTransform: "uppercase", color: COLORS.ink }}>{label}</span>
      </div>
      {subtitle && <div style={{ fontFamily: FONT.mono, color: COLORS.gray, fontSize: 14, letterSpacing: 1, marginTop: 13 }}>{subtitle}</div>}
    </div>
  );
};

export const Credit = ({ children, style = {} }: { children: ReactNode; style?: CSSProperties }) => (
  <div style={{ position: "absolute", left: 116, bottom: 188, fontSize: 17, color: COLORS.gray, fontFamily: FONT.chinese, letterSpacing: 0.4, ...style }}>
    {children}
  </div>
);

export const RevealText = ({
  text,
  start = 20,
  size = 72,
  color = COLORS.ink,
  accent = false,
  style = {},
}: {
  text: string;
  start?: number;
  size?: number;
  color?: string;
  accent?: boolean;
  style?: CSSProperties;
}) => {
  const f = useCurrentFrame();
  return (
    <div style={{ fontFamily: FONT.sans, fontSize: size, fontWeight: 700, lineHeight: 1.35, letterSpacing: -2, ...style }}>
      {Array.from(text).map((char, i) => {
        const p = appear(f, start + i * 2, 16);
        return (
          <span key={i} style={{ opacity: p, filter: `blur(${(1 - p) * 5}px)`, color: accent ? undefined : readableColor(color) }}>
            {accent ? <AccentText>{char}</AccentText> : char}
          </span>
        );
      })}
    </div>
  );
};

export const Quote = ({ children, start = 20, style = {} }: { children: ReactNode; start?: number; style?: CSSProperties }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        opacity: appear(f, start, 30),
        transform: `translateY(${ease(f, start, start + 35, 14, 0)}px)`,
        fontFamily: FONT.chinese,
        fontSize: 24,
        lineHeight: 1.8,
        fontWeight: 400,
        color: COLORS.gray,
        borderLeft: `3px solid ${COLORS.blue}`,
        paddingLeft: 24,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
