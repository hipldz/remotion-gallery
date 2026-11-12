// 全片唯一的例子。S3 演它，S4 把它拆成 JSON，S7 把它重排成数据模型，
// S8 拿它去跑并发。所有画面都引用这一份数据，不另造例子。
export type ToolCall = {
  callId: string;
  execId: string;
  name: string;
  arg: string;
  /** 应用里的执行耗时占比（0…1），只影响进度条长度 */
  span: number;
};

export type ResponseData = {
  id: string;
  genId: string;
  index: number;
  kind: "tool_calls" | "message";
  calls: ToolCall[];
  text?: string;
};

export const EXAMPLE = {
  prompt: "分析一下这个项目",
  answer: "这个项目用 Remotion 做视频，核心是三条数据边界。",
  responses: [
    {
      id: "resp_123",
      genId: "gen_01",
      index: 1,
      kind: "tool_calls",
      calls: [
        {callId: "call_001", execId: "exec_01", name: "read_file", arg: "src/app.ts", span: 0.62},
        {callId: "call_002", execId: "exec_02", name: "read_file", arg: "src/router.ts", span: 0.44},
        {callId: "call_003", execId: "exec_03", name: "read_file", arg: "src/store.ts", span: 0.78},
      ],
    },
    {
      id: "resp_456",
      genId: "gen_02",
      index: 2,
      kind: "tool_calls",
      calls: [
        {callId: "call_004", execId: "exec_04", name: "grep", arg: '"useEffect"', span: 0.35},
        {callId: "call_005", execId: "exec_05", name: "grep", arg: '"generation_id"', span: 0.5},
      ],
    },
    {
      id: "resp_789",
      genId: "gen_03",
      index: 3,
      kind: "message",
      calls: [],
      text: "这个项目用 Remotion 做视频，核心是三条数据边界。",
    },
  ] satisfies ResponseData[],
  turnId: "turn_01",
};

export const ALL_CALLS: ToolCall[] = EXAMPLE.responses.flatMap((r) => r.calls);

// HUD 计数器的事件表：Response 只跳 3 下，Tool Call 要跳 5 下。
export const HUD_EVENTS = {
  turn: [30.6],
  response: [31.6, 43.2, 47.2],
  tool: [32.3, 32.7, 33.1, 44.0, 44.4],
};

// 执行 / 回传的时间点（S3）
export const EXEC = {
  start: [39.8, 40.1, 40.4],
  done: [41.5, 41.8, 42.1],
  returnStart: 42.2,
  returnEnd: 43.4,
};

// S8 并发完成顺序：b → c → a
export const CONCURRENCY = {
  start: 147.2,
  done: {b: 148.9, c: 150.1, a: 151.3},
  pairIndex: 152.6,
  pairName: 154.0,
  pairCallId: 155.6,
  verdict: 156.8,
};

export const TRACE_ROWS = [
  {t: 0, kind: "agent" as const, name: "agent run", ms: 8420, parent: true},
  {t: 0.5, kind: "gen" as const, name: "POST /v1/responses", ms: 2100, model: "gpt-5-codex"},
  {t: 1.2, kind: "tool" as const, name: "codex · read_file", ms: 340},
  {t: 1.6, kind: "tool" as const, name: "codex · read_file", ms: 290},
  {t: 2.0, kind: "tool" as const, name: "codex · read_file", ms: 410},
  {t: 3.1, kind: "gen" as const, name: "POST /v1/responses", ms: 2600, model: "gpt-5-codex"},
  {t: 4.0, kind: "tool" as const, name: "codex · grep", ms: 220},
  {t: 4.4, kind: "tool" as const, name: "codex · grep", ms: 260},
  {t: 5.6, kind: "gen" as const, name: "POST /v1/responses", ms: 1800, model: "gpt-5-codex"},
  {t: 6.8, kind: "handoff" as const, name: "handoff → subagent", ms: 150},
  {t: 7.2, kind: "gen" as const, name: "POST /v1/responses", ms: 1200, model: "gpt-5-mini"},
];
