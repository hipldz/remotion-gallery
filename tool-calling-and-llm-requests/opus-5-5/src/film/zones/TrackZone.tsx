// S3 Agent Loop  →  S4 钻进 Response #1 看 JSON  →  S7 同一批对象重排成 Turn / Generation / ToolCall
import React from "react";
import {ZONE, zoneOpacity} from "../timeline";
import {C, FONT, alpha} from "../theme";
import {
  Rect,
  alongPolyline,
  clamp01,
  cubic,
  ease,
  keyed,
  lerp,
  mixRect,
  out,
  outBack,
  polyD,
  prog,
  pulse,
  quad,
  spring,
} from "../ease";
import {ArrowHead, Box, Caps, DrawPath, IconBubble, IconCheck, IconFn, Mono, Tag, cardStyle, solidPanel} from "../ui/primitives";
import {
  ANSWER_TRACK,
  ANSWER_TREE,
  Bx,
  CHIPS,
  Chip,
  GEN_CX,
  LANES,
  LOOP_PATH,
  REQ_IDS,
  RESP_IDS,
  T,
  TURN_NODE,
  USER_BUBBLE,
  cardTrack,
  cardTree,
  chipTrack,
  chipTree,
  execEndAt,
  execStartAt,
  popAt,
  reqCtrl,
  reqEnd,
  reqStart,
} from "./trackData";

const abs = (r: Rect): React.CSSProperties => ({position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h});
const treeP = (t: number, idx: number) => ease(t, T.tree + idx * 0.08, 1.4);

// ───────────────────────── S3：轨道上的对象 ─────────────────────────

const Lanes: React.FC<{t: number; fade: number}> = ({t, fade}) => {
  const p = out(prog(t, T.lanes, 0.9));
  const op = p * lerp(1, 0.0, fade);
  if (op <= 0) return null;
  const band = (r: {x: number; y: number; w: number; h: number}, label: string, color: string) => (
    <div
      style={{
        position: "absolute",
        left: r.x,
        top: r.y,
        width: r.w,
        height: r.h,
        borderRadius: 26,
        background: alpha(color, 0.035),
        border: `1px dashed ${alpha(color, 0.22)}`,
        opacity: op,
      }}
    >
      <Box x={24} y={16}>
        <Caps size={14} color={alpha(color, 0.75)}>
          {label}
        </Caps>
      </Box>
    </div>
  );
  return (
    <>
      {band(LANES.model, "模型 · Model", C.blue)}
      {band(LANES.app, "你的应用 · Agent Runtime", C.text2)}
    </>
  );
};

const TurnBracket: React.FC<{t: number; fade: number}> = ({t, fade}) => {
  const end = keyed(
    t,
    [
      [T.user, 90],
      [T.user + 0.7, 440],
      [T.card[0] + 0.4, 1000],
      [popAt(CHIPS[2]) + 0.6, 1400],
      [T.card[1] + 0.1, 2060],
      [popAt(CHIPS[4]) + 0.4, 2460],
      [T.card[2] + 0.2, 3080],
      [T.answer + 0.8, 3700],
    ],
    out,
  );
  const show = out(prog(t, T.user, 0.5)) * (1 - fade);
  if (show <= 0) return null;
  const done = ease(t, T.answer + 0.8, 0.4);
  return (
    <>
      <svg style={{position: "absolute", left: 0, top: 0, overflow: "visible", opacity: show}} width={3800} height={1080}>
        <path d={`M90,222 L90,200 L${end},200 ${done > 0 ? `L${end},222` : ""}`} fill="none" stroke={C.violet} strokeWidth={3} strokeLinejoin="round" opacity={0.9} />
        <circle cx={end} cy={200} r={6 * (1 - done)} fill={C.violet} />
      </svg>
      <Box x={90} y={140} style={{opacity: show, display: "flex", gap: 14, alignItems: "baseline"}}>
        <Caps size={18} color={C.violet}>
          Turn
        </Caps>
        <span style={{fontFamily: FONT.sans, fontSize: 18, color: C.text2}}>一次完整的用户任务</span>
      </Box>
    </>
  );
};

const UserBubble: React.FC<{t: number; fade: number}> = ({t, fade}) => {
  const p = spring(prog(t, T.user, 0.6));
  if (p <= 0) return null;
  return (
    <div
      style={{
        ...abs(USER_BUBBLE),
        ...cardStyle(C.violet, 0.4),
        background: alpha(C.violet, 0.14),
        borderRadius: 22,
        opacity: clamp01(p * 2) * (1 - fade),
        transform: `scale(${0.7 + 0.3 * p})`,
        transformOrigin: "left center",
      }}
    >
      <Box x={22} y={12}>
        <Caps size={12} color={alpha(C.violet, 0.9)}>
          用户
        </Caps>
      </Box>
      <Box x={22} y={36}>
        <span style={{fontFamily: FONT.sans, fontSize: 24, color: C.text, whiteSpace: "nowrap"}}>帮我分析一下这个项目</span>
      </Box>
    </div>
  );
};

