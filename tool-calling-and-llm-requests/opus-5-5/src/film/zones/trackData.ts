// 轨道区域的几何与时间表。S3（Agent Loop）、S4（JSON）、S7（数据模型）共用同一批对象。
import type {Pt, Rect} from "../ease";

export const Bx = (r: number) => 480 + r * 1060;

export const LANES = {
  model: {x: 60, y: 270, w: 3680, h: 230},
  app: {x: 60, y: 590, w: 3680, h: 300},
};

export const USER_BUBBLE: Rect = {x: 110, y: 650, w: 320, h: 86};
export const ANSWER_TRACK: Rect = {x: Bx(2) + 530, y: 650, w: 400, h: 86};
export const ANSWER_TREE: Rect = {x: 2230, y: 580, w: 320, h: 60};

export const cardTrack = (r: number): Rect => ({x: Bx(r) + 150, y: 290, w: 340, h: 180});
export const GEN_CX = [1440, 1900, 2360];
export const cardTree = (r: number): Rect => ({x: GEN_CX[r] - 170, y: 330, w: 340, h: 180});

export const TURN_NODE: Rect = {x: 1700, y: 150, w: 400, h: 96};

export const reqStart = (r: number): Pt => ({x: Bx(r), y: 690});
export const reqEnd = (r: number): Pt => ({x: Bx(r) + 146, y: 430});
export const reqCtrl = (r: number): [Pt, Pt] => [
  {x: Bx(r), y: 560},
  {x: Bx(r) + 30, y: 430},
];

export type Chip = {r: number; i: number; name: string; arg: string; call: string; exec: string; resp: string};
export const CHIPS: Chip[] = [
  {r: 0, i: 0, name: "read_file", arg: '"a.ts"', call: "call_001", exec: "exec_01", resp: "a.ts 的内容"},
  {r: 0, i: 1, name: "read_file", arg: '"b.ts"', call: "call_002", exec: "exec_02", resp: "b.ts 的内容"},
  {r: 0, i: 2, name: "read_file", arg: '"c.ts"', call: "call_003", exec: "exec_03", resp: "c.ts 的内容"},
  {r: 1, i: 0, name: "grep", arg: '"AgentRunState"', call: "call_004", exec: "exec_04", resp: "3 处匹配"},
  {r: 1, i: 1, name: "grep", arg: '"version"', call: "call_005", exec: "exec_05", resp: "5 处匹配"},
];

export const chipTrack = (c: Chip): Rect => ({x: Bx(c.r) + 530, y: 640 + c.i * 76, w: 320, h: 60});
export const chipTree = (c: Chip): Rect =>
  c.r === 0 ? {x: 1310, y: 580 + c.i * 76, w: 320, h: 60} : {x: 1770, y: 580 + c.i * 76, w: 320, h: 60};

export const RESP_IDS = ["resp_123", "resp_456", "resp_789"];
export const REQ_IDS = ["req_7Kq1…", "req_9Fz2…", "req_3Lm8…"];

export const T = {
  lanes: 30.0,
  user: 30.9,
  req: [32.4, 43.0, 48.4],
  card: [33.2, 43.8, 49.2],
  pop: [
    [34.8, 35.3, 35.8],
    [44.9, 45.4],
  ],
  execStart: [39.8, 46.2],
  execDur: [
    [1.3, 0.9, 1.6],
    [0.9, 1.2],
  ],
  answer: 50.4,
  loop: 58.8,
  loopDur: 3.0,
  // S4
  jsonOpen: 64.6,
  jsonLines: 65.6,
  dim: 69.2,
  hiId: 70.0,
  hiOut: 71.4,
  hiCall: 72.8,
  gutter: 75.2,
  callPulse: 75.8,
  idPulse: 77.4,
  notesOut: 82.4,
  footer: 82.6,
  jsonClose: 125.2,
  // S7
  tree: 126.6,
  turnNode: 127.2,
  levels: 127.6,
  links: 128.4,
  stampTurn: 130.8,
  stampGen: 131.2,
  stampExec: 131.8,
  tagResp: 134.8,
  tagReq: 135.4,
  tagCall: 136.0,
  cross: 138.8,
  crossHead: 139.8,
  crossBody: 140.4,
  crossLinks: 141.0,
};

export const popAt = (c: Chip) => T.pop[c.r][c.i];
export const execStartAt = (c: Chip) => T.execStart[c.r];
export const execEndAt = (c: Chip) => T.execStart[c.r] + T.execDur[c.r][c.i];

// HUD 计数器（S3）
export const HUD_EVENTS = {
  turn: [T.user + 0.3],
  responses: T.card.map((x) => x + 0.2),
  tools: CHIPS.map((c) => popAt(c) + 0.1),
};

// 一圈圈的 Agent Loop 走线（S3 结尾）
export const LOOP_PATH: Pt[] = [
  {x: 430, y: 693},
  ...[0, 1].flatMap((r) => [
    reqStart(r),
    reqEnd(r),
    {x: Bx(r) + 320, y: 470},
    {x: Bx(r) + 690, y: 716},
  ]),
  reqStart(2),
  reqEnd(2),
  {x: Bx(2) + 320, y: 470},
  {x: ANSWER_TRACK.x, y: 693},
];
