// 全片唯一的视觉规范。颜色只表达含义，全片不变：
//   紫 = Turn（一次完整的用户任务）
//   琥珀 = HTTP / API Request / x-request-id
//   蓝 = Response / Generation（一次模型响应）
//   绿 = Tool Call / call_id
//   红 = “我注意到这里” / 错误
export const FPS = 60;
export const DURATION = 180; // 秒
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const TOTAL_FRAMES = FPS * DURATION;

export const C = {
  bg: "#070A10",
  bg2: "#0B1019",
  panel: "#0E131C",
  panel2: "#121926",
  text: "#EAF0FA",
  text2: "#9AA6BC",
  text3: "#5D6A80",
  line: "rgba(255,255,255,0.09)",
  line2: "rgba(255,255,255,0.16)",
  violet: "#A78BFA",
  amber: "#FBBF24",
  blue: "#5B9DFF",
  green: "#34D399",
  red: "#FF5C68",
} as const;

export type Hue = "violet" | "amber" | "blue" | "green" | "red" | "text";

/** #RRGGBB + alpha → rgba() */
export const alpha = (hex: string, a: number): string => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a))})`;
};

export const hue = (h: Hue): string => (h === "text" ? C.text : C[h]);

export const FONT = {
  sans: '"Inter", "Segoe UI Variable Display", "Segoe UI", "SF Pro Display", "PingFang SC", "HarmonyOS Sans SC", "Microsoft YaHei", "Noto Sans CJK SC", "Noto Sans SC", "Source Han Sans SC", sans-serif',
  mono: '"JetBrains Mono", "Cascadia Code", "SF Mono", "Consolas", "Liberation Mono", "DejaVu Sans Mono", "Noto Sans Mono CJK SC", monospace',
} as const;
