import React from "react";
import {ZONE, zoneAlpha} from "../zones";
import {C, FONT, alpha} from "../theme";
import {clamp01, outBack, outCubic, prog} from "../motion";
import {Caps, Chip, Icon, Mono, Path, Svg} from "../ui";
import {CONCURRENCY, EXAMPLE} from "../data";

const CALLS = EXAMPLE.responses[0].calls; // a, b, c
const LANE_Y = [190, 320, 450];
const SLOT_Y = [190, 320, 450];

// 完成顺序 b → c → a
const DONE_ORDER = [1, 2, 0];

const PAIR_PANELS = [
  {x: 60, title: "按下标", sub: "completion[0] → call[0]", c: C.red, at: 151.8, icon: "cross" as const},
  {x: 720, title: "按工具名", sub: "read_file → 哪一个？", c: C.amber, at: 153.2, icon: "search" as const},
  {x: 1380, title: "按 call_id", sub: "output.call_id → call.call_id", c: C.green, at: 154.8, icon: "check" as const},
];

const PairLines: React.FC<{mode: number; progress: number}> = ({mode, progress}) => {
  if (mode === 0) {
    return (
      <>
        {[0, 1, 2].map((i) => (
          <Path key={i} d={`M 156 ${82 + i * 52} H 402`} color={alpha(C.red, 0.55)} width={1.6} draw={progress} />
        ))}
      </>
    );
  }
  if (mode === 1) {
    return (
      <>
        {[0, 1, 2].map((i) =>
          [0, 1, 2].map((j) => (
            <Path
              key={`${i}-${j}`}
              d={`M 156 ${82 + i * 52} C 240 ${60 + i * 40}, 300 ${120 + j * 46}, 402 ${82 + j * 52}`}
              color={alpha(C.amber, 0.32 + (i === j ? 0.16 : 0))}
              width={1.2}
              draw={progress}
            />
          )),
        )}
      </>
    );
  }
  return (
    <>
      {[1, 2, 0].map((target, i) => (
        <Path
          key={i}
          d={`M 156 ${82 + i * 52} C 250 ${82 + i * 52}, 300 ${82 + target * 52}, 402 ${82 + target * 52}`}
          color={alpha(C.green, 0.7)}
          width={2}
          draw={progress}
        />
      ))}
    </>
  );
};

