import React from "react";
import {ZONE, zoneAlpha} from "../zones";
import {C, FONT, alpha} from "../theme";
import {clamp01, outCubic, prog} from "../motion";
import {Caps, Chip, Dot, Icon, Mono} from "../ui";
import {TRACE_ROWS} from "../data";

const PANEL = {x: 50, y: 110, w: 1500, h: 1260};
const ROW_TOP = 154;
const ROW_H = 76;
const BAR_X = 556;
const BAR_W = 806;
const SPAN = 8.9; // 秒

const KIND = {
  gen: {c: C.blue, label: "Generation Span", short: "gen"},
  tool: {c: C.green, label: "Tool Span", short: "tool"},
  agent: {c: C.violet, label: "Agent Span", short: "agent"},
  handoff: {c: C.amber, label: "Handoff", short: "handoff"},
} as const;

const T = {
  rows: 105.2,
  legend: 106.0,
  other: 116.2,
};

export const TraceZone: React.FC<{t: number}> = ({t}) => {
  const gens = TRACE_ROWS.filter((r) => r.kind === "gen").length;
  const tools = TRACE_ROWS.filter((r) => r.kind === "tool").length;

  return (
    <div
      style={{
        position: "absolute",
        left: ZONE.trace.x,
        top: ZONE.trace.y,
        width: ZONE.trace.w,
        height: ZONE.trace.h,
        opacity: zoneAlpha("trace", t),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: PANEL.x,
          top: PANEL.y,
          width: PANEL.w,
          height: PANEL.h,
          borderRadius: 18,
          border: `1px solid ${C.line}`,
          background: "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.01))",
          overflow: "hidden",
        }}
      >
        <div style={{height: 62, display: "flex", alignItems: "center", gap: 10, padding: "0 22px", borderBottom: `1px solid ${C.line}`}}>
          <Icon name="list" size={15} color={C.soft} />
          <div style={{fontFamily: FONT.sans, fontSize: 16, fontWeight: 600, color: C.ink}}>Trace</div>
          <Mono size={11} color={C.faint}>/v1/traces · cookbook 示例重绘</Mono>
          <Chip color={C.violet} size={9.5} style={{marginLeft: "auto"}}>同一个 Turn</Chip>
        </div>

        {/* 时间轴刻度 */}
        {[0, 2, 4, 6, 8].map((s) => (
          <div key={s} style={{position: "absolute", left: BAR_X + (BAR_W * s) / SPAN, top: 68, bottom: 20, width: 1, background: "rgba(255,255,255,0.045)"}} />
        ))}
        {[0, 2, 4, 6, 8].map((s) => (
          <div key={`l${s}`} style={{position: "absolute", left: BAR_X + (BAR_W * s) / SPAN - 8, top: 92, opacity: 0.7}}>
            <Mono size={9} color={C.faint}>{s}s</Mono>
          </div>
        ))}

        {TRACE_ROWS.map((row, i) => {
          const meta = KIND[row.kind];
          const at = T.rows + i * 0.34;
          const p = outCubic(clamp01((t - at) / 0.6));
          const y = ROW_TOP + i * ROW_H;
          const depth = row.kind === "agent" ? 0 : row.kind === "gen" ? 1 : 2;
          const left = BAR_X + (BAR_W * row.t) / SPAN + depth * 8;
          const w = Math.max(26, (BAR_W * row.ms) / 1000 / SPAN);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: y,
                height: ROW_H,
                opacity: p,
                borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.035)",
              }}
            >
              <div style={{position: "absolute", left: 24, top: 16, display: "flex", alignItems: "center", gap: 9, width: 500}}>
                <Dot color={meta.c} size={6} glow={row.kind === "gen"} />
                <Mono size={11.5} color={C.ink} style={{whiteSpace: "nowrap"}}>{row.name}</Mono>
                {row.kind === "gen" && row.model && <Mono size={9.5} color={C.faint}>{row.model}</Mono>}
              </div>
              <div style={{position: "absolute", left: 24, top: 40, display: "flex", gap: 8, alignItems: "center"}}>
                <Caps size={8.5} color={alpha(meta.c, 0.85)}>{meta.label}</Caps>
                {row.kind === "tool" && <Mono size={9} color={C.faint}>{row.ms}ms</Mono>}
              </div>

              <div
                style={{
                  position: "absolute",
                  left,
                  top: 26,
                  width: w * p,
                  height: 22,
                  borderRadius: 5,
                  background: `linear-gradient(90deg, ${alpha(meta.c, 0.55)}, ${alpha(meta.c, 0.28)})`,
                  border: `1px solid ${alpha(meta.c, 0.55)}`,
                  boxShadow: row.kind === "gen" ? `0 0 14px ${alpha(meta.c, 0.18)}` : undefined,
                }}
              />
              <div style={{position: "absolute", left: BAR_X + 820, top: 30, opacity: p}}>
                <Mono size={9.5} color={C.faint}>{(row.ms / 1000).toFixed(2)}s</Mono>
              </div>
            </div>
          );
        })}

        {/* 底部一句：这个 Turn 里到底有什么 */}
        <div
          style={{
            position: "absolute",
            left: 24,
            right: 24,
            top: 1040,
            paddingTop: 14,
            borderTop: `1px dashed ${alpha(C.violet, 0.2)}`,
            display: "flex",
            alignItems: "center",
            gap: 10,
            opacity: outCubic(prog(t, T.other + 0.6, 0.9)),
          }}
        >
          <Mono size={10.5} color={C.muted}>同一个 Turn 里：</Mono>
          <Chip color={C.blue} size={9.5}>{gens} 次模型响应</Chip>
          <Mono size={10} color={C.faint}>+</Mono>
          <Chip color={C.green} size={9.5}>{tools} 次工具执行</Chip>
          <Mono size={10} color={C.faint}>+</Mono>
          <Chip color={C.violet} size={9.5}>1 次 Handoff</Chip>
          <Mono size={10.5} color={C.muted} style={{marginLeft: 6}}>—— 它们不是同一个 Response</Mono>
        </div>
      </div>

      {/* 图例：跟着 Trace 行点亮 */}
      <div style={{position: "absolute", left: 1590, top: 556, width: 290}}>
        <Caps size={9} color={C.faint}>这个 Turn 里</Caps>
        {[
          {label: "Generation", n: gens, c: C.blue, at: T.legend},
          {label: "Tool Call", n: tools, c: C.green, at: T.legend + 0.5},
          {label: "Agent / Handoff", n: 2, c: C.violet, at: T.legend + 1.0},
        ].map((it) => {
          const p = outCubic(prog(t, it.at, 0.6));
          return (
            <div
              key={it.label}
              style={{
                marginTop: 14,
                padding: "12px 14px",
                borderRadius: 10,
                border: `1px solid ${alpha(it.c, 0.24)}`,
                background: alpha(it.c, 0.055),
                opacity: p,
                transform: `translateX(${(1 - p) * 12}px)`,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Dot color={it.c} size={6} />
              <Caps size={9} color={alpha(it.c, 0.9)}>{it.label}</Caps>
              <span style={{marginLeft: "auto", fontFamily: FONT.sans, fontSize: 22, fontWeight: 650, color: C.ink}}>{it.n}</span>
            </div>
          );
        })}
      </div>

      {/* 另一条记录：11 / 10 */}
      <div
        style={{
          position: "absolute",
          left: 1570,
          top: 862,
          width: 320,
          padding: "16px 16px 14px",
          borderRadius: 12,
          border: `1px dashed ${alpha(C.amber, 0.3)}`,
          background: "rgba(255,255,255,0.02)",
          opacity: outCubic(prog(t, T.other, 0.8)),
          transform: `translateY(${(1 - outCubic(prog(t, T.other, 0.8))) * 10}px)`,
        }}
      >
        <Caps size={8.5} color={alpha(C.amber, 0.85)}>文档里的另一条记录</Caps>
        <div style={{marginTop: 10, display: "flex", alignItems: "baseline", gap: 6}}>
          <span style={{fontFamily: FONT.sans, fontSize: 34, fontWeight: 650, color: C.blue}}>11</span>
          <Mono size={10} color={C.faint}>Generation</Mono>
          <span style={{fontFamily: FONT.sans, fontSize: 20, color: C.faint}}>/</span>
          <span style={{fontFamily: FONT.sans, fontSize: 34, fontWeight: 650, color: C.green}}>10</span>
          <Mono size={10} color={C.faint}>Tool</Mono>
        </div>
        <Mono size={9.5} color={C.soft} style={{display: "block", marginTop: 10, lineHeight: 1.6}}>
          都在同一个 Turn 里，分布在 root agent 和两个 subagent 之间。
        </Mono>
        <Mono size={9.5} color={alpha(C.red, 0.9)} style={{display: "block", marginTop: 8, lineHeight: 1.6}}>
          不是 root agent 自己调了 11 次模型。
        </Mono>
        <div style={{marginTop: 10}}>
          <Mono size={8.5} color={C.faint}>来源：Tracing 文档 · 与上方重绘不是同一条 Trace</Mono>
        </div>
      </div>
    </div>
  );
};
