import type { CSSProperties, ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { C, CJK, FONT, MONO } from "../theme";
import { clamp, easeOut, springIn } from "../lib/motion";
import { Label, Pill, Rule, StatusDot } from "../components/Primitives";
import { SceneHeader } from "../components/Chrome";
import { ScreenshotCrop } from "../components/Screenshot";
import { SCENES } from "../timeline";

const scene = SCENES[1];

const PathGraph = ({ kind, color }: { kind: "workflow" | "agent"; color: string }) => (
  <svg width={430} height={42} viewBox="0 0 430 42" style={{ display: "block", overflow: "visible" }}>
    {kind === "workflow" ? (
      <>
        <path d="M18 21H72M98 21H152M178 21H232M258 21H312M338 21H392" stroke="#CDD3DA" strokeWidth={1.5} />
        {[18, 98, 178, 258, 338, 412].map((x, i) => (
          <g key={x}>
            <circle cx={x} cy={21} r={10} fill="#FFFFFF" stroke={i === 0 ? "#8D949D" : "#CBD1D8"} strokeWidth={1.6} />
            <circle cx={x} cy={21} r={3} fill={i === 0 ? "#8D949D" : "#D6DBE0"} />
          </g>
        ))}
      </>
    ) : (
      <>
        <circle cx={24} cy={21} r={13} fill={`${color}14`} stroke={color} strokeWidth={1.8} />
        <circle cx={24} cy={21} r={4} fill={color} />
        <path d="M38 21H90" stroke={color} strokeWidth={1.6} />
        <path d="M90 21L112 9M90 21L112 33" stroke={color} strokeWidth={1.4} />
        <circle cx={124} cy={9} r={8} fill="#FFFFFF" stroke={color} strokeWidth={1.5} />
        <circle cx={124} cy={33} r={8} fill="#FFFFFF" stroke={color} strokeWidth={1.5} />
        <path d="M134 9H172M134 33H172" stroke={`${color}70`} strokeWidth={1.4} strokeDasharray="3 3" />
        <circle cx={184} cy={9} r={8} fill="#FFFFFF" stroke="#CBD1D8" strokeWidth={1.4} />
        <circle cx={184} cy={33} r={8} fill="#FFFFFF" stroke="#CBD1D8" strokeWidth={1.4} />
        <path d="M194 9H232" stroke="#D6DBE0" strokeWidth={1.3} strokeDasharray="3 3" />
        <path d="M194 33H232" stroke="#D6DBE0" strokeWidth={1.3} strokeDasharray="3 3" />
        <circle cx={244} cy={21} r={9} fill="#FFFFFF" stroke="#CBD1D8" strokeWidth={1.4} strokeDasharray="2.5 2.5" />
      </>
    )}
  </svg>
);

const ReadingCard = ({
  frame,
  delay,
  accent,
  index,
  kind,
  source,
  quote,
  translation,
  active,
  dim,
  children,
  style,
}: {
  frame: number;
  delay: number;
  accent: string;
  index: string;
  kind: "workflow" | "agent";
  source: string;
  quote: string;
  translation: ReactNode;
  active: boolean;
  dim: number;
  children?: ReactNode;
  style?: CSSProperties;
}) => {
  const entry = springIn(frame, delay, { damping: 21, stiffness: 115 });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: 480,
        padding: "17px 20px 15px",
        borderRadius: 18,
        border: `1.5px solid ${active ? `${accent}70` : C.line}`,
        background: "#FFFFFF",
        boxShadow: active
          ? `0 18px 46px ${accent}12, inset 3px 0 0 ${accent}`
          : "0 9px 26px rgba(30,42,57,.04)",
        opacity: clamp(entry * 1.15) * dim,
        transform: `translateY(${(1 - clamp(entry)) * 18}px)`,
        transition: "none",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: 1.3,
            color: active ? accent : C.faint,
          }}
        >
          {index} / {kind.toUpperCase()}
        </span>
        <span style={{ flex: 1, height: 1, background: active ? `${accent}25` : C.hairline }} />
        <span style={{ fontFamily: CJK, fontSize: 11, color: C.faint }}>{source}</span>
      </div>
      <div
        style={{
          marginTop: 10,
          fontFamily: FONT,
          fontSize: 20,
          fontWeight: 450,
          lineHeight: 1.42,
          color: active ? C.ink : C.body,
        }}
      >
        <span style={{ color: accent, fontFamily: "Georgia, serif", fontSize: 23 }}>“</span>
        {quote}
        <span style={{ color: accent, fontFamily: "Georgia, serif", fontSize: 23 }}>”</span>
      </div>
      <div
        style={{
          marginTop: 8,
          paddingTop: 8,
          borderTop: `1px solid ${C.hairline}`,
          fontFamily: CJK,
          fontSize: 25,
          fontWeight: 550,
          lineHeight: 1.5,
          color: C.ink,
        }}
      >
        {translation}
      </div>
      <div style={{ marginTop: 10, opacity: active ? 1 : 0.55 }}>
        <PathGraph kind={kind} color={active ? accent : C.faint} />
      </div>
      {children}
    </div>
  );
};

