// S8：Tool Result 必须关联回原始 Tool Call。
// 并发执行 → 完成顺序 b、c、a → 按下标 ✗ / 按工具名 ✗ / 按 call_id ✓
import React from "react";
import {ZONE, zoneOpacity} from "../timeline";
import {C, FONT, alpha} from "../theme";
import {clamp01, ease, inOut, lerp, out, outBack, prog} from "../ease";
import {Box, Caps, DrawPath, IconFn, Mono, solidPanel} from "../ui/primitives";

const CALLS = [
  {call: "call_001", file: "a.ts", dur: 3.0},
  {call: "call_002", file: "b.ts", dur: 1.3},
  {call: "call_003", file: "c.ts", dur: 2.1},
];
const ROW_Y = [280, 410, 540]; // 行中心
const T = {
  cards: 146.6,
  race: 147.2,
  byIndex: 151.0,
  byName: 152.8,
  byCallId: 155.4,
};
// 到达顺序：b(1) → c(2) → a(0)
const ARRIVAL = [1, 2, 0];
const slotOf = (i: number) => ARRIVAL.indexOf(i);
const finishAt = (i: number) => T.race + CALLS[i].dur;

const LEFT_X = 520; // 左侧卡片右缘
const RIGHT_X = 1380; // 右侧结果左缘

const link = (i: number, j: number) => {
  const y1 = ROW_Y[i];
  const y2 = ROW_Y[j];
  return `M${LEFT_X},${y1} C${LEFT_X + 300},${y1} ${RIGHT_X - 300},${y2} ${RIGHT_X},${y2}`;
};

