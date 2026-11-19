// S5：别把顶层 API Request 和模型内部执行混为一谈。
// 左：Function Tools —— 应用自己执行，四个数一步步看得见。
// 右：托管工具 —— 平台内部编排，应用只看到 1 次请求，里面走了几步看不见。
import React from "react";
import {ZONE, zoneOpacity} from "../timeline";
import {C, FONT, alpha} from "../theme";
import {clamp01, ease, hash, lerp, out, outBack, prog, pulse} from "../ease";
import {Box, Caps, IconCode, IconFile, IconGlobe, RollingNumber, solidPanel} from "../ui/primitives";

const T = {
  cards: 87.0,
  // 左：两次往返
  lReq: [88.4, 91.2],
  lResp: [89.2, 92.0],
  lTool: [90.2, 90.6],
  // 右：一次请求，平台内部若干步
  rReq: 93.2,
  rInside: 93.8,
  rResp: 97.2,
  unknown: 94.0,
  settle: 98.2,
  neq: 100.4,
};

const COUNTERS = ["顶层请求", "Response", "Generation", "工具执行"];
const COLORS = [C.amber, C.blue, C.blue, C.green];

const Packet: React.FC<{t: number; at: number; from: number; to: number; y: number; color: string}> = ({t, at, from, to, y, color}) => {
  const u = prog(t, at, 0.42);
  if (u <= 0 || u >= 1) return null;
  const x = lerp(from, to, out(u));
  return <div style={{position: "absolute", left: x - 12, top: y - 12, width: 24, height: 24, borderRadius: 12, background: color, boxShadow: `0 0 18px ${color}`}} />;
};

const Lane: React.FC<{x1: number; x2: number; y: number; color: string; dir: 1 | -1; label: string}> = ({x1, x2, y, color, dir, label}) => (
  <>
    <div style={{position: "absolute", left: x1, top: y - 1, width: x2 - x1, height: 2, background: alpha(color, 0.35)}} />
    <div
      style={{
        position: "absolute",
        left: dir === 1 ? x2 - 12 : x1,
        top: y - 7,
        width: 0,
        height: 0,
        borderTop: "7px solid transparent",
        borderBottom: "7px solid transparent",
        borderLeft: dir === 1 ? `12px solid ${alpha(color, 0.7)}` : undefined,
        borderRight: dir === -1 ? `12px solid ${alpha(color, 0.7)}` : undefined,
      }}
    />
    <Box x={x1} y={y + (dir === 1 ? -30 : 10)} w={x2 - x1} style={{textAlign: "center"}}>
      <span style={{fontFamily: FONT.mono, fontSize: 13, color: alpha(color, 0.9)}}>{label}</span>
    </Box>
  </>
);

const NodeBox: React.FC<{x: number; y: number; w: number; h: number; label: string; color: string; children?: React.ReactNode; glass?: boolean}> = ({
  x,
  y,
  w,
  h,
  label,
  color,
  children,
  glass,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 20,
      background: glass ? "linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))" : alpha(color, 0.08),
      border: `1px solid ${alpha(color, 0.45)}`,
      overflow: "hidden",
    }}
  >
    <Box x={18} y={14}>
      <Caps size={13} color={color}>
        {label}
      </Caps>
    </Box>
    {children}
  </div>
);

const Counter: React.FC<{x: number; y: number; label: string; color: string; children: React.ReactNode; flash?: number}> = ({x, y, label, color, children, flash = 0}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 170,
      height: 120,
      borderRadius: 16,
      background: alpha(color, 0.06 + 0.1 * flash),
      border: `1px solid ${alpha(color, 0.3 + 0.4 * flash)}`,
    }}
  >
    <Box x={16} y={14}>
      <span style={{fontFamily: FONT.sans, fontSize: 16, color: C.text2, whiteSpace: "nowrap"}}>{label}</span>
    </Box>
    <Box x={16} y={46}>
      <span style={{fontFamily: FONT.sans, fontSize: 52, fontWeight: 750, color, lineHeight: 1}}>{children}</span>
    </Box>
  </div>
);

