// S6：官方 Tracing —— 按原文配图（OpenAI Cookbook 多 Agent Trace）重绘成全片统一的样式。
import React from "react";
import {ZONE, zoneOpacity} from "../timeline";
import {C, FONT, alpha} from "../theme";
import {ease, out, prog} from "../ease";
import {Box, IconBubble, IconChevron, IconCube, IconFn, IconList, IconShuffle, IconWarn, Mono, solidPanel} from "../ui/primitives";

export type SpanKind = "meta" | "agent" | "gen" | "tool" | "handoff" | "error";
type Row = {k: SpanKind; lv: 0 | 1; name: string; dur: string; s: number; d: number};

// 数据来自原文截图（Cookbook: Building Consistent Workflows with Codex CLI & Agents SDK）
export const TRACE_ROWS: Row[] = [
  {k: "meta", lv: 0, name: "List MCP Tools", dur: "2 ms", s: 0, d: 0},
  {k: "agent", lv: 0, name: "Project Manager", dur: "139.95 s", s: 0, d: 139.95},
  {k: "gen", lv: 1, name: "POST /v1/responses", dur: "91.82 s", s: 0, d: 91.82},
  {k: "tool", lv: 1, name: "codex", dur: "45.16 s", s: 91.9, d: 45.16},
  {k: "meta", lv: 1, name: "List MCP Tools", dur: "3 ms", s: 137.1, d: 0},
  {k: "gen", lv: 1, name: "POST /v1/responses", dur: "2,952 ms", s: 137.1, d: 2.95},
  {k: "handoff", lv: 1, name: "Handoff › Designer", dur: "0 ms", s: 140, d: 0},
  {k: "meta", lv: 0, name: "List MCP Tools", dur: "4 ms", s: 140, d: 0},
  {k: "agent", lv: 0, name: "Designer", dur: "102.43 s", s: 140, d: 102.43},
  {k: "gen", lv: 1, name: "POST /v1/responses", dur: "58.47 s", s: 140, d: 58.47},
  {k: "tool", lv: 1, name: "codex", dur: "41.66 s", s: 198.5, d: 41.66},
  {k: "meta", lv: 1, name: "List MCP Tools", dur: "1 ms", s: 240.2, d: 0},
  {k: "gen", lv: 1, name: "POST /v1/responses", dur: "2,304 ms", s: 240.2, d: 2.3},
  {k: "handoff", lv: 1, name: "Handoff › Project Manager", dur: "0 ms", s: 242.5, d: 0},
  {k: "meta", lv: 0, name: "List MCP Tools", dur: "2 ms", s: 242.5, d: 0},
  {k: "agent", lv: 0, name: "Project Manager", dur: "9,534 ms", s: 242.5, d: 9.53},
  {k: "gen", lv: 1, name: "POST /v1/responses", dur: "9,533 ms", s: 242.5, d: 9.53},
  {k: "error", lv: 1, name: "Handoff › Frontend Developer", dur: "0 ms", s: 252, d: 0},
  {k: "meta", lv: 0, name: "List MCP Tools", dur: "2 ms", s: 252, d: 0},
  {k: "agent", lv: 0, name: "Frontend Developer", dur: "142.99 s", s: 252, d: 142.99},
  {k: "gen", lv: 1, name: "POST /v1/responses", dur: "93.58 s", s: 252, d: 93.58},
  {k: "tool", lv: 1, name: "codex", dur: "46.27 s", s: 345.6, d: 46.27},
  {k: "meta", lv: 1, name: "List MCP Tools", dur: "1 ms", s: 391.9, d: 0},
  {k: "gen", lv: 1, name: "POST /v1/responses", dur: "3,138 ms", s: 391.9, d: 3.14},
  {k: "handoff", lv: 1, name: "Handoff › Project Manager", dur: "0 ms", s: 395, d: 0},
];
const TOTAL = 430;

export const TRACE_T = {
  panel: 103.8,
  rows: 104.4,
  gen: 108.4,
  tool: 112.6,
  agent: 117.0,
  stat: 117.4,
};

/** 第 n 个同类行的高亮时间 */
export const hiAt = (kind: "gen" | "tool" | "agent", order: number) =>
  (kind === "gen" ? TRACE_T.gen : kind === "tool" ? TRACE_T.tool : TRACE_T.agent) + order * 0.32;

const PANEL = {x: 140, y: 80, w: 1100};
const HEADER_H = 72;
const ROW_H = 52;

