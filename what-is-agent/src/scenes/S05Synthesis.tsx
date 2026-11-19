import type { ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { C, CJK, FONT, MONO } from "../theme";
import { clamp, easeOut, springIn } from "../lib/motion";
import { Label, Pill, StatusDot } from "../components/Primitives";
import { SceneHeader } from "../components/Chrome";
import { SCENES } from "../timeline";

const scene = SCENES[4];

const SourcePoint = ({
  x,
  frame,
  delay,
  color,
  source,
  text,
}: {
  x: number;
  frame: number;
  delay: number;
  color: string;
  source: string;
  text: string;
}) => {
  const k = springIn(frame, delay, { damping: 21, stiffness: 110 });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 268,
        width: 820,
        height: 126,
        padding: "15px 22px 13px",
        borderRadius: 16,
        border: `1.5px solid ${color}2C`,
        background: "rgba(255,255,255,.88)",
        boxShadow: "0 9px 28px rgba(30,42,57,.035)",
        opacity: clamp(k * 1.15),
        transform: `translateY(${(1 - clamp(k)) * 20}px)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <StatusDot color={color} size={6} />
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1.3, color }}>{source}</span>
        <span style={{ flex: 1, height: 1, background: `${color}1F` }} />
        <span style={{ fontFamily: CJK, fontSize: 11, color: C.faint }}>上一镜留下的要点</span>
      </div>
      <div
        style={{
          marginTop: 12,
          fontFamily: CJK,
          fontSize: 28,
          fontWeight: 600,
          color: C.ink,
          letterSpacing: 0.2,
          lineHeight: 1.35,
        }}
      >
        {text}
      </div>
      <div style={{ marginTop: 6, fontFamily: CJK, fontSize: 11.5, color: C.muted }}>
        {source === "ANTHROPIC" ? "Who directs the process?" : "What does the system accomplish?"}
      </div>
    </div>
  );
};

const Marked = ({
  children,
  color,
  progress,
}: {
  children: ReactNode;
  color: string;
  progress: number;
}) => (
  <span style={{ position: "relative", display: "inline-block", whiteSpace: "nowrap" }}>
    <span
      style={{
        position: "absolute",
        left: -3,
        right: -3,
        bottom: 5,
        height: 13,
        borderRadius: 3,
        background: `${color}30`,
        transform: `scaleX(${clamp(progress)})`,
        transformOrigin: "left",
        zIndex: 0,
      }}
    />
    <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
  </span>
);

const SystemStrip = ({ frame }: { frame: number }) => {
  const full = easeOut(frame, 410, 42);
  const line = easeOut(frame, 480, 36);
  return (
    <div
      style={{
        position: "absolute",
        left: 230,
        top: 784,
        width: 1460,
        height: 100,
        borderRadius: 17,
        border: `1px solid ${C.ink}20`,
        background: "#FFFFFF",
        boxShadow: "0 8px 24px rgba(30,42,57,.035)",
        opacity: 0.74 + full * 0.26,
        transform: `translateY(${(1 - full) * 6}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 22,
          top: 0,
          bottom: 0,
          width: 115,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1.4, color: C.faint }}>SYSTEM</span>
        <span style={{ fontFamily: CJK, fontSize: 21, fontWeight: 650, color: C.ink }}>系统</span>
      </div>
      <div style={{ position: "absolute", left: 145, top: 19, bottom: 19, width: 1, background: C.line }} />
      <div style={{ position: "absolute", left: 170, top: 25, display: "flex", gap: 14 }}>
        {[
          ["模型", C.blue, "做决策"],
          ["工具", C.green, "连接环境"],
          ["指令", C.yellowDeep, "给出约束"],
        ].map(([name, color, note]) => (
          <div
            key={name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 13px",
              borderRadius: 9,
              background: `${color}0D`,
              border: `1px solid ${color}1A`,
            }}
          >
            <StatusDot color={color} size={5} />
            <span style={{ fontFamily: CJK, fontSize: 16, fontWeight: 600, color: C.ink }}>{name}</span>
            <span style={{ fontFamily: CJK, fontSize: 11.5, color: C.muted }}>{note}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          right: 22,
          top: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          gap: 9,
        }}
      >
        <span style={{ width: 28, height: 1, background: `${C.green}55` }} />
        <Pill color={C.green} soft={C.greenSoft} style={{ height: 27, fontSize: 11.5 }}>
          反馈
        </Pill>
        <span style={{ fontFamily: CJK, fontSize: 11.5, color: C.muted }}>结果回来，再决定下一步</span>
      </div>
      <svg
        width={340}
        height={80}
        viewBox="0 0 340 80"
        style={{ position: "absolute", right: -250, top: 8, overflow: "visible", pointerEvents: "none" }}
      >
        <path
          d="M0 42H188C220 42 236 60 252 60"
          fill="none"
          stroke={`${C.green}80`}
          strokeWidth={1.5}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - line}
        />
        <path
          d="M245 54L256 60L245 66"
          fill="none"
          stroke={`${C.green}90`}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={line > 0.8 ? 1 : 0}
        />
      </svg>
    </div>
  );
};