export const HostedZone: React.FC<{t: number}> = ({t}) => {
  const zo = zoneOpacity("hosted", t);
  if (t < T.cards - 0.6) return null;
  const pc = out(prog(t, T.cards, 0.7));
  const pr = out(prog(t, T.cards + 0.3, 0.7));

  // 左侧四个计数
  const lEvents = [T.lReq.map((x) => x + 0.4), T.lResp.map((x) => x + 0.4), T.lResp.map((x) => x + 0.4), T.lTool];
  const lastEvent = (ev: number[]) => ev.filter((e) => t >= e).pop() ?? -9;

  // 右侧：平台内部“看不见”的步骤
  const inside = clamp01(prog(t, T.rInside, T.rResp - T.rInside));
  const insideActive = t >= T.rInside && t < T.rResp + 0.2;
  const settle = ease(t, T.settle, 0.4);
  const rolling = (seed: number) => 1 + Math.floor(hash(Math.floor(t * 14) + seed) * 9);

  const L = {x: 100, y: 80};
  const R = {x: 1020, y: 80};

  const unknownNum = (seed: number) => {
    if (t < T.unknown) return <span style={{color: C.text3}}>0</span>;
    return (
      <span style={{position: "relative", display: "inline-block", width: 60}}>
        <span style={{position: "absolute", left: 0, top: 0, opacity: 1 - settle, filter: "blur(1.5px)"}}>{rolling(seed)}</span>
        <span style={{position: "absolute", left: 0, top: 0, opacity: settle}}>?</span>
        <span style={{visibility: "hidden"}}>0</span>
      </span>
    );
  };

  return (
    <div style={{position: "absolute", left: ZONE.hosted.x, top: ZONE.hosted.y, width: 1920, height: 1080, opacity: zo}}>
      {/* ── 左：Function Tools ── */}
      <div style={{position: "absolute", left: L.x, top: L.y + (1 - pc) * 30, width: 800, height: 760, ...solidPanel(), opacity: pc}}>
        <Box x={40} y={32}>
          <span style={{fontFamily: FONT.sans, fontSize: 30, fontWeight: 750, color: C.text}}>Function Tools</span>
        </Box>
        <Box x={40} y={78}>
          <span style={{fontFamily: FONT.sans, fontSize: 18, color: C.text2}}>应用自己执行工具</span>
        </Box>
        <NodeBox x={60} y={150} w={240} h={250} label="你的应用" color={C.text2}>
          {T.lTool.map((at, i) => {
            const p = outBack(prog(t, at, 0.4));
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 30 + i * 70,
                  top: 150,
                  width: 54,
                  height: 54,
                  borderRadius: 12,
                  background: alpha(C.green, 0.25),
                  border: `1.5px solid ${C.green}`,
                  opacity: clamp01(p),
                  transform: `scale(${0.5 + 0.5 * clamp01(p)})`,
                }}
              />
            );
          })}
          <Box x={30} y={60}>
            <span style={{fontFamily: FONT.sans, fontSize: 15, color: C.text3}}>执行 function_call</span>
          </Box>
        </NodeBox>
        <NodeBox x={500} y={150} w={240} h={250} label="模型" color={C.blue}>
          <div
            style={{
              position: "absolute",
              left: 80,
              top: 90,
              width: 80,
              height: 80,
              borderRadius: 40,
              border: `2px solid ${C.blue}`,
              background: alpha(C.blue, 0.15 + 0.2 * (pulse(t, T.lResp[0] - 0.3, 0.6) + pulse(t, T.lResp[1] - 0.3, 0.6))),
            }}
          />
        </NodeBox>
        <Lane x1={310} x2={490} y={230} color={C.amber} dir={1} label="Request" />
        <Lane x1={310} x2={490} y={330} color={C.blue} dir={-1} label="Response" />
        {T.lReq.map((at, i) => (
          <Packet key={`q${i}`} t={t} at={at} from={310} to={490} y={230} color={C.amber} />
        ))}
        {T.lResp.map((at, i) => (
          <Packet key={`s${i}`} t={t} at={at} from={490} to={310} y={330} color={i === 0 ? C.green : C.blue} />
        ))}
        {COUNTERS.map((label, k) => {
          const ev = lEvents[k];
          return (
            <Counter key={k} x={21 + k * 196} y={470} label={label} color={COLORS[k]} flash={pulse(t, lastEvent(ev), 0.6)}>
              <RollingNumber t={t} events={ev} size={52} color={COLORS[k]} />
            </Counter>
          );
        })}
        <Box x={40} y={630}>
          <span style={{fontFamily: FONT.sans, fontSize: 19, color: C.text2}}>每一步都经过你的应用：四个数都数得清。</span>
        </Box>
      </div>

      {/* ── 右：托管工具 ── */}
      <div style={{position: "absolute", left: R.x, top: R.y + (1 - pr) * 30, width: 800, height: 760, ...solidPanel(), opacity: pr}}>
        <Box x={40} y={32}>
          <span style={{fontFamily: FONT.sans, fontSize: 30, fontWeight: 750, color: C.text}}>托管工具 Hosted Tools</span>
        </Box>
        <Box x={40} y={78}>
          <span style={{fontFamily: FONT.sans, fontSize: 18, color: C.text2}}>Web Search · File Search · Code Interpreter</span>
        </Box>
        <NodeBox x={60} y={150} w={200} h={250} label="你的应用" color={C.text2} />
        <NodeBox x={420} y={130} w={330} h={290} label="OpenAI 平台内部" color={C.text} glass>
          {/* 模型 */}
          <div
            style={{
              position: "absolute",
              left: 125,
              top: 70,
              width: 80,
              height: 80,
              borderRadius: 40,
              border: `2px solid ${C.blue}`,
              background: alpha(C.blue, 0.15 + (insideActive ? 0.25 * Math.abs(Math.sin(t * 5)) : 0)),
              filter: "blur(0.6px)",
            }}
          />
          {/* 平台里的工具：在动，但看不清走了几步 */}
          {[IconGlobe, IconFile, IconCode].map((Ic, i) => {
            const on = insideActive ? 0.35 + 0.65 * Math.max(0, Math.sin(t * 4.2 + i * 2.1)) : 0.25;
            return (
              <div key={i} style={{position: "absolute", left: 50 + i * 95, top: 190, opacity: on, filter: "blur(1.4px)"}}>
                <div style={{width: 56, height: 56, borderRadius: 14, border: `1.5px solid ${C.green}`, background: alpha(C.green, 0.12), display: "flex", alignItems: "center", justifyContent: "center"}}>
                  <Ic size={28} color={C.green} />
                </div>
              </div>
            );
          })}
          {/* 磨砂玻璃 */}
          <div style={{position: "absolute", inset: 0, background: "rgba(14,19,28,0.35)", backdropFilter: "blur(2px)"}} />
          <div
            style={{
              position: "absolute",
              left: 0,
              bottom: 0,
              height: 4,
              width: `${inside * 100}%`,
              background: `linear-gradient(90deg, ${alpha(C.text, 0.1)}, ${alpha(C.text, 0.5)})`,
              opacity: insideActive ? 1 : 0.3,
            }}
          />
        </NodeBox>
        <Lane x1={270} x2={410} y={230} color={C.amber} dir={1} label="Request" />
        <Lane x1={270} x2={410} y={330} color={C.blue} dir={-1} label="Response" />
        <Packet t={t} at={T.rReq} from={270} to={410} y={230} color={C.amber} />
        <Packet t={t} at={T.rResp} from={410} to={270} y={330} color={C.blue} />
        {COUNTERS.map((label, k) => {
          const ev = k === 0 ? [T.rReq + 0.4] : k === 1 ? [T.rResp + 0.4] : [];
          return (
            <Counter key={k} x={21 + k * 196} y={470} label={label} color={COLORS[k]} flash={k < 2 ? pulse(t, ev[0] ?? -9, 0.6) : 0.4 * pulse(t, T.settle, 0.8)}>
              {k < 2 ? <RollingNumber t={t} events={ev} size={52} color={COLORS[k]} /> : unknownNum(k * 17)}
            </Counter>
          );
        })}
        {/* ≠：这几个数不能互相替代 */}
        {[0, 1, 2].map((k) => {
          const p = outBack(prog(t, T.neq + k * 0.15, 0.4));
          if (p <= 0) return null;
          return (
            <Box key={k} x={21 + 170 + k * 196 - 2} y={508} w={30} style={{textAlign: "center", opacity: clamp01(p), transform: `scale(${p})`}}>
              <span style={{fontFamily: FONT.sans, fontSize: 34, fontWeight: 800, color: C.red}}>≠</span>
            </Box>
          );
        })}
        <Box x={40} y={630}>
          <span style={{fontFamily: FONT.sans, fontSize: 19, color: C.text2}}>平台内部编排：1 次请求里，走了几步？</span>
        </Box>
      </div>
    </div>
  );
};