const RequestArrow: React.FC<{t: number; r: number; fade: number}> = ({t, r, fade}) => {
  const at = T.req[r];
  const p = ease(t, at, 0.7, out);
  if (p <= 0 || fade >= 1) return null;
  const s = reqStart(r);
  const e = reqEnd(r);
  const [c1, c2] = reqCtrl(r);
  const d = `M${s.x},${s.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${e.x},${e.y}`;
  const packetU = prog(t, at, 0.7);
  const pk = cubic(s, c1, c2, e, out(packetU));
  return (
    <svg style={{position: "absolute", left: 0, top: 0, overflow: "visible", opacity: 1 - fade}} width={3800} height={1080}>
      <DrawPath d={d} p={p} color={C.amber} width={3} glow />
      <ArrowHead x={e.x + 4} y={e.y} angle={0} color={C.amber} size={14} opacity={p > 0.95 ? 1 : 0} />
      {packetU > 0 && packetU < 1 && <circle cx={pk.x} cy={pk.y} r={9} fill={C.amber} style={{filter: `drop-shadow(0 0 10px ${C.amber})`}} />}
    </svg>
  );
};

const RequestPill: React.FC<{t: number; r: number; fade: number}> = ({t, r, fade}) => {
  const p = outBack(prog(t, T.req[r] + 0.15, 0.5));
  if (p <= 0) return null;
  const extra = r === 0 ? null : r === 1 ? "+ 3 个工具结果" : "+ 2 个工具结果";
  return (
    <div
      style={{
        position: "absolute",
        left: Bx(r) - 186,
        top: 512,
        width: 170,
        height: extra ? 84 : 58,
        borderRadius: 14,
        background: alpha(C.amber, 0.1),
        border: `1px solid ${alpha(C.amber, 0.5)}`,
        opacity: clamp01(p) * (1 - fade),
        transform: `scale(${0.8 + 0.2 * p})`,
        transformOrigin: "right center",
      }}
    >
      <Box x={14} y={10}>
        <Caps size={13} color={C.amber}>{`Request #${r + 1}`}</Caps>
      </Box>
      <Box x={14} y={32}>
        <Mono size={13} color={C.text2}>
          POST /v1/responses
        </Mono>
      </Box>
      {extra && (
        <Box x={14} y={56}>
          <span style={{fontFamily: FONT.sans, fontSize: 14, color: C.green}}>{extra}</span>
        </Box>
      )}
    </div>
  );
};

