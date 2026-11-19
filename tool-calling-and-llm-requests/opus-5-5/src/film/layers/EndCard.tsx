// 片尾：结论 + 原文最后一句 + 参考资料。画面上的 WebUI 仍在后面隐约可见。
import React from "react";
import {C, FONT, alpha} from "../theme";
import {clamp01, ease, out, prog} from "../ease";
import {Caps} from "../ui/primitives";

const T = {in: 175.6, fadeBlack: 179.3};

const FACTS = [
  {text: "1 个 Response → 多个 Tool Calls", color: C.blue},
  {text: "1 个 Turn → 多次 Response", color: C.violet},
  {text: "托管工具 → 统计口径不同", color: C.amber},
];

const REFS = [
  "OpenAI Function Calling",
  "OpenAI Agents API — Tracing",
  "OpenAI Cookbook — Building Consistent Workflows with Codex CLI & Agents SDK",
  "OpenAI API Overview — Request IDs",
];

export const EndCard: React.FC<{t: number}> = ({t}) => {
  const scrim = ease(t, T.in, 0.7);
  const black = ease(t, T.fadeBlack, 0.7);
  if (scrim <= 0) return null;
  const p = (d: number) => out(prog(t, T.in + d, 0.5));
  return (
    <>
      <div style={{position: "absolute", inset: 0, background: alpha(C.bg, 0.86 * scrim)}} />
      <div style={{position: "absolute", left: 0, top: 0, width: 1920, height: 1080, textAlign: "center"}}>
        <div style={{position: "absolute", left: 0, right: 0, top: 190, opacity: p(0.2)}}>
          <Caps size={18} color={C.text2}>
            ToolCalling 和 Request 是一对一的吗？
          </Caps>
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 236,
            opacity: p(0.35),
            transform: `translateY(${(1 - p(0.35)) * 20}px)`,
            fontFamily: FONT.sans,
            fontSize: 96,
            fontWeight: 800,
            color: C.text,
          }}
        >
          不是。
        </div>
        <div style={{position: "absolute", left: 0, right: 0, top: 404, display: "flex", justifyContent: "center", gap: 18}}>
          {FACTS.map((f, i) => (
            <span
              key={i}
              style={{
                opacity: p(0.6 + i * 0.15),
                transform: `translateY(${(1 - p(0.6 + i * 0.15)) * 14}px)`,
                padding: "12px 22px",
                borderRadius: 14,
                fontFamily: FONT.sans,
                fontSize: 24,
                fontWeight: 650,
                color: f.color,
                background: alpha(f.color, 0.1),
                border: `1px solid ${alpha(f.color, 0.45)}`,
                whiteSpace: "nowrap",
              }}
            >
              {f.text}
            </span>
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            left: 360,
            right: 360,
            top: 520,
            opacity: p(1.2),
            fontFamily: FONT.sans,
            fontSize: 27,
            lineHeight: 1.6,
            color: C.text,
          }}
        >
          把执行数据模型和 UI 展示策略分开，后续无论做工具调用展示、并发调度、执行追踪还是状态恢复，都会清晰很多。
        </div>
        <div style={{position: "absolute", left: 0, right: 0, top: 690, opacity: p(1.8)}}>
          <Caps size={13} color={C.text3}>
            参考资料
          </Caps>
          <div style={{marginTop: 12, fontFamily: FONT.sans, fontSize: 17, lineHeight: 1.7, color: C.text2}}>
            {REFS.map((r) => (
              <div key={r}>{r}</div>
            ))}
          </div>
          <div style={{marginTop: 18, fontFamily: FONT.sans, fontSize: 16, color: C.text3}}>更多踩坑（重试幂等、分开记录 attempt）见原文</div>
        </div>
      </div>
      <div style={{position: "absolute", inset: 0, background: C.bg, opacity: clamp01(black)}} />
    </>
  );
};