export const PitfallZone: React.FC<{t: number}> = ({t}) => {
  const zo = zoneOpacity("pitfall", t);
  if (t < T.cards - 0.6) return null;
  const pc = out(prog(t, T.cards, 0.7));
  const m1 = ease(t, T.byIndex, 0.6) * (1 - ease(t, T.byName - 0.2, 0.4));
  const m2 = ease(t, T.byName, 0.6) * (1 - ease(t, T.byCallId - 0.2, 0.4));
  const m3 = ease(t, T.byCallId, 0.8);
  const lanesDim = 1 - 0.75 * ease(t, T.byIndex - 0.2, 0.5);
  const mode = t >= T.byCallId - 0.2 ? 3 : t >= T.byName - 0.2 ? 2 : t >= T.byIndex - 0.2 ? 1 : 0;
  const modeText = ["Runtime 并发执行", "按数组下标配对  ✗", "按工具名配对  ✗", "按 call_id 配对  ✓"][mode];
  const modeColor = mode === 0 ? C.text2 : mode === 3 ? C.green : C.red;
  const modeP = outBack(prog(t, mode === 0 ? T.cards + 0.3 : [0, T.byIndex, T.byName, T.byCallId][mode] - 0.2, 0.45));

  return (
    <div style={{position: "absolute", left: ZONE.pitfall.x, top: ZONE.pitfall.y, width: 1920, height: 1080, opacity: zo}}>
      {/* 顶部：当前的配对方式 */}
      <Box x={600} y={120} w={690} style={{textAlign: "center", opacity: pc}}>
        <span
          style={{
            display: "inline-block",
            padding: "10px 24px",
            borderRadius: 24,
            fontFamily: FONT.sans,
            fontSize: 24,
            fontWeight: 700,
            color: modeColor,
            background: alpha(modeColor, 0.1),
            border: `1.5px solid ${alpha(modeColor, 0.55)}`,
            transform: `scale(${0.85 + 0.15 * clamp01(modeP)})`,
            whiteSpace: "pre",
          }}
        >
          {modeText}
        </span>
      </Box>

      {/* 左：Response #1 的三个调用 */}
      <div style={{position: "absolute", left: 120, top: 170 + (1 - pc) * 20, width: 400, height: 480, ...solidPanel(C.blue), opacity: pc}}>
        <Box x={24} y={22}>
          <Caps size={14} color={C.blue}>
            Response #1 · output[]
          </Caps>
        </Box>
      </div>
      {CALLS.map((c, i) => {
        const glow = m3 > 0 ? m3 : 0;
        return (
          <div
            key={c.call}
            style={{
              position: "absolute",
              left: 144,
              top: ROW_Y[i] - 46,
              width: 352,
              height: 92,
              borderRadius: 14,
              background: alpha(C.green, 0.08),
              border: `1px solid ${alpha(C.green, 0.35 + 0.4 * glow)}`,
              opacity: pc,
            }}
          >
            <Box x={16} y={34}>
              <IconFn size={24} color={C.green} />
            </Box>
            <Box x={54} y={16}>
              <Mono size={18} color={C.text}>{`read_file("${c.file}")`}</Mono>
            </Box>
            <Box x={54} y={50}>
              <Mono size={16} color={C.green} style={{background: alpha(C.green, 0.2 * glow), borderRadius: 4, boxShadow: `0 0 0 3px ${alpha(C.green, 0.2 * glow)}`}}>
                {c.call}
              </Mono>
            </Box>
          </div>
        );
      })}

      {/* 中：三条并发执行的跑道 */}
      {CALLS.map((c, i) => {
        const p = inOut(prog(t, T.race, c.dur));
        const x = lerp(600, 1290, p);
        const done = t >= finishAt(i);
        const rank = slotOf(i) + 1;
        return (
          <React.Fragment key={c.call}>
            <div style={{position: "absolute", left: 600, top: ROW_Y[i] - 1, width: 690, height: 2, background: alpha(C.text, 0.12), opacity: pc * lanesDim}} />
            <div
              style={{
                position: "absolute",
                left: 600,
                top: ROW_Y[i] - 3,
                width: x - 600,
                height: 6,
                borderRadius: 3,
                background: `linear-gradient(90deg, ${alpha(C.green, 0)}, ${alpha(C.green, 0.8)})`,
                opacity: pc * lanesDim,
              }}
            />
            {t >= T.race && (
              <div
                style={{
                  position: "absolute",
                  left: x - 11,
                  top: ROW_Y[i] - 11,
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  background: C.green,
                  boxShadow: `0 0 16px ${C.green}`,
                  opacity: lanesDim,
                }}
              />
            )}
            {done && (
              <Box x={1190} y={ROW_Y[i] - 46} w={100} style={{textAlign: "right", opacity: out(prog(t, finishAt(i), 0.3)) * lanesDim}}>
                <span style={{fontFamily: FONT.sans, fontSize: 17, color: C.text2}}>第 {rank} 个完成</span>
              </Box>
            )}
          </React.Fragment>
        );
      })}

      {/* 右：结果按完成顺序到达 */}
      {ARRIVAL.map((ci, slot) => {
        const at = finishAt(ci) + 0.1;
        const p = out(prog(t, at, 0.5));
        if (p <= 0) return null;
        const c = CALLS[ci];
        const glow = m3;
        return (
          <div
            key={c.call}
            style={{
              position: "absolute",
              left: RIGHT_X + (1 - p) * -60,
              top: ROW_Y[slot] - 46,
              width: 420,
              height: 92,
              borderRadius: 14,
              opacity: p,
              background: C.panel2,
              border: `1px solid ${alpha(C.green, 0.35 + 0.4 * glow)}`,
            }}
          >
            <Box x={18} y={12}>
              <Mono size={13} color={C.text3}>
                function_call_output
              </Mono>
            </Box>
            <Box x={18} y={42}>
              <span style={{fontFamily: FONT.sans, fontSize: 21, color: C.text}}>{`${c.file} 的内容`}</span>
            </Box>
            <Box x={270} y={44} w={130} style={{textAlign: "right"}}>
              <Mono size={16} color={C.green} style={{background: alpha(C.green, 0.2 * glow), borderRadius: 4, boxShadow: `0 0 0 3px ${alpha(C.green, 0.2 * glow)}`}}>
                {c.call}
              </Mono>
            </Box>
          </div>
        );
      })}
      <Box x={RIGHT_X} y={630} style={{opacity: out(prog(t, finishAt(1), 0.4))}}>
        <span style={{fontFamily: FONT.sans, fontSize: 17, color: C.text3}}>结果按完成顺序回来：b → c → a</span>
      </Box>

      {/* 配对连线 */}
      <svg style={{position: "absolute", left: 0, top: 0, overflow: "visible"}} width={1920} height={1080}>
        {m1 > 0 &&
          [0, 1, 2].map((i) => <DrawPath key={`i${i}`} d={link(i, i)} p={ease(t, T.byIndex + i * 0.12, 0.6)} color={C.red} width={3} opacity={m1} />)}
        {m2 > 0 &&
          [0, 1, 2].flatMap((i) =>
            [0, 1, 2].map((j) => <DrawPath key={`n${i}${j}`} d={link(i, j)} p={ease(t, T.byName + (i * 3 + j) * 0.04, 0.6)} color={C.red} width={2} opacity={m2 * 0.55} />),
          )}
        {m3 > 0 &&
          [0, 1, 2].map((i) => <DrawPath key={`c${i}`} d={link(i, slotOf(i))} p={ease(t, T.byCallId + i * 0.15, 0.7)} color={C.green} width={3.5} glow />)}
      </svg>
      {/* ✗ / ? / ✓ 标记 */}
      {m1 > 0 &&
        [0, 1, 2].map((i) => (
          <Box key={`x${i}`} x={950 - 18} y={ROW_Y[i] - 22} w={36} style={{textAlign: "center", opacity: m1 * out(prog(t, T.byIndex + 0.5 + i * 0.12, 0.3))}}>
            <span style={{fontFamily: FONT.sans, fontSize: 30, fontWeight: 800, color: C.red}}>✗</span>
          </Box>
        ))}
      {m2 > 0 && (
        <Box x={950 - 30} y={ROW_Y[1] - 34} w={60} style={{textAlign: "center", opacity: m2 * out(prog(t, T.byName + 0.6, 0.3))}}>
          <span style={{fontFamily: FONT.sans, fontSize: 48, fontWeight: 800, color: C.red}}>?</span>
        </Box>
      )}
      {m3 > 0 &&
        [0, 1, 2].map((j) => (
          <Box key={`v${j}`} x={RIGHT_X - 44} y={ROW_Y[j] - 18} w={36} style={{textAlign: "center", opacity: out(prog(t, T.byCallId + 0.7 + j * 0.15, 0.3))}}>
            <span style={{fontFamily: FONT.sans, fontSize: 26, fontWeight: 800, color: C.green}}>✓</span>
          </Box>
        ))}
    </div>
  );
};