const ResponseCard: React.FC<{t: number; r: number; hideForJson: number; dim: number}> = ({t, r, hideForJson, dim}) => {
  const at = T.card[r];
  const land = spring(prog(t, at, 0.65));
  if (land <= 0) return null;
  const tp = treeP(t, r);
  const rect = mixRect(cardTrack(r), cardTree(r), tp);
  const glow = pulse(t, at, 1.1) + (r === 0 ? 0.8 * pulse(t, 36.8, 1.8) : 0);
  const nItems = r === 0 ? 3 : r === 1 ? 2 : 0;
  const trackOp = 1 - clamp01(tp * 2);
  const treeOp = clamp01(tp * 2 - 1);
  const stamp = outBack(prog(t, T.stampGen + r * 0.2, 0.4));
  const tagResp = out(prog(t, T.tagResp + r * 0.15, 0.4));
  const tagReq = out(prog(t, T.tagReq + r * 0.15, 0.4));
  return (
    <div
      style={{
        ...abs(rect),
        ...cardStyle(C.blue, clamp01(glow)),
        background: `linear-gradient(180deg, ${alpha(C.blue, 0.16)}, ${alpha(C.blue, 0.05)})`,
        opacity: clamp01(prog(t, at, 0.25)) * (1 - hideForJson) * dim,
        transform: `scale(${0.86 + 0.14 * land})`,
      }}
    >
      {/* 轨道状态：Response 卡片 */}
      <div style={{position: "absolute", inset: 0, opacity: trackOp}}>
        <Box x={20} y={18}>
          <Caps size={15} color={C.blue}>{`Response #${r + 1}`}</Caps>
        </Box>
        <Box x={190} y={17} w={130} style={{textAlign: "right"}}>
          <Mono size={15} color={C.text2}>
            {RESP_IDS[r]}
          </Mono>
        </Box>
        <Box x={20} y={58}>
          <Mono size={15} color={C.text3}>
            output[]
          </Mono>
        </Box>
        <Box x={20} y={88} style={{display: "flex", gap: 10}}>
          {nItems > 0 ? (
            Array.from({length: nItems}, (_, i) => {
              const c = CHIPS.filter((x) => x.r === r)[i];
              const filled = t >= popAt(c);
              return (
                <span
                  key={i}
                  style={{
                    width: 54,
                    height: 36,
                    borderRadius: 9,
                    display: "inline-block",
                    border: `1.5px solid ${C.green}`,
                    background: filled ? alpha(C.green, 0.25) : alpha(C.green, 0.7),
                  }}
                />
              );
            })
          ) : (
            <span style={{width: 180, height: 36, borderRadius: 9, display: "inline-block", border: `1.5px solid ${C.blue}`, background: alpha(C.blue, 0.4)}} />
          )}
        </Box>
        <Box x={20} y={140}>
          <span style={{fontFamily: FONT.sans, fontSize: 15, color: C.text2}}>{nItems > 0 ? `${nItems} × function_call` : "message · 最终回答"}</span>
        </Box>
      </div>
      {/* 数据模型状态：Generation 节点 */}
      {treeOp > 0 && (
        <div style={{position: "absolute", inset: 0, opacity: treeOp}}>
          <Box x={18} y={16}>
            <Caps size={15} color={C.blue}>{`Generation ${r + 1}`}</Caps>
          </Box>
          <Box x={230} y={12} w={92} style={{textAlign: "right", opacity: clamp01(stamp), transform: `scale(${0.6 + 0.4 * stamp})`, transformOrigin: "right center"}}>
            <Mono size={18} color={C.text}>{`gen_${r + 1}`}</Mono>
          </Box>
          <Box x={18} y={46} style={{opacity: clamp01(stamp)}}>
            <span style={{fontFamily: FONT.mono, fontSize: 13, color: C.text3}}>generation_id · 内部生成</span>
          </Box>
          <div style={{position: "absolute", left: 18, right: 18, top: 76, height: 1, background: C.line}} />
          <Box x={18} y={92} w={304} h={28} style={{opacity: tagResp, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <Mono size={14} color={C.text2}>
              response.id
            </Mono>
            <Mono size={16} color={C.blue}>
              {RESP_IDS[r]}
            </Mono>
          </Box>
          <Box x={18} y={132} w={304} h={28} style={{opacity: tagReq, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <Mono size={14} color={C.text2}>
              x-request-id
            </Mono>
            <Mono size={16} color={C.amber}>
              {REQ_IDS[r]}
            </Mono>
          </Box>
        </div>
      )}
    </div>
  );
};

const ChipCard: React.FC<{t: number; c: Chip; idx: number; dim: number}> = ({t, c, idx, dim}) => {
  const at = popAt(c);
  const pp = out(prog(t, at, 0.75));
  if (pp <= 0) return null;
  const sc = spring(prog(t, at, 0.7));
  const end = chipTrack(c);
  const start = {x: Bx(c.r) + 320 - end.w / 2, y: 440 - end.h / 2};
  const ctrl = {x: end.x - 40, y: start.y + 20};
  const pos = quad(start, ctrl, {x: end.x, y: end.y}, pp);
  const track: Rect = {x: pos.x, y: pos.y, w: end.w, h: end.h};
  const tp = treeP(t, 3 + idx);
  const rect = mixRect(track, chipTree(c), tp);

  const es = execStartAt(c);
  const ee = execEndAt(c);
  const run = prog(t, es, ee - es);
  const done = t >= ee;
  const glow = pulse(t, at, 0.9) + (done ? 0.6 * pulse(t, ee, 0.7) : 0);
  const stamp = outBack(prog(t, T.stampExec + idx * 0.12, 0.4));
  const callTag = out(prog(t, T.tagCall + idx * 0.1, 0.4));
  return (
    <div
      style={{
        ...abs(rect),
        ...cardStyle(C.green, clamp01(glow)),
        background: `linear-gradient(180deg, ${alpha(C.green, 0.15)}, ${alpha(C.green, 0.05)})`,
        borderRadius: 14,
        opacity: clamp01(pp * 3) * dim,
        transform: `scale(${0.5 + 0.5 * sc})`,
        overflow: "hidden",
      }}
    >
      <Box x={14} y={18}>
        <IconFn size={24} color={C.green} />
      </Box>
      <Box x={50} y={8}>
        <Mono size={16} color={C.text}>{`${c.name}(${c.arg})`}</Mono>
      </Box>
      <Box x={50} y={35} style={{opacity: 1 - clamp01(tp * 2)}}>
        <Mono size={13} color={C.green}>
          {c.call}
        </Mono>
      </Box>
      {tp > 0 && (
        <>
          <Box x={50} y={35} style={{opacity: clamp01(stamp) * clamp01(tp * 2 - 1)}}>
            <Mono size={13} color={C.text}>
              {c.exec}
            </Mono>
          </Box>
          <Box x={140} y={35} w={166} style={{textAlign: "right", opacity: callTag * clamp01(tp * 2 - 1)}}>
            <Mono size={13} color={C.green}>{`call_id · ${c.call}`}</Mono>
          </Box>
        </>
      )}
      {done && tp < 0.5 && (
        <Box x={286} y={18} style={{opacity: out(prog(t, ee, 0.3)) * (1 - tp * 2)}}>
          <IconCheck size={22} color={C.green} />
        </Box>
      )}
      {run > 0 && tp <= 0 && (
        <div style={{position: "absolute", left: 0, bottom: 0, height: 4, width: `${run * 100}%`, background: C.green, opacity: done ? 0.35 : 0.9}} />
      )}
    </div>
  );
};

const ResultPacket: React.FC<{t: number; c: Chip}> = ({t, c}) => {
  const at = execEndAt(c) + 0.1;
  const u = prog(t, at, 1.1);
  if (u <= 0 || u >= 1) return null;
  const s = {x: Bx(c.r) + 850, y: 670 + c.i * 76};
  const e = reqStart(c.r + 1);
  const ctrl = {x: (s.x + e.x) / 2, y: 870};
  const q = quad(s, ctrl, e, out(u));
  const op = Math.min(prog(u, 0, 0.12), 1 - prog(u, 0.8, 0.2));
  const sc = lerp(1, 0.5, prog(u, 0.7, 0.3));
  return (
    <div
      style={{
        position: "absolute",
        left: q.x - 84,
        top: q.y - 16,
        width: 168,
        height: 32,
        borderRadius: 16,
        background: C.panel2,
        border: `1px solid ${alpha(C.green, 0.7)}`,
        boxShadow: `0 0 18px ${alpha(C.green, 0.35)}`,
        opacity: op,
        transform: `scale(${sc})`,
        textAlign: "center",
        lineHeight: "30px",
      }}
    >
      <Mono size={13} color={C.green}>{`output · ${c.call}`}</Mono>
    </div>
  );
};

const AnswerBubble: React.FC<{t: number; dim: number}> = ({t, dim}) => {
  const p = spring(prog(t, T.answer, 0.6));
  if (p <= 0) return null;
  const tp = treeP(t, 8);
  const rect = mixRect(ANSWER_TRACK, ANSWER_TREE, tp);
  return (
    <div
      style={{
        ...abs(rect),
        ...cardStyle(C.blue, 0.3),
        background: alpha(C.blue, 0.12),
        borderRadius: lerp(22, 14, tp),
        opacity: clamp01(p * 2) * dim,
        transform: `scale(${0.7 + 0.3 * p})`,
        transformOrigin: "left center",
        overflow: "hidden",
      }}
    >
      <div style={{position: "absolute", inset: 0, opacity: 1 - clamp01(tp * 2)}}>
        <Box x={22} y={12}>
          <Caps size={12} color={C.blue}>
            最终回答
          </Caps>
        </Box>
        <Box x={22} y={36}>
          <span style={{fontFamily: FONT.sans, fontSize: 22, color: C.text, whiteSpace: "nowrap"}}>项目由 3 个模块组成……</span>
        </Box>
      </div>
      {tp > 0 && (
        <div style={{position: "absolute", inset: 0, opacity: clamp01(tp * 2 - 1)}}>
          <Box x={14} y={18}>
            <IconBubble size={24} color={C.blue} />
          </Box>
          <Box x={50} y={18}>
            <span style={{fontFamily: FONT.sans, fontSize: 18, color: C.text}}>message · 最终回答</span>
          </Box>
        </div>
      )}
    </div>
  );
};

const LoopTrace: React.FC<{t: number}> = ({t}) => {
  const p = ease(t, T.loop, T.loopDur, (x) => x);
  const fade = 1 - ease(t, T.loop + T.loopDur + 0.2, 0.8);
  if (p <= 0 || fade <= 0) return null;
  const head = alongPolyline(LOOP_PATH, p);
  const d = polyD(LOOP_PATH);
  return (
    <svg style={{position: "absolute", left: 0, top: 0, overflow: "visible", opacity: fade}} width={3800} height={1080}>
      <path d={d} fill="none" stroke={C.violet} strokeWidth={18} opacity={0.12} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} strokeLinejoin="round" strokeLinecap="round" />
      <path d={d} fill="none" stroke={C.violet} strokeWidth={5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={head.x} cy={head.y} r={14} fill={C.text} style={{filter: `drop-shadow(0 0 16px ${C.violet})`}} />
    </svg>
  );
};

// ───────────────────────── S4：Response #1 展开成 JSON ─────────────────────────

type SegK = "p" | "key" | "str" | "idK" | "idV" | "outK" | "outB" | "callK" | "callV";
type Seg = {s: string; k: SegK};
const item = (n: number, file: string, last: boolean): Seg[] => [
  {s: "    { ", k: "p"},
  {s: '"type"', k: "key"},
  {s: ": ", k: "p"},
  {s: '"function_call"', k: "str"},
  {s: ", ", k: "p"},
  {s: '"call_id"', k: "callK"},
  {s: ": ", k: "p"},
  {s: `"call_00${n}"`, k: "callV"},
  {s: ", ", k: "p"},
  {s: '"name"', k: "key"},
  {s: ": ", k: "p"},
  {s: '"read_file"', k: "str"},
  {s: ", ", k: "p"},
  {s: '"arguments"', k: "key"},
  {s: ": ", k: "p"},
  {s: `"{\\"path\\":\\"${file}\\"}"`, k: "str"},
  {s: last ? " }" : " },", k: "p"},
];
const JSON_LINES: Seg[][] = [
  [{s: "{", k: "p"}],
  [
    {s: "  ", k: "p"},
    {s: '"id"', k: "idK"},
    {s: ": ", k: "p"},
    {s: '"resp_123"', k: "idV"},
    {s: ",", k: "p"},
  ],
  [
    {s: "  ", k: "p"},
    {s: '"output"', k: "outK"},
    {s: ": ", k: "p"},
    {s: "[", k: "outB"},
  ],
  item(1, "a.ts", false),
  item(2, "b.ts", false),
  item(3, "c.ts", true),
  [
    {s: "  ", k: "p"},
    {s: "]", k: "outB"},
  ],
  [{s: "}", k: "p"}],
];
const PANEL: Rect = {x: 50, y: 110, w: 1500, h: 660};
const LINE_TOP = 92;
const LINE_H = 40;
const lineC = (i: number) => LINE_TOP + i * LINE_H + LINE_H / 2;

const JsonPanel: React.FC<{t: number; pj: number}> = ({t, pj}) => {
  const rect = mixRect(cardTrack(0), PANEL, pj);
  const s = rect.w / PANEL.w;
  const contentOp = clamp01((pj - 0.55) / 0.45);
  const dim = ease(t, T.dim, 0.6);
  const hId = ease(t, T.hiId, 0.4);
  const hOut = ease(t, T.hiOut, 0.4);
  const hCall = ease(t, T.hiCall, 0.4);
  const gut = ease(t, T.gutter, 0.8);
  const notesOut = 1 - ease(t, T.notesOut, 0.4);
  const footer = out(prog(t, T.footer, 0.5));

  const segStyle = (k: SegK, li: number): React.CSSProperties => {
    const keyKind = k === "idK" || k === "idV" || k === "outK" || k === "outB" || k === "callK" || k === "callV";
    const base: React.CSSProperties = {
      color: k === "p" ? "#6B7590" : k === "key" ? "#8FA2C7" : k === "str" ? "#D5DAE4" : k.startsWith("call") ? C.green : k.startsWith("id") ? C.blue : C.text,
      opacity: keyKind ? 1 : lerp(1, 0.28, dim),
      borderRadius: 5,
    };
    if (k === "idK" || k === "idV") {
      const pu = k === "idV" ? pulse(t, T.idPulse, 0.8) : 0;
      const a = 0.2 * hId + 0.25 * pu;
      return {...base, background: alpha(C.blue, a), boxShadow: `0 0 0 3px ${alpha(C.blue, a)}`};
    }
    if (k === "callK" || k === "callV") {
      const pu = k === "callV" ? pulse(t, T.callPulse + (li - 3) * 0.5, 0.7) : 0;
      const a = 0.18 * hCall + 0.3 * pu;
      return {...base, background: alpha(C.green, a), boxShadow: `0 0 0 3px ${alpha(C.green, a)}`};
    }
    if (k === "outK" || k === "outB") return {...base, color: lerp(0, 1, hOut) > 0.5 ? C.text : "#B9C2D3", fontWeight: hOut > 0.5 ? 700 : 400};
    return base;
  };

  const notes = [
    {x: 48, tok: "response.id", color: C.blue, desc: "标识整个 Response", at: T.hiId + 0.2},
    {x: 520, tok: "output", color: C.text, desc: "模型返回的输出 Item 列表", at: T.hiOut + 0.2},
    {x: 992, tok: "call_id", color: C.green, desc: "标识具体工具调用，提交结果时用它关联", at: T.hiCall + 0.2},
  ];
  const arrays = [
    {n: 0, label: "零个"},
    {n: 1, label: "一个"},
    {n: 3, label: "多个"},
  ];

  return (
    <div style={{...abs(rect), ...solidPanel(C.blue), overflow: "hidden", zIndex: 5}}>
      <div style={{position: "absolute", left: 0, top: 0, width: PANEL.w, height: PANEL.h, transform: `scale(${s})`, transformOrigin: "0 0", opacity: contentOp}}>
        <Box x={36} y={28}>
          <Caps size={16} color={C.blue}>
            Response #1
          </Caps>
        </Box>
        <Box x={210} y={25}>
          <span style={{fontFamily: FONT.sans, fontSize: 19, color: C.text2}}>Responses API 返回体（节选 · 示意值）</span>
        </Box>
        <Box x={PANEL.w - 250} y={22}>
          <Tag color={C.amber} size={15}>
            POST /v1/responses
          </Tag>
        </Box>
        <div style={{position: "absolute", left: 0, right: 0, top: 70, height: 1, background: C.line}} />

        {/* output[] 列表范围 */}
        <div
          style={{
            position: "absolute",
            left: 40,
            top: LINE_TOP + 2 * LINE_H - 4,
            width: PANEL.w - 80,
            height: 5 * LINE_H + 8,
            borderRadius: 12,
            border: `1.5px dashed ${alpha(C.text, 0.45 * hOut)}`,
            background: alpha(C.text, 0.03 * hOut),
          }}
        />
        {/* 左侧槽：三项都挂在同一个 response.id 下 */}
        {gut > 0 && (
          <svg style={{position: "absolute", left: 0, top: 0, overflow: "visible"}} width={60} height={PANEL.h}>
            <DrawPath d={`M24,${lineC(1)} L24,${lineC(5)}`} p={gut} color={C.blue} width={3} />
            {[1, 3, 4, 5].map((li, k) => (
              <circle key={li} cx={24} cy={lineC(li)} r={6} fill={C.blue} opacity={out(prog(t, T.gutter + 0.15 + k * 0.15, 0.3))} />
            ))}
          </svg>
        )}

        {JSON_LINES.map((segs, li) => {
          const p = out(prog(t, T.jsonLines + li * 0.1, 0.35));
          return (
            <div
              key={li}
              style={{
                position: "absolute",
                left: 56,
                top: LINE_TOP + li * LINE_H,
                height: LINE_H,
                lineHeight: `${LINE_H}px`,
                fontFamily: FONT.mono,
                fontSize: 20,
                whiteSpace: "pre",
                opacity: p,
                transform: `translateX(${(1 - p) * 20}px)`,
              }}
            >
              {segs.map((sg, si) => (
                <span key={si} style={segStyle(sg.k, li)}>
                  {sg.s}
                </span>
              ))}
            </div>
          );
        })}

        {/* 三个变量的说明 */}
        {notes.map((n, i) => {
          const p = out(prog(t, n.at, 0.45)) * notesOut;
          if (p <= 0) return null;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: n.x,
                top: 448,
                width: 452,
                height: 96,
                borderRadius: 14,
                background: alpha(n.color, 0.07),
                border: `1px solid ${alpha(n.color, 0.35)}`,
                opacity: p,
                transform: `translateY(${(1 - p) * 14}px)`,
              }}
            >
              <Box x={20} y={16}>
                <Mono size={20} color={n.color}>
                  {n.tok}
                </Mono>
              </Box>
              <Box x={20} y={54}>
                <span style={{fontFamily: FONT.sans, fontSize: 18, color: C.text2, whiteSpace: "nowrap"}}>{n.desc}</span>
              </Box>
            </div>
          );
        })}

        {/* 官方文档：零个、一个或多个 */}
        {footer > 0 && (
          <div style={{position: "absolute", left: 48, top: 448, width: PANEL.w - 96, height: 170, opacity: footer}}>
            <Box x={0} y={30}>
              <span style={{fontFamily: FONT.sans, fontSize: 22, color: C.text2}}>一次响应的 output[] 里，function_call 可以有：</span>
            </Box>
            {arrays.map((a, k) => {
              const p = outBack(prog(t, T.footer + 0.8 + k * 0.8, 0.5));
              return (
                <Box key={k} x={560 + k * 260} y={14} style={{opacity: clamp01(p), transform: `scale(${0.7 + 0.3 * clamp01(p)})`}}>
                  <div style={{display: "flex", alignItems: "center", gap: 6, height: 52}}>
                    <Mono size={30} color={C.text2}>
                      [
                    </Mono>
                    {a.n === 0 ? (
                      <span style={{width: 26, display: "inline-block"}} />
                    ) : (
                      Array.from({length: a.n}, (_, j) => (
                        <span key={j} style={{width: 30, height: 30, borderRadius: 7, background: alpha(C.green, 0.75), display: "inline-block"}} />
                      ))
                    )}
                    <Mono size={30} color={C.text2}>
                      ]
                    </Mono>
                  </div>
                  <div style={{fontFamily: FONT.sans, fontSize: 18, color: C.green, marginTop: 4}}>{a.label}</div>
                </Box>
              );
            })}
            <Box x={0} y={132}>
              <span style={{fontFamily: FONT.sans, fontSize: 15, color: C.text3}}>来源：OpenAI Function Calling 文档 · Handling function calls</span>
            </Box>
          </div>
        )}
      </div>
    </div>
  );
};

// ───────────────────────── S7：数据模型（树）与 HTTP 剖面 ─────────────────────────

const TreeOverlay: React.FC<{t: number; crossDim: number}> = ({t, crossDim}) => {
  const node = outBack(prog(t, T.turnNode, 0.6));
  const links = ease(t, T.links, 1.0);
  const levels = out(prog(t, T.levels, 0.6)) * (1 - ease(t, T.cross, 0.6));
  const stamp = outBack(prog(t, T.stampTurn, 0.4));
  if (node <= 0 && levels <= 0) return null;
  const turnBottom = {x: TURN_NODE.x + TURN_NODE.w / 2, y: TURN_NODE.y + TURN_NODE.h};
  const spine = (r: number, ys: number[]) => {
    const x = GEN_CX[r] - 150;
    const last = ys[ys.length - 1];
    return `M${x},510 L${x},${last} ` + ys.map((y) => `M${x},${y} L${x + 20},${y}`).join(" ");
  };
  return (
    <>
      <svg style={{position: "absolute", left: 0, top: 0, overflow: "visible"}} width={3800} height={1080}>
        {GEN_CX.map((cx, r) => (
          <DrawPath
            key={r}
            d={`M${turnBottom.x},${turnBottom.y} C${turnBottom.x},${turnBottom.y + 46} ${cx},${330 - 46} ${cx},330`}
            p={links}
            color={C.violet}
            width={2.5}
            opacity={r === 0 ? 0.9 : 0.9 * crossDim}
          />
        ))}
        <DrawPath d={spine(0, [610, 686, 762])} p={ease(t, T.links + 0.4, 0.8)} color={C.blue} width={2.5} opacity={0.8} />
        <DrawPath d={spine(1, [610, 686])} p={ease(t, T.links + 0.5, 0.8)} color={C.blue} width={2.5} opacity={0.8 * crossDim} />
        <DrawPath d={spine(2, [610])} p={ease(t, T.links + 0.6, 0.8)} color={C.blue} width={2.5} opacity={0.8 * crossDim} />
      </svg>
      {node > 0 && (
        <div
          style={{
            ...abs(TURN_NODE),
            ...cardStyle(C.violet, 0.4),
            background: `linear-gradient(180deg, ${alpha(C.violet, 0.2)}, ${alpha(C.violet, 0.06)})`,
            opacity: clamp01(node) * crossDim,
            transform: `scale(${0.7 + 0.3 * node})`,
          }}
        >
          <Box x={22} y={18}>
            <Caps size={16} color={C.violet}>
              Turn
            </Caps>
          </Box>
          <Box x={22} y={50}>
            <span style={{fontFamily: FONT.sans, fontSize: 17, color: C.text2}}>一次用户任务</span>
          </Box>
          <Box x={230} y={30} w={150} style={{textAlign: "right", opacity: clamp01(stamp), transform: `scale(${0.6 + 0.4 * stamp})`, transformOrigin: "right center"}}>
            <Mono size={20} color={C.text}>
              turn_01
            </Mono>
          </Box>
        </div>
      )}
      {/* 左侧：三层实体 + 内部 ID（原文的表） */}
      {[
        {y: 164, name: "Turn", id: "turn_id", color: C.violet, desc: "一次用户任务"},
        {y: 384, name: "Generation", id: "generation_id", color: C.blue, desc: "一次模型响应"},
        {y: 628, name: "ToolCall", id: "tool_execution_id", color: C.green, desc: "一次工具执行"},
      ].map((l, i) => {
        const p = out(prog(t, T.levels + i * 0.15, 0.5)) * (1 - ease(t, T.cross, 0.6));
        if (p <= 0) return null;
        return (
          <Box key={i} x={920} y={l.y} w={330} style={{opacity: p, transform: `translateX(${(1 - p) * -16}px)`}}>
            <div style={{fontFamily: FONT.sans, fontSize: 30, fontWeight: 750, color: l.color}}>{l.name}</div>
            <div style={{fontFamily: FONT.mono, fontSize: 16, color: C.text2, marginTop: 6}}>
              {l.id} <span style={{fontFamily: FONT.sans, color: C.text3}}>· {l.desc}</span>
            </div>
          </Box>
        );
      })}
    </>
  );
};

const CrossSection: React.FC<{t: number}> = ({t}) => {
  const p = out(prog(t, T.cross, 0.7));
  if (p <= 0) return null;
  const head = ease(t, T.crossHead, 0.5);
  const body = ease(t, T.crossBody, 0.5);
  const links = ease(t, T.crossLinks, 0.9);
  const X = 220;
  const Y = 190;
  const hdr = ["HTTP/1.1 200 OK", "content-type: application/json", "x-request-id: req_7Kq1…"];
  const bdy = ["{", '  "id": "resp_123",', '  "object": "response",', '  "output": [ … ]', "}"];
  const gen = cardTree(0);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: X,
          top: Y,
          width: 860,
          height: 580,
          ...solidPanel(),
          opacity: p,
          transform: `translateX(${(1 - p) * -30}px)`,
        }}
      >
        <Box x={24} y={20}>
          <Caps size={15} color={C.text2}>
            一次 HTTP 响应的剖面
          </Caps>
        </Box>
        <div style={{position: "absolute", left: 24, top: 60, width: 812, height: 176, borderRadius: 14, background: alpha(C.amber, 0.07), border: `1px solid ${alpha(C.amber, 0.35)}`}}>
          <Box x={20} y={14}>
            <Caps size={13} color={C.amber}>
              Headers · 定位这次 HTTP 请求
            </Caps>
          </Box>
          {hdr.map((l, i) => (
            <Box key={i} x={20} y={48 + i * 38}>
              <Mono
                size={19}
                color={i === 2 ? C.amber : C.text2}
                style={i === 2 ? {background: alpha(C.amber, 0.18 * head), boxShadow: `0 0 0 4px ${alpha(C.amber, 0.18 * head)}`, borderRadius: 5} : undefined}
              >
                {l}
              </Mono>
            </Box>
          ))}
        </div>
        <div style={{position: "absolute", left: 24, top: 254, width: 812, height: 302, borderRadius: 14, background: alpha(C.blue, 0.07), border: `1px solid ${alpha(C.blue, 0.35)}`}}>
          <Box x={20} y={14}>
            <Caps size={13} color={C.blue}>
              Body · Response 对象
            </Caps>
          </Box>
          {bdy.map((l, i) => (
            <Box key={i} x={20} y={48 + i * 46}>
              <Mono
                size={19}
                color={i === 1 ? C.blue : C.text2}
                style={i === 1 ? {background: alpha(C.blue, 0.18 * body), boxShadow: `0 0 0 4px ${alpha(C.blue, 0.18 * body)}`, borderRadius: 5} : undefined}
              >
                {l}
              </Mono>
            </Box>
          ))}
        </div>
      </div>
      {/* Generation 1 上的两个 ID，分别连到 Header 和 Body：交叉，不是同一层 */}
      <svg style={{position: "absolute", left: 0, top: 0, overflow: "visible"}} width={3800} height={1080}>
        <DrawPath d={`M${gen.x},${gen.y + 146} C${gen.x - 90},${gen.y + 146} ${X + 900},${Y + 60 + 48 + 2 * 38 + 12} ${X + 862},${Y + 60 + 48 + 2 * 38 + 12}`} p={links} color={C.amber} width={2.5} glow />
        <DrawPath d={`M${gen.x},${gen.y + 106} C${gen.x - 90},${gen.y + 106} ${X + 900},${Y + 254 + 48 + 46 + 12} ${X + 862},${Y + 254 + 48 + 46 + 12}`} p={ease(t, T.crossLinks + 0.3, 0.9)} color={C.blue} width={2.5} glow />
      </svg>
    </>
  );
};

