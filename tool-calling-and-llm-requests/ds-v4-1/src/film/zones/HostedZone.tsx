import React from "react";
import {ZONE, zoneAlpha} from "../zones";
import {C, FONT, alpha} from "../theme";
import {clamp01, outCubic, prog} from "../motion";
import {Caps, Chip, Dot, Icon, Mono} from "../ui";

const T = {
  leftCount: 88.0,
  hostedSpin: 96.2,
  unknown: 99.8,
  verdict: 100.6,
};

const LEFT_EVENTS = {
  request: [88.0, 88.7, 89.4],
  response: [88.2, 88.9, 89.6],
  generation: [88.2, 88.9, 89.6],
  tool: [88.5, 89.1, 89.7, 90.3, 90.9],
};

const Counter: React.FC<{
  label: string;
  value: number;
  color: string;
  unknown?: number;
  suffix?: string;
}> = ({label, value, color, unknown = 0, suffix = ""}) => (
  <div
    style={{
      borderRadius: 10,
      border: `1px solid ${alpha(color, 0.2)}`,
      background: alpha(color, 0.05),
      padding: "10px 12px",
      display: "flex",
      flexDirection: "column",
      gap: 4,
    }}
  >
    <Caps size={8.5} color={alpha(color, 0.85)}>{label}</Caps>
    <div style={{display: "flex", alignItems: "baseline", gap: 6}}>
      <span
        style={{
          fontFamily: FONT.sans,
          fontSize: 30,
          fontWeight: 650,
          color: unknown > 0.5 ? C.red : C.ink,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
        }}
      >
        {unknown > 0.5 ? "?" : value}
      </span>
      {suffix && <Mono size={10} color={C.faint}>{suffix}</Mono>}
    </div>
  </div>
);

const countOf = (t: number, events: number[]) => events.reduce((n, e) => (e <= t ? n + 1 : n), 0);

