import { SCENES } from "../src/timeline";
import { FPS } from "../src/theme";

type SceneId = (typeof SCENES)[number]["id"];

const CHAPTERS: Record<SceneId, string> = {
  S01: "开场",
  S02: "两家的定义",
  S03: "两家的定义",
  S04: "基础构成",
  S05: "本片归纳",
  S06: "执行循环",
  S07: "边界与出口",
  S08: "收束",
};

// Stops are expressed in seconds inside one shot; only this adapter knows the
// shot table. The shared package receives plain integer-frame intervals.
function cue(
  sceneId: SceneId,
  id: string,
  title: string,
  fromSeconds: number,
  holdSeconds: number,
  notes?: string,
) {
  const scene = SCENES.find((item) => item.id === sceneId);
  if (!scene) throw new Error(`演示停留点引用了不存在的镜头：${sceneId}`);
  if (
    fromSeconds < 0 ||
    holdSeconds <= fromSeconds ||
    holdSeconds >= scene.duration / FPS
  ) {
    throw new Error(
      `演示区间超出镜头范围：${id}（${sceneId}，共 ${(scene.duration / FPS).toFixed(1)} 秒）`,
    );
  }
  return {
    id,
    title,
    chapter: CHAPTERS[sceneId],
    fromFrame: scene.from + Math.round(fromSeconds * FPS),
    holdFrame: scene.from + Math.round(holdSeconds * FPS),
    notes,
  };
}

// 停在每次动作落位之后：卡片到场、定义句成形、循环走完一轮。
export const cues = [
  cue(
    "S01",
    "open",
    "Agent 到底是什么，先看原文",
    0,
    18.9,
    "Agent 这个词，很多人听过，也用过。\n可真要系统地说清它是什么，反而不好讲。\n所以我找了两家大公司的博客，看它们怎么定义。\n先看 Anthropic 的《Building effective agents》，2024 年 12 月发的。",
  ),

  cue(
    "S02",
    "workflow",
    "Workflow：路径是人写好的",
    0,
    7.6,
    "Anthropic 分得挺清楚：Workflow 的路，是人提前写好的，模型和工具照着走。",
  ),
  cue(
    "S02",
    "agent",
    "Agent：模型自己判断下一步",
    7.9,
    19.4,
    "Agent 不一样，下一步做什么、工具怎么用，模型自己判断。\n区别就在这儿——谁来决定下一步。",
  ),

  cue(
    "S03",
    "definition",
    "OpenAI：替你独立完成任务",
    0,
    6.3,
    "再看 OpenAI 这份：Agent 是替你独立完成任务的系统。",
  ),
  cue(
    "S03",
    "management",
    "不只是回答，还要管理执行",
    6.3,
    17.4,
    "它不是答完一个问题就结束，还要管理执行、做决策，也得知道任务什么时候算完成。",
  ),

  cue(
    "S04",
    "three-parts",
    "拆成三块：模型、工具、指令",
    0,
    6.2,
    "那它靠什么完成任务？OpenAI 拆成三块：模型、工具、指令。",
  ),
  cue(
    "S04",
    "roles",
    "三块怎么咬合",
    6.2,
    14.4,
    "模型管判断，工具去接外面的系统。目标和边界，得你来写。",
  ),

  cue(
    "S05",
    "synthesis",
    "把两家的重点合成一句话",
    0,
    9.5,
    "两家放一起看：Agent 是让大模型在执行中做决策，借助工具和反馈，替你完成任务。",
  ),
  cue(
    "S05",
    "not-just-answers",
    "不只是给出答案",
    9.5,
    17.4,
    "模型不只是给出答案，它还参与决定接下来怎么做。",
  ),

  cue(
    "S06",
    "loop",
    "一轮动作：决策、执行、反馈",
    0,
    8.6,
    "实际跑起来，是一轮一轮的：模型提出下一步，程序去执行工具，结果再交回去。",
  ),
  cue(
    "S06",
    "exits",
    "继续、调整，还是结束",
    8.6,
    14.4,
    "看到结果，它再决定继续、调整，还是结束。",
  ),

  cue(
    "S07",
    "bounds",
    "在约束内运行，该停就停",
    0,
    13.5,
    "当然，能自己决定，不等于没有边界。\n它得在约束里跑：任务完成就停；处理不了，或者要你来定，就把控制权还给你。",
  ),

  cue(
    "S08",
    "close",
    "把定义留给观众",
    0,
    5.5,
    "这一镜没有旁白：完整定义留在画面上，让观众自己读。",
  ),
] as const;
