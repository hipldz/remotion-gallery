import type { CSSProperties, ReactNode } from "react";
import { C, CJK } from "../theme";
import { clamp, easeOut, springIn } from "../lib/motion";
import { Icon, type IconName } from "./Icons";
import { Label, Pill, Rule, StatusDot } from "./Primitives";

type NodeSpec = {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  soft: string;
  icon: IconName;
  en: string;
  title: string;
  role: string;
  footer: string;
  reveal: number;
  status?: ReactNode;
};

const NODES = {
  goal: {
    x: 20,
    y: 10,
    w: 270,
    h: 102,
    color: C.slate,
    soft: "#F1F3F6",
    icon: "target" as IconName,
    en: "USER GOAL",
    title: "用户目标",
    role: "持续输入",
    footer: "要完成的事情",
    reveal: 0,
  },
  model: {
    x: 40,
    y: 280,
    w: 300,
    h: 174,
    color: C.blue,
    soft: C.blueSoft,
    icon: "model" as IconName,
    en: "MODEL",
    title: "模型",
    role: "决定下一步",
    footer: "提出动作，不直接执行",
    reveal: 15,
  },
  tool: {
    x: 540,
    y: 280,
    w: 300,
    h: 174,
    color: C.green,
    soft: C.greenSoft,
    icon: "tools" as IconName,
    en: "PROGRAM",
    title: "程序",
    role: "执行工具",
    footer: "真正执行动作",
    reveal: 65,
  },
  result: {
    x: 1040,
    y: 280,
    w: 300,
    h: 174,
    color: C.greenDeep,
    soft: C.greenSoft,
    icon: "loop" as IconName,
    en: "OBSERVATION",
    title: "结果",
    role: "返回执行结果",
    footer: "交回模型，作为反馈",
    reveal: 115,
  },
} satisfies Record<string, NodeSpec>;

const NodeCard = ({
  spec,
  frame,
  mode,
  status,
  active = false,
}: {
  spec: NodeSpec;
  frame: number;
  mode: "explain" | "bounds";
  status?: ReactNode;
  active?: boolean;
}) => {
  const k = mode === "bounds" ? 1 : springIn(frame, spec.reveal, { damping: 20, stiffness: 120 });
  const border = active ? spec.color : `${spec.color}2F`;
  return (
    <div
      style={{
        position: "absolute",
        left: spec.x,
        top: spec.y,
        width: spec.w,
        height: spec.h,
        padding: "18px 20px 16px",
        borderRadius: 18,
        border: `1.5px solid ${border}`,
        background: "#FFFFFF",
        boxShadow: active
          ? `0 14px 32px ${spec.color}16, inset 0 3px 0 ${spec.color}`
          : `0 8px 22px rgba(30,42,57,.045), inset 0 2px 0 ${spec.color}42`,
        opacity: clamp(k * 1.15),
        transform: `translateY(${(1 - clamp(k)) * 15}px) scale(${0.97 + clamp(k) * 0.03})`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            display: "grid",
            placeItems: "center",
            background: spec.soft,
          }}
        >
          <Icon name={spec.icon} size={20} color={spec.color} strokeWidth={2.6} />
        </span>
        <Label size={10} tracking={1.5} color={spec.color}>
          {spec.en}
        </Label>
        <div style={{ marginLeft: "auto" }}>{status}</div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 13 }}>
        <span style={{ fontFamily: CJK, fontSize: 27, fontWeight: 650, color: C.ink, lineHeight: 1.1 }}>
          {spec.title}
        </span>
        <span style={{ fontFamily: CJK, fontSize: 16, color: spec.color, fontWeight: 500 }}>{spec.role}</span>
      </div>
      <div
        style={{
          marginTop: 11,
          paddingTop: 9,
          borderTop: `1px solid ${spec.color}1A`,
          fontFamily: CJK,
          fontSize: 13.5,
          color: C.muted,
          lineHeight: 1.35,
        }}
      >
        {spec.footer}
      </div>
    </div>
  );
};

