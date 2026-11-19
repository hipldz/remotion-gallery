import raw from "./captions.json";
import type {Hue} from "./theme";

export type Mark = {w: string; c: Hue};
export type Caption = {
  start: number;
  end: number;
  text: string;
  marks: Mark[];
  source?: string;
};

export const CAPTIONS = raw as Caption[];

export type Glyph = {ch: string; hue?: Hue};

/**
 * 把一条字幕拆成逐字数组，并给命中的关键词打上颜色。
 * 渲染时按 reveal 进度逐字浮现，而不是整行淡入。
 */
export const glyphsOf = (cap: Caption): Glyph[] => {
  const ranges: Array<{from: number; to: number; c: Hue}> = [];
  for (const m of cap.marks) {
    const at = cap.text.indexOf(m.w);
    if (at >= 0) ranges.push({from: at, to: at + m.w.length, c: m.c});
  }
  const out: Glyph[] = [];
  for (let i = 0; i < cap.text.length; i++) {
    const hit = ranges.find((r) => i >= r.from && i < r.to);
    out.push({ch: cap.text[i], hue: hit?.c});
  }
  return out;
};
