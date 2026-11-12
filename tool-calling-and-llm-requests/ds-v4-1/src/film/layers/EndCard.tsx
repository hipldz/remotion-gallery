import React from "react";
import {C, FONT, alpha} from "../theme";
import {clamp01, outBack, outCubic, prog} from "../motion";

const T = {
  in: 175.1,
  lines: 175.8,
  refs: 176.8,
  black: 178.9,
};

export const EndCard: React.FC<{t: number}> = ({t}) => {
  if (t < T.in) return null;
  const p = outCubic(prog(t, T.in, 0.9));
  const stamp = outBack(prog(t, T.in + 0.1, 0.6), 1.6);
  const black = outCubic(prog(t, T.black, 1.4));

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(4,6,10,0.86)",
          backdropFilter: "blur(10px)",
          opacity: p,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 250,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: p,
        }}
      >
        <div style={{fontFamily: FONT.sans, fontSize: 11, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", color: C.faint}}>
          结论
        </div>

        <div
          style={{
            marginTop: 18,
            fontFamily: FONT.sans,
            fontSize: 142,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "0.02em",
            color: C.ink,
            transform: `scale(${0.94 + 0.06 * clamp01(stamp)})`,
            opacity: clamp01(stamp * 1.2),
          }}
        >
          不是<span style={{fontSize: "0.42em", color: C.red}}>。</span>
        </div>

        <div style={{marginTop: 20, fontFamily: FONT.sans, fontSize: 28, color: C.soft, letterSpacing: "0.01em", opacity: outCubic(prog(t, T.lines, 0.8))}}>
          Tool Calling 和 LLM Request 不是一对一的。
        </div>

        <div style={{display: "flex", gap: 12, marginTop: 34, opacity: outCubic(prog(t, T.lines + 0.4, 0.8))}}>
          {[
            {k: "1 个 Response → 多个 Tool Call", c: C.green},
            {k: "1 个 Turn → 多次 Response", c: C.blue},
            {k: "托管工具还可能多步编排", c: C.violet},
          ].map((x) => (
            <div
              key={x.k}
              style={{
                padding: "10px 14px",
                borderRadius: 9,
                border: `1px solid ${alpha(x.c, 0.3)}`,
                background: alpha(x.c, 0.07),
                fontFamily: FONT.sans,
                fontSize: 14,
                color: C.ink,
              }}
            >
              {x.k}
            </div>
          ))}
        </div>

        <div style={{marginTop: 30, fontFamily: FONT.sans, fontSize: 17, color: C.muted, opacity: outCubic(prog(t, T.refs, 0.9))}}>
          在模型调用层创建 <span style={{color: C.blue, fontFamily: FONT.mono, fontSize: 16}}>generation_id</span>，把 Tool Call 关联到对应的 Generation。
        </div>

        <div
          style={{
            marginTop: 56,
            display: "flex",
            gap: 26,
            fontFamily: FONT.mono,
            fontSize: 10.5,
            color: C.faint,
            opacity: outCubic(prog(t, T.refs + 0.3, 0.9)),
          }}
        >
          <span>OpenAI Function Calling</span>
          <span>·</span>
          <span>OpenAI Agents Tracing</span>
          <span>·</span>
          <span>Codex CLI &amp; Agents SDK Cookbook</span>
        </div>
      </div>

      <div style={{position: "absolute", inset: 0, background: "#03050A", opacity: black}} />
    </>
  );
};
