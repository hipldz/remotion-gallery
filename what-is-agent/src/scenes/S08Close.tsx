import { useCurrentFrame } from "remotion";
import { C, CJK, FONT, MONO } from "../theme";
import { clamp, springIn } from "../lib/motion";
import { Icon } from "../components/Icons";
import { Label, Rule, StatusDot } from "../components/Primitives";

const miniNodes = [
  {
    title: "目标",
    note: "持续输入",
    color: C.slate,
    soft: "#F2F4F7",
    icon: "target" as const,
  },
  {
    title: "模型决策",
    note: "执行中决定下一步",
    color: C.blue,
    soft: C.blueSoft,
    icon: "model" as const,
  },
  {
    title: "工具反馈",
    note: "真实执行结果",
    color: C.green,
    soft: C.greenSoft,
    icon: "tools" as const,
  },
  {
    title: "完成 / 交还",
    note: "始终存在出口",
    color: C.red,
    soft: C.redSoft,
    icon: "pause" as const,
  },
];

export const S08Close = () => {
  const frame = useCurrentFrame();
  const card = springIn(frame, 2, { damping: 24, stiffness: 95 });
  const mini = springIn(frame, 12, { damping: 24, stiffness: 105 });
  const sources = springIn(frame, 24, { damping: 24, stiffness: 100 });

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 96,
          top: 98,
          display: "flex",
          alignItems: "center",
          gap: 13,
          color: C.muted,
          fontFamily: MONO,
          fontSize: 12,
          letterSpacing: 1.8,
        }}
      >
        <Rule color={C.blue} width={25} height={3} />
        <span style={{ color: C.ink }}>08 / 08</span>
        <span style={{ color: "#C2C8CF" }}>/</span>
        <span>FINAL / 完整定义</span>
      </div>
      <div
        style={{
          position: "absolute",
          right: 96,
          top: 98,
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: 1.3,
          color: C.faint,
        }}
      >
        <span style={{ width: 5, height: 5, borderRadius: 5, background: C.blue }} />
        END CARD / 6 SEC
      </div>

      <div
        style={{
          position: "absolute",
          left: 240,
          top: 208,
          width: 1440,
          height: 382,
          padding: "28px 42px 24px",
          borderRadius: 22,
          border: `1.5px solid ${C.blue}26`,
          background: "rgba(255,255,255,.94)",
          boxShadow: `0 28px 72px ${C.blue}0B`,
          opacity: clamp(card * 1.15),
          transform: `translateY(${(1 - clamp(card)) * 14}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 55,
            bottom: 55,
            width: 4,
            borderRadius: "0 4px 4px 0",
            background: `linear-gradient(to bottom, ${C.blue}, ${C.green} 52%, ${C.yellow} 78%, ${C.red})`,
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
          <span style={{ fontFamily: CJK, fontSize: 12.5, color: C.faint }}>
            从两家原文提炼，不是任何一家公司的逐字原句
          </span>
          <div style={{ marginLeft: "auto" }}>
            <Label size={9.5} tracking={1.5} color="#AFB6BF">
              OUR SYNTHESIS
            </Label>
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            fontFamily: CJK,
            fontSize: 45,
            fontWeight: 550,
            lineHeight: 1.6,
            letterSpacing: 0.15,
            color: C.ink,
          }}
        >
          <span style={{ fontFamily: FONT, fontSize: 50, fontWeight: 650, color: C.blue }}>Agent</span>
          <span style={{ color: C.body }}>：</span>
          让大模型在
          <span
            style={{
              display: "inline-block",
              whiteSpace: "nowrap",
              color: C.blueDeep,
              background: `linear-gradient(transparent 68%, ${C.blue}22 68%)`,
            }}
          >
            执行中做决策
          </span>
          ，
          <br />
          借助
          <span
            style={{
              display: "inline-block",
              whiteSpace: "nowrap",
              color: C.greenDeep,
              background: `linear-gradient(transparent 68%, ${C.green}22 68%)`,
            }}
          >
            工具和反馈
          </span>
          ，推进
          <span
            style={{
              display: "inline-block",
              whiteSpace: "nowrap",
              color: C.yellowDeep,
              background: `linear-gradient(transparent 68%, ${C.yellow}25 68%)`,
            }}
          >
            用户任务
          </span>
          的系统。
        </div>

        <div
          style={{
            position: "absolute",
            left: 42,
            right: 42,
            bottom: 25,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ width: 32, height: 1, background: C.line }} />
          <span style={{ fontFamily: CJK, fontSize: 17, color: C.muted, letterSpacing: 0.2 }}>
            在既定约束内运行，完成或需要人介入时停止。
          </span>
          <div style={{ marginLeft: "auto" }}>
            <Label size={9.5} tracking={1.2} color={C.faint}>
              ANTHROPIC + OPENAI
            </Label>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 240,
          top: 626,
          opacity: clamp(mini * 1.1),
          transform: `translateY(${(1 - clamp(mini)) * 8}px)`,
        }}
      >
        <Label size={9} tracking={1.4} color={C.faint}>
          SYSTEM / 收缩为一条执行链
        </Label>
      </div>

      <div
        style={{
          position: "absolute",
          left: 300,
          top: 658,
          width: 1316,
          height: 132,
          opacity: clamp(mini * 1.1),
        }}
      >
        {miniNodes.map((node, i) => {
          const k = springIn(frame, 14 + i * 4, { damping: 22, stiffness: 110 });
          return (
            <div key={node.title}>
              <div
                style={{
                  position: "absolute",
                  left: i * 338,
                  top: 0,
                  width: 286,
                  height: 78,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "0 16px",
                  borderRadius: 14,
                  border: `1px solid ${node.color}2B`,
                  background: "#FFFFFF",
                  boxShadow: "0 7px 20px rgba(30,42,57,.035)",
                  opacity: clamp(k * 1.15),
                  transform: `translateY(${(1 - clamp(k)) * 8}px)`,
                }}
              >
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    display: "grid",
                    placeItems: "center",
                    background: node.soft,
                    flex: "0 0 auto",
                  }}
                >
                  <Icon name={node.icon} size={19} color={node.color} strokeWidth={2.5} />
                </span>
                <div>
                  <div style={{ fontFamily: CJK, fontSize: 17, fontWeight: 600, color: C.ink }}>{node.title}</div>
                  <div style={{ fontFamily: CJK, fontSize: 10.5, color: C.muted, marginTop: 2 }}>{node.note}</div>
                </div>
              </div>
              {i < miniNodes.length - 1 ? (
                <div
                  style={{
                    position: "absolute",
                    left: i * 338 + 290,
                    top: 38,
                    width: 43,
                    height: 2,
                    background: C.line,
                  }}
                >
                  <svg width={44} height={8} style={{ position: "absolute", left: 0, top: -3 }}>
                    <path d="M0 4H33M29 1L35 4L29 7" fill="none" stroke="#B7BEC7" strokeWidth={1.2} />
                  </svg>
                </div>
              ) : null}
            </div>
          );
        })}
        <svg width={1316} height={132} viewBox="0 0 1316 132" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <path
            d="M790 83V108C790 116 782 120 772 120H560C548 120 540 114 540 105V85"
            fill="none"
            stroke={`${C.green}70`}
            strokeWidth={1.4}
            strokeDasharray="4 4"
          />
          <path d="M534 92L540 82L546 92" fill="none" stroke={`${C.green}90`} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
          <text x={650} y={116} textAnchor="middle" fill="#A5ACB5" fontFamily={MONO} fontSize={8.5} letterSpacing={1}>
            FEEDBACK
          </text>
        </svg>
      </div>

      <div
        style={{
          position: "absolute",
          left: 240,
          right: 240,
          top: 900,
          paddingTop: 15,
          borderTop: `1px solid ${C.hairline}`,
          display: "flex",
          alignItems: "center",
          opacity: clamp(sources * 1.1),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StatusDot color={C.blue} size={5} />
          <span style={{ fontFamily: CJK, fontSize: 12.5, color: C.muted }}>
            Anthropic · Building effective agents
          </span>
        </div>
        <span style={{ width: 1, height: 14, background: C.line, margin: "0 20px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StatusDot color={C.green} size={5} />
          <span style={{ fontFamily: CJK, fontSize: 12.5, color: C.muted }}>
            OpenAI · A practical guide to building agents
          </span>
        </div>
        <span style={{ marginLeft: "auto", fontFamily: CJK, fontSize: 11, color: C.faint }}>
          完整链接见视频简介
        </span>
      </div>
    </>
  );
};
