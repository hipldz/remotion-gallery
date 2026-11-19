import { C, FPS } from "./theme";

export type Scene = {
  id: `S0${number}`;
  index: number;
  from: number;
  duration: number;
  label: string;
  title: string;
  accent: string;
};

const SCENE_INPUT = [
  {
    id: "S01",
    index: 1,
    from: 0,
    duration: 240,
    label: "原文",
    title: "Agent 到底是什么？",
    accent: C.blue,
  },
  {
    id: "S02",
    index: 2,
    from: 240,
    duration: 600,
    label: "架构区别",
    title: "Anthropic：谁在主导执行过程",
    accent: C.blue,
  },
  {
    id: "S03",
    index: 3,
    from: 840,
    duration: 540,
    label: "任务系统",
    title: "OpenAI：代表用户完成任务",
    accent: C.green,
  },
  {
    id: "S04",
    index: 4,
    from: 1380,
    duration: 450,
    label: "基础构成",
    title: "模型、工具、指令",
    accent: C.yellow,
  },
  {
    id: "S05",
    index: 5,
    from: 1830,
    duration: 540,
    label: "本片归纳",
    title: "把两家的重点合成一句话",
    accent: C.blue,
  },
  {
    id: "S06",
    index: 6,
    from: 2370,
    duration: 450,
    label: "执行循环",
    title: "一轮动作：决策、执行、反馈",
    accent: C.blue,
  },
  {
    id: "S07",
    index: 7,
    from: 2820,
    duration: 420,
    label: "边界与出口",
    title: "能自主推进，也要能停下来",
    accent: C.yellow,
  },
  {
    id: "S08",
    index: 8,
    from: 3240,
    duration: 180,
    label: "收束",
    title: "把定义留给观众",
    accent: C.blue,
  },
] as const;

export const SCENES: readonly Scene[] = SCENE_INPUT;
export const TOTAL_FRAMES = SCENES.reduce((sum, scene) => sum + scene.duration, 0);

export const sceneAt = (frame: number) =>
  SCENES.find((scene) => frame >= scene.from && frame < scene.from + scene.duration) ?? SCENES[SCENES.length - 1];

export const sceneById = (id: Scene["id"]) => SCENES.find((scene) => scene.id === id)!;

export type Caption = {
  id: string;
  scene: Scene["id"];
  from: number;
  to: number;
  text: string;
};

/** 口播节拍按分镜估算，没有音频时作为字幕与动作的提示。 */
const CAPTION_INPUT: Array<{
  scene: Scene["id"];
  cues: Array<[start: number, end: number, text: string]>;
}> = [
  {
    scene: "S01",
    cues: [
      [0.3, 3.0, "Agent 到底是什么？"],
      [3.4, 7.5, "先别急着下定义，我们回到两份官方原文。"],
    ],
  },
  {
    scene: "S02",
    cues: [
      [0.4, 3.0, "Anthropic 把界限划得很清楚："],
      [3.3, 8.0, "Workflow 是提前把路径写好，模型和工具照着走；"],
      [8.3, 13.8, "Agent 不一样，下一步做什么、工具怎么用，由模型在运行时判断。"],
      [14.1, 16.2, "区别就在这儿——谁来决定下一步。"],
    ],
  },
  {
    scene: "S03",
    cues: [
      [0.4, 2.9, "OpenAI 说得更直接："],
      [3.2, 7.5, "Agent 是能够代表用户、独立完成任务的系统。"],
      [7.8, 12.2, "它不是答完一个问题就结束，还要管理执行、做决策，"],
      [12.5, 15.5, "也得知道任务什么时候算完成。"],
    ],
  },
  {
    scene: "S04",
    cues: [
      [0.4, 2.8, "那它靠什么完成任务？"],
      [3.1, 6.0, "OpenAI 把基础构成拆成三块：模型、工具和指令。"],
      [6.3, 9.4, "模型负责判断，工具负责和外部系统打交道，"],
      [9.7, 12.7, "指令规定目标、行为和边界。"],
    ],
  },
  {
    scene: "S05",
    cues: [
      [0.4, 2.4, "把两家放在一起看："],
      [2.7, 7.3, "Agent 是让大模型在执行中做决策，"],
      [7.6, 11.3, "借助工具和反馈，推进用户任务的系统。"],
      [11.6, 16.2, "关键在这儿——模型不只是给出答案，它还参与决定接下来怎么做。"],
    ],
  },
  {
    scene: "S06",
    cues: [
      [0.4, 3.6, "实际运行起来，是一轮一轮往前走的："],
      [3.9, 6.6, "模型提出下一步，程序真正去执行工具，"],
      [6.9, 9.4, "结果再交回模型。"],
      [9.7, 13.2, "模型看到结果，再决定是继续、调整，还是结束。"],
    ],
  },
  {
    scene: "S07",
    cues: [
      [0.4, 3.2, "当然，自主不等于没有边界。"],
      [3.5, 6.8, "它得在既定约束里运行：任务完成就停；"],
      [7.1, 9.4, "处理不了，或者需要你来做决定，"],
      [9.7, 11.6, "就把控制权交还给你。"],
    ],
  },
];

export const CAPTIONS: Caption[] = CAPTION_INPUT.flatMap(({ scene: id, cues }) => {
  const scene = sceneById(id);
  return cues.map(([start, end, text], i) => ({
    id: `${id}-C${i + 1}`,
    scene: id,
    from: scene.from + Math.round(start * FPS),
    to: scene.from + Math.round(end * FPS),
    text,
  }));
});

export const captionAt = (frame: number) =>
  CAPTIONS.find((cue) => frame >= cue.from && frame < cue.to) ?? null;

export const timecode = (frame: number) => {
  const totalSeconds = Math.floor(frame / FPS);
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`;
};
