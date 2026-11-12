import {fadeIO} from "./motion";

// 全片只有一张画布。每个"区域"是画布上的一块地，镜头在区域之间移动，
// 没有章节页，也没有切场景。
export const ZONE = {
  hook: {x: 0, y: 0, w: 2900, h: 1080}, // 我的 WebUI + Codex 原生 + 对线
  question: {x: 3200, y: 0, w: 1300, h: 1080}, // 标题问题
  track: {x: 5000, y: 0, w: 3800, h: 1080}, // Agent Loop → JSON → 数据模型
  hosted: {x: 5400, y: 1500, w: 1920, h: 1080}, // 托管工具的统计口径
  trace: {x: 7600, y: 1500, w: 1920, h: 1500}, // 官方 Trace
  pitfall: {x: 3200, y: 1500, w: 2200, h: 1080}, // 并发与 call_id
} as const;

export type ZoneName = keyof typeof ZONE;

// 每个区域"在镜头焦点内"的时间窗。离开焦点后保留最终状态、压暗到 0.2，
// 镜头飞过时还能看见——像一张逐渐被填满的图纸。
const FOCUS: Record<ZoneName, Array<[number, number]>> = {
  hook: [
    [0, 22.8],
    [158.8, 180],
  ],
  question: [[21.6, 30.4]],
  track: [
    [29.2, 87.0],
    [124.8, 146.6],
  ],
  hosted: [[86.2, 104.0]],
  trace: [[102.8, 125.8]],
  pitfall: [[145.6, 160.2]],
};

export const zoneAlpha = (zone: ZoneName, t: number): number => {
  let f = 0;
  for (const [a, b] of FOCUS[zone]) f = Math.max(f, fadeIO(t, a, b, 0.9, 0.9));
  return 0.2 + 0.8 * f;
};

export const SECTIONS = [
  {id: "S1", at: 0, name: "我的 WebUI：又长又重复 → 猜想 → 对线"},
  {id: "S2", at: 22.4, name: "问题：Tool Calling 和 Request 是一对一的吗"},
  {id: "S3", at: 30.0, name: "先给结论：一个 Turn，三次 Response，五个 Tool Call"},
  {id: "S4", at: 64.4, name: "背书：Response JSON 里的三个变量"},
  {id: "S5", at: 87.0, name: "别混为一谈：托管工具的统计口径"},
  {id: "S6", at: 103.8, name: "官方 Tracing：Generation Span 与 Tool Span"},
  {id: "S7", at: 125.6, name: "自己建模：Turn / Generation / ToolCall 与两种 ID"},
  {id: "S8", at: 146.4, name: "踩坑：用 call_id 把结果关联回去"},
  {id: "S9", at: 159.6, name: "回到 WebUI：按 generation_id 分组"},
] as const;