const icon = (k: SpanKind) => {
  switch (k) {
    case "agent":
      return <IconCube size={20} color={C.violet} />;
    case "gen":
      return <IconBubble size={20} color={C.blue} />;
    case "tool":
      return <IconFn size={20} color={C.green} />;
    case "handoff":
      return <IconShuffle size={20} color={C.amber} />;
    case "error":
      return <IconWarn size={20} color={C.red} />;
    default:
      return <IconList size={20} color={C.text3} />;
  }
};

export const TraceZone: React.FC<{t: number}> = ({t}) => {
  const zo = zoneOpacity("trace", t);
  if (t < TRACE_T.panel - 0.6) return null;
  const pp = out(prog(t, TRACE_T.panel, 0.7));
  const order: Record<string, number> = {gen: 0, tool: 0, agent: 0};
  const h = HEADER_H + TRACE_ROWS.length * ROW_H;
  return (
    <div style={{position: "absolute", left: ZONE.trace.x, top: ZONE.trace.y, width: 1920, height: 1700, opacity: zo}}>
      <div style={{position: "absolute", left: PANEL.x, top: PANEL.y + (1 - pp) * 40, width: PANEL.w, height: h, ...solidPanel(), opacity: pp, overflow: "hidden"}}>
        <Box x={28} y={22} style={{display: "flex", alignItems: "center", gap: 14}}>
          <span style={{fontFamily: FONT.sans, fontSize: 24, fontWeight: 700, color: C.text}}>‹ Traces / Agent workflow</span>
          <Mono size={15} color={C.text3}>
            trace_6b7215a09ba8435…
          </Mono>
        </Box>
        <div style={{position: "absolute", left: 0, right: 0, top: HEADER_H - 1, height: 1, background: C.line}} />
        {TRACE_ROWS.map((r, i) => {
          const p = out(prog(t, TRACE_T.rows + i * 0.05, 0.4));
          let hi = 0;
          let color: string = C.text3;
          if (r.k === "gen" || r.k === "tool" || r.k === "agent") {
            const n = order[r.k]++;
            hi = ease(t, hiAt(r.k, n), 0.35);
            color = r.k === "gen" ? C.blue : r.k === "tool" ? C.green : C.violet;
          }
          const y = HEADER_H + i * ROW_H;
          const barX = 730 + (r.s / TOTAL) * 340;
          const barW = Math.max(6, (r.d / TOTAL) * 340);
          const barColor = hi > 0 ? color : r.k === "agent" ? alpha(C.violet, 0.5) : alpha(C.text, 0.35);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                top: y,
                width: PANEL.w,
                height: ROW_H,
                opacity: p,
                transform: `translateX(${(1 - p) * -20}px)`,
                borderBottom: `1px solid ${alpha(C.text, 0.05)}`,
                background: hi > 0 ? alpha(color, (r.k === "agent" ? 0.06 : 0.12) * hi) : "transparent",
                boxShadow: hi > 0 && r.k !== "agent" ? `inset 4px 0 0 ${alpha(color, hi)}` : "none",
              }}
            >
              <Box x={r.lv === 0 ? 20 : 58} y={15} style={{display: "flex", alignItems: "center", gap: 10}}>
                {r.k === "agent" ? <IconChevron size={16} color={C.text3} /> : <span style={{width: r.lv === 0 ? 16 : 0, display: "inline-block"}} />}
                {icon(r.k)}
                <span
                  style={{
                    fontFamily: r.k === "gen" ? FONT.mono : FONT.sans,
                    fontSize: r.k === "gen" ? 17 : 18,
                    color: r.k === "meta" ? C.text3 : C.text,
                    fontWeight: r.k === "agent" ? 650 : 400,
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.name}
                </span>
              </Box>
              <Box x={560} y={15} w={150} style={{textAlign: "right"}}>
                <Mono size={15} color={C.text2}>
                  {r.dur}
                </Mono>
              </Box>
              <div style={{position: "absolute", left: 730, top: 22, width: 340, height: 8, borderRadius: 4, background: alpha(C.text, 0.05)}} />
              <div style={{position: "absolute", left: barX, top: 22, width: barW, height: 8, borderRadius: 4, background: barColor}} />
            </div>
          );
        })}
      </div>
      <Box x={PANEL.x} y={PANEL.y + h + 18} style={{opacity: pp}}>
        <span style={{fontFamily: FONT.sans, fontSize: 15, color: C.text3}}>
          重绘自 OpenAI Cookbook《Building Consistent Workflows with Codex CLI &amp; Agents SDK》中的 Trace 截图（归档示例）
        </span>
      </Box>
    </div>
  );
};
