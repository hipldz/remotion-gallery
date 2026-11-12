import React from "react";
import {C, FONT, alpha} from "../theme";
import {fadeIO} from "../motion";
import {HUD_EVENTS} from "../data";
import {RollingNumber} from "../ui";

const IN = 30.0;
const OUT = 63.6;

export const Hud: React.FC<{t: number}> = ({t}) => {
  const a = fadeIO(t, IN, OUT, 0.7, 0.7);
  if (a <= 0) return null;

  const rows = [
    {label: "Turn", value: <RollingNumber t={t} events={HUD_EVENTS.turn} color={C.violet} size={38} />, c: C.violet},
    {label: "Response", value: <RollingNumber t={t} events={HUD_EVENTS.response} color={C.blue} size={38} />, c: C.blue},
    {label: "Tool Call", value: <RollingNumber t={t} events={HUD_EVENTS.tool} color={C.green} size={38} />, c: C.green},
  ];

  return (
    <div
      style={{
        position: "absolute",
        left: 1448,
        top: 60,
        width: 376,
        padding: "16px 18px 14px",
        borderRadius: 14,
        border: `1px solid ${C.line}`,
        background: "rgba(10,13,20,0.82)",
        boxShadow: "0 22px 50px rgba(0,0,0,0.5)",
        opacity: a,
        transform: `translateY(${(1 - a) * -10}px)`,
      }}
    >
      <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 10}}>
        <span style={{fontFamily: FONT.sans, fontSize: 12, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted}}>
          This turn
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: FONT.mono,
            fontSize: 9.5,
            color: alpha(C.green, 0.9),
            padding: "3px 7px",
            borderRadius: 5,
            border: `1px solid ${alpha(C.green, 0.25)}`,
            background: alpha(C.green, 0.08),
          }}
        >
          live
        </span>
      </div>

      {rows.map((r, i) => (
        <div
          key={r.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "7px 0",
            borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <span style={{width: 7, height: 7, borderRadius: 4, background: r.c, boxShadow: `0 0 10px ${alpha(r.c, 0.7)}`}} />
          <span style={{fontFamily: FONT.sans, fontSize: 13, color: C.soft}}>{r.label}</span>
          <span style={{marginLeft: "auto"}}>{r.value}</span>
        </div>
      ))}

      <div style={{marginTop: 8, fontFamily: FONT.mono, fontSize: 9.5, color: C.faint, lineHeight: 1.6}}>
        一个 Turn 里，Response 只跳 1 下，Tool Call 跳了 3 下
      </div>
    </div>
  );
};
