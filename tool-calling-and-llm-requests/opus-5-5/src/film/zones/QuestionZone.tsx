// S2：全片唯一一张“标题”——就是原文的问题本身。
// 1 : 1 的连线被扯断，变成 1 个 Request（Response）→ 多个 Tool Calls。
import React from "react";
import {ZONE, zoneOpacity} from "../timeline";
import {C, FONT, alpha} from "../theme";
import {clamp01, ease, lerp, out, outBack, prog, spring} from "../ease";
import {Box, DrawPath} from "../ui/primitives";

const T = {
  line1: 22.6,
  line2: 23.1,
  link: 24.2,
  label: 24.8,
  snap: 27.0,
  fan: 27.5,
  answer: 27.4,
};

const Chars: React.FC<{text: string; t: number; at: number; size: number; weight: number; color?: string; step?: number}> = ({
  text,
  t,
  at,
  size,
  weight,
  color = C.text,
  step = 0.035,
}) => (
  <div style={{fontFamily: FONT.sans, fontSize: size, fontWeight: weight, color, letterSpacing: "-0.01em", whiteSpace: "nowrap", textAlign: "center"}}>
    {Array.from(text).map((ch, i) => {
      const p = out(prog(t, at + i * step, 0.5));
      return (
        <span
          key={i}
          style={{
            display: "inline-block",
            opacity: p,
            transform: `translateY(${(1 - p) * size * 0.35}px)`,
            filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined,
            whiteSpace: "pre",
          }}
        >
          {ch}
        </span>
      );
    })}
  </div>
);

export const QuestionZone: React.FC<{t: number}> = ({t}) => {
  const zo = zoneOpacity("question", t);
  if (t < T.line1 - 0.5) return null;

  const link = ease(t, T.link, 0.8);
  const snap = ease(t, T.snap, 0.5, out);
  const fan = ease(t, T.fan, 0.9, out);
  const labelIn = out(prog(t, T.label, 0.5));
  const ans = outBack(prog(t, T.answer, 0.6));

  const L = {x: 700, y: 640}; // Tool Call
  const R = {x: 1220, y: 640}; // Request / Response
  const midX = (L.x + R.x) / 2;
  // 断开：左右两半各自回缩
  const leftEnd = lerp(midX, L.x + 40, snap);
  const rightStart = lerp(midX, R.x - 40, snap);
  // 扇出：一个 Request 对应多个 Tool Calls
  const fanYs = [520, 640, 760];

  return (
    <div style={{position: "absolute", left: ZONE.question.x, top: ZONE.question.y, width: 1920, height: 1080, opacity: zo}}>
      <Box x={0} y={200} w={1920}>
        <Chars text="Tool Calling 和 Request" t={t} at={T.line1} size={76} weight={700} color={C.text2} step={0.03} />
      </Box>
      <Box x={0} y={300} w={1920}>
        <Chars text="是一对一的吗？" t={t} at={T.line2} size={116} weight={800} step={0.07} />
      </Box>

      <svg style={{position: "absolute", left: 0, top: 0, overflow: "visible"}} width={1920} height={1080}>
        {/* 1 : 1 的连线 */}
        {snap < 1 && (
          <>
            <DrawPath d={`M${L.x + 34},${L.y} L${snap > 0 ? leftEnd : R.x - 34},${L.y}`} p={link} color={C.text2} width={3} opacity={1 - snap} />
            {snap > 0 && <DrawPath d={`M${rightStart},${R.y} L${R.x - 34},${R.y}`} p={1} color={C.text2} width={3} opacity={1 - snap} />}
          </>
        )}
        {/* 扇出：Request → 多个 Tool Call */}
        {fanYs.map((y, i) => (
          <DrawPath
            key={i}
            d={`M${R.x - 34},${R.y} C${R.x - 200},${R.y} ${L.x + 200},${y} ${L.x + 34},${y}`}
            p={ease(t, T.fan + 0.1 + i * 0.12, 0.6)}
            color={C.green}
            width={3}
            opacity={0.9}
          />
        ))}
        {/* 节点 */}
        {fanYs.map((y, i) => {
          const yy = i === 1 ? L.y : lerp(L.y, y, fan);
          const show = i === 1 ? link > 0 : fan > 0;
          if (!show) return null;
          return (
            <g key={i} opacity={i === 1 ? clamp01(link * 3) : fan}>
              <circle cx={L.x} cy={yy} r={30} fill={alpha(C.green, 0.15)} stroke={C.green} strokeWidth={3} />
              <circle cx={L.x} cy={yy} r={8} fill={C.green} />
            </g>
          );
        })}
        {link > 0 && (
          <g opacity={clamp01(link * 3)}>
            <circle cx={R.x} cy={R.y} r={30} fill={alpha(C.amber, 0.15)} stroke={C.amber} strokeWidth={3} />
            <circle cx={R.x} cy={R.y} r={8} fill={C.amber} />
          </g>
        )}
      </svg>

      {/* 节点名 */}
      <Box x={L.x - 260} y={L.y - 18} w={200} style={{textAlign: "right", opacity: clamp01(link * 3)}}>
        <span style={{fontFamily: FONT.sans, fontSize: 28, fontWeight: 700, color: C.green}}>Tool Call{fan > 0.5 ? "s" : ""}</span>
      </Box>
      <Box x={R.x + 60} y={R.y - 18} w={300} style={{opacity: clamp01(link * 3)}}>
        <span style={{fontFamily: FONT.sans, fontSize: 28, fontWeight: 700, color: C.amber}}>Request</span>
      </Box>

      {/* 1 : 1 ?  →  1 : N */}
      <Box x={midX - 150} y={L.y - 78} w={300} style={{textAlign: "center", opacity: labelIn * (1 - snap)}}>
        <span style={{fontFamily: FONT.mono, fontSize: 34, color: C.text2}}>1 : 1 ?</span>
      </Box>

      {/* 不是一对一。 */}
      {ans > 0 && (
        <Box x={0} y={806} w={1920} style={{textAlign: "center", opacity: clamp01(ans), transform: `scale(${lerp(1.35, 1, clamp01(ans))})`}}>
          <span
            style={{
              fontFamily: FONT.sans,
              fontSize: 64,
              fontWeight: 800,
              color: C.text,
              padding: "6px 26px",
              borderBottom: `5px solid ${C.red}`,
            }}
          >
            不是一对一。
          </span>
        </Box>
      )}

      {/* 轻微的回弹提示：线被扯断的一瞬 */}
      {snap > 0 && snap < 1 && (
        <Box
          x={midX - 40}
          y={L.y - 40}
          w={80}
          h={80}
          style={{
            borderRadius: 40,
            border: `2px solid ${alpha(C.red, 1 - snap)}`,
            transform: `scale(${0.4 + spring(snap) * 1.4})`,
          }}
        />
      )}
    </div>
  );
};
