import type { EdgeSpec, GraphSpec, NodeSpec } from "../components/Graph";
import { C } from "./theme";
import { ease, mix } from "../lib/motion";

const n = (id: string, x: number, y: number, label: string, extra: Partial<NodeSpec> = {}): NodeSpec => ({ id, x, y, label, ...extra });
const io = (id: string, x: number, y: number, label = id === "in" ? "In" : "Out") =>
  n(id, x, y, label, { shape: "pill", color: C.ink, width: 100, height: 70 });
export const patternInfo = [
  { key: "chain", name: "Prompt chaining", number: "01", summary: "把一次任务，拆成有检查点的接力", example: "写大纲 → 检查大纲 → 写正文" },
  { key: "route", name: "Routing", number: "02", summary: "在已定义的出口里，选择最合适的一条", example: "一般咨询 / 退款申请 / 技术支持" },
  { key: "parallel", name: "Parallelization", number: "03", summary: "独立执行，同时推进，最后汇总", example: "Sectioning · 分工 / Voting · 多数票" },
  { key: "orch", name: "Orchestrator-workers", number: "04", summary: "任务临时拆分，外层结构依然固定", example: "编码任务：要改几个文件，事先并不知道" },
  { key: "eval", name: "Evaluator-optimizer", number: "05", summary: "沿着反馈回路，逐轮改善结果", example: "文学翻译 → 评审意见 → 修改" },
] as const;
export type Pattern = (typeof patternInfo)[number]["key"];

export function makePattern(key: Pattern, time: number): GraphSpec {
  switch (key) {
    case "chain": {
      const second = time >= 5;
      return {
        nodes: [
          io("in", 70, 235),
          n("llm1", 330, 235, "LLM Call 1"),
          n("gate", 610, 235, second ? "Gate\n✕" : "Gate\n✓", { shape: "diamond", color: C.green }),
          n("llm2", 900, 235, "LLM Call 2"),
          n("llm3", 1190, 235, "LLM Call 3"),
          io("out", 1480, 235),
          io("exit", 610, 445, "Exit"),
        ],
        edges: (
          [
            { from: "in", to: "llm1", at: 0.3 },
            { from: "llm1", to: "gate", at: 1.2 },
            { from: "gate", to: "llm2", at: second ? 999 : 2.2, label: "Pass" },
            { from: "llm2", to: "llm3", at: second ? 999 : 3.1 },
            { from: "llm3", to: "out", at: second ? 999 : 4 },
            {
              from: "gate",
              to: "exit",
              optional: true,
              color: C.green,
              label: "Fail",
              at: second ? 2.2 : 999,
              points: [
                [610, 295],
                [610, 330],
                [610, 370],
                [610, 410],
              ],
            },
          ] satisfies EdgeSpec[]
        ).map((e) => ({ ...e, at: (e.at ?? 0) + (second ? 5 : 0) })),
      };
    }
    case "route": {
      const models = time >= 6.6;
      const chosen = models ? 2 : 1;
      return {
        nodes: [
          io("in", 120, 260),
          n("router", 510, 260, "LLM Router", { sub: "classify → route" }),
          ...[0, 1, 2].map((i) =>
            n(`b${i}`, 1040, 90 + i * 170, models ? ["小模型", "中等模型", "大模型"][i] : ["一般问题", "退款申请", "技术支持"][i], {
              color: i === chosen ? C.yellow : C.gray,
              sub: models ? ["simple", "standard", "complex"][i] : `route ${i + 1}`,
            }),
          ),
          io("out", 1470, 260),
        ],
        edges: [
          { from: "in", to: "router", at: models ? 5.2 : 0.2 },
          ...[0, 1, 2].map((i) => ({ from: "router", to: `b${i}`, at: i === chosen ? (models ? 6.3 : 1.6) : 999, dynamic: true, duration: 1.5 })),
          ...[0, 1, 2].map((i) => ({ from: `b${i}`, to: "out", at: i === chosen ? (models ? 8 : 3.3) : 999, optional: true })),
        ],
      };
    }
    case "parallel": {
      const voting = time >= 6.6;
      return {
        nodes: [
          io("in", 100, 260),
          ...[0, 1, 2].map((i) =>
            n(`w${i}`, 610, 90 + i * 170, voting ? `审查 ${i + 1}  ${i < 2 ? "✓" : "✕"}` : ["回答用户", "内容筛查", "独立子任务"][i], {
              sub: voting ? "code review" : `section ${i + 1}`,
            }),
          ),
          n("agg", 1120, 260, voting ? "多数票：通过" : "Aggregator", { color: C.blue, width: 230 }),
          io("out", 1490, 260),
        ],
        edges: [
          ...[0, 1, 2].map((i) => ({ from: "in", to: `w${i}`, at: voting ? 5.4 : 0.4, duration: 1.2 })),
          ...[0, 1, 2].map((i) => ({ from: `w${i}`, to: "agg", at: voting ? 7.3 : 2.4, duration: 1.3 })),
          { from: "agg", to: "out", at: voting ? 8.8 : 4 },
        ],
      };
    }
    case "orch": {
      const second = time >= 5;
      const k = ease(time, 5, 0.7);
      return {
        nodes: [
          io("in", 70, 255),
          n("orch", 410, 255, "Orchestrator", { sub: second ? "4 subtasks" : "2 subtasks", width: 230 }),
          ...[0, 1, 2, 3].map((i) =>
            n(`w${i}`, 850, mix(180 + i * 150, 60 + i * 135, k), `Worker ${i + 1}`, { muted: !second && i > 1, delay: i > 1 ? 5 : 0, height: 75 }),
          ),
          n("synth", 1220, 255, "Synthesizer", { color: C.blue, width: 230 }),
          io("out", 1510, 255),
        ],
        edges: [
          { from: "in", to: "orch", at: second ? 5.1 : 0.1 },
          ...[0, 1, 2, 3].map((i) => ({
            from: "orch",
            to: `w${i}`,
            dynamic: true,
            color: C.yellow,
            at: !second && i > 1 ? 999 : second ? 5.8 + i * 0.2 : 1.1 + i * 0.2,
            duration: 1.2,
          })),
          ...[0, 1, 2, 3].map((i) => ({ from: `w${i}`, to: "synth", optional: true, at: !second && i > 1 ? 999 : second ? 7.7 : 3.1, duration: 1 })),
          { from: "synth", to: "out", at: second ? 9 : 4.4 },
        ],
      };
    }
    case "eval": {
      const round = Math.min(3, 1 + Math.floor(time / 3));
      const offset = (round - 1) * 3;
      return {
        nodes: [
          io("in", 90, 250),
          n("gen", 480, 250, "Generator", { sub: `draft 0${round}` }),
          n("eval", 1050, 250, "Evaluator", { color: round === 3 ? C.green : C.yellow, sub: round === 3 ? "✓ accepted" : "↻ revise" }),
          io("out", 1490, 250),
        ],
        edges: [
          { from: "in", to: "gen", at: 0.2 },
          {
            from: "gen",
            to: "eval",
            label: "Solution",
            at: offset + 0.55,
            duration: 1.2,
            points: [
              [585, 225],
              [730, 75],
              [800, 75],
              [945, 225],
            ],
          },
          {
            from: "eval",
            to: "gen",
            label: "Rejected + Feedback",
            at: round < 3 ? offset + 1.8 : 999,
            duration: 1.1,
            points: [
              [945, 280],
              [800, 425],
              [730, 425],
              [585, 280],
            ],
          },
          { from: "eval", to: "out", color: C.green, label: "Accepted", at: 7.9, duration: 1.2 },
        ],
      };
    }
  }
}

