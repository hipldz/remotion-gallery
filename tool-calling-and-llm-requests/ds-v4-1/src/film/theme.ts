import type {CSSProperties} from "react";

// 全片唯一的视觉规范。颜色只表达含义，不表达"好看"：
//   紫 = Turn（一次完整的用户任务）
//   琥珀 = HTTP / API Request / x-request-id
//   蓝 = Response / Generation
//   绿 = Tool Call / call_id
//   红 = "注意这里" / 错误 / ≠
export const C = {
  bg: "#07090E",
  ink: "#EDF1F8",
  soft: "#C3CAD8",
  muted: "#8C95A8",
  faint: "#5A6377",
  ghost: "#343B4B",
  line: "rgba(255,255,255,0.10)",
  lineStrong: "rgba(255,255,255,0.18)",
  panel: "rgba(17,21,31,0.82)",
  violet: "#9B8CFF",
  amber: "#F4B45E",
  blue: "#5CA9FF",
  green: "#46D6A5",
  red: "#FF7070",
} as const;

export type Hue = "violet" | "amber" | "blue" | "green" | "red" | "text";

export const hueColor = (h: Hue): string => (h === "text" ? C.ink : C[h]);

export const alpha = (hex: string, a: number): string => {
  // 只支持 #rrggbb
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

export const FONT = {
  sans: '"Segoe UI", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", system-ui, sans-serif',
  mono: '"Cascadia Mono", Consolas, "JetBrains Mono", "SFMono-Regular", monospace',
} as const;

// 玻璃卡片：全片所有"实体"都用同一种材质，只有描边颜色随含义变化。
export const glass = (border: string, glow?: number): CSSProperties => ({
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.022) 42%, rgba(255,255,255,0.012) 100%)",
  border: `1px solid ${border}`,
  borderRadius: 16,
  boxShadow: glow
    ? `0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.02) inset, 0 0 ${glow}px ${alpha(
        border.startsWith("#") ? border : C.blue,
        0.18,
      )}`
    : "0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.02) inset",
  backdropFilter: "blur(2px)",
});
