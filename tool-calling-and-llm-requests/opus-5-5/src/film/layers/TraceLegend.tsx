// S6 屏幕右侧的图例：随着 Trace 行被点亮而计数。
import React from "react";
import {C, FONT, alpha} from "../theme";
import {clamp01, fadeIO, out, outBack, prog} from "../ease";
import {Caps, IconBubble, IconCube, IconFn, RollingNumber} from "../ui/primitives";
import {TRACE_T, hiAt} from "../zones/TraceZone";

const X = 1300;
const W = 540;

const ITEMS = [
  {kind: "gen" as const, n: 7, at: TRACE_T.gen, color: C.blue, name: "Generation Span", desc: "一次模型响应，记录输入和输出", Icon: IconBubble},
  {kind: "tool" as const, n: 3, at: TRACE_T.tool, color: C.green, name: "Tool Span", desc: "一次具体工具调用及其结果", Icon: IconFn},
  {kind: "agent" as const, n: 4, at: TRACE_T.agent, color: C.violet, name: "Agent Span", desc: "某个 Agent 执行的一段工作", Icon: IconCube},
];

export const TraceLegend: React.FC<{t: number}> = ({t}) => {
  const vis = fadeIO(t, 103.8, 125.4, 0.6, 0.7);
  if (vis <= 0) return null;
  const stat = out(prog(t, TRACE_T.stat, 0.6));
  return (
    <div style={{position: "absolute", left: 0, top: 0, width: 1920, height: 1080, opacity: vis}}>
      {ITEMS.map((it, i) => {
        const p = out(prog(t, it.at - 0.2, 0.5));
        if (p <= 0) return null;
        const events = Array.from({length: it.n}, (_, k) => hiAt(it.kind, k) + 0.2);
        const Icon = it.Icon;
        return (
          <div
            key={it.kind}
            style={{
              position: "absolute",
              left: X + (1 - p) * 30,
              top: 96 + i * 118,
              width: W,
              height: 104,
              borderRadius: 18,
              opacity: p,
              background: `linear-gradient(180deg, ${alpha(it.color, 0.13)}, ${alpha(C.panel, 0.9)})`,
              border: `1px solid ${alpha(it.color, 0.45)}`,
              boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
            }}
          >
            <div style={{position: "absolute", left: 20, top: 22}}>
              <Icon size={28} color={it.color} />
            </div>
            <div style={{position: "absolute", left: 64, top: 20}}>
              <Caps size={15} color={it.color}>
                {it.name}
              </Caps>
            </div>
            <div style={{position: "absolute", left: 64, top: 52, fontFamily: FONT.sans, fontSize: 18, color: C.text2, whiteSpace: "nowrap"}}>{it.desc}</div>
            <div style={{position: "absolute", right: 22, top: 22, fontFamily: FONT.sans, fontSize: 44, fontWeight: 800, display: "flex", alignItems: "baseline", gap: 4}}>
              <span style={{fontSize: 24, color: alpha(it.color, 0.7)}}>×</span>
              <RollingNumber t={t} events={events} size={44} color={it.color} />
            </div>
          </div>
        );
      })}

      {/* 官方 Tracing 文档里的真实例子（与左侧截图不是同一个 Trace，单独列出） */}
      {stat > 0 && (
        <div
          style={{
            position: "absolute",
            left: X + (1 - stat) * 30,
            top: 470,
            width: W,
            height: 330,
            borderRadius: 18,
            opacity: stat,
            background: alpha(C.panel2, 0.96),
            border: `1px solid ${C.line2}`,
            boxShadow: "0 18px 50px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{position: "absolute", left: 24, top: 20}}>
            <Caps size={14} color={C.text2}>
              Tracing 文档中的真实记录
            </Caps>
          </div>
          <div style={{position: "absolute", left: 24, top: 52, fontFamily: FONT.sans, fontSize: 26, fontWeight: 750, color: C.text, whiteSpace: "nowrap"}}>
            <span style={{color: C.violet}}>1</span> 个 Turn ·{" "}
            <span style={{color: C.blue}}>11</span> 个 Generation ·{" "}
            <span style={{color: C.green}}>10</span> 个 Tool
          </div>
          <div style={{position: "absolute", left: 24, top: 104, width: W - 48, display: "flex", flexWrap: "wrap", gap: 8}}>
            {Array.from({length: 21}, (_, k) => {
              const isGen = k % 2 === 0; // G T G T … G：生成与工具交替
              const p = outBack(prog(t, TRACE_T.stat + 0.4 + k * 0.06, 0.35));
              return (
                <span
                  key={k}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    display: "inline-block",
                    background: alpha(isGen ? C.blue : C.green, 0.7),
                    opacity: clamp01(p),
                    transform: `scale(${0.4 + 0.6 * clamp01(p)})`,
                  }}
                />
              );
            })}
          </div>
          <div style={{position: "absolute", left: 24, top: 220, width: W - 48, fontFamily: FONT.sans, fontSize: 17, lineHeight: 1.55, color: C.text2, opacity: out(prog(t, TRACE_T.stat + 2.0, 0.6))}}>
            注意：这 11 个 Generation 分布在 root agent 和两个 subagent 之间，不是 root agent 自己调用了 11 次模型。
          </div>
        </div>
      )}
    </div>
  );
};