const ArrowLabel = ({
  x,
  y,
  children,
  color = C.muted,
  opacity = 1,
}: {
  x: number;
  y: number;
  children: ReactNode;
  color?: string;
  opacity?: number;
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: "translateX(-50%)",
      opacity,
      fontFamily: CJK,
      fontSize: 13,
      color,
      whiteSpace: "nowrap",
      letterSpacing: 0.4,
      background: "rgba(250,251,253,0.86)",
      padding: "2px 7px",
      borderRadius: 4,
    }}
  >
    {children}
  </div>
);

const ExitCard = ({
  x,
  y,
  w,
  h,
  color,
  soft,
  icon,
  title,
  sub,
  frame,
  delay,
  active = false,
  style,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  soft: string;
  icon: IconName;
  title: string;
  sub: string;
  frame: number;
  delay: number;
  active?: boolean;
  style?: CSSProperties;
}) => {
  const k = springIn(frame, delay, { damping: 19, stiffness: 125 });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        padding: "12px 14px",
        borderRadius: 14,
        border: `1.5px solid ${color}${active ? "AA" : "55"}`,
        background: `linear-gradient(180deg, #FFFFFF 0%, ${soft} 100%)`,
        boxShadow: active ? `0 10px 26px ${color}18` : "0 4px 15px rgba(30,42,57,.04)",
        display: "flex",
        alignItems: "center",
        gap: 11,
        opacity: clamp(k * 1.15),
        transform: `translateY(${(1 - clamp(k)) * 11}px) scale(${0.97 + clamp(k) * 0.03})`,
        ...style,
      }}
    >
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          display: "grid",
          placeItems: "center",
          background: `${color}16`,
          flex: "0 0 auto",
        }}
      >
        <Icon name={icon} size={19} color={color} strokeWidth={2.7} />
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: CJK, fontSize: 17, fontWeight: 650, color: C.ink, lineHeight: 1.25 }}>
          {title}
        </div>
        <div style={{ fontFamily: CJK, fontSize: 12.5, color: C.muted, lineHeight: 1.35, marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
};

const FeedbackPath = ({ progress }: { progress: number }) => {
  const p = clamp(progress);
  return (
    <svg
      width={1480}
      height={680}
      viewBox="0 0 1480 680"
      style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}
    >
      <defs>
        <linearGradient id="feedback-gradient" x1="1190" y1="0" x2="340" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={C.green} />
          <stop offset="0.55" stopColor={C.blue} />
          <stop offset="1" stopColor={C.blue} />
        </linearGradient>
      </defs>
      <path
        d="M1190 280V155H300V263"
        fill="none"
        stroke="url(#feedback-gradient)"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - p}
      />
      <path
        d="M293 257L300 269L307 257"
        fill="none"
        stroke={C.blue}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={p > 0.85 ? 1 : 0}
      />
    </svg>
  );
};

const GoalConnector = ({ progress }: { progress: number }) => {
  const p = clamp(progress);
  return (
    <svg
      width={1480}
      height={680}
      viewBox="0 0 1480 680"
      style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}
    >
      <path
        d="M155 112V268"
        fill="none"
        stroke={`${C.slate}70`}
        strokeWidth={1.8}
        strokeDasharray="4 6"
        opacity={p}
      />
      <path
        d="M148 262L155 272L162 262"
        fill="none"
        stroke={`${C.slate}90`}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={p > 0.9 ? 1 : 0}
      />
    </svg>
  );
};

