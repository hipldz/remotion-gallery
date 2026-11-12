import type { CSSProperties } from "react";
import { C } from "../data/theme";

export type GlyphName = "search" | "tool" | "memory" | "file" | "terminal" | "shield" | "check" | "clock" | "layers" | "globe" | "link";
const paths: Record<GlyphName, string> = {
  search: "M29 48a19 19 0 1 0 0-38a19 19 0 0 0 0 38M43 43l17 17",
  tool: "M44 12a16 16 0 0 0-18 20L9 49a8 8 0 0 0 12 12l17-17a16 16 0 0 0 20-18L47 37 35 25Z",
  memory: "M14 18c0-12 44-12 44 0s-44 12-44 0v35c0 12 44 12 44 0V18M14 35c0 12 44 12 44 0",
  file: "M18 8h24l15 16v39H18ZM42 8v18h15M27 38h20M27 48h20",
  terminal: "M8 14h56v44H8ZM20 26l11 10-11 10M38 46h15",
  shield: "M36 7L12 17v18c0 17 24 29 24 29s24-12 24-29V17ZM25 35l8 8 15-18",
  check: "M13 36l16 16 31-32",
  clock: "M36 63a27 27 0 1 0 0-54a27 27 0 0 0 0 54M36 18v20l13 7",
  layers: "M36 8L7 24l29 16 29-16ZM8 38l28 16 28-16M8 50l28 16 28-16",
  globe: "M36 63a27 27 0 1 0 0-54a27 27 0 0 0 0 54M9 36h54M36 9c-21 18-21 36 0 54M36 9c21 18 21 36 0 54",
  link: "M28 44l16-16M25 35l-8 8a12 12 0 0 0 17 17l10-10M47 37l8-8a12 12 0 0 0-17-17L28 22",
};

export function Glyph({ name, color = C.blue, size = 72, style }: { name: GlyphName; color?: string; size?: number; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" style={style} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
}
