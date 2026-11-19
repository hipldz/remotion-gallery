import React from "react";
import {ZONE, zoneAlpha} from "../zones";
import {C, FONT, alpha} from "../theme";
import {bezierPath, clamp01, easeInOut, outBack, outCubic, prog} from "../motion";
import {ArrowDefs, Caps, Chip, Dot, Icon, Mono, Path, Svg} from "../ui";
import {EXAMPLE, EXEC, type ResponseData} from "../data";

/* ------------------------------- 布局常量 ------------------------------- */

const COL = [880, 2020, 3160];
const CARD = {w: 430, h: 290, y: 250};
const EXEC_Y = [686, 742, 798];
const JSON_RECT = {x: 600, y: 236, w: 700, h: 642};
const CARD1_RECT = {x: COL[0] - CARD.w / 2, y: CARD.y, w: CARD.w, h: CARD.h};

const T = {
  turnBracket: 30.6,
  card1: 31.6,
  calls: [32.3, 32.7, 33.1],
  card2: 43.2,
  card3: 47.2,
  answer: 49.4,
  pullback: 54.6,
  loopLabel: 58.6,
  jsonStart: 64.5,
  jsonDone: 66.4,
  jsonVars: 68.6,
  spine: 74.8,
  zeroOneMany: 82.6,
  treeStart: 126.2,
  ids: 130.4,
  providers: 139.2,
  cutaway: 139.4,
};

/* --------------------------------- 基础层 -------------------------------- */

const TurnBracket: React.FC<{t: number}> = ({t}) => {
  const p = outCubic(prog(t, T.turnBracket, 1.4));
  return (
    <>
      <Svg x={120} y={96} w={3480} h={80}>
        <Path d="M 0 44 H 3460" color={alpha(C.violet, 0.5)} width={1.5} draw={p} />
        <Path d="M 0 30 V 58" color={alpha(C.violet, 0.5)} width={1.5} draw={p} />
        <Path d="M 3460 30 V 58" color={alpha(C.violet, 0.5)} width={1.5} draw={p} />
      </Svg>
      <div style={{position: "absolute", left: 140, top: 74, opacity: p, display: "flex", alignItems: "center", gap: 8}}>
        <Chip color={C.violet} size={10.5}>1 个 Turn</Chip>
        <Mono size={11} color={C.muted}>一次完整的用户任务</Mono>
      </div>
    </>
  );
};

const Lanes: React.FC<{opacity: number}> = ({opacity}) => (
  <div style={{opacity}}>
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 190,
        width: 3480,
        height: 402,
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.055)",
        background: "rgba(255,255,255,0.014)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 630,
        width: 3480,
        height: 300,
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.055)",
        background: "rgba(255,255,255,0.01)",
      }}
    />
    <div style={{position: "absolute", left: 144, top: 204, display: "flex", gap: 10, alignItems: "center"}}>
      <Caps size={10} color={alpha(C.blue, 0.8)}>模型侧</Caps>
      <Mono size={11} color={C.faint}>一次 Response 可以带多个 Tool Call</Mono>
    </div>
    <div style={{position: "absolute", left: 144, top: 646, display: "flex", gap: 10, alignItems: "center"}}>
      <Caps size={10} color={alpha(C.green, 0.8)}>应用侧</Caps>
      <Mono size={11} color={C.faint}>逐个执行，再带着结果发起下一次 Request</Mono>
    </div>
  </div>
);

/* ------------------------------- Response 卡 ----------------------------- */