export const HostedZone: React.FC<{t: number}> = ({t}) => {
  const leftIn = outCubic(prog(t, 87.4, 0.8));
  const unknown = outCubic(prog(t, T.unknown, 0.6));
  const verdict = outCubic(prog(t, T.verdict, 0.7));
  const hostedN = Math.min(9, Math.floor(clamp01((t - T.hostedSpin) / 3.0) * 12));

  return (
    <div
      style={{
        position: "absolute",
        left: ZONE.hosted.x,
        top: ZONE.hosted.y,
        width: ZONE.hosted.w,
        height: ZONE.hosted.h,
        opacity: zoneAlpha("hosted", t),
      }}
    >
      {/* 左：Function Tools */}
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 160,
          width: 830,
          height: 740,
          borderRadius: 18,
          border: `1px solid ${alpha(C.green, 0.22)}`,
          background: "linear-gradient(180deg, rgba(70,214,165,0.055), rgba(255,255,255,0.012))",
          opacity: leftIn,
          transform: `translateY(${(1 - leftIn) * 16}px)`,
          padding: "22px 24px",
        }}
      >
        <div style={{display: "flex", alignItems: "center", gap: 10}}>
          <Icon name="fn" size={16} color={C.green} />
          <div style={{fontFamily: FONT.sans, fontSize: 18, fontWeight: 600, color: C.ink}}>Function Tools</div>
          <Chip color={C.green} size={9.5} style={{marginLeft: "auto"}}>应用自己执行</Chip>
        </div>
        <Mono size={11} color={C.faint} style={{display: "block", marginTop: 6}}>
          每一步都在你的 Runtime 里，看得见、数得清
        </Mono>

        {/* 流程图 */}
        <div style={{position: "relative", height: 300, marginTop: 22}}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 24,
              width: 170,
              height: 62,
              borderRadius: 10,
              border: `1px solid ${alpha(C.amber, 0.3)}`,
              background: alpha(C.amber, 0.08),
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "0 12px",
              gap: 3,
            }}
          >
            <Caps size={8} color={alpha(C.amber, 0.9)}>Request</Caps>
            <Mono size={12} color={C.ink}>POST /responses</Mono>
          </div>

          <svg width={520} height={300} style={{position: "absolute", left: 170, top: 0, overflow: "visible"}}>
            <defs>
              <marker id="host-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
                <path d="M0,0.6 L5.6,3 L0,5.6 z" fill={alpha(C.amber, 0.8)} />
              </marker>
            </defs>
            <path d="M 0 55 H 190" stroke={alpha(C.amber, 0.55)} strokeWidth={1.5} markerEnd="url(#host-arrow)" fill="none" />
          </svg>

          <div
            style={{
              position: "absolute",
              left: 360,
              top: 0,
              width: 420,
              height: 118,
              borderRadius: 12,
              border: `1px solid ${alpha(C.blue, 0.28)}`,
              background: alpha(C.blue, 0.07),
              padding: "12px 14px",
            }}
          >
            <div style={{display: "flex", alignItems: "center", gap: 7}}>
              <Dot color={C.blue} size={6} glow />
              <Mono size={11} color={alpha(C.blue, 0.95)}>Response #1</Mono>
              <Mono size={9.5} color={C.faint} style={{marginLeft: "auto"}}>3 个 output</Mono>
            </div>
            <div style={{marginTop: 10, display: "flex", gap: 6}}>
              {["read_file", "read_file", "read_file"].map((n, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    borderRadius: 7,
                    border: `1px solid ${alpha(C.green, 0.22)}`,
                    background: alpha(C.green, 0.08),
                    padding: "6px 8px",
                  }}
                >
                  <Mono size={10} color={C.green}>{n}</Mono>
                  <div style={{marginTop: 2}}>
                    <Mono size={8.5} color={C.faint}>call_00{i + 1}</Mono>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <svg width={850} height={300} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
            <path
              d="M 570 130 C 570 210, 260 210, 240 240"
              stroke={alpha(C.green, 0.5)}
              strokeWidth={1.5}
              fill="none"
              strokeDasharray="5 7"
            />
            <path d="M 240 240 H 70" stroke={alpha(C.green, 0.5)} strokeWidth={1.5} fill="none" strokeDasharray="5 7" />
          </svg>

          <div style={{position: "absolute", left: 0, top: 240, display: "flex", gap: 8}}>
            {["exec_01", "exec_02", "exec_03", "exec_04", "exec_05"].map((e, i) => (
              <div
                key={e}
                style={{
                  padding: "6px 9px",
                  borderRadius: 7,
                  border: `1px solid ${alpha(C.green, 0.2)}`,
                  background: alpha(C.green, 0.05),
                  opacity: outCubic(prog(t, 90.6 + i * 0.18, 0.4)),
                }}
              >
                <Mono size={9.5} color={C.soft}>{e}</Mono>
              </div>
            ))}
          </div>
          <div style={{position: "absolute", left: 620, top: 244, opacity: outCubic(prog(t, 90.4, 0.5))}}>
            <Chip color={C.green} size={9.5}>5 次执行</Chip>
          </div>
        </div>

        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10}}>
          <Counter label="API Request" value={countOf(t, LEFT_EVENTS.request)} color={C.amber} />
          <Counter label="Response" value={countOf(t, LEFT_EVENTS.response)} color={C.blue} />
          <Counter label="Generation" value={countOf(t, LEFT_EVENTS.generation)} color={C.blue} />
          <Counter label="Tool Execution" value={countOf(t, LEFT_EVENTS.tool)} color={C.green} />
        </div>
        <div style={{marginTop: 12, display: "flex", alignItems: "center", gap: 7}}>
          <Icon name="check" size={12} color={C.green} />
          <Mono size={10.5} color={C.muted}>四个数在同一条时间线上对得上</Mono>
        </div>

        <div style={{position: "absolute", left: 24, right: 24, bottom: 22, paddingTop: 12, borderTop: `1px dashed ${alpha(C.green, 0.2)}`}}>
          <Caps size={8.5} color={C.faint}>统计口径</Caps>
          <Mono size={10} color={C.muted} style={{display: "block", marginTop: 5}}>
            请求、响应、执行都发生在应用侧，逐个可数
          </Mono>
        </div>
      </div>

      {/* 右：托管工具 */}
      <div
        style={{
          position: "absolute",
          left: 1020,
          top: 160,
          width: 830,
          height: 740,
          borderRadius: 18,
          border: `1px solid ${alpha(C.violet, 0.22)}`,
          background: "linear-gradient(180deg, rgba(155,140,255,0.055), rgba(255,255,255,0.012))",
          opacity: leftIn,
          transform: `translateY(${(1 - leftIn) * 16}px)`,
          padding: "22px 24px",
          overflow: "hidden",
        }}
      >
        <div style={{display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 3}}>
          <Icon name="globe" size={16} color={C.violet} />
          <div style={{fontFamily: FONT.sans, fontSize: 18, fontWeight: 600, color: C.ink}}>托管工具</div>
          <Chip color={C.violet} size={9.5} style={{marginLeft: "auto"}}>平台内部编排</Chip>
        </div>
        <Mono size={11} color={C.faint} style={{display: "block", marginTop: 6}}>
          Web Search · File Search · Code Interpreter
        </Mono>

        {/* 磨砂玻璃：里面的步骤看不清 */}
        <div
          style={{
            position: "relative",
            height: 300,
            marginTop: 22,
            borderRadius: 12,
            overflow: "hidden",
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${alpha(C.violet, 0.18)}`,
          }}
        >
          <div style={{filter: "blur(5px)", opacity: 0.55, padding: 18}}>
            {Array.from({length: 5}).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 40,
                  marginBottom: 12,
                  marginLeft: i % 2 ? 26 : 0,
                  width: 300 + ((i * 53) % 200),
                  borderRadius: 8,
                  background: alpha(i % 2 ? C.violet : C.amber, 0.16),
                  border: `1px solid ${alpha(i % 2 ? C.violet : C.amber, 0.2)}`,
                  transform: `translateX(${Math.sin(t * 0.7 + i) * 6}px)`,
                }}
              />
            ))}
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(10,13,20,0.25), rgba(10,13,20,0.75))",
            }}
          />
          <div style={{position: "absolute", left: 0, right: 0, bottom: 14, display: "flex", justifyContent: "center"}}>
            <Mono size={10.5} color={alpha(C.violet, 0.9)}>这些步骤在平台内部，应用看不见</Mono>
          </div>
        </div>

        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, position: "relative", zIndex: 3}}>
          <Counter
            label="API Request"
            value={Math.min(9, 1 + (hostedN % 4))}
            color={C.amber}
            unknown={unknown}
          />
          <Counter
            label="Response"
            value={Math.min(9, 1 + (hostedN % 5))}
            color={C.blue}
            unknown={unknown}
          />
          <Counter
            label="Generation"
            value={Math.min(9, 2 + (hostedN % 7))}
            color={C.blue}
            unknown={unknown}
          />
          <Counter
            label="Tool Execution"
            value={Math.min(9, 3 + (hostedN % 6))}
            color={C.green}
            unknown={unknown}
          />
        </div>
        <div style={{marginTop: 12, display: "flex", alignItems: "center", gap: 7, opacity: 0.4 + 0.6 * unknown}}>
          <Icon name="cross" size={12} color={C.red} />
          <Mono size={10.5} color={alpha(C.red, 0.9)}>这几个数没有一一对应的关系</Mono>
        </div>

        <div style={{position: "absolute", left: 24, right: 24, bottom: 22, paddingTop: 12, borderTop: `1px dashed ${alpha(C.violet, 0.2)}`}}>
          <Caps size={8.5} color={C.faint}>统计口径</Caps>
          <Mono size={10} color={C.muted} style={{display: "block", marginTop: 5}}>
            平台内部编排：应用只看到 1 次顶层请求
          </Mono>
        </div>
      </div>

      {/* ≠ 结论 */}
      <div
        style={{
          position: "absolute",
          left: 300,
          top: 116,
          width: 1320,
          opacity: verdict,
          transform: `translateY(${(1 - verdict) * -10}px)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            border: `2px solid ${alpha(C.red, 0.7)}`,
            background: "rgba(7,9,14,0.9)",
            display: "grid",
            placeItems: "center",
            boxShadow: `0 0 34px ${alpha(C.red, 0.2)}`,
          }}
        >
          <span style={{fontFamily: FONT.sans, fontSize: 30, color: C.red}}>≠</span>
        </div>
        <div style={{display: "flex", flexDirection: "column", gap: 4}}>
          <Mono size={13} color={alpha(C.red, 0.95)}>顶层 API Request 的个数 ≠ 平台内部真实发生的执行次数</Mono>
          <Mono size={10.5} color={C.muted}>数字可能相关，但不能不加区分地互相替代</Mono>
        </div>
      </div>
    </div>
  );
};
