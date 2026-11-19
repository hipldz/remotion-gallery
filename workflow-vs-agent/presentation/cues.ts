import storyboard from "../src/data/storyboard.json";
import { FPS } from "../src/data/theme";

// Offsets are in source-shot seconds. Only this adapter reads storyboard data;
// the shared presentation package receives plain integer-frame intervals.
function cue(
  shotId: string,
  id: string,
  title: string,
  fromSeconds: number,
  holdSeconds: number,
  notes?: string,
) {
  const shot = storyboard.shots.find((entry) => entry.id === shotId);
  if (!shot) throw new Error(`演示停留点引用了不存在的分镜：${shotId}`);
  if (
    fromSeconds < 0 ||
    holdSeconds <= fromSeconds ||
    holdSeconds >= shot.end - shot.start
  ) {
    throw new Error(`演示区间超出分镜范围：${id} (${shotId})`);
  }
  const chapter = storyboard.chapters.find((entry) => entry.index === shot.act);
  return {
    id,
    title,
    chapter: chapter?.title ?? "",
    fromFrame: Math.round((shot.start + fromSeconds) * FPS),
    holdFrame: Math.round((shot.start + holdSeconds) * FPS),
    notes,
  };
}

// Keep holds away from shot cuts, chapter-card exits and camera transitions.
// Source scenes remain unchanged, including their own in-graphic text.
export const cues = [
  cue("S0-1", "opening", "Workflow 和 Agent：到底怎么选？", 0, 3),
  cue("S0-2", "coze-news", "从产品变化聊起", 0, 3),
  cue("S0-2", "coze-question", "产品下线意味着 Workflow 过时吗？", 3, 8.5),
  cue("S0-3", "questions", "是什么、谁更好、要不要换？", 0, 5),
  cue("S0-4", "sources", "两份原始资料的定义", 0, 3),

  // S0-5's follow request and the two-second chapter cards are skipped.
  cue("S1-2", "model", "核心积木：LLM", 0, 2),
  cue("S1-2", "retrieval", "加上检索能力", 2, 9.2),
  cue("S1-2", "tools", "加上执行工具", 9.2, 10.8),
  cue("S1-2", "memory", "加上记忆", 10.8, 13.5),
  cue("S1-3", "who-decides", "下一步由谁安排？", 0, 4.5),

  cue("S2-1", "workflow-overview", "五种常见 Workflow 搭法", 2.7, 5),
  cue("S2-2", "chain-pass", "提示词链：通过检查点", 0, 6.7),
  cue("S2-2", "chain-fail", "提示词链：检查失败时退出", 6.7, 12.3),
  cue("S2-3", "routing-task", "路由：选择任务出口", 0, 4.8),
  cue("S2-3", "routing-model", "路由：按复杂度选择模型", 4.8, 9.5),
  cue("S2-4", "parallel-sections", "并行：独立分工再汇总", 0, 4.8),
  cue("S2-4", "parallel-voting", "并行：多路审查与投票", 4.8, 9.7),
  cue("S2-5", "orchestrator-two", "统筹与执行：动态拆分任务", 0, 4.8),
  cue("S2-5", "orchestrator-four", "统筹与执行：增加子任务", 4.8, 9.8),
  cue("S2-6", "evaluate-feedback", "评估与改进：反馈回路", 0, 2.9),
  cue("S2-6", "evaluate-accepted", "评估与改进：达到标准后交付", 2.9, 9.7),
  cue(
    "S2-7",
    "still-workflow",
    "有动态分工和循环，仍然可能是 Workflow",
    0,
    3.2,
  ),

  cue("S3-2", "agent-loop", "Agent：模型在运行中选择下一步", 0, 6),
  cue("S3-3", "agent-feedback", "每一步都看真实工具反馈", 0, 6.5),
  cue("S3-4", "decision-rights", "把运行时决策权交给模型", 0, 5.5),
  cue("S3-5", "independent-task", "独立完成任务意味着接管执行", 0, 8),
  cue("S4-1", "false-signals", "用了模型、有循环，都不是充分条件", 0, 10.5),
  cue("S4-1", "decision-scope", "判断模型能够决定多大范围的事", 10.5, 15),

  cue("S5-2", "guardrails", "自主运行需要多层护栏", 0, 6.5),
  cue("S5-3", "human-handoff", "按工具风险设置人工交接点", 0, 4.8),
  cue("S6-2", "three-signals", "三个值得考虑 Agent 的信号", 0, 4.5),
  cue("S6-3", "decision-tree", "从任务特点选择执行方式", 0, 6.7),
  cue("S6-4", "right-system", "复杂度不是目标", 0, 4.5),

  cue("S7-2", "qc-trunk", "基因组 QC：固定主干", 0, 6),
  cue("S7-3", "qc-exceptions", "把异常样本交给诊断分支", 0, 7.2),
  cue("S7-4", "qc-evidence", "综合确定性指标、诊断证据和审批记录", 0, 2),
  cue("S8-2", "dify", "Dify：固定流程中的 Agent 节点", 0, 8.8),
  cue("S8-3", "n8n", "n8n：模型、记忆和工具的组合", 0, 6.5),
  cue("S8-4", "workflow-tool-detail", "放大查看 Workflow 工具内部", 0, 4.7),
  cue("S8-4", "workflow-as-tool", "Agent 也可以把 Workflow 当作工具", 4.7, 7.9),

  cue("S9-2", "research-agents", "多 Agent 研究：分工、汇总与引用", 0, 6.8),
  cue("S9-2", "research-cost", "研究效果背后的 Token 成本", 6.8, 10),
  cue("S9-3", "research-insight", "更多 Token 与任务适用边界", 0, 4),
  cue("S9-4", "chatgpt-capabilities", "能力汇合与执行确认", 0, 4.7),
  cue("S9-4", "chatgpt-mitigation", "确认机制与攻击缓解", 4.7, 9.2),
  cue("S9-5", "long-running", "长任务：上下文重置，工作继续", 0, 9.7),
  cue("S9-6", "harness", "给完成设置可验证的标准", 0, 5.5),
  cue("S9-7", "managed", "大脑、执行环境与日志分别保存", 0, 6.7),

  // These holds preserve the original scene's cue-dependent card highlights.
  cue("S10-1", "return-to-task", "回到我们真正需要解决的任务", 0, 10),
  cue("S10-2", "choose-workflow", "步骤清楚、要求稳定：Workflow", 0, 6),
  cue("S10-2", "choose-agent", "路径难预设、需要动态判断：Agent", 6, 10),
  cue("S10-2", "choose-hybrid", "稳定主干、局部灵活：Hybrid", 10, 14),
  cue("S10-2", "weigh-cost", "效果、时间、成本与边界一起看", 14, 19),
  cue("S10-2", "task-first", "适合任务，才是更好的方案", 19, 23),
  cue("S10-3", "thanks", "谢谢大家", 0, 2),
] as const;