const ResponseCard: React.FC<{
  r: ResponseData;
  x: number;
  y: number;
  w: number;
  h: number;
  t: number;
  callsIn: number[];
  bodyOpacity: number;
  jsonOpacity: number;
  dim?: number;
}> = ({r, x, y, w, h, t, callsIn, bodyOpacity, jsonOpacity, dim = 1}) => {
  const appear = outBack(clamp01((t - (r.index === 1 ? T.card1 : r.index === 2 ? T.card2 : T.card3)) / 0.6), 1.2);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 18,
        border: `1px solid ${alpha(C.blue, 0.32 + 0.1 * dim)}`,
        background: "linear-gradient(180deg, rgba(92,169,255,0.10) 0%, rgba(255,255,255,0.02) 46%, rgba(255,255,255,0.01) 100%)",
        boxShadow: `0 26px 60px rgba(0,0,0,0.5), 0 0 40px ${alpha(C.blue, 0.06)}`,
        opacity: appear * dim,
        transform: `translateY(${(1 - appear) * -22}px)`,
        overflow: "hidden",
      }}
    >
      <div style={{height: 52, display: "flex", alignItems: "center", gap: 9, padding: "0 18px", borderBottom: `1px solid ${alpha(C.blue, 0.14)}`, opacity: bodyOpacity}}>
        <Dot color={C.blue} size={7} glow />
        <div style={{fontFamily: FONT.sans, fontSize: 14.5, fontWeight: 600, color: C.ink}}>Response #{r.index}</div>
        <Mono size={11} color={alpha(C.blue, 0.85)} style={{marginLeft: "auto"}}>{r.id}</Mono>
      </div>

      <div style={{opacity: bodyOpacity}}>
        {r.kind === "tool_calls" ? (
          <div style={{padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8}}>
            {r.calls.map((call, i) => {
              const p = outBack(clamp01((t - (callsIn[i] ?? 99)) / 0.5), 1.4);
              return (
                <div
                  key={call.callId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    height: Math.min(64, (h - 84) / r.calls.length - 8),
                    padding: "0 10px",
                    borderRadius: 10,
                    background: alpha(C.green, 0.07),
                    border: `1px solid ${alpha(C.green, 0.18)}`,
                    opacity: clamp01(p),
                    transform: `translateY(${(1 - clamp01(p)) * 10}px)`,
                  }}
                >
                  <Icon name="fn" size={13} color={C.green} />
                  <div style={{minWidth: 0}}>
                    <Mono size={12.5} color={C.ink}>{call.name}</Mono>
                    <Mono size={11} color={C.faint} style={{marginLeft: 8}}>{call.arg}</Mono>
                  </div>
                  <Mono size={10} color={alpha(C.green, 0.8)} style={{marginLeft: "auto"}}>{call.callId}</Mono>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{padding: "16px 18px"}}>
            <div style={{display: "flex", alignItems: "center", gap: 8}}>
              <Icon name="spark" size={14} color={C.blue} />
              <Mono size={11} color={alpha(C.blue, 0.85)}>message</Mono>
            </div>
            <div style={{marginTop: 12, fontFamily: FONT.sans, fontSize: 18, lineHeight: 1.6, color: C.soft}}>
              {r.text}
            </div>
          </div>
        )}
      </div>

      {/* JSON（只在 S4 出现） */}
      <div style={{position: "absolute", inset: 0, opacity: jsonOpacity}}>
        <JsonBody />
      </div>

      <div style={{position: "absolute", left: 18, bottom: 10, opacity: bodyOpacity * 0.75}}>
        <Mono size={9.5} color={C.faint}>
          {r.kind === "tool_calls" ? `${r.calls.length} 个 output item` : "1 个 message item"}
        </Mono>
      </div>
    </div>
  );
};

/* --------------------------------- JSON --------------------------------- */

type Tok = {s: string; c?: string; hi?: "blue" | "green" | "amber"};

const L = {
  p: C.faint,
  k: C.muted,
  s: C.soft,
};

