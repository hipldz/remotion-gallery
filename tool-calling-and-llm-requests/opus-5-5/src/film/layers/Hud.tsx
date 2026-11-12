// S3 的计数器：标题那个问题的“仪表盘”。Tool Calls 跳 3 下时，Response 只跳 1 下。
import React from "react";
import {C, FONT, alpha} from "../theme";
import {clamp01, ease, lerp, out, prog, pulse} from "../ease";
import {Caps, RollingNumber} from "../ui/primitives";
import {HUD_EVENTS} from "../zones/trackData";

const T = {in: 30.2, center: 54.2, out: 63.4};
const PILLS = [
  {key: "turn", label: "Turn", sub: "一次完整的 Agent 任务", color: C.violet},
  {key: "responses", label: "Response", sub: "模型响应单元", color: C.blue},
  {key: "tools", label: "Tool Calls", sub: "工具调用单元", color: C.green},
] as const;
const W = 260;
const GAP = 14;
const TOTAL_W = W * 3 + GAP * 2;

export const Hud: React.FC<{t: number}> = ({t}) => {
  const pin = out(prog(t, T.in, 0.6));
  const pout = 1 - ease(t, T.out, 0.8);
  if (pin <= 0 || pout <= 0) return null;
  const c = ease(t, T.center, 1.0);
  // 右上角 → 画面上方中央并放大（拉远看全貌时）
  const scale = lerp(0.82, 1.25, c);
  const left = lerp(1920 - 40 - TOTAL_W * 0.82, 960 - (TOTAL_W * 1.25) / 2, c);
  const top = lerp(36, 70, c);
  // S3 中段强调：Response 1 vs Tool Calls 3
  const emph = pulse(t, 36.8, 1.8);
  return (
    <div style={{position: "absolute", left, top, width: TOTAL_W, transform: `scale(${scale})`, transformOrigin: "0 0", opacity: pin * pout, display: "flex", gap: GAP}}>
      {PILLS.map((p) => {
        const ev = HUD_EVENTS[p.key];
        const last = ev.filter((e) => t >= e).pop() ?? -9;
        const flash = pulse(t, last, 0.7) + (p.key !== "turn" ? emph : 0);
        return (
          <div
            key={p.key}
            style={{
              position: "relative",
              width: W,
              height: 96,
              borderRadius: 18,
              background: `linear-gradient(180deg, ${alpha(p.color, 0.14 + 0.1 * clamp01(flash))}, ${alpha(C.panel, 0.85)})`,
              border: `1px solid ${alpha(p.color, 0.35 + 0.5 * clamp01(flash))}`,
              boxShadow: `0 16px 40px rgba(0,0,0,0.45), 0 0 ${30 * clamp01(flash)}px ${alpha(p.color, 0.4 * clamp01(flash))}`,
            }}
          >
            <div style={{position: "absolute", left: 20, top: 14, fontFamily: FONT.sans, fontSize: 50, fontWeight: 800, lineHeight: 1}}>
              <RollingNumber t={t} events={ev} size={50} color={p.color} />
            </div>
            <div style={{position: "absolute", left: 84, top: 22}}>
              <Caps size={14} color={p.color}>
                {p.label}
              </Caps>
            </div>
            <div style={{position: "absolute", left: 84, top: 50, fontFamily: FONT.sans, fontSize: 14, color: C.text2, whiteSpace: "nowrap"}}>{p.sub}</div>
          </div>
        );
      })}
    </div>
  );
};
