import React from "react";
import {ZONE, zoneAlpha} from "../zones";
import {C, FONT, alpha} from "../theme";
import {clamp01, outBack, outCubic, prog} from "../motion";
import {ArrowDefs, Caps, Chip, Icon, Mono, Path, Svg} from "../ui";

const T = {
  breakLine: 26.7,
  fan: 27.2,
  stamp: 28.1,
};

const CURVES = [
  "M 400 712 C 620 712, 700 620, 878 620",
  "M 400 712 C 640 712, 720 712, 878 712",
  "M 400 712 C 620 712, 700 804, 878 804",
];

export const QuestionZone: React.FC<{t: number}> = ({t}) => {
  const broken = outCubic(prog(t, T.breakLine, 0.65));
  const fan = outCubic(prog(t, T.fan, 0.8));
  const stamp = outBack(prog(t, T.stamp, 0.5), 2.1);

  return (
    <div
      style={{
        position: "absolute",
        left: ZONE.question.x,
        top: ZONE.question.y,
        width: ZONE.question.w,
        height: ZONE.question.h,
        opacity: zoneAlpha("question", t),
      }}
    >
      <Caps style={{position: "absolute", left: 84, top: 150}} color={C.faint}>
        The question
      </Caps>

      <div
        style={{
          position: "absolute",
          left: 80,
          top: 196,
          fontFamily: FONT.sans,
          fontSize: 54,
          fontWeight: 600,
          letterSpacing: "-0.01em",
          color: C.ink,
          lineHeight: 1.15,
        }}
      >
        Tool Calling 和 Request
      </div>
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 268,
          fontFamily: FONT.sans,
          fontSize: 60,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          color: C.ink,
          display: "flex",
          alignItems: "baseline",
          gap: 4,
        }}
      >
        是一对一的吗
        <span style={{color: C.red}}>？</span>
      </div>

      {/* 1 : 1 的连线，然后被扯断 */}
      <Svg x={0} y={0} w={1300} h={1080}>
        <ArrowDefs color={C.amber} id="q-arrow" />
        <Path
          d="M 402 712 H 686"
          color={alpha(C.amber, 0.55)}
          width={2}
          draw={1 - broken}
          dashed={false}
        />
        <Path
          d="M 694 712 H 878"
          color={alpha(C.amber, 0.55)}
          width={2}
          draw={1 - broken}
        />
        {fan > 0.01 &&
          CURVES.map((d, i) => (
            <Path
              key={d}
              d={d}
              color={alpha(C.green, 0.55)}
              width={1.8}
              draw={clamp01((fan - i * 0.12) / 0.75)}
              arrow
            />
          ))}
      </Svg>

      <div style={{position: "absolute", left: 500, top: 660, opacity: 1 - broken}}>
        <Chip color={C.amber} size={12} filled>
          1 : 1 ?
        </Chip>
      </div>

      {/* 左：Request */}
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 650,
          width: 262,
          height: 124,
          borderRadius: 14,
          border: `1px solid ${alpha(C.amber, 0.34)}`,
          background: `linear-gradient(180deg, ${alpha(C.amber, 0.11)}, rgba(255,255,255,0.02))`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 18px",
          gap: 6,
        }}
      >
        <div style={{display: "flex", alignItems: "center", gap: 8}}>
          <Icon name="globe" size={14} color={C.amber} />
          <Caps size={9.5} color={alpha(C.amber, 0.9)}>
            API Request
          </Caps>
        </div>
        <Mono size={15} color={C.ink}>1 次顶层请求</Mono>
      </div>

      {/* 右：一个 Tool Call（会被拆成三个） */}
      <div
        style={{
          position: "absolute",
          left: 878,
          top: 650,
          width: 262,
          height: 124,
          opacity: 1 - fan,
          transform: `translateY(${broken * 16}px) rotate(${broken * 4}deg)`,
          borderRadius: 14,
          border: `1px solid ${alpha(C.green, 0.34)}`,
          background: `linear-gradient(180deg, ${alpha(C.green, 0.11)}, rgba(255,255,255,0.02))`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 18px",
          gap: 6,
        }}
      >
        <div style={{display: "flex", alignItems: "center", gap: 8}}>
          <Icon name="fn" size={14} color={C.green} />
          <Caps size={9.5} color={alpha(C.green, 0.9)}>
            Tool Call
          </Caps>
        </div>
        <Mono size={15} color={C.ink}>1 次工具调用</Mono>
      </div>

      {[0, 1, 2].map((i) => {
        const p = outBack(clamp01((fan - i * 0.12) / 0.55), 1.5);
        if (fan <= 0.01) return null;
        const y = [560, 650, 740][i];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 878,
              top: y,
              width: 262,
              height: 124,
              borderRadius: 14,
              border: `1px solid ${alpha(C.green, 0.34)}`,
              background: `linear-gradient(180deg, ${alpha(C.green, 0.11)}, rgba(255,255,255,0.02))`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "0 18px",
              gap: 6,
              opacity: clamp01(p),
              transform: `translateY(${(1 - clamp01(p)) * -14}px) scale(${0.92 + 0.08 * clamp01(p)})`,
            }}
          >
            <div style={{display: "flex", alignItems: "center", gap: 8}}>
              <Icon name="fn" size={14} color={C.green} />
              <Caps size={9.5} color={alpha(C.green, 0.9)}>
                Tool Call
              </Caps>
              <Mono size={10} color={C.faint} style={{marginLeft: "auto"}}>
                call_00{i + 1}
              </Mono>
            </div>
            <Mono size={15} color={C.ink}>同一个 Response 里</Mono>
          </div>
        );
      })}

      {/* 结论章 */}
      <div
        style={{
          position: "absolute",
          left: 760,
          top: 470,
          opacity: clamp01(stamp),
          transform: `scale(${1.15 - 0.15 * clamp01(stamp)}) rotate(-6deg)`,
          border: `3px solid ${alpha(C.red, 0.85)}`,
          borderRadius: 10,
          padding: "8px 18px 10px",
          color: C.red,
          fontFamily: FONT.sans,
          fontSize: 46,
          fontWeight: 700,
          letterSpacing: "0.04em",
          boxShadow: `0 0 30px ${alpha(C.red, 0.15)}`,
        }}
      >
        不是一对一
      </div>
    </div>
  );
};