const JSON_LINES: Tok[][] = [
  [{s: "{", c: L.p}],
  [{s: "  ", c: L.p}, {s: '"id"', c: L.k}, {s: ": ", c: L.p}, {s: '"resp_123"', c: C.blue, hi: "blue"}, {s: ",", c: L.p}],
  [{s: "  ", c: L.p}, {s: '"object"', c: L.k}, {s: ": ", c: L.p}, {s: '"response"', c: L.s}, {s: ",", c: L.p}],
  [{s: "  ", c: L.p}, {s: '"output"', c: C.amber, hi: "amber"}, {s: ": [", c: L.p}],
  [{s: "    {", c: L.p}],
  [{s: "      ", c: L.p}, {s: '"type"', c: L.k}, {s: ": ", c: L.p}, {s: '"function_call"', c: L.s}, {s: ",", c: L.p}],
  [{s: "      ", c: L.p}, {s: '"call_id"', c: L.k}, {s: ": ", c: L.p}, {s: '"call_001"', c: C.green, hi: "green"}, {s: ",", c: L.p}],
  [{s: "      ", c: L.p}, {s: '"name"', c: L.k}, {s: ": ", c: L.p}, {s: '"read_file"', c: L.s}, {s: ",", c: L.p}],
  [{s: "      ", c: L.p}, {s: '"arguments"', c: L.k}, {s: ": ", c: L.p}, {s: '"{\\"path\\":\\"src/app.ts\\"}"', c: L.s}],
  [{s: "    },", c: L.p}],
  [{s: "    {", c: L.p}],
  [{s: "      ", c: L.p}, {s: '"type"', c: L.k}, {s: ": ", c: L.p}, {s: '"function_call"', c: L.s}, {s: ",", c: L.p}],
  [{s: "      ", c: L.p}, {s: '"call_id"', c: L.k}, {s: ": ", c: L.p}, {s: '"call_002"', c: C.green, hi: "green"}, {s: ",", c: L.p}],
  [{s: "      ", c: L.p}, {s: '"name"', c: L.k}, {s: ": ", c: L.p}, {s: '"read_file"', c: L.s}, {s: ",", c: L.p}],
  [{s: "      ", c: L.p}, {s: '"arguments"', c: L.k}, {s: ": ", c: L.p}, {s: '"{\\"path\\":\\"src/router.ts\\"}"', c: L.s}],
  [{s: "    },", c: L.p}],
  [{s: "    {", c: L.p}],
  [{s: "      ", c: L.p}, {s: '"type"', c: L.k}, {s: ": ", c: L.p}, {s: '"function_call"', c: L.s}, {s: ",", c: L.p}],
  [{s: "      ", c: L.p}, {s: '"call_id"', c: L.k}, {s: ": ", c: L.p}, {s: '"call_003"', c: C.green, hi: "green"}],
  [{s: "    }", c: L.p}],
  [{s: "  ]", c: L.p}],
  [{s: "}", c: L.p}],
];

const LINE_H = 22;

const JsonBody: React.FC = () => (
  <>
    <div style={{height: 52, display: "flex", alignItems: "center", gap: 9, padding: "0 18px", borderBottom: `1px solid ${alpha(C.blue, 0.14)}`}}>
      <Dot color={C.blue} size={7} glow />
      <div style={{fontFamily: FONT.sans, fontSize: 14.5, fontWeight: 600, color: C.ink}}>Response #1</div>
      <Mono size={10.5} color={alpha(C.blue, 0.9)} style={{marginLeft: "auto"}}>resp_123</Mono>
    </div>
    <div style={{position: "absolute", left: 36, top: 56, right: 18, fontFamily: FONT.mono, fontSize: 13.5, lineHeight: `${LINE_H}px`}}>
      {JSON_LINES.map((line, i) => (
        <div key={i} style={{height: LINE_H, whiteSpace: "pre"}}>
          {line.map((tk, j) => (
            <span
              key={j}
              style={{
                color: tk.c,
                background:
                  tk.hi === "blue"
                    ? alpha(C.blue, 0.18)
                    : tk.hi === "green"
                      ? alpha(C.green, 0.16)
                      : undefined,
                borderRadius: tk.hi ? 4 : 0,
                borderBottom: tk.hi === "amber" ? `1px dashed ${alpha(C.amber, 0.8)}` : undefined,
                paddingBottom: tk.hi === "amber" ? 1 : 0,
              }}
            >
              {tk.s}
            </span>
          ))}
        </div>
      ))}
    </div>
  </>
);

/* ------------------------------ JSON 右侧说明 ---------------------------- */

const JSON_CARDS = [
  {k: "response.id", c: C.blue, d: "标识整个 Response。一次响应只有一个。"},
  {k: "output", c: C.amber, d: "模型返回的 Item 列表，可以有多个 function_call。"},
  {k: "call_id", c: C.green, d: "标识具体的工具调用，回传结果时用它配对。"},
];

