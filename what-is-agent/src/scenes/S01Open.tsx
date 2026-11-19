import { useCurrentFrame } from "remotion";
import { C, CJK, FONT, MONO } from "../theme";
import { clamp, easeIn, easeOut, mix, springIn } from "../lib/motion";
import { Label, Pill, Rule } from "../components/Primitives";
import { ScreenshotCrop } from "../components/Screenshot";
import { SceneHeader } from "../components/Chrome";
import { SCENES } from "../timeline";

type SourceCardProps = {
  x: number;
  frame: number;
  delay: number;
  accent: string;
  kicker: string;
  title: string;
  src: string;
  quote: string;
  bookmark: string;
  imageWidth: number;
  offsetX?: number;
  offsetY?: number;
};

const SourceCard = ({
  x,
  frame,
  delay,
  accent,
  kicker,
  title,
  src,
  quote,
  bookmark,
  imageWidth,
  offsetX = 0,
  offsetY = 0,
}: SourceCardProps) => {
  const k = springIn(frame, delay, { damping: 20, stiffness: 105 });
  const exit = easeIn(frame, 568, 28);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 286,
        width: 820,
        height: 454,
        opacity: clamp(k * 1.15),
        transform: `translateY(${(1 - clamp(k)) * 60}px) scale(${0.965 + clamp(k) * 0.035})`,
      }}
    >
      <div
        className="paper-surface"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 20,
          overflow: "hidden",
          borderTop: `4px solid ${accent}`,
        }}
      >
        <div
          style={{
            height: 62,
            padding: "0 22px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: `1px solid ${C.hairline}`,
          }}
        >
          <span style={{ width: 9, height: 9, borderRadius: 9, background: accent }} />
          <span
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: 1.3,
              color: accent,
              textTransform: "uppercase",
            }}
          >
            {kicker}
          </span>
          <span style={{ fontFamily: CJK, fontSize: 18, fontWeight: 600, color: C.ink }}>{title}</span>
          <div style={{ marginLeft: "auto" }}>
            <Pill color={accent} soft={`${accent}0D`} style={{ height: 27, fontSize: 12 }}>
              官方页面
            </Pill>
          </div>
        </div>
        <div style={{ padding: 18 }}>
          <ScreenshotCrop
            src={src}
            width={784}
            height={282}
            imageWidth={imageWidth}
            offsetX={offsetX}
            offsetY={offsetY}
            style={{ background: "#F6F6F5", border: `1px solid ${C.hairline}` }}
          />
          <div
            style={{
              marginTop: 15,
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              height: 50,
            }}
          >
            <div style={{ width: 3, height: 40, borderRadius: 3, background: `${accent}45`, flex: "0 0 auto" }} />
            <div
              style={{
                fontFamily: CJK,
                fontSize: 16,
                lineHeight: 1.5,
                color: C.body,
                letterSpacing: 0.1,
              }}
            >
              {quote}
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 464,
          height: 30,
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "0 11px",
          borderLeft: `3px solid ${accent}`,
          background: `${accent}0D`,
          borderRadius: "0 6px 6px 0",
          color: accent,
          fontFamily: CJK,
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: 0.3,
        }}
      >
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1.1, opacity: 0.7 }}>BOOKMARK</span>
        {bookmark}
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 20,
          pointerEvents: "none",
          border: `1px solid ${exit > 0.1 ? `${accent}30` : "transparent"}`,
        }}
      />
    </div>
  );
};