export const LoopDiagram = ({
  frame,
  mode,
  style,
}: {
  frame: number;
  mode: "explain" | "bounds";
  style?: CSSProperties;
}) => {
  const isBounds = mode === "bounds";
  const feedbackStart = isBounds ? 0 : 272;
  const feedback = isBounds ? 1 : easeOut(frame, feedbackStart, 42);
  const goalLine = isBounds ? 1 : easeOut(frame, 50, 22);
  const modelToTool = isBounds ? 1 : easeOut(frame, 150, 24);
  const toolToResult = isBounds ? 1 : easeOut(frame, 212, 26);

  const toolActive = isBounds ? frame < 258 : frame >= 165 && frame < 235;
  const modelActive = isBounds ? frame < 258 : frame >= 100 && frame < 170;
  const resultActive = isBounds ? frame < 258 : frame >= 218 && frame < 265;
  const exitsDelay = isBounds ? 120 : 345;
  const feedbackPulse = isBounds ? frame < 258 : frame > 272;
  const pulseT = ((Math.max(0, frame - feedbackStart) / 54) % 1 + 1) % 1;
  const pulseX = feedbackPulse && feedback > 0.9 ? 1190 - pulseT * 890 : 1190;
  const pulseY = 155;

  return (
    <div
      style={{
        position: "absolute",
        left: 110,
        top: 250,
        width: 1480,
        height: 680,
        ...style,
      }}
    >
      {isBounds ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 118,
            width: 1388,
            height: 470,
            borderRadius: 26,
            border: `2px dashed ${C.yellow}C0`,
            background: `${C.yellow}08`,
            opacity: clamp(easeOut(frame, 8, 24)),
            boxShadow: `inset 0 0 60px ${C.yellow}0A`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 20,
              top: 28,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: CJK,
              fontSize: 13,
              fontWeight: 500,
              color: C.yellowDeep,
              background: "rgba(255,255,255,.9)",
              border: `1px solid ${C.yellow}70`,
              borderRadius: 999,
              padding: "5px 10px",
            }}
          >
            <StatusDot color={C.yellow} size={6} />
            既定约束
          </div>
        </div>
      ) : null}

      <GoalConnector progress={goalLine} />
      <FeedbackPath progress={feedback} />

      <NodeCard spec={NODES.goal} frame={frame} mode={mode} />
      <NodeCard
        spec={NODES.model}
        frame={frame}
        mode={mode}
        active={modelActive}
        status={
          <Pill
            color={C.blue}
            soft={isBounds ? C.blueSoft : "#FFFFFF"}
            style={{ height: 24, fontSize: 11, padding: "0 8px", gap: 5 }}
          >
            <StatusDot color={C.blue} size={5} />
            {isBounds ? "决策" : modelActive ? "思考中" : "决策"}
          </Pill>
        }
      />
      <NodeCard
        spec={NODES.tool}
        frame={frame}
        mode={mode}
        active={toolActive}
        status={
          <Pill
            color={toolActive ? C.green : C.muted}
            soft={toolActive ? C.greenSoft : "#F5F6F8"}
            style={{ height: 24, fontSize: 11, padding: "0 8px", gap: 5 }}
          >
            <StatusDot color={toolActive ? C.green : C.faint} size={5} />
            {toolActive ? "运行中" : "待命"}
          </Pill>
        }
      />
      <NodeCard
        spec={NODES.result}
        frame={frame}
        mode={mode}
        active={resultActive}
        status={
          <Pill
            color={C.greenDeep}
            soft={C.greenSoft}
            style={{ height: 24, fontSize: 11, padding: "0 8px", gap: 5 }}
          >
            <StatusDot color={C.greenDeep} size={5} />
            观察
          </Pill>
        }
      />

      <ArrowLabel x={440} y={332} color={modelToTool > 0.4 ? C.blue : C.faint} opacity={clamp(modelToTool * 1.2)}>
        提出下一步
      </ArrowLabel>
      <ArrowLabel x={940} y={332} color={toolToResult > 0.4 ? C.green : C.faint} opacity={clamp(toolToResult * 1.2)}>
        执行并观察
      </ArrowLabel>

      <svg
        width={1480}
        height={680}
        viewBox="0 0 1480 680"
        style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}
      >
        <path
          d="M340 367H528"
          fill="none"
          stroke={C.blue}
          strokeWidth={2}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - modelToTool}
          opacity={0.8}
        />
        <path
          d="M529 360L540 367L529 374"
          fill="none"
          stroke={C.blue}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={modelToTool > 0.85 ? 1 : 0}
        />
        <path
          d="M840 367H1028"
          fill="none"
          stroke={C.green}
          strokeWidth={2}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - toolToResult}
          opacity={0.8}
        />
        <path
          d="M1029 360L1040 367L1029 374"
          fill="none"
          stroke={C.green}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={toolToResult > 0.85 ? 1 : 0}
        />
        {feedbackPulse && feedback > 0.95 ? (
          <circle cx={pulseX} cy={pulseY} r={4.5} fill={C.blue} opacity={0.75} />
        ) : null}
      </svg>

      <div
        style={{
          position: "absolute",
          left: 660,
          top: 105,
          width: 300,
          textAlign: "center",
          opacity: clamp(feedback * 1.1),
          background: "rgba(250,251,253,.9)",
          padding: "4px 10px",
          borderRadius: 7,
        }}
      >
        <span style={{ fontFamily: CJK, fontSize: 14, fontWeight: 600, color: C.blue }}>反馈</span>
        <span style={{ fontFamily: CJK, fontSize: 12, color: C.muted, marginLeft: 8 }}>
          成功 / 报错 / 页面变化
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          left: 170,
          top: 188,
          opacity: clamp(goalLine * 1.15),
          fontFamily: CJK,
          fontSize: 12,
          color: C.muted,
          background: "rgba(250,251,253,.9)",
          padding: "2px 7px",
          borderRadius: 4,
        }}
      >
        目标 · 约束
      </div>

      {isBounds ? (
        <>
          <div
            style={{
              position: "absolute",
              left: 40,
              top: 470,
              width: 660,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${C.line} 10%, ${C.line} 90%, transparent)`,
              opacity: clamp(easeOut(frame, 110, 18)),
            }}
          />
          <ExitCard
            x={40}
            y={500}
            w={300}
            h={66}
            color={C.green}
            soft={C.greenSoft}
            icon="check"
            title="完成 · 交付结果"
            sub="任务达到目标，停止循环"
            frame={frame}
            delay={120}
            active={frame >= 258}
          />
          <ExitCard
            x={372}
            y={500}
            w={400}
            h={66}
            color={C.red}
            soft={C.redSoft}
            icon="pause"
            title="暂停 · 交还控制"
            sub="处理不了，或需要人来决定"
            frame={frame}
            delay={240}
            active={frame >= 258}
          />
          <div
            style={{
              position: "absolute",
              left: 790,
              top: 506,
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity: clamp(easeOut(frame, 258, 20)),
            }}
          >
            <Rule color={C.red} width={22} height={2} />
            <span style={{ fontFamily: CJK, fontSize: 12, color: C.redDeep }}>
              不一边等待人，一边继续执行
            </span>
          </div>
        </>
      ) : (
        <>
          <ExitCard
            x={40}
            y={500}
            w={220}
            h={56}
            color={C.blue}
            soft={C.blueSoft}
            icon="loop"
            title="继续 / 调整"
            sub="带着新结果进入下一轮"
            frame={frame}
            delay={exitsDelay}
          />
          <ExitCard
            x={280}
            y={500}
            w={220}
            h={56}
            color={C.green}
            soft={C.greenSoft}
            icon="check"
            title="完成"
            sub="任务达到目标"
            frame={frame}
            delay={exitsDelay + 5}
          />
          <div
            style={{
              position: "absolute",
              left: 530,
              top: 516,
              fontFamily: CJK,
              fontSize: 12,
              color: C.muted,
              opacity: clamp(easeOut(frame, exitsDelay + 9, 18)),
            }}
          >
            由模型判断
          </div>
        </>
      )}
    </div>
  );
};
