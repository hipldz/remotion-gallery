import { useCurrentFrame } from "remotion";
import { C, CJK, FONT, MONO } from "../theme";
import { clamp, easeOut, springIn } from "../lib/motion";
import { Icon, type IconName } from "../components/Icons";
import { Paper, Pill, Rule, StatusDot } from "../components/Primitives";
import { SceneHeader } from "../components/Chrome";
import { SCENES } from "../timeline";

const scene = SCENES[3];

const ModelGlyph = ({ color }: { color: string }) => (
  <svg width={452} height={82} viewBox="0 0 452 82" style={{ display: "block", overflow: "visible" }}>
    <path d="M16 42H96M132 42H238M288 42H360" stroke="#D4D9E0" strokeWidth={1.5} />
    <circle cx={16} cy={42} r={7} fill="#FFFFFF" stroke="#AAB1BA" strokeWidth={1.5} />
    <circle cx={114} cy={42} r={17} fill={`${color}12`} stroke={color} strokeWidth={1.7} />
    <circle cx={114} cy={42} r={5} fill={color} />
    <path d="M248 42L272 24M248 42L272 60" stroke={color} strokeWidth={1.5} />
    <circle cx={284} cy={24} r={9} fill="#FFFFFF" stroke={`${color}90`} strokeWidth={1.4} />
    <circle cx={284} cy={60} r={9} fill="#FFFFFF" stroke="#C8CED6" strokeWidth={1.4} strokeDasharray="2.5 2.5" />
    <path d="M298 24H360M298 60H360" stroke="#DCE0E5" strokeWidth={1.3} strokeDasharray="3 4" />
    <circle cx={372} cy={42} r={11} fill="#FFFFFF" stroke="#AAB1BA" strokeWidth={1.4} />
    <path d="M368 42l3 3 5-6" stroke="#8B939C" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <text x={16} y={70} fill="#A1A8B1" fontFamily={MONO} fontSize={8.5} letterSpacing={1}>
      CONTEXT
    </text>
    <text x={101} y={70} fill={color} fontFamily={MONO} fontSize={8.5} letterSpacing={1}>
      DECIDE
    </text>
    <text x={349} y={70} fill="#A1A8B1" fontFamily={MONO} fontSize={8.5} letterSpacing={1}>
      NEXT
    </text>
  </svg>
);

const ToolsGlyph = ({ color }: { color: string }) => (
  <svg width={452} height={82} viewBox="0 0 452 82" style={{ display: "block", overflow: "visible" }}>
    <rect x={2} y={17} width={135} height={48} rx={11} fill={`${color}0E`} stroke={`${color}60`} strokeWidth={1.5} />
    <circle cx={36} cy={41} r={10} fill="#FFFFFF" stroke={color} strokeWidth={1.5} />
    <path d="M31 41h10M36 36v10" stroke={color} strokeWidth={1.3} />
    <path d="M55 36h58M55 46h38" stroke={`${color}70`} strokeWidth={2.5} strokeLinecap="round" />
    <path d="M150 41H198" stroke="#C7CDD4" strokeWidth={1.5} strokeDasharray="4 4" />
    <path d="M196 34L206 41L196 48" fill="none" stroke="#AAB1BA" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M244 18v46M244 18h-10M244 18h10M244 64h-10M244 64h10" stroke={color} strokeWidth={1.4} fill="none" />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={266} y={17 + i * 18} width={182} height={12} rx={5} fill="#F4F6F8" stroke="#E3E7EC" strokeWidth={1} />
        <circle cx={275 + (i === 1 ? 36 : 12)} cy={23 + i * 18} r={3} fill={i === 1 ? color : "#C5CBD2"} />
      </g>
    ))}
    <text x={2} y={78} fill="#A1A8B1" fontFamily={MONO} fontSize={8.5} letterSpacing={1}>
      TOOL
    </text>
    <text x={280} y={78} fill="#A1A8B1" fontFamily={MONO} fontSize={8.5} letterSpacing={1}>
      EXTERNAL SYSTEM
    </text>
  </svg>
);

const InstructionsGlyph = ({ color }: { color: string }) => (
  <svg width={452} height={82} viewBox="0 0 452 82" style={{ display: "block", overflow: "visible" }}>
    <rect
      x={2}
      y={8}
      width={438}
      height={64}
      rx={10}
      fill={`${color}08`}
      stroke={`${color}90`}
      strokeWidth={1.6}
      strokeDasharray="7 5"
    />
    <circle cx={49} cy={40} r={15} fill="#FFFFFF" stroke={color} strokeWidth={1.5} />
    <circle cx={49} cy={40} r={6} fill="none" stroke={color} strokeWidth={1.5} />
    <circle cx={49} cy={40} r={2} fill={color} />
    <path d="M86 31h122M86 40h82M86 49h108" stroke="#D0D5DC" strokeWidth={2.2} strokeLinecap="round" />
    <path d="M326 26v28M326 26h-9M326 26h9M326 54h-9M326 54h9" stroke={color} strokeWidth={1.4} fill="none" />
    <rect x={348} y={27} width={70} height={26} rx={7} fill="#FFFFFF" stroke={`${color}50`} strokeWidth={1.2} strokeDasharray="3 3" />
    <path d="M365 40h36" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <circle cx={365} cy={40} r={4} fill="#FFFFFF" stroke={color} strokeWidth={1.3} />
    <text x={2} y={80} fill="#A1A8B1" fontFamily={MONO} fontSize={8.5} letterSpacing={1}>
      BOUNDARY
    </text>
    <text x={390} y={80} fill="#A1A8B1" fontFamily={MONO} fontSize={8.5} letterSpacing={1}>
      GOAL
    </text>
  </svg>
);

