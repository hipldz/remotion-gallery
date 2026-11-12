export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const DURATION = 5340;
export const TRANSITION = 24;

export const COLORS = {
  blue: "#4285F4",
  red: "#EA4335",
  yellow: "#FBBC04",
  green: "#34A853",
  blueLight: "#8AB4F8",
  redLight: "#EA4335",
  blue50: "#E8F0FE",
  red50: "#FCE8E6",
  yellow50: "#FEF7E0",
  green50: "#E6F4EA",
  blueDeep: "#1967D2",
  redInk: "#B3261E",
  yellowInk: "#8D6600",
  greenInk: "#188038",
  ink: "#202124",
  gray: "#5F6368",
  line: "#DADCE0",
  paper: "#F8F9FA",
  bg: "#FCFCFD",
} as const;

// Accent shapes use the brand colors; small text uses their readable shades.
export const readableColor = (color: string): string => {
  const base = color.slice(0, 7).toUpperCase();
  if (base === COLORS.yellow) return COLORS.yellowInk;
  if (base === COLORS.green) return COLORS.greenInk;
  if (base === COLORS.red || base === "#F28B82") return COLORS.redInk;
  if (base === COLORS.blue || base === COLORS.blueLight) return COLORS.blueDeep;
  return color;
};

export type Chapter =
  | "intro"
  | "layers"
  | "chatbot"
  | "tools"
  | "workflow"
  | "agent"
  | "ending";
export type SceneId =
  `S${"01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20"}`;
export type Shot = {
  id: SceneId;
  title: string;
  start: number;
  duration: number;
  chapter: Chapter;
  color: string;
  captions: string[];
};

export const SHOTS: Shot[] = [
  {
    id: "S01",
    title: "光核苏醒",
    start: 0,
    duration: 90,
    chapter: "intro",
    color: COLORS.green,
    captions: [],
  },
  {
    id: "S02",
    title: "公告浮现",
    start: 90,
    duration: 150,
    chapter: "intro",
    color: COLORS.blue,
    captions: ["前段时间，字节的扣子", "发布了企业版下线公告。"],
  },
  {
    id: "S03",
    title: "一条帖子的三句话",
    start: 240,
    duration: 300,
    chapter: "intro",
    color: COLORS.green,
    captions: [
      "网上有人聊这件事，说：",
      "workflow 不是被 AI 淘汰的，",
      "是被「模型自己会规划」淘汰的。"
    ],
  },
  {
    id: "S04",
    title: "片名：AI 应用技术的变化",
    start: 540,
    duration: 270,
    chapter: "intro",
    color: COLORS.green,
    captions: [
      "从 2023 年的 ChatGPT，",
      "到 2026 年，",
      "AI 应用技术都有哪些变化？"
    ],
  },
  {
    id: "S05",
    title: "能力的地层",
    start: 810,
    duration: 300,
    chapter: "layers",
    color: COLORS.green,
    captions: [
      "这几年，AI 的能力在一层层增加：",
      "对话、调用工具、工作流、Agent。",
      "前面的能力也都还在。"
    ],
  },
  {
    id: "S06",
    title: "2023，一个对话框",
    start: 1110,
    duration: 240,
    chapter: "chatbot",
    color: COLORS.blue,
    captions: [
      "2023 年的 ChatGPT，",
      "用起来就是聊天：",
      "你发一句，它逐字生成一句。"
    ],
  },
  {
    id: "S07",
    title: "token 之雨，答案成形",
    start: 1350,
    duration: 300,
    chapter: "chatbot",
    color: COLORS.blue,
    captions: [
      "比如你让它评估一批细菌基因组的组装质量，",
      "它会告诉你看 N50、用 QUAST，",
      "甚至把脚本都写好。",
    ],
  },
  {
    id: "S08",
    title: "玻璃墙",
    start: 1650,
    duration: 240,
    chapter: "chatbot",
    color: COLORS.blue,
    captions: [
      "但它没有真的读文件、跑命令。",
      "它能告诉你怎么做，",
      "动手的还是你。",
    ],
  },
  {
    id: "S09",
    title: "裂缝里的 JSON",
    start: 1890,
    duration: 210,
    chapter: "tools",
    color: COLORS.yellow,
    captions: [
      "2023 年，Function Calling 来了：",
      "模型可以输出一段结构化的调用请求。",
    ],
  },
  {
    id: "S10",
    title: "一颗胶囊的旅程",
    start: 2100,
    duration: 300,
    chapter: "tools",
    color: COLORS.yellow,
    captions: [
      "模型先发出工具调用请求。",
      "程序检查权限，执行调用，",
      "再把结果交回给模型。"
    ],
  },
  {
    id: "S11",
    title: "一颗胶囊，一座迷宫",
    start: 2400,
    duration: 240,
    chapter: "tools",
    color: COLORS.yellow,
    captions: [
      "任务有好几步，",
      "就得把先后顺序、失败重试，",
      "还有什么时候结束，都安排好。"
    ],
  },
  {
    id: "S12",
    title: "光的流水线",
    start: 2640,
    duration: 390,
    chapter: "workflow",
    color: COLORS.red,
    captions: [
      "Workflow 的做法，是先把流程搭好：",
      "节点、连线、条件，再加一个执行引擎。",
      "读 FASTA、跑 QC、解析指标、",
      "判断阈值、出报告，一条线串起来。"
    ],
  },
  {
    id: "S13",
    title: "三块屏幕",
    start: 3030,
    duration: 240,
    chapter: "workflow",
    color: COLORS.red,
    captions: [
      "n8n、Dify、扣子，",
      "都能把模型、工具接成这样的流程。"
    ],
  },
  {
    id: "S14",
    title: "轨道的尽头",
    start: 3270,
    duration: 300,
    chapter: "workflow",
    color: COLORS.red,
    captions: [
      "流程固定、要审计、要可预测，",
      "Workflow 很好用。",
      "但有些任务只给你一个目标，",
      "具体要做哪几步，得边做边看。"
    ],
  },
  {
    id: "S15",
    title: "三色汇流",
    start: 3570,
    duration: 210,
    chapter: "agent",
    color: COLORS.green,
    captions: [
      "于是来到 Agent。",
      "像 Deep Research、Codex：",
      "你交代目标，它自己连续干活。",
    ],
  },
  {
    id: "S16",
    title: "一个会自己选路的轨道系统",
    start: 3780,
    duration: 300,
    chapter: "agent",
    color: COLORS.green,
    captions: [
      "它的核心是一个循环：",
      "模型决定下一步，调用工具，",
      "观察结果，再决定下一步——",
      "直到完成，或者碰到边界。",
    ],
  },
  {
    id: "S17",
    title: "30 个样本",
    start: 4080,
    duration: 420,
    chapter: "agent",
    color: COLORS.green,
    captions: [
      "还是基因组：「检查这 30 个样本，",
      "失败的先排查，最后给我异常清单和报告。」",
      "Agent 会自己跑工具、看日志、",
      "调参数重跑，最后汇总成报告。",
    ],
  },
  {
    id: "S18",
    title: "设计时 vs 运行时",
    start: 4500,
    duration: 300,
    chapter: "ending",
    color: COLORS.green,
    captions: [
      "区别就在于，下一步由谁决定。",
      "Workflow 按事先写好的规则走；",
      "Agent 根据刚才的结果，决定下一步。"
    ],
  },
  {
    id: "S19",
    title: "三句话",
    start: 4800,
    duration: 300,
    chapter: "ending",
    color: COLORS.green,
    captions: [
      "说简单点：Chatbot，你问我答；",
      "Workflow，流程搭好自动跑；",
      "Agent，你说清目标，它自己选下一步。"
    ],
  },
  {
    id: "S20",
    title: "了解 Agent，用好 Agent",
    start: 5100,
    duration: 240,
    chapter: "ending",
    color: COLORS.green,
    captions: [
      "了解 Agent，才能用好 Agent。",
      "本期分享结束，谢谢大家。"
    ],
  },
];

