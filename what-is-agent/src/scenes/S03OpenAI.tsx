import { useCurrentFrame } from "remotion";
import { C, CJK, FONT, MONO } from "../theme";
import { clamp, easeOut, mix, springIn } from "../lib/motion";
import { Label, Pill, Rule, StatusDot } from "../components/Primitives";
import { SceneHeader } from "../components/Chrome";
import { ScreenshotCrop } from "../components/Screenshot";
import { SCENES } from "../timeline";

const scene = SCENES[2];

const tagRows = [
  ["01", "管理执行", "把动作组织成可推进的流程"],
  ["02", "做决策", "根据上下文选择下一步"],
  ["03", "判断完成", "知道何时该停下"],
];

export const S03OpenAI = () => {
  const frame = useCurrentFrame();
  const expand = easeOut(frame, 12, 34);
  const cardScale = mix(0.18, 1, expand);
  const cardOpacity = mix(0.68, 1, expand);
  const bookmark = 1 - easeOut(frame, 22, 20);
  const marker = 1 - easeOut(frame, 70, 26);

  const focus = springIn(frame, 46, { damping: 20, stiffness: 110 });
  const translation = springIn(frame, 52, { damping: 22, stiffness: 105 });
  const systemK = easeOut(frame, 104, 24);
  const taskK = easeOut(frame, 130, 24);
  const tagsK = springIn(frame, 244, { damping: 20, stiffness: 110 });
  const groupK = springIn(frame, 276, { damping: 22, stiffness: 100 });

  return (
    <>
      <SceneHeader
        scene={scene}
        subtitle="不是“用了模型”，而是把任务交给一个系统"
        source="OpenAI · A practical guide to building agents"
        sourceColor={C.green}
        width={1160}
      />

      <div
        style={{
          position: "absolute",
          left: 88,
          top: 244,
          width: 1220,
          height: 630,
          transform: `scale(${cardScale})`,
          transformOrigin: "100% 100%",
          opacity: cardOpacity,
        }}
      >
        <div className="paper-surface" style={{ position: "absolute", inset: 0, borderRadius: 18, padding: 15 }}>
          <ScreenshotCrop
            src="images/openai.png"
            width={1190}
            height={600}
            imageWidth={1190}
            style={{ borderRadius: 9, border: `1px solid ${C.hairline}`, background: "#F6F6F5" }}
          >
            <div
              style={{
                position: "absolute",
                left: 383,
                top: 280,
                width: 672,
                height: 92,
                opacity: clamp(focus * 1.1),
              }}
            >
              {[
                { left: 0, top: 0, borderLeft: `2px solid ${C.green}`, borderTop: `2px solid ${C.green}`, borderRadius: "4px 0 0 0" },
                { right: 0, top: 0, borderRight: `2px solid ${C.green}`, borderTop: `2px solid ${C.green}`, borderRadius: "0 4px 0 0" },
                { left: 0, bottom: 0, borderLeft: `2px solid ${C.green}`, borderBottom: `2px solid ${C.green}`, borderRadius: "0 0 0 4px" },
                { right: 0, bottom: 0, borderRight: `2px solid ${C.green}`, borderBottom: `2px solid ${C.green}`, borderRadius: "0 0 4px 0" },
              ].map((corner, i) => (
                <span key={i} style={{ position: "absolute", width: 16, height: 16, ...corner }} />
              ))}
            </div>

            <div
              style={{
                position: "absolute",
                left: 1052,
                top: 282,
                opacity: clamp(focus * 1.1),
                fontFamily: CJK,
                fontSize: 11,
                color: C.greenDeep,
                background: "rgba(255,255,255,.94)",
                border: `1px solid ${C.green}40`,
                padding: "4px 7px",
                borderRadius: 4,
                whiteSpace: "nowrap",
              }}
            >
              原文 · 定义句
            </div>
          </ScreenshotCrop>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 1040,
          top: 806,
          padding: "8px 12px",
          borderRadius: 7,
          background: "#FFFFFF",
          border: `1px solid ${C.green}40`,
          boxShadow: "0 7px 20px rgba(30,42,57,.06)",
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: 1.1,
          color: C.green,
          opacity: bookmark,
          transform: `translateY(${(1 - expand) * 6}px)`,
        }}
      >
        OPENAI · 任务系统
      </div>

      <div
        style={{
          position: "absolute",
          left: 1350,
          top: 228,
          width: 480,
        }}
      >
        <div
          style={{
            opacity: clamp(translation * 1.1),
            transform: `translateY(${(1 - clamp(translation)) * 16}px)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9, height: 20, marginBottom: 10 }}>
            <Rule color={C.green} width={22} height={3} />
            <Label size={10.5} tracking={1.5} color={C.muted}>
              原文句 / WHAT IS AN AGENT?
            </Label>
          </div>
          <div
            style={{
              padding: "17px 19px 16px",
              borderRadius: 16,
              background: "#FFFFFF",
              border: `1.5px solid ${C.green}3A`,
              boxShadow: `0 12px 34px ${C.green}0A`,
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontSize: 22,
                lineHeight: 1.42,
                fontWeight: 450,
                color: C.ink,
              }}
            >
              <span style={{ color: C.green, fontFamily: "Georgia, serif", fontSize: 26 }}>“</span>
              Agents are systems that independently accomplish tasks on your behalf.
              <span style={{ color: C.green, fontFamily: "Georgia, serif", fontSize: 26 }}>”</span>
            </div>
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <StatusDot color={C.faint} size={5} />
              <span style={{ fontFamily: CJK, fontSize: 11, color: C.faint }}>
                截图中的红框为原页面已有标注
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            padding: "16px 19px 17px",
            borderRadius: 16,
            background: "linear-gradient(135deg, #FFFFFF 0%, #F5FBF7 100%)",
            border: `1px solid ${C.green}25`,
            opacity: clamp(translation * 1.1),
            transform: `translateY(${(1 - clamp(translation)) * 18}px)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: 1.3,
                color: C.greenDeep,
                border: `1px solid ${C.green}45`,
                borderRadius: 4,
                padding: "3px 6px",
              }}
            >
              意译
            </span>
            <span style={{ fontFamily: CJK, fontSize: 12, color: C.muted }}>不是官方原句，不加引号引用</span>
          </div>
          <div
            style={{
              marginTop: 10,
              fontFamily: CJK,
              fontSize: 31,
              fontWeight: 600,
              lineHeight: 1.55,
              color: C.ink,
              letterSpacing: 0.2,
            }}
          >
            代表用户，
            <br />
            独立完成
            <span
              style={{
                display: "inline-block",
                whiteSpace: "nowrap",
                backgroundImage: `linear-gradient(transparent 72%, ${C.green}33 72%)`,
                backgroundSize: `${clamp(taskK) * 100}% 100%`,
                backgroundRepeat: "no-repeat",
              }}
            >
              任务
            </span>
            的
            <span
              style={{
                display: "inline-block",
                whiteSpace: "nowrap",
                backgroundImage: `linear-gradient(transparent 72%, ${C.green}33 72%)`,
                backgroundSize: `${clamp(systemK) * 100}% 100%`,
                backgroundRepeat: "no-repeat",
              }}
            >
              系统
            </span>
            。
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            opacity: clamp(tagsK * 1.15),
            transform: `translateY(${(1 - clamp(tagsK)) * 17}px)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
            <Label size={10.5} tracking={1.4} color={C.muted}>
              下方正文要点
            </Label>
            <span style={{ flex: 1, height: 1, background: C.hairline }} />
            <Pill color={C.muted} soft="#F3F5F7" style={{ height: 22, fontSize: 10.5 }}>
              不是红框同一句
            </Pill>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 7,
            }}
          >
            {tagRows.map(([num, title, note], i) => {
              const k = springIn(frame, 250 + i * 10, { damping: 20, stiffness: 120 });
              return (
                <div
                  key={num}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    height: 49,
                    padding: "0 13px",
                    borderRadius: 10,
                    border: `1px solid ${C.green}1E`,
                    background: "rgba(255,255,255,.76)",
                    opacity: clamp(k * 1.15),
                    transform: `translateX(${(1 - clamp(k)) * 10}px)`,
                  }}
                >
                  <span style={{ fontFamily: MONO, fontSize: 10, color: C.green, letterSpacing: 0.8 }}>{num}</span>
                  <span style={{ fontFamily: CJK, fontSize: 18, fontWeight: 600, color: C.ink }}>{title}</span>
                  <span style={{ marginLeft: "auto", fontFamily: CJK, fontSize: 11.5, color: C.muted }}>{note}</span>
                </div>
              );
            })}
          </div>
          <div
            style={{
              marginTop: 11,
              display: "flex",
              gap: 7,
              alignItems: "center",
              fontFamily: CJK,
              fontSize: 11.5,
              color: C.muted,
              opacity: clamp(groupK * 1.15),
            }}
          >
            <StatusDot color={C.green} size={5} />
            这些动作，由模型在执行过程中管理
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 96,
          top: 886,
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "9px 14px",
          borderRadius: 10,
          border: `1px solid ${C.blue}2B`,
          background: "rgba(255,255,255,.8)",
          opacity: clamp(marker),
        }}
      >
        <StatusDot color={C.blue} size={7} />
        <span style={{ fontFamily: CJK, fontSize: 13.5, fontWeight: 550, color: C.blueDeep }}>
          上一镜的运行时决策
        </span>
        <span style={{ width: 1, height: 13, background: `${C.blue}30` }} />
        <span style={{ fontFamily: CJK, fontSize: 12, color: C.muted }}>从“谁决定”走到“完成什么”</span>
      </div>

      <div
        style={{
          position: "absolute",
          left: 1350,
          top: 866,
          width: 480,
          display: "flex",
          justifyContent: "space-between",
          color: C.faint,
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: 0.8,
        }}
      >
        <span>OPENAI / AGENT DESIGN FOUNDATIONS</span>
        <span>中文为制作意译</span>
      </div>
    </>
  );
};