export function agentGraph(time: number, detail = false): GraphSpec {
  const round = Math.min(2, Math.floor(time / 2.8));
  const offset = round * 2.8;
  return {
    nodes: [
      io("goal", 130, 235, "目标"),
      n("llm", 475, 235, "LLM 决策", { sub: detail ? `iteration ${round + 1} / max N` : "choose next action", width: 245 }),
      n("tool", 900, 120, ["搜索", "终端", "文件"][round], { color: C.red, sub: "Tool / Environment", width: 250 }),
      n("obs", 1300, 235, "Observation", { sub: detail ? "ground truth" : "真实执行结果", color: C.red, width: 255 }),
      n("done", 900, 440, "完成？", { shape: "diamond", color: C.green }),
      io("final", 1390, 440, "交付"),
    ],
    edges: [
      { from: "goal", to: "llm", at: 0.15, color: C.red, dynamic: true },
      { from: "llm", to: "tool", at: offset + 0.5, duration: 0.65, color: C.red, dynamic: true, established: round > 0 },
      { from: "tool", to: "obs", at: offset + 1.2, duration: 0.65, color: C.red, dynamic: true, established: round > 0 },
      { from: "obs", to: "done", at: offset + 1.9, duration: 0.5, color: C.red, dynamic: true, established: round > 0 },
      {
        from: "done",
        to: "llm",
        at: round === 2 ? 999 : offset + 2.4,
        duration: 0.4,
        color: C.red,
        dynamic: true,
        established: round > 0,
        label: detail ? "checkpoint · 人类反馈" : "否 · 根据结果继续",
        points: [
          [840, 440],
          [610, 530],
          [470, 460],
          [475, 279],
        ],
      },
      { from: "done", to: "final", at: round === 2 ? offset + 2.4 : 999, color: C.green, dynamic: true, label: "是 / 停止条件" },
    ],
  };
}