export const PitfallZone: React.FC<{t: number}> = ({t}) => {
  const inP = outCubic(prog(t, 146.2, 0.8));

  return (
    <div
      style={{
        position: "absolute",
        left: ZONE.pitfall.x,
        top: ZONE.pitfall.y,
        width: ZONE.pitfall.w,
        height: ZONE.pitfall.h,
        opacity: zoneAlpha("pitfall", t),
      }}
    >
      <div style={{position: "absolute", left: 60, top: 120, opacity: inP, display: "flex", alignItems: "center", gap: 10}}>
        <Chip color={C.green} size={10}>三个 Tool Call · 并发执行</Chip>
        <Mono size={11} color={C.faint}>完成顺序可能和发起顺序不同</Mono>
      </div>

      {/* 原始 Response */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 170,
          width: 380,
          height: 366,
          borderRadius: 14,
          border: `1px solid ${alpha(C.blue, 0.28)}`,
          background: alpha(C.blue, 0.06),
          opacity: inP,
          padding: "14px 16px",
        }}
      >
        <div style={{display: "flex", alignItems: "center", gap: 8}}>
          <span style={{width: 7, height: 7, borderRadius: 4, background: C.blue}} />
          <div style={{fontFamily: FONT.sans, fontSize: 13.5, fontWeight: 600, color: C.ink}}>Response #1</div>
          <Mono size={9.5} color={C.faint} style={{marginLeft: "auto"}}>resp_123</Mono>
        </div>
        <div style={{marginTop: 14, display: "flex", flexDirection: "column", gap: 10}}>
          {CALLS.map((call, i) => (
            <div
              key={call.callId}
              style={{
                borderRadius: 9,
                border: `1px solid ${alpha(C.green, 0.2)}`,
                background: alpha(C.green, 0.05),
                padding: "8px 10px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                opacity: outCubic(prog(t, 146.6 + i * 0.12, 0.4)),
              }}
            >
              <Mono size={12} color={C.ink}>{["a", "b", "c"][i]}</Mono>
              <Mono size={10} color={C.faint}>{call.name}</Mono>
              <Mono size={9} color={alpha(C.green, 0.85)} style={{marginLeft: "auto"}}>{call.callId}</Mono>
            </div>
          ))}
        </div>
        <Mono size={9.5} color={C.faint} style={{display: "block", marginTop: 14}}>
          发起顺序：a → b → c
        </Mono>
      </div>

      {/* 三条跑道 */}
      {CALLS.map((call, i) => {
        const doneAt = CONCURRENCY.done[["a", "b", "c"][i] as "a" | "b" | "c"];
        const start = CONCURRENCY.start + i * 0.08;
        const p = clamp01((t - start) / (doneAt - start));
        const done = t >= doneAt;
        return (
          <React.Fragment key={call.callId}>
            <div
              style={{
                position: "absolute",
                left: 476,
                top: LANE_Y[i] + 6,
                width: 96,
                opacity: inP,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Mono size={13} color={C.ink} weight={600}>{["a", "b", "c"][i]}</Mono>
              <Mono size={9} color={C.faint}>{call.callId}</Mono>
            </div>
            <div
              style={{
                position: "absolute",
                left: 586,
                top: LANE_Y[i] + 14,
                width: 700,
                height: 4,
                borderRadius: 2,
                background: "rgba(255,255,255,0.06)",
                opacity: inP,
              }}
            >
              <div style={{width: `${p * 100}%`, height: 4, borderRadius: 2, background: alpha(C.green, 0.75)}} />
            </div>
            <div style={{position: "absolute", left: 1294, top: LANE_Y[i] + 6, opacity: inP}}>
              <Mono size={9.5} color={done ? alpha(C.green, 0.9) : C.faint}>
                {done ? "done" : p > 0 ? "running" : "queued"}
              </Mono>
            </div>
          </React.Fragment>
        );
      })}

      {/* 结果槽位：先占位，再被结果替换 */}
      {DONE_ORDER.map((callIdx, slot) => {
        const doneAt = CONCURRENCY.done[["a", "b", "c"][callIdx] as "a" | "b" | "c"];
        const hide = clamp01((t - doneAt) / 0.35);
        return (
          <div
            key={`slot-${slot}`}
            style={{
              position: "absolute",
              left: 1430,
              top: SLOT_Y[slot] + 2,
              width: 400,
              height: 68,
              borderRadius: 10,
              border: `1px dashed ${alpha(C.green, 0.22)}`,
              background: "rgba(255,255,255,0.012)",
              opacity: inP * (1 - hide),
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "0 12px",
            }}
          >
            <Icon name="clock" size={13} color={alpha(C.green, 0.55)} />
            <Mono size={10} color={C.faint}>output · 等待结果</Mono>
            <Mono size={9} color={C.faint} style={{marginLeft: "auto"}}>#{slot + 1}</Mono>
          </div>
        );
      })}

      {/* 结果按完成顺序到达 */}
      {DONE_ORDER.map((callIdx, slot) => {
        const call = CALLS[callIdx];
        if (!call) return null;
        const doneAt = CONCURRENCY.done[["a", "b", "c"][callIdx] as "a" | "b" | "c"];
        const p = outBack(clamp01((t - doneAt) / 0.45), 1.3);
        if (t < doneAt - 0.05) return null;
        return (
          <div
            key={call.callId}
            style={{
              position: "absolute",
              left: 1430,
              top: SLOT_Y[slot] + 2,
              width: 400,
              height: 68,
              borderRadius: 10,
              border: `1px solid ${alpha(C.green, 0.3)}`,
              background: alpha(C.green, 0.07),
              opacity: clamp01(p),
              transform: `translateY(${(1 - clamp01(p)) * 14}px)`,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 12px",
            }}
          >
            <Icon name="fn" size={13} color={C.green} />
            <div>
              <Mono size={10} color={C.faint}>output</Mono>
              <div style={{marginTop: 2}}>
                <Mono size={11} color={C.ink}>{call.callId}</Mono>
                <Mono size={9.5} color={C.muted} style={{marginLeft: 8}}>{["a", "b", "c"][callIdx]} · {call.name}</Mono>
              </div>
            </div>
            <Mono size={9} color={C.faint} style={{marginLeft: "auto"}}>#{slot + 1}</Mono>
          </div>
        );
      })}

      {/* 三种配对方式 */}
      {PAIR_PANELS.map((panel, pi) => {
        const pp = outCubic(prog(t, panel.at, 0.7));
        if (t < panel.at - 0.05) return null;
        const lineP = outCubic(prog(t, panel.at + 0.55, 0.8));
        return (
          <div
            key={panel.title}
            style={{
              position: "absolute",
              left: panel.x,
              top: 600,
              width: 580,
              height: 272,
              borderRadius: 14,
              border: `1px solid ${alpha(panel.c, 0.26)}`,
              background: "rgba(255,255,255,0.018)",
              opacity: pp,
              transform: `translateY(${(1 - pp) * 14}px)`,
              overflow: "hidden",
            }}
          >
            <div style={{height: 42, display: "flex", alignItems: "center", gap: 8, padding: "0 14px", borderBottom: `1px solid ${alpha(panel.c, 0.16)}`}}>
              <Icon name={panel.icon} size={12} color={panel.c} />
              <Mono size={11.5} color={panel.c} weight={600}>{panel.title}</Mono>
              <Mono size={9} color={C.faint} style={{marginLeft: "auto"}}>{panel.sub}</Mono>
            </div>
            <Caps size={8} color={C.faint} style={{position: "absolute", left: 16, top: 54}}>完成顺序</Caps>
            <Caps size={8} color={C.faint} style={{position: "absolute", left: 404, top: 54}}>发起顺序</Caps>
            {DONE_ORDER.map((_ci, row) => (
              <Mono
                key={`l${row}`}
                size={10}
                color={C.soft}
                style={{position: "absolute", left: 16, top: 72 + row * 52}}
              >
                {["b", "c", "a"][row]} · output
              </Mono>
            ))}
            {[0, 1, 2].map((row) => (
              <Mono
                key={`r${row}`}
                size={10}
                color={C.soft}
                style={{position: "absolute", left: 404, top: 72 + row * 52}}
              >
                {["a", "b", "c"][row]} · call_00{row + 1}
              </Mono>
            ))}
            <Svg x={0} y={0} w={580} h={272} style={{position: "absolute"}}>
              <PairLines mode={pi} progress={lineP} />
            </Svg>
            {pi !== 1 && (
              <div style={{position: "absolute", right: 14, top: 194, opacity: lineP}}>
                <Mono size={9.5} color={alpha(panel.c, 0.95)}>
                  {pi === 0 ? "三条都错位" : "三根都对上"}
                </Mono>
              </div>
            )}
            {pi === 1 && (
              <div style={{position: "absolute", right: 16, top: 190, opacity: lineP}}>
                <Chip color={C.amber} size={9.5}>名字一样，配不上</Chip>
              </div>
            )}
          </div>
        );
      })}

      {/* 定论 */}
      <div
        style={{
          position: "absolute",
          left: 1200,
          top: 120,
          opacity: outCubic(prog(t, CONCURRENCY.verdict, 0.8)),
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Icon name="check" size={13} color={C.green} />
        <Mono size={12} color={alpha(C.green, 0.95)}>用 call_id 关联，和完成顺序无关</Mono>
      </div>
    </div>
  );
};