const JsonNotes: React.FC<{t: number}> = ({t}) => {
  const p = prog(t, T.jsonVars, 1.2);
  const spine = outCubic(prog(t, T.spine, 1.2));
  const fade = 1 - prog(t, 124.2, 1.2);
  return (
    <div style={{position: "absolute", inset: 0, opacity: fade}}>
      {JSON_CARDS.map((c, i) => {
        const at = T.jsonVars + i * 0.18;
        const pp = outCubic(clamp01((t - at) / 0.55));
        return (
          <div
            key={c.k}
            style={{
              position: "absolute",
              left: 1340,
              top: 250 + i * 148,
              width: 460,
              height: 128,
              opacity: clamp01(pp) * p,
              transform: `translateX(${(1 - clamp01(pp)) * 18}px)`,
              borderRadius: 12,
              border: `1px solid ${alpha(c.c, 0.26)}`,
              background: `linear-gradient(180deg, ${alpha(c.c, 0.07)}, rgba(255,255,255,0.01))`,
              padding: "14px 16px",
            }}
          >
            <Mono size={13} color={c.c} weight={600}>{c.k}</Mono>
            <div style={{marginTop: 8, fontFamily: FONT.sans, fontSize: 14, lineHeight: 1.55, color: C.soft}}>{c.d}</div>
          </div>
        );
      })}

      {/* 蓝色脊线：三个 call_id 挂在同一个 id 上 */}
      <Svg x={600} y={236} w={700} h={642}>
        <Path d="M 16 80 V 470" color={alpha(C.blue, 0.55)} width={1.5} draw={spine} />
        {[89, 199, 331, 463].map((y) => (
          <Path key={y} d={`M 16 ${y} H 30`} color={alpha(C.blue, 0.65)} width={1.5} draw={spine} />
        ))}
      </Svg>

      {/* 零个 / 一个 / 多个 */}
      <div style={{position: "absolute", left: 1340, top: 706, width: 460, opacity: outCubic(prog(t, T.zeroOneMany, 0.8))}}>
        <Caps size={9.5} color={C.faint}>官方文档：一次响应可以返回</Caps>
        <div style={{display: "flex", gap: 8, marginTop: 10}}>
          {["", "■", "■■■"].map((box, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 64,
                borderRadius: 9,
                border: `1px solid ${alpha(C.green, 0.24)}`,
                background: alpha(C.green, 0.06),
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
              }}
            >
              <Mono size={13} color={alpha(C.green, 0.95)}>[{box}]</Mono>
              <Mono size={10} color={C.muted}>{["零个", "一个", "多个"][i]}</Mono>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------- 数据模型 -------------------------------- */

const GENS = [
  {x: 1700, label: "Generation 1", id: "gen_01", resp: "resp_123"},
  {x: 2320, label: "Generation 2", id: "gen_02", resp: "resp_456"},
  {x: 2940, label: "Generation 3", id: "gen_03", resp: "resp_789"},
];

const ModelTree: React.FC<{t: number}> = ({t}) => {
  const p = outCubic(prog(t, T.treeStart, 1.6));
  if (p <= 0) return null;
  const idP = outCubic(prog(t, T.ids, 1.2));
  const provP = outCubic(prog(t, T.providers, 1.0));

  return (
    <div style={{opacity: p}}>
      {/* 连接线 */}
      <Svg x={0} y={0} w={3800} h={1080}>
        <Path d="M 2480 296 V 322 M 1940 322 H 3180 M 1940 322 V 352 M 2560 322 V 352 M 3180 322 V 352" color={alpha(C.violet, 0.3)} width={1.4} draw={p} />
        <Path d="M 1940 502 V 540 M 1940 592 V 600 M 1940 652 V 660" color={alpha(C.blue, 0.28)} width={1.3} draw={p} />
        <Path d="M 2560 502 V 540 M 2560 592 V 600" color={alpha(C.blue, 0.28)} width={1.3} draw={p} />
        <Path d="M 3180 502 V 540" color={alpha(C.blue, 0.28)} width={1.3} draw={p} />

        {/* Provider ID 的两根交叉线 */}
        {provP > 0.2 && (
          <>
            <Path d="M 1940 502 C 1900 600, 1900 700, 1880 770" color={alpha(C.amber, 0.55)} width={1.6} draw={clamp01((provP - 0.2) / 0.8)} dashed />
            <Path d="M 1940 502 C 2260 620, 2400 700, 2480 772" color={alpha(C.blue, 0.55)} width={1.6} draw={clamp01((provP - 0.2) / 0.8)} dashed />
          </>
        )}
      </Svg>

      {/* Turn 节点 */}
      <div
        style={{
          position: "absolute",
          left: 2200,
          top: 210,
          width: 560,
          height: 86,
          borderRadius: 12,
          border: `1px solid ${alpha(C.violet, 0.36)}`,
          background: `linear-gradient(180deg, ${alpha(C.violet, 0.12)}, rgba(255,255,255,0.015))`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 16px",
        }}
      >
        <Icon name="cube" size={15} color={C.violet} />
        <div>
          <div style={{fontFamily: FONT.sans, fontSize: 14.5, fontWeight: 600, color: C.ink}}>Turn</div>
          <Mono size={10.5} color={C.faint}>一次完整的用户任务</Mono>
        </div>
        <div style={{marginLeft: "auto", opacity: idP, transform: `scale(${0.9 + 0.1 * idP})`}}>
          <Chip color={C.violet} size={10}>turn_01</Chip>
        </div>
      </div>

      {/* Generation 节点 */}
      {GENS.map((g, i) => {
        const gp = outBack(clamp01((p - i * 0.12) / 0.7), 1.2);
        const calls = EXAMPLE.responses[i]?.calls ?? [];
        return (
          <React.Fragment key={g.id}>
            <div
              style={{
                position: "absolute",
                left: g.x,
                top: 352,
                width: 480,
                height: 150,
                borderRadius: 12,
                border: `1px solid ${alpha(C.blue, 0.32)}`,
                background: `linear-gradient(180deg, ${alpha(C.blue, 0.1)}, rgba(255,255,255,0.015))`,
                padding: "12px 16px",
                opacity: clamp01(gp),
                transform: `translateY(${(1 - clamp01(gp)) * 12}px)`,
              }}
            >
              <div style={{display: "flex", alignItems: "center", gap: 8}}>
                <Dot color={C.blue} size={6} />
                <div style={{fontFamily: FONT.sans, fontSize: 13.5, fontWeight: 600, color: C.ink}}>{g.label}</div>
                <Mono size={10} color={C.faint} style={{marginLeft: "auto"}}>POST /v1/responses</Mono>
              </div>
              <div style={{marginTop: 10, display: "flex", alignItems: "center", gap: 8}}>
                <Mono size={11} color={alpha(C.blue, 0.9)}>{g.resp}</Mono>
                {provP > 0 && (
                  <span style={{opacity: provP, transform: `translateY(${(1 - provP) * 4}px)`, display: "inline-flex"}}>
                    <Chip color={C.blue} size={9.5}>response.id</Chip>
                  </span>
                )}
              </div>
              <div style={{position: "absolute", left: 16, bottom: 36}}>
                <Mono size={9.5} color={C.faint}>
                  {i === 2 ? "output: message" : `output: ${calls.length} × function_call`}
                </Mono>
              </div>
              <div style={{position: "absolute", left: 16, bottom: 10, opacity: idP}}>
                <Mono size={10} color={C.muted}>{g.id}</Mono>
              </div>
            </div>

            {calls.map((call, k) => {
              const cp = outCubic(clamp01((t - (T.treeStart + 0.5 + i * 0.16 + k * 0.08)) / 0.5));
              return (
                <div
                  key={call.callId}
                  style={{
                    position: "absolute",
                    left: g.x,
                    top: 542 + k * 60,
                    width: 480,
                    height: 50,
                    borderRadius: 9,
                    border: `1px solid ${alpha(C.green, 0.24)}`,
                    background: alpha(C.green, 0.055),
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "0 12px",
                    opacity: cp,
                  }}
                >
                  <Icon name="fn" size={12} color={C.green} />
                  <Mono size={11.5} color={C.ink}>{call.name}</Mono>
                  <Mono size={10} color={alpha(C.green, 0.8)}>{call.callId}</Mono>
                  <div style={{marginLeft: "auto", display: "flex", alignItems: "center", gap: 8}}>
                    {provP > 0 && (
                      <span style={{opacity: provP}}>
                        <Mono size={9.5} color={C.faint}>call_id</Mono>
                      </span>
                    )}
                    <Mono size={9.5} color={C.muted} style={{opacity: idP}}>{call.execId}</Mono>
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        );
      })}

      {/* 第三个 Generation 的输出是 message */}
      <div
        style={{
          position: "absolute",
          left: 2940,
          top: 542,
          width: 480,
          height: 68,
          borderRadius: 9,
          border: `1px solid ${alpha(C.blue, 0.22)}`,
          background: alpha(C.blue, 0.05),
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "0 12px",
          opacity: outCubic(clamp01((t - T.treeStart - 1.1) / 0.6)),
        }}
      >
        <Icon name="spark" size={13} color={C.blue} />
        <div>
          <Mono size={11} color={C.soft}>message</Mono>
          <div style={{fontFamily: FONT.sans, fontSize: 10.5, color: C.faint, marginTop: 2}}>最终回答</div>
        </div>
        <div style={{marginLeft: "auto", opacity: provP}}>
          <Chip color={C.blue} size={9.5}>resp_789</Chip>
        </div>
      </div>

      {/* HTTP 剖面 */}
      <HttpCutaway t={t} />
    </div>
  );
};

/* ------------------------------- HTTP 剖面 ------------------------------- */

const HttpCutaway: React.FC<{t: number}> = ({t}) => {
  const p = outCubic(prog(t, T.cutaway, 1.0));
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 1700,
        top: 770,
        width: 1720,
        height: 240,
        borderRadius: 14,
        border: `1px solid ${C.line}`,
        background: "rgba(10,13,20,0.9)",
        opacity: p,
        transform: `translateY(${(1 - p) * 16}px)`,
        overflow: "hidden",
      }}
    >
      <div style={{height: 40, borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 10, padding: "0 16px"}}>
        <Icon name="globe" size={13} color={C.amber} />
        <Mono size={11} color={C.soft}>一次 HTTP 响应</Mono>
        <Mono size={10} color={C.faint} style={{marginLeft: "auto"}}>同一件事的两个 ID，不在同一层</Mono>
      </div>
      <div style={{display: "flex", height: 200}}>
        <div style={{width: "50%", padding: "18px 20px", borderRight: `1px solid ${C.line}`}}>
          <Caps size={9.5} color={alpha(C.amber, 0.85)}>Headers</Caps>
          <div style={{marginTop: 12, display: "flex", flexDirection: "column", gap: 8}}>
            <Mono size={12.5} color={C.ink}>
              x-request-id: <span style={{color: C.amber}}>req_7Kq1…9f</span>
            </Mono>
            <Mono size={10.5} color={C.faint}>定位这一次 HTTP 请求，用于排错</Mono>
          </div>
        </div>
        <div style={{width: "50%", padding: "18px 20px"}}>
          <Caps size={9.5} color={alpha(C.blue, 0.85)}>Body</Caps>
          <div style={{marginTop: 12, display: "flex", flexDirection: "column", gap: 8}}>
            <Mono size={12.5} color={C.ink}>
              "id": <span style={{color: C.blue}}>"resp_123"</span>
            </Mono>
            <Mono size={10.5} color={C.faint}>标识 Response 对象，用于关联输出</Mono>
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: "46%",
          top: 42,
          bottom: 0,
          width: 1,
          background: `linear-gradient(180deg, ${alpha(C.red, 0.5)}, transparent)`,
        }}
      />
      <div style={{position: "absolute", left: "47%", top: 108}}>
        <Chip color={C.red} size={10}>不是一回事</Chip>
      </div>
    </div>
  );
};

/* --------------------------------- 主区域 -------------------------------- */

export const TrackZone: React.FC<{t: number}> = ({t}) => {
  const baseFade = 1 - prog(t, T.treeStart - 0.6, 1.5);
  const laneFade = 1 - prog(t, T.jsonStart, 1.1);
  const cardDim = t > T.jsonStart && t < 108 ? 0.16 : 1;
  const morph = easeInOut(prog(t, T.jsonStart + 0.2, 1.8));
  const cardRect = {
    x: CARD1_RECT.x + (JSON_RECT.x - CARD1_RECT.x) * morph,
    y: CARD1_RECT.y + (JSON_RECT.y - CARD1_RECT.y) * morph,
    w: CARD1_RECT.w + (JSON_RECT.w - CARD1_RECT.w) * morph,
    h: CARD1_RECT.h + (JSON_RECT.h - CARD1_RECT.h) * morph,
  };
  const jsonIn = prog(t, T.jsonStart + 0.9, 0.9);
  const cardBodyOut = 1 - prog(t, T.jsonStart + 0.05, 0.5);

  const r1 = EXAMPLE.responses[0];
  const r2 = EXAMPLE.responses[1];
  const r3 = EXAMPLE.responses[2];

  return (
    <div
      style={{
        position: "absolute",
        left: ZONE.track.x,
        top: ZONE.track.y,
        width: ZONE.track.w,
        height: ZONE.track.h,
        opacity: zoneAlpha("track", t),
      }}
    >
      <div style={{opacity: baseFade}}>
        <TurnBracket t={t} />
        <Lanes opacity={laneFade} />
      </div>

      {/* 用户消息 */}
      <div
        style={{
          position: "absolute",
          left: 148,
          top: 700,
          width: 360,
          opacity: outCubic(prog(t, 30.2, 0.7)) * baseFade * laneFade,
          borderRadius: 12,
          border: `1px solid ${alpha(C.violet, 0.28)}`,
          background: alpha(C.violet, 0.1),
          padding: "12px 14px",
        }}
      >
        <div style={{display: "flex", alignItems: "center", gap: 8}}>
          <Icon name="agent" size={13} color={C.violet} />
          <Caps size={9} color={alpha(C.violet, 0.9)}>User</Caps>
        </div>
        <div style={{marginTop: 6, fontFamily: FONT.sans, fontSize: 14, color: C.ink}}>分析一下这个项目</div>
      </div>

      {/* Request #1 */}
      <RequestChip t={t} i={1} x={COL[0] - 62} y={578} opacity={1 - prog(t, T.jsonStart, 0.8)} />
      <RequestChip t={t} i={2} x={COL[1] - 62} y={578} opacity={1 - prog(t, T.jsonStart, 0.8)} />
      <RequestChip t={t} i={3} x={COL[2] - 62} y={578} opacity={1 - prog(t, T.jsonStart, 0.8)} />

      {/* 三张 Response 卡 */}
      <ResponseCard
        r={r1}
        x={cardRect.x}
        y={cardRect.y}
        w={cardRect.w}
        h={cardRect.h}
        t={t}
        callsIn={T.calls}
        bodyOpacity={cardBodyOut}
        jsonOpacity={jsonIn}
        dim={baseFade}
      />
      <ResponseCard
        r={r2}
        x={COL[1] - CARD.w / 2}
        y={CARD.y}
        w={CARD.w}
        h={CARD.h}
        t={t}
        callsIn={[44.0, 44.4]}
        bodyOpacity={1}
        jsonOpacity={0}
        dim={cardDim * baseFade}
      />
      <ResponseCard
        r={r3}
        x={COL[2] - CARD.w / 2}
        y={CARD.y}
        w={CARD.w}
        h={CARD.h}
        t={t}
        callsIn={[]}
        bodyOpacity={1}
        jsonOpacity={0}
        dim={cardDim * baseFade}
      />

      {/* 应用侧执行 */}
      <div style={{opacity: laneFade}}>
        {r1.calls.map((call, i) => {
          const start = EXEC.start[i] ?? 99;
          const done = EXEC.done[i] ?? 99;
          const p = clamp01((t - start) / (done - start));
          const isDone = t >= done;
          return (
            <div
              key={call.callId}
              style={{
                position: "absolute",
                left: COL[0] - 210,
                top: EXEC_Y[i],
                width: 420,
                height: 48,
                borderRadius: 9,
                border: `1px solid ${alpha(C.green, isDone ? 0.3 : 0.16)}`,
                background: isDone ? alpha(C.green, 0.07) : "rgba(255,255,255,0.02)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "0 12px",
                opacity: outCubic(prog(t, start - 0.3, 0.4)),
              }}
            >
              <Icon name="fn" size={12} color={C.green} />
              <Mono size={11} color={C.soft}>{call.name}</Mono>
              <div style={{flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden"}}>
                <div style={{width: `${p * 100}%`, height: 4, background: isDone ? C.green : alpha(C.green, 0.6)}} />
              </div>
              <Mono size={9.5} color={isDone ? alpha(C.green, 0.9) : C.faint}>
                {isDone ? `output · ${call.callId}` : "running"}
              </Mono>
            </div>
          );
        })}

        {r2.calls.map((call, i) => {
          const start = 44.6 + i * 0.3;
          const done = 45.4 + i * 0.3;
          const p = clamp01((t - start) / (done - start));
          const isDone = t >= done;
          return (
            <div
              key={call.callId}
              style={{
                position: "absolute",
                left: COL[1] - 210,
                top: EXEC_Y[i],
                width: 420,
                height: 48,
                borderRadius: 9,
                border: `1px solid ${alpha(C.green, isDone ? 0.3 : 0.16)}`,
                background: isDone ? alpha(C.green, 0.07) : "rgba(255,255,255,0.02)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "0 12px",
                opacity: outCubic(prog(t, start - 0.3, 0.4)),
              }}
            >
              <Icon name="fn" size={12} color={C.green} />
              <Mono size={11} color={C.soft}>{call.name}</Mono>
              <div style={{flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden"}}>
                <div style={{width: `${p * 100}%`, height: 4, background: C.green}} />
              </div>
              <Mono size={9.5} color={isDone ? alpha(C.green, 0.9) : C.faint}>
                {isDone ? `output · ${call.callId}` : "running"}
              </Mono>
            </div>
          );
        })}

        {/* 最终回答 */}
        <div
          style={{
            position: "absolute",
            left: COL[2] - 210,
            top: 686,
            width: 420,
            height: 118,
            borderRadius: 12,
            border: `1px solid ${alpha(C.blue, 0.3)}`,
            background: alpha(C.blue, 0.08),
            padding: "14px 16px",
            opacity: outCubic(prog(t, T.answer, 0.6)),
          }}
        >
          <div style={{display: "flex", alignItems: "center", gap: 8}}>
            <Icon name="spark" size={13} color={C.blue} />
            <Mono size={10.5} color={alpha(C.blue, 0.9)}>message · 最终回答</Mono>
          </div>
          <div style={{marginTop: 8, fontFamily: FONT.sans, fontSize: 14, lineHeight: 1.5, color: C.ink}}>
            {EXAMPLE.answer}
          </div>
        </div>
      </div>

      {/* 结果回传的弧线 */}
      <Svg x={0} y={0} w={3800} h={1080}>
        <ArrowDefs color={alpha(C.green, 0.8)} id="ret-arrow" />
        {[0, 1, 2].map((i) => {
          const d = bezierPath(
            [COL[0] + 210, EXEC_Y[i] + 24],
            [COL[0] + 420, EXEC_Y[i] + 10],
            [COL[1] - 300, 600],
            [COL[1] - 62, 590],
          );
          const p = clamp01((t - (EXEC.returnStart + i * 0.12)) / 0.9);
          return <Path key={i} d={d} color={alpha(C.green, 0.45)} width={1.4} draw={laneFade * p} dashed />;
        })}
        {[0, 1].map((i) => {
          const d = bezierPath(
            [COL[1] + 210, EXEC_Y[i] + 24],
            [COL[1] + 400, EXEC_Y[i] + 10],
            [COL[2] - 300, 600],
            [COL[2] - 62, 590],
          );
          const p = clamp01((t - (45.6 + i * 0.12)) / 0.9);
          return <Path key={i} d={d} color={alpha(C.green, 0.45)} width={1.4} draw={laneFade * p} dashed />;
        })}
      </Svg>

      {/* Agent Loop 标注 */}
      <div
        style={{
          position: "absolute",
          left: 1900,
          top: 912,
          opacity: outCubic(prog(t, T.loopLabel + 0.2, 0.8)) * baseFade * laneFade,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Chip color={C.violet} size={10.5} filled>Agent Loop</Chip>
        <Mono size={11} color={C.muted}>执行结果回到模型，就是下一次 Generation</Mono>
      </div>

      {/* 环形回路线：从最后一次回答绕回起点 */}
      <Svg x={0} y={0} w={3800} h={1080}>
        <ArrowDefs color={alpha(C.violet, 0.9)} id="loop-arrow" />
        <Path
          d="M 3380 970 C 2860 1150, 1080 1150, 760 970"
          color={alpha(C.violet, 0.5)}
          width={1.8}
          draw={outCubic(prog(t, T.loopLabel + 0.4, 1.4)) * baseFade * laneFade}
          dashed
          arrow
        />
      </Svg>

      {/* S4 JSON 说明 */}
      {t > T.jsonStart && <JsonNotes t={t} />}

      {/* S7 数据模型 */}
      <ModelTree t={t} />
    </div>
  );
};

const RequestChip: React.FC<{t: number; i: number; x: number; y: number; opacity: number}> = ({t, i, x, y, opacity}) => {
  const p = outCubic(prog(t, T.card1 + i * 0.05, 0.5));
  return (
    <div style={{position: "absolute", left: x, top: y, opacity: p * opacity}}>
      <Chip color={C.amber} size={10.5}>
        <Icon name="arrow" size={10} color={C.amber} />
        Request #{i}
      </Chip>
    </div>
  );
};