const cards = [
  {
    en: "MODEL",
    title: "模型",
    name: "Model",
    role: "推理与决策",
    note: "判断现在处于什么位置，下一步要做什么。",
    color: C.blue,
    soft: C.blueSoft,
    icon: "model" as IconName,
    reveal: 18,
    roleStart: 182,
    glyph: <ModelGlyph color={C.blue} />,
  },
  {
    en: "TOOLS",
    title: "工具",
    name: "Tools",
    role: "与外部系统交互",
    note: "把判断变成真实动作，把外部变化带回来。",
    color: C.green,
    soft: C.greenSoft,
    icon: "tools" as IconName,
    reveal: 30,
    roleStart: 238,
    glyph: <ToolsGlyph color={C.green} />,
  },
  {
    en: "INSTRUCTIONS",
    title: "指令",
    name: "Instructions",
    role: "行为指导与约束",
    note: "规定目标、行为和边界，也规定何时停下。",
    color: C.yellowDeep,
    soft: C.yellowSoft,
    icon: "instructions" as IconName,
    reveal: 42,
    roleStart: 286,
    glyph: <InstructionsGlyph color={C.yellow} />,
  },
];

const FoundationCard = ({
  item,
  frame,
  active,
  explained,
}: {
  item: (typeof cards)[number];
  frame: number;
  active: boolean;
  explained: boolean;
}) => {
  const entry = springIn(frame, item.reveal, { damping: 21, stiffness: 110 });
  const roleK = springIn(frame, item.roleStart, { damping: 21, stiffness: 115 });
  return (
    <div
      style={{
        position: "absolute",
        top: 106,
        left: 0,
        width: 520,
        height: 334,
        padding: "24px 25px 20px",
        borderRadius: 16,
        border: `1.5px solid ${active ? item.color : explained ? `${item.color}42` : C.line}`,
        background: "#FFFFFF",
        boxShadow: active
          ? `0 20px 46px ${item.color}14, inset 0 4px 0 ${item.color}`
          : explained
            ? `0 10px 28px ${item.color}08, inset 0 3px 0 ${item.color}55`
            : "0 7px 20px rgba(30,42,57,.035)",
        opacity: clamp(entry * 1.15),
        transform: `translateY(${(1 - clamp(entry)) * 28}px)`,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1.4, color: item.color }}>
          {String(cards.indexOf(item) + 1).padStart(2, "0")} / {item.en}
        </span>
        <span style={{ flex: 1, height: 1, background: active ? `${item.color}30` : C.hairline }} />
        <span
          style={{
            fontFamily: CJK,
            fontSize: 11,
            color: item.color,
            opacity: explained ? 1 : 0.36,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <StatusDot color={active ? item.color : `${item.color}65`} size={5} />
          {active ? "正在讲" : explained ? "已说明" : "待展开"}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16, height: 60 }}>
        <span
          style={{
            width: 54,
            height: 54,
            borderRadius: 15,
            display: "grid",
            placeItems: "center",
            background: item.soft,
            border: `1px solid ${item.color}1C`,
          }}
        >
          <Icon name={item.icon} size={30} color={item.color} strokeWidth={2.3} />
        </span>
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
            <span style={{ fontFamily: CJK, fontSize: 40, fontWeight: 650, color: C.ink, lineHeight: 1.05 }}>
              {item.title}
            </span>
            <span style={{ fontFamily: FONT, fontSize: 17, color: C.faint, fontWeight: 450 }}>{item.name}</span>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 13,
          height: 58,
          paddingTop: 10,
          borderTop: `1px solid ${C.hairline}`,
          opacity: clamp(roleK * 1.15),
          transform: `translateY(${(1 - clamp(roleK)) * 9}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Rule color={item.color} width={18} height={3} />
          <span style={{ fontFamily: CJK, fontSize: 25, fontWeight: 600, color: item.color, lineHeight: 1.15 }}>
            {item.role}
          </span>
        </div>
        <div style={{ marginTop: 5, fontFamily: CJK, fontSize: 12.5, lineHeight: 1.35, color: C.muted }}>
          {item.note}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 25,
          right: 25,
          bottom: 26,
          opacity: explained ? 0.95 : 0.28,
        }}
      >
        {item.glyph}
      </div>
    </div>
  );
};

export const S04Foundations = () => {
  const frame = useCurrentFrame();
  const noteEntry = springIn(frame, 5, { damping: 23, stiffness: 95 });
  const systemK = springIn(frame, 366, { damping: 24, stiffness: 100 });
  const modelActive = frame >= 180 && frame < 236;
  const toolsActive = frame >= 238 && frame < 284;
  const instructionsActive = frame >= 286 && frame < 362;
  const explained = [frame >= 182, frame >= 238, frame >= 286];
  const systemOn = frame >= 366;

  return (
    <>
      <SceneHeader
        scene={scene}
        title="这份指南，把 Agent 拆成三块"
        subtitle="不是三个产品模块，而是同一套执行系统的三个基础构成"
        source="OpenAI · Agent design foundations"
        sourceColor={C.yellowDeep}
        width={1190}
      />

      <div
        style={{
          position: "absolute",
          left: 90,
          top: 250,
          width: 1740,
          height: 654,
          opacity: clamp(noteEntry * 1.12),
          transform: `translateY(${(1 - clamp(noteEntry)) * 22}px)`,
        }}
      >
        <Paper style={{ position: "absolute", inset: 0, borderRadius: 20 }}>
          <div
            style={{
              height: 60,
              padding: "0 26px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              borderBottom: `1px solid ${C.hairline}`,
            }}
          >
            <span style={{ width: 32, height: 4, borderRadius: 3, background: C.yellow }} />
            <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: 1.4, color: C.yellowDeep }}>
              SOURCE NOTE / OPENAI
            </span>
            <span style={{ fontFamily: CJK, fontSize: 17, fontWeight: 600, color: C.ink }}>
              Agent design foundations
            </span>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
              <Pill color={C.muted} soft="#F4F6F8" style={{ height: 25, fontSize: 11 }}>
                原生文字摘记
              </Pill>
              <span style={{ fontFamily: CJK, fontSize: 11, color: C.faint }}>不是网页截图</span>
            </div>
          </div>

          <div style={{ position: "absolute", left: 50, top: 0, width: 520 }}>
            <FoundationCard item={cards[0]} frame={frame} active={modelActive} explained={explained[0]} />
          </div>
          <div style={{ position: "absolute", left: 610, top: 0, width: 520 }}>
            <FoundationCard item={cards[1]} frame={frame} active={toolsActive} explained={explained[1]} />
          </div>
          <div style={{ position: "absolute", left: 1170, top: 0, width: 520 }}>
            <FoundationCard item={cards[2]} frame={frame} active={instructionsActive} explained={explained[2]} />
          </div>

          {/* 三块合成为一个系统。边框在讲完指令后出现。 */}
          <div
            style={{
              position: "absolute",
              left: 26,
              top: 88,
              width: 1688,
              height: 380,
              borderRadius: 22,
              border: `1.5px solid ${C.ink}2B`,
              boxShadow: `0 0 0 7px ${C.ink}04`,
              opacity: clamp(systemK * 1.08),
              transform: `scale(${0.985 + clamp(systemK) * 0.015})`,
              transformOrigin: "50% 50%",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: 18,
                top: -14,
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "5px 11px",
                borderRadius: 999,
                background: "#FFFFFF",
                border: `1px solid ${C.ink}30`,
                fontFamily: CJK,
                fontSize: 12,
                fontWeight: 600,
                color: C.ink,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: 6, background: C.ink }} />
              系统 / SYSTEM
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 68,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 15,
              opacity: clamp(systemK * 1.1),
              transform: `translateY(${(1 - clamp(systemK)) * 8}px)`,
            }}
          >
            <span style={{ fontFamily: CJK, fontSize: 17, fontWeight: 600, color: C.ink }}>
              模型 + 工具 + 指令
            </span>
            <span style={{ fontFamily: MONO, fontSize: 12, color: C.faint }}>→</span>
            <span style={{ fontFamily: CJK, fontSize: 16, color: C.muted }}>一个可运行、受约束的系统</span>
          </div>

          <div
            style={{
              position: "absolute",
              left: 26,
              right: 26,
              bottom: 22,
              paddingTop: 13,
              borderTop: `1px solid ${C.hairline}`,
              display: "flex",
              justifyContent: "space-between",
              color: C.faint,
              fontFamily: CJK,
              fontSize: 11.5,
            }}
          >
            <span>来源：OpenAI · A practical guide to building agents / Agent design foundations</span>
            <span>中文角色说明为制作整理，不是官方原句</span>
          </div>
        </Paper>
      </div>

      <div
        style={{
          position: "absolute",
          left: 96,
          top: 918,
          display: "flex",
          alignItems: "center",
          gap: 9,
          opacity: clamp(easeOut(frame, 370, 26)) * 0.9,
        }}
      >
        <StatusDot color={C.ink} size={5} />
        <span style={{ fontFamily: CJK, fontSize: 12, color: C.muted }}>
          三者共同组成系统，不是三个孤立名词
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          right: 90,
          top: 918,
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: 1.1,
          color: C.faint,
          opacity: systemOn ? 1 : 0.35,
        }}
      >
        SYSTEM BOUNDARY / 03 PARTS
      </div>
    </>
  );
};