export const S02Anthropic = () => {
  const frame = useCurrentFrame();
  const imageEntry = springIn(frame, 0, { damping: 24, stiffness: 95 });
  const workflowActive = frame >= 78 && frame < 230;
  const agentActive = frame >= 237;
  const conclusion = frame >= 418;
  const workflowReveal = springIn(frame, 82, { damping: 20, stiffness: 120 });
  const push = easeOut(frame, 0, 570);

  return (
    <>
      <SceneHeader
        scene={scene}
        subtitle="不是能力高低，而是执行过程由谁组织"
        source="Anthropic · Building effective agents"
        width={1195}
      />

      <div
        style={{
          position: "absolute",
          left: 88,
          top: 244,
          width: 1224,
          height: 650,
          opacity: clamp(imageEntry * 1.1),
          transform: `translateY(${(1 - clamp(imageEntry)) * 22}px) scale(${1 + push * 0.004})`,
          transformOrigin: "48% 50%",
        }}
      >
        <div className="paper-surface" style={{ position: "absolute", inset: 0, borderRadius: 18, padding: 12 }}>
          <ScreenshotCrop
            src="images/anthropic.png"
            width={1200}
            height={626}
            imageWidth={2036}
            offsetX={-398}
            offsetY={-86}
            style={{ borderRadius: 10, border: `1px solid ${C.hairline}` }}
          >
            {/* 原文位置标识：Workflow 句 */}
            <div
              style={{
                position: "absolute",
                left: 90,
                top: 310,
                width: 1014,
                height: 84,
                borderRadius: 8,
                border: `2px solid ${C.yellow}`,
                background: `linear-gradient(90deg, ${C.yellow}16, ${C.yellow}02 80%)`,
                opacity: clamp(workflowReveal * 1.15) * (agentActive ? 0.5 : 1),
                boxShadow: workflowActive ? `0 0 0 6px ${C.yellow}12` : "none",
              }}
            />
          </ScreenshotCrop>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 1350,
          top: 228,
          width: 480,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, height: 20, marginBottom: 10 }}>
          <Rule color={C.blue} width={22} height={3} />
          <Label size={10.5} tracking={1.6} color={C.muted}>
            两段原文 / 同一个分界
          </Label>
          <div style={{ marginLeft: "auto" }}>
            <Pill color={C.muted} soft="#F3F5F7" style={{ height: 24, fontSize: 11 }}>
              意译为制作整理
            </Pill>
          </div>
        </div>

        <ReadingCard
          frame={frame}
          delay={78}
          accent={C.yellowDeep}
          index="01"
          kind="workflow"
          source="原文"
          quote="orchestrated through predefined code paths"
          translation={
            <>
              按预定义代码路径，
              <br />
              组织模型和工具。
            </>
          }
          active={workflowActive}
          dim={agentActive ? 0.62 : 1}
          style={{ top: 30 }}
        >
          <div
            style={{
              position: "absolute",
              right: 20,
              top: 18,
              opacity: workflowActive ? 1 : 0,
            }}
          >
            <StatusDot color={C.yellowDeep} size={6} />
          </div>
        </ReadingCard>

        <ReadingCard
          frame={frame}
          delay={238}
          accent={C.blue}
          index="02"
          kind="agent"
          source="原文"
          quote="LLMs dynamically direct their own processes and tool usage"
          translation={
            <>
              模型动态决定
              <br />
              执行过程与工具使用。
            </>
          }
          active={agentActive}
          dim={1}
          style={{ top: 318 }}
        >
          <div
            style={{
              position: "absolute",
              right: 20,
              top: 18,
              opacity: agentActive ? 1 : 0,
            }}
          >
            <StatusDot color={C.blue} size={6} />
          </div>
        </ReadingCard>
      </div>

      <div
        style={{
          position: "absolute",
          left: 92,
          top: 902,
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "9px 15px",
          borderRadius: 10,
          border: `1px solid ${C.blue}2B`,
          background: "rgba(255,255,255,.78)",
          opacity: clamp(springIn(frame, 418, { damping: 20, stiffness: 120 }) * 1.15),
          transform: `translateY(${(1 - clamp(springIn(frame, 418))) * 8}px)`,
        }}
      >
        <StatusDot color={C.blue} size={7} />
        <span style={{ fontFamily: CJK, fontSize: 14, fontWeight: 550, color: C.blueDeep }}>
          模型进入运行时决策
        </span>
        <span style={{ width: 1, height: 14, background: `${C.blue}30` }} />
        <span style={{ fontFamily: CJK, fontSize: 13, color: C.muted }}>接着看 OpenAI 的任务定义</span>
      </div>

      <div
        style={{
          position: "absolute",
          left: 1350,
          top: 844,
          width: 480,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: C.faint,
          fontFamily: CJK,
          fontSize: 12.5,
          opacity: conclusion ? 1 : 0.55,
          transition: "none",
        }}
      >
        <span>{conclusion ? "区别：谁在决定下一步" : "Workflow 也可以有分支和循环"}</span>
        <span style={{ fontFamily: MONO, letterSpacing: 0.8, fontSize: 10 }}>ANTHROPIC / 2024</span>
      </div>
    </>
  );
};
