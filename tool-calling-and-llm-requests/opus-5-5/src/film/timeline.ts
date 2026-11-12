// 全片只有一张大画布（world）。每个“区域”是画布上的一块地方，
// 镜头在区域之间平移 / 推拉，没有切页。
import {fadeIO} from "./ease";

export const ZONE = {
  hook: {x: 0, y: 0}, //       我的 WebUI + Codex 原生界面（2400×1080）
  question: {x: 2700, y: 0}, //  标题问题
  track: {x: 4900, y: 0}, //     Agent Loop 轨道 → JSON → 数据模型（3800×1080）
  hosted: {x: 4900, y: 1500}, // 托管工具：统计口径
  trace: {x: 7100, y: 1500}, //  官方 Trace（1920×1600）
  pitfall: {x: 2700, y: 1500}, // 踩坑：call_id 关联
} as const;

// 每个区域“在镜头焦点内”的时间窗（秒）。离开焦点后保留最终状态并变暗，
// 镜头飞过时依然看得到，像一张逐渐被填满的画布。
const FOCUS: Record<keyof typeof ZONE, Array<[number, number]>> = {
  hook: [[0, 22.6], [159.0, 180]],
  question: [[21.6, 30.0]],
  track: [[29.2, 87.2], [124.8, 146.6]],
  hosted: [[86.4, 103.8]],
  trace: [[103.0, 125.6]],
  pitfall: [[145.8, 160.0]],
};

export const zoneOpacity = (zone: keyof typeof ZONE, t: number): number => {
  let f = 0;
  for (const [a, b] of FOCUS[zone]) f = Math.max(f, fadeIO(t, a, b, 0.9, 0.9));
  return 0.22 + 0.78 * f;
};
