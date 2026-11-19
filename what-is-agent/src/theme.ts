export const WIDTH = 1920;
export const HEIGHT = 1080;
export const FPS = 30;

export const C = {
  bg: "#FAFBFD",
  ink: "#202124",
  body: "#4A515A",
  muted: "#7D858F",
  faint: "#A9B0B9",
  line: "#E4E8ED",
  hairline: "#EEF1F4",
  paper: "#FFFFFF",
  blue: "#4285F4",
  blueSoft: "#EAF2FF",
  blueDeep: "#1F5FCE",
  green: "#34A853",
  greenSoft: "#EAF7EF",
  greenDeep: "#1E7D3C",
  yellow: "#FBBC04",
  yellowSoft: "#FFF7DE",
  yellowDeep: "#8B6500",
  red: "#EA4335",
  redSoft: "#FDEDEA",
  redDeep: "#B52B1F",
  slate: "#4E5968",
} as const;

export const FONT = 'Outfit, "Noto Sans SC", sans-serif';
export const CJK = '"Noto Sans SC", "Microsoft YaHei", sans-serif';
export const LATIN = "Outfit, sans-serif";
export const MONO = '"JetBrains Mono", monospace';

/** 分镜色只承担语义：蓝=模型/决策，绿=工具/结果，黄=指令/边界，红=暂停/交还。 */
export const semantic = {
  model: C.blue,
  tools: C.green,
  instructions: C.yellow,
  pause: C.red,
} as const;