export const S05Synthesis = () => {
  const frame = useCurrentFrame();
  const definitionEntry = springIn(frame, 80, { damping: 22, stiffness: 105 });
  const lines = easeOut(frame, 66, 28);
  const decisionK = easeOut(frame, 130, 28);
  const toolsK = easeOut(frame, 194, 28);
  const taskK = easeOut(frame, 260, 28);
  const keyK = springIn(frame, 310, { damping: 21, stiffness: 115 });
  const cardBorder = `1.5px solid ${C.blue}30`;

  return (
    <>
      <SceneHeader
        scene={scene}
        title="把两家的重点，合成一句话"
        subtitle="不是把两段原文拼起来，而是提炼两家共同强调的能力"
        source="本片归纳 · 不是任何一家公司的原句"
        sourceColor={C.blue}
        sourceLabel="NOTE"
        width={1150}
      />

      <SourcePoint
        x={96}
        frame={frame}
        delay={20}
        color={C.blue}
        source="ANTHROPIC"
        text="动态决定执行过程与工具使用"
      />
      <SourcePoint
        x={1004}
        frame={frame}
        delay={32}
        color={C.green}
        source="OPENAI"
        text="替你独立完成任务"
      />

      <svg width={1920} height={520} viewBox="0 0 1920 520" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <path
          d="M506 394C650 420 815 436 948 444"
          fill="none"
          stroke={`${C.blue}66`}
          strokeWidth={1.5}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - lines}
        />
        <path
          d="M1414 394C1270 420 1105 436 972 444"
          fill="none"
          stroke={`${C.green}66`}
          strokeWidth={1.5}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - lines}
        />
        <circle cx={948} cy={444} r={3} fill={C.blue} opacity={lines > 0.85 ? 1 : 0} />
        <circle cx={972} cy={444} r={3} fill={C.green} opacity={lines > 0.85 ? 1 : 0} />
      </svg>

      <div
        style={{
          position: "absolute",
          left: 230,
          top: 444,
          width: 1460,
          height: 270,
          padding: "26px 38px 24px",
          borderRadius: 20,
          border: cardBorder,
          background: "rgba(255,255,255,.94)",
          boxShadow: `0 26px 64px ${C.blue}0B`,
          opacity: clamp(definitionEntry * 1.15),
          transform: `translateY(${(1 - clamp(definitionEntry)) * 26}px) scale(${0.987 + clamp(definitionEntry) * 0.013})`,
          transformOrigin: "50% 40%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "6px 11px",
              borderRadius: 6,
              background: C.blueSoft,
              border: `1px solid ${C.blue}30`,
              fontFamily: CJK,
              fontSize: 13,
              fontWeight: 600,
              color: C.blueDeep,
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: 3, background: C.blue }} />
            本片归纳
          </span>
          <span style={{ fontFamily: CJK, fontSize: 12, color: C.faint }}>
            合并两家的重点，不是任何一家公司的逐字原句
          </span>
          <div style={{ marginLeft: "auto" }}>
            <Label size={9.5} tracking={1.4} color="#B0B7BF">
              OUR SYNTHESIS
            </Label>
          </div>
        </div>

        <div
          style={{
            marginTop: 22,
            fontFamily: CJK,
            fontSize: 41,
            fontWeight: 550,
            lineHeight: 1.62,
            letterSpacing: 0.1,
            color: C.ink,
          }}
        >
          <span style={{ fontFamily: FONT, fontSize: 47, fontWeight: 650, color: C.blue }}>Agent</span>
          <span style={{ color: C.body }}>：</span>
          让大模型在
          <Marked color={C.blue} progress={decisionK}>
            执行中做决策
          </Marked>
          ，
          <br />
          借助
          <Marked color={C.green} progress={toolsK}>
            工具和反馈
          </Marked>
          ，替你
          <Marked color={C.yellow} progress={taskK}>
            完成任务
          </Marked>
          。
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 600,
          top: 724,
          display: "flex",
          alignItems: "center",
          gap: 10,
          opacity: clamp(keyK * 1.15),
          transform: `translateY(${(1 - clamp(keyK)) * 8}px)`,
        }}
      >
        <span
          style={{
            fontFamily: CJK,
            fontSize: 12,
            fontWeight: 600,
            color: C.blueDeep,
            background: C.blueSoft,
            border: `1px solid ${C.blue}25`,
            borderRadius: 5,
            padding: "4px 8px",
          }}
        >
          决策
        </span>
        <span style={{ fontFamily: CJK, fontSize: 19, fontWeight: 550, color: C.ink }}>
          模型参与决定接下来怎么做
        </span>
        <span style={{ fontFamily: CJK, fontSize: 13, color: C.muted }}>
          不是只生成一段答案
        </span>
      </div>

      <SystemStrip frame={frame} />

      <div
        style={{
          position: "absolute",
          right: 90,
          top: 902,
          display: "flex",
          alignItems: "center",
          gap: 7,
          fontFamily: MONO,
          fontSize: 9.5,
          letterSpacing: 1.1,
          color: C.faint,
        }}
      >
        <span style={{ width: 4, height: 4, borderRadius: 4, background: C.blue }} />
        NEXT / AGENT LOOP
      </div>
    </>
  );
};
