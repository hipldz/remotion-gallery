import type { ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { C, CJK, MONO } from "../theme";
import { clamp, easeOut, springIn } from "../lib/motion";
import { Label, Rule, StatusDot } from "../components/Primitives";
import { SceneHeader } from "../components/Chrome";
import { LoopDiagram } from "../components/LoopDiagram";
import { SCENES } from "../timeline";

const scene = SCENES[6];

const SourceNote = ({
  frame,
  delay,
  color,
  source,
  title,
  note,
  top,
}: {
  frame: number;
  delay: number;
  color: string;
  source: string;
  title: string;
  note: string;
  top: number;
}) => {
  const k = springIn(frame, delay, { damping: 21, stiffness: 110 });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top,
        width: 242,
        padding: "13px 14px 13px 15px",
        borderLeft: `2px solid ${color}`,
        background: "rgba(255,255,255,.62)",
        borderRadius: "0 8px 8px 0",
        opacity: clamp(k * 1.15),
        transform: `translateX(${(1 - clamp(k)) * 12}px)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 5, height: 5, borderRadius: 4, background: color }} />
        <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: 1, color }}>{source}</span>
      </div>
      <div style={{ marginTop: 5, fontFamily: CJK, fontSize: 15, fontWeight: 600, color: C.ink }}>{title}</div>
      <div style={{ marginTop: 4, fontFamily: CJK, fontSize: 10.5, lineHeight: 1.4, color: C.muted }}>{note}</div>
    </div>
  );
};

const SummaryRow = ({
  frame,
  delay,
  color,
  label,
  value,
}: {
  frame: number;
  delay: number;
  color: string;
  label: string;
  value: ReactNode;
}) => {
  const k = springIn(frame, delay, { damping: 22, stiffness: 110 });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        height: 36,
        borderBottom: `1px solid ${C.hairline}`,
        opacity: clamp(k * 1.15),
        transform: `translateX(${(1 - clamp(k)) * 8}px)`,
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: 3, background: color, flex: "0 0 auto" }} />
      <span style={{ fontFamily: CJK, fontSize: 12.5, fontWeight: 600, color: C.ink }}>{label}</span>
      <span style={{ marginLeft: "auto", fontFamily: CJK, fontSize: 10.5, color: C.muted, textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
};

export const S07Bounds = () => {
  const frame = useCurrentFrame();
  const railK = springIn(frame, 16, { damping: 22, stiffness: 100 });
  const paused = frame >= 258;
  const pauseNotice = springIn(frame, 258, { damping: 20, stiffness: 115 });
  const summaryK = springIn(frame, 355, { damping: 22, stiffness: 100 });

  return (
    <>
      <SceneHeader
        scene={scene}
        title="能自主推进，也要能停下来"
        subtitle="约束圈出执行范围，完成与交还控制都需要明确出口"
        width={1450}
      />

      <LoopDiagram frame={frame} mode="bounds" />

      <div
        style={{
          position: "absolute",
          left: 1602,
          top: 232,
          width: 242,
          opacity: clamp(railK * 1.12),
          transform: `translateX(${(1 - clamp(railK)) * 14}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11 }}>
          <Rule color={C.yellow} width={18} height={3} />
          <Label size={9.5} tracking={1.4} color={C.muted}>
            SOURCES / 依据
          </Label>
        </div>
        <SourceNote
          frame={frame}
          delay={28}
          color={C.green}
          source="OPENAI"
          title="What is an agent?"
          note="约束、完成判断，失败时交还控制"
          top={30}
        />
        <SourceNote
          frame={frame}
          delay={44}
          color={C.blue}
          source="ANTHROPIC"
          title="Agents"
          note="环境反馈、人工介入与停止条件"
          top={122}
        />

        <div
          style={{
            marginTop: 222,
            paddingTop: 14,
            borderTop: `1px solid ${C.line}`,
            opacity: clamp(summaryK * 1.1),
          }}
        >
          <Label size={9} tracking={1.3} color={C.faint}>
            KEEP IN FRAME
          </Label>
          <div style={{ marginTop: 7 }}>
            <SummaryRow frame={frame} delay={358} color={C.yellowDeep} label="目标" value="持续输入" />
            <SummaryRow frame={frame} delay={362} color={C.blue} label="模型决策" value="提出下一步" />
            <SummaryRow frame={frame} delay={366} color={C.green} label="工具反馈" value="真实结果" />
            <SummaryRow frame={frame} delay={370} color={C.red} label="退出条件" value="完成 / 交还" />
          </div>
        </div>

        <div
          style={{
            marginTop: 15,
            display: "flex",
            alignItems: "flex-start",
            gap: 7,
            padding: "9px 10px",
            borderRadius: 8,
            background: paused ? C.redSoft : "rgba(255,255,255,.62)",
            border: `1px solid ${paused ? `${C.red}35` : C.hairline}`,
            opacity: clamp(pauseNotice * 1.15),
          }}
        >
          <StatusDot color={C.red} size={5} />
          <span style={{ fontFamily: CJK, fontSize: 10.5, lineHeight: 1.45, color: paused ? C.redDeep : C.muted }}>
            {paused ? "循环已停：等待人的决定，不再显示运行状态" : "约束之内运行，条件触发时停止"}
          </span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 110,
          top: 906,
          display: "flex",
          alignItems: "center",
          gap: 10,
          opacity: 0.85,
        }}
      >
        <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: 1.2, color: C.faint }}>
          AGENT LOOP / WITH EXIT CONDITIONS
        </span>
        <span style={{ width: 30, height: 1, background: C.line }} />
        <span style={{ fontFamily: CJK, fontSize: 11.5, color: C.muted }}>
          完成时停下，处理不了时交还
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          right: 82,
          top: 906,
          fontFamily: MONO,
          fontSize: 9.5,
          letterSpacing: 1.1,
          color: C.faint,
          opacity: clamp(easeOut(frame, 240, 26)),
        }}
      >
        CONTROL / HANDED BACK
      </div>
    </>
  );
};