export const CHAPTERS: {
  name: string;
  start: number;
  end: number;
  color: string;
}[] = [
  { name: "序章", start: 0, end: 810, color: COLORS.green },
  { name: "能力叠加", start: 810, end: 1110, color: COLORS.green },
  { name: "Chatbot", start: 1110, end: 1890, color: COLORS.blue },
  { name: "Tool Use", start: 1890, end: 2640, color: COLORS.yellow },
  { name: "Workflow", start: 2640, end: 3570, color: COLORS.red },
  { name: "Agent", start: 3570, end: 4500, color: COLORS.green },
  { name: "控制权", start: 4500, end: 5340, color: COLORS.green },
];

export type CaptionCue = {
  start: number;
  end: number;
  text: string;
  shot: SceneId;
};
const readingWeight = (text: string) =>
  text.replace(/[A-Za-z]+/g, "字字").replace(/[\s，。：；、！？「」——]/g, "")
    .length;

// Captions remain on the absolute storyboard clock, independent of transition handles.
export const CAPTIONS: CaptionCue[] = SHOTS.flatMap((shot) => {
  const inset = shot.id === "S20" ? 8 : 12;
  const available = shot.duration - inset - 8;
  const weights = shot.captions.map(readingWeight);
  const total = weights.reduce((sum, value) => sum + value, 0);
  let elapsed = 0;
  return shot.captions.map((text, i) => {
    const start =
      shot.start + inset + Math.round((available * elapsed) / total);
    elapsed += weights[i];
    const end = shot.start + inset + Math.round((available * elapsed) / total);
    return { start, end, text, shot: shot.id };
  });
});

export const getShot = (frame: number) =>
  SHOTS.find(
    (shot) => frame >= shot.start && frame < shot.start + shot.duration,
  ) ?? SHOTS[SHOTS.length - 1];

export const ASSETS = {
  announcement: {
    file: "images/coze-announcement.png",
    source: "图源：扣子官方公告",
  },
  post: {
    file: "images/coze-post-anonymous.png",
    source: "来源：X 网友帖子 · 作者身份未经核实",
  },
  chatgpt: {
    file: "images/chatgpt-2023.png",
    source: "图源：SUPERJUMP · 2023 年 1 月历史截图",
  },
  n8n: { file: "images/n8n-workflow.png", source: "图源：n8n Community" },
  dify: { file: "images/dify-workflow.png", source: "图源：Dify 官方文档" },
  coze: { file: "images/coze-workflow.png", source: "图源：扣子官方文档" },
  research: {
    file: "images/deep-research-2025.png",
    source: "图源：Neowin · 2025",
  },
} as const;