// ───────────────────────── 组装 ─────────────────────────

export const TrackZone: React.FC<{t: number}> = ({t}) => {
  const zo = zoneOpacity("track", t);
  if (t < T.lanes - 0.5) return null;
  const treeFade = ease(t, T.tree - 0.2, 1.0);
  const pj = ease(t, T.jsonOpen, 1.2) * (1 - ease(t, T.jsonClose, 1.0));
  const hideCard0 = clamp01(pj * 5);
  const crossDim = 1 - 0.7 * ease(t, T.cross, 0.6);
  return (
    <div style={{position: "absolute", left: ZONE.track.x, top: ZONE.track.y, width: 3800, height: 1080, opacity: zo}}>
      <Lanes t={t} fade={treeFade} />
      <TurnBracket t={t} fade={treeFade} />
      <UserBubble t={t} fade={treeFade} />
      {[0, 1, 2].map((r) => (
        <React.Fragment key={r}>
          <RequestArrow t={t} r={r} fade={treeFade} />
          <RequestPill t={t} r={r} fade={treeFade} />
        </React.Fragment>
      ))}
      <TreeOverlay t={t} crossDim={crossDim} />
      {[0, 1, 2].map((r) => (
        <ResponseCard key={r} t={t} r={r} hideForJson={r === 0 ? hideCard0 : 0} dim={r === 0 ? 1 : crossDim} />
      ))}
      {CHIPS.map((c, idx) => (
        <ChipCard key={c.call} t={t} c={c} idx={idx} dim={c.r === 0 ? 1 : crossDim} />
      ))}
      {CHIPS.map((c) => (
        <ResultPacket key={c.call} t={t} c={c} />
      ))}
      <AnswerBubble t={t} dim={crossDim} />
      <LoopTrace t={t} />
      <CrossSection t={t} />
      {pj > 0.001 && <JsonPanel t={t} pj={pj} />}
    </div>
  );
};
