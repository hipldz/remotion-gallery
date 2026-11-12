// 屏幕文字与中文旁白共用时间轴。逐字浮现，关键词按全片配色着色。
import React from "react";
import data from "../captions.json";
import {C, FONT, Hue, alpha, hue} from "../theme";
import {clamp01, out, prog} from "../ease";

export type Caption = {start: number; end: number; text: string; marks: Array<{w: string; c: Hue}>; source?: string};
export const CAPTIONS = data as unknown as Caption[];

type Run = {s: string; color?: string};

const toRuns = (cap: Caption): Run[] => {
  const color: Array<string | undefined> = Array.from({length: cap.text.length}, () => undefined);
  for (const m of cap.marks) {
    let from = 0;
    for (;;) {
      const i = cap.text.indexOf(m.w, from);
      if (i < 0) break;
      for (let k = i; k < i + m.w.length; k++) color[k] = hue(m.c);
      from = i + m.w.length;
    }
  }
  const runs: Run[] = [];
  for (let i = 0; i < cap.text.length; i++) {
    const last = runs[runs.length - 1];
    if (last && last.color === color[i]) last.s += cap.text[i];
    else runs.push({s: cap.text[i], color: color[i]});
  }
  return runs;
};

export const Captions: React.FC<{t: number}> = ({t}) => {
  const cap = CAPTIONS.find((c) => t >= c.start && t < c.end);
  if (!cap) return null;
  const runs = toRuns(cap);
  const exit = prog(t, cap.end - 0.3, 0.3);
  let idx = 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        right: 120,
        bottom: 70,
        textAlign: "center",
        opacity: 1 - exit,
        transform: `translateY(${-exit * 8}px)`,
      }}
    >
      <div
        style={{
          fontFamily: FONT.sans,
          fontSize: 42,
          fontWeight: 600,
          lineHeight: 1.35,
          letterSpacing: "0.01em",
          color: C.text,
          textShadow: "0 2px 22px rgba(0,0,0,0.75)",
        }}
      >
        {runs.map((r, ri) => (
          <span key={ri} style={{color: r.color ?? C.text, fontWeight: r.color ? 750 : 600}}>
            {Array.from(r.s).map((ch, ci) => {
              const p = out(prog(t, cap.start + idx++ * 0.022, 0.38));
              return (
                <span
                  key={ci}
                  style={{
                    display: "inline-block",
                    whiteSpace: "pre",
                    opacity: p,
                    transform: `translateY(${(1 - p) * 16}px)`,
                    filter: p < 1 ? `blur(${(1 - p) * 6}px)` : undefined,
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
        ))}
      </div>
      {cap.source && (
        <div style={{marginTop: 10, fontFamily: FONT.sans, fontSize: 18, color: alpha(C.text2, clamp01(prog(t, cap.start + 0.6, 0.5)))}}>
          — {cap.source}
        </div>
      )}
    </div>
  );
};
