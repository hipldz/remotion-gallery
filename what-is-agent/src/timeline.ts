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
    duration: 630,
    label: "原文",
    title: "Agent 到底是什么？",
    accent: C.blue,
  },
  {
    id: "S02",
    index: 2,
    from: 630,
    duration: 600,
    label: "架构区别",
    title: "Anthropic：谁在主导执行过程",
    accent: C.blue,
  },
  {
    id: "S03",
    index: 3,
    from: 1230,
    duration: 540,
    label: "任务系统",
    title: "OpenAI：替你完成任务",
    accent: C.green,
  },
  {
    id: "S04",
    index: 4,
    from: 1770,
    duration: 450,
    label: "基础构成",
    title: "模型、工具、指令",
    accent: C.yellow,
  },
  {
    id: "S05",
    index: 5,
    from: 2220,
    duration: 540,
    label: "本片归纳",
    title: "把两家的重点合成一句话",
    accent: C.blue,
  },
  {
    id: "S06",
    index: 6,
    from: 2760,
    duration: 450,
    label: "执行循环",
    title: "一轮动作：决策、执行、反馈",
    accent: C.blue,
  },
  {
    id: "S07",
    index: 7,
    from: 3210,
    duration: 420,
    label: "边界与出口",
    title: "能自主推进，也要能停下来",
    accent: C.yellow,
  },
  {
    id: "S08",
    index: 8,
    from: 3630,
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
      [0.4, 4.6, "Agent 这个词，很多人听过，也用过。"],
      [4.9, 9.5, "可真要系统地说清它是什么，反而不好讲。"],
      [9.8, 15.2, "所以我找了两家大公司的博客，看它们怎么定义。"],
      [15.5, 20.6, "先看 Anthropic 的《Building effective agents》，2024 年 12 月发的。"],
    ],
  },
  {
    scene: "S02",
    cues: [
      [0.4, 2.8, "Anthropic 分得挺清楚："],
      [3.1, 9.1, "Workflow 的路，是人提前写好的，模型和工具照着走；"],
      [9.4, 15.7, "Agent 不一样，下一步做什么、工具怎么用，模型自己判断。"],
      [16.0, 19.3, "区别就在这儿——谁来决定下一步。"],
    ],
  },
  {
    scene: "S03",
    cues: [
      [0.4, 3.1, "再看 OpenAI 这份："],
      [3.4, 7.6, "Agent 是替你独立完成任务的系统。"],
      [7.9, 13.3, "它不是答完一个问题就结束，还要管理执行、做决策，"],
      [13.6, 16.9, "也得知道任务什么时候算完成。"],
    ],
  },
  {
    scene: "S04",
    cues: [
      [0.4, 2.7, "那它靠什么完成任务？"],
      [3.0, 6.2, "OpenAI 拆成三块：模型、工具、指令。"],
      [6.5, 12.4, "模型管判断，工具去接外面的系统。目标和边界，得你来写。"],
    ],
  },
  {
    scene: "S05",
    cues: [
      [0.4, 1.9, "两家放一起看："],
      [2.2, 5.9, "Agent 是让大模型在执行中做决策，"],
      [6.2, 9.5, "借助工具和反馈，替你完成任务。"],
      [9.8, 15.2, "模型不只是给出答案，它还参与决定接下来怎么做。"],
    ],
  },
  {
    scene: "S06",
    cues: [
      [0.4, 3.2, "实际跑起来，是一轮一轮的："],
      [3.5, 8.6, "模型提出下一步，程序去执行工具，结果再交回去。"],
      [8.9, 13.0, "看到结果，它再决定继续、调整，还是结束。"],
    ],
  },
  {
    scene: "S07",
    cues: [
      [0.4, 4.0, "当然，能自己决定，不等于没有边界。"],
      [4.3, 7.6, "它得在约束里跑：任务完成就停；"],
      [7.9, 12.5, "处理不了，或者要你来定，就把控制权还给你。"],
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