export const S01Open = () => {
  const frame = useCurrentFrame();
  const intro = springIn(frame, 2, { damping: 18, stiffness: 80 });
  const introOut = easeIn(frame, 290, 22);
  const header = springIn(frame, 294, { damping: 22, stiffness: 100 });
  const cameraPush = easeOut(frame, 180, 60);

  const cardShift = mix(0, -10, cameraPush);
  const cardScale = mix(1, 1.012, cameraPush);

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 11,
          opacity: clamp(header * 1.15),
          pointerEvents: "none",
        }}
      >
        <SceneHeader
          scene={SCENES[0]}
          title={
            <>
              Agent 到底是什么？
              <span style={{ color: C.blue }}> 先看原文</span>
            </>
          }
          subtitle="两份官方材料，两种措辞，指向同一件能力"
          width={1300}
        />
      </div>

      {/* 片名：先作为唯一焦点出现，再让位给两张原文卡。 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 8,
          opacity: clamp(intro * 1.1) * (1 - introOut),
          transform: `translateY(${(1 - clamp(intro)) * 34 - introOut * 46}px)`,
          filter: `blur(${introOut * 6}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 372,
            textAlign: "center",
            fontFamily: FONT,
            fontSize: 142,
            fontWeight: 600,
            lineHeight: 1,
            letterSpacing: -5.5,
            color: C.ink,
          }}
        >
          <span style={{ color: C.blue }}>Agent</span> 是什么？
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 552,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 18,
            fontFamily: CJK,
            fontSize: 27,
            letterSpacing: 2,
            color: C.muted,
          }}
        >
          <span style={{ width: 38, height: 1, background: "#C5CBD2" }} />
          从两份官方定义说起
          <span style={{ width: 38, height: 1, background: "#C5CBD2" }} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 626, display: "flex", justifyContent: "center", gap: 8 }}>
          {[C.blue, C.green, C.yellow, C.red].map((c) => (
            <span key={c} style={{ width: 20, height: 4, borderRadius: 3, background: c }} />
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 264,
            textAlign: "center",
            opacity: 0.9,
          }}
        >
          <Label size={12} tracking={3.2} color={C.faint}>
            A CONCEPT FILM · ANTHROPIC / OPENAI
          </Label>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: clamp(header * 1.15),
          transform: `translateY(${(1 - clamp(header)) * 18}px)`,
        }}
      >
        <div style={{ position: "absolute", left: 96, top: 243, display: "flex", alignItems: "center", gap: 14 }}>
          <Rule color={C.blue} width={30} height={3} />
          <span
            style={{
              fontFamily: CJK,
              fontSize: 15,
              color: C.muted,
              letterSpacing: 0.8,
            }}
          >
            先露出来源，再进入两段原文
          </span>
        </div>

        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            transform: `translateX(${cardShift}px) scale(${cardScale})`,
            transformOrigin: "48% 52%",
          }}
        >
          <SourceCard
            x={120}
            frame={frame}
            delay={300}
            accent={C.blue}
            kicker="ANTHROPIC"
            title="Building effective agents"
            src="images/anthropic.png"
            quote="Workflows 与 Agents：两种架构，区别在于谁主导执行过程。"
            bookmark="Anthropic · 架构区别"
            imageWidth={784}
          />
          <div
            style={{
              position: "absolute",
              left: 980,
              top: 286,
              width: 820,
              height: 454,
              opacity: clamp(springIn(frame, 312) * 1.15) * (1 - easeOut(frame, 570, 40) * 0.82),
              transform: `translateY(${mix(0, 76, easeOut(frame, 570, 44))}px) scale(${mix(1, 0.9, easeOut(frame, 570, 44))})`,
              transformOrigin: "80% 90%",
            }}
          >
            <div
              className="paper-surface"
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 20,
                overflow: "hidden",
                borderTop: `4px solid ${C.green}`,
              }}
            >
              <div
                style={{
                  height: 62,
                  padding: "0 22px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  borderBottom: `1px solid ${C.hairline}`,
                }}
              >
                <span style={{ width: 9, height: 9, borderRadius: 9, background: C.green }} />
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    letterSpacing: 1.3,
                    color: C.green,
                    textTransform: "uppercase",
                  }}
                >
                  OPENAI
                </span>
                <span style={{ fontFamily: CJK, fontSize: 18, fontWeight: 600, color: C.ink }}>
                  A practical guide to building agents
                </span>
                <div style={{ marginLeft: "auto" }}>
                  <Pill color={C.green} soft={C.greenSoft} style={{ height: 27, fontSize: 12 }}>
                    官方页面
                  </Pill>
                </div>
              </div>
              <div style={{ padding: 18 }}>
                <ScreenshotCrop
                  src="images/openai.png"
                  width={784}
                  height={282}
                  imageWidth={784}
                  style={{ background: "#F6F6F5", border: `1px solid ${C.hairline}` }}
                />
                <div style={{ marginTop: 15, display: "flex", alignItems: "flex-start", gap: 12, height: 50 }}>
                  <div style={{ width: 3, height: 40, borderRadius: 3, background: `${C.green}45`, flex: "0 0 auto" }} />
                  <div style={{ fontFamily: CJK, fontSize: 16, lineHeight: 1.5, color: C.body }}>
                    Agents are systems that independently accomplish tasks on your behalf.
                  </div>
                </div>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 464,
                height: 30,
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "0 11px",
                borderLeft: `3px solid ${C.green}`,
                background: `${C.green}0D`,
                borderRadius: "0 6px 6px 0",
                color: C.green,
                fontFamily: CJK,
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1.1, opacity: 0.7 }}>BOOKMARK</span>
              OpenAI · 任务系统
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 96,
            top: 844,
            display: "flex",
            alignItems: "center",
            gap: 20,
            opacity: clamp(easeOut(frame, 330, 30)) * (1 - clamp(easeOut(frame, 576, 30))),
          }}
        >
          <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: 1.6, color: C.faint }}>SOURCE 01 / 02</span>
          <span style={{ width: 52, height: 1, background: C.line }} />
          <span style={{ fontFamily: CJK, fontSize: 14, color: C.muted, letterSpacing: 0.4 }}>
            截图保持原样，不把中文归纳放进截图
          </span>
        </div>
      </div>

    </>
  );
};
