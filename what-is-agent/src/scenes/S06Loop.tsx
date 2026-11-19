import { Img, staticFile, useCurrentFrame } from "remotion";
import { C, CJK, MONO } from "../theme";
import { clamp, easeIn, easeOut, springIn } from "../lib/motion";
import { Label, StatusDot } from "../components/Primitives";
import { SceneHeader } from "../components/Chrome";
import { LoopDiagram } from "../components/LoopDiagram";
import { SCENES } from "../timeline";

const scene = SCENES[5];

export const S06Loop = () => {
  const frame = useCurrentFrame();
  const referenceIn = springIn(frame, 2, { damping: 22, stiffness: 100 });
  const referenceOut = easeIn(frame, 56, 26);
  const diagramIn = easeOut(frame, 40, 22);
  const diagramLabel = springIn(frame, 70, { damping: 22, stiffness: 100 });

  return (
    <>
      <SceneHeader
        scene={scene}
        title="一轮动作：决策、执行、反馈"
        subtitle="模型提出下一步，程序真正执行，结果再交回模型"
        source="Anthropic · Agents / 简化重绘"
        sourceColor={C.blue}
        width={1100}
      />

      <LoopDiagram
        frame={frame}
        mode="explain"
        style={{
          opacity: diagramIn,
          transform: `scale(${0.988 + diagramIn * 0.012})`,
          transformOrigin: "50% 40%",
        }}
      />

      <div
        style={{
          position: "absolute",
          right: 106,
          top: 244,
          display: "flex",
          alignItems: "center",
          gap: 7,
          opacity: clamp(diagramLabel),
        }}
      >
        <Label size={9.5} tracking={1.3} color={C.faint}>
          REDRAWN FROM THE LOOP
        </Label>
        <span style={{ width: 20, height: 1, background: C.line }} />
      </div>

      {/* 0–2 秒只承接附件原图，随后让位给重绘简图。 */}
      <div
        style={{
          position: "absolute",
          left: 400,
          top: 264,
          width: 1120,
          height: 604,
          zIndex: 16,
          opacity: clamp(referenceIn * 1.15) * (1 - referenceOut),
          transform: `translateY(${(1 - clamp(referenceIn)) * 24}px) scale(${1 + referenceOut * 0.025})`,
          filter: `blur(${referenceOut * 4}px)`,
        }}
      >
        <div
          className="paper-surface"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 18,
            padding: 12,
            background: "rgba(255,255,255,.97)",
          }}
        >
          <div
            style={{
              position: "relative",
              width: 1096,
              height: 580,
              borderRadius: 10,
              overflow: "hidden",
              border: `1px solid ${C.hairline}`,
              background: "#F7F8FA",
            }}
          >
            <Img
              src={staticFile("images/loop-reference.png")}
              style={{
                width: 1440,
                height: "auto",
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%) scale(0.761)",
                maxWidth: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 16,
                top: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 9px",
                borderRadius: 5,
                background: "rgba(255,255,255,.92)",
                border: "1px solid rgba(224,228,235,.95)",
                fontFamily: MONO,
                fontSize: 9.5,
                letterSpacing: 1.1,
                color: C.blue,
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: 3, background: C.blue }} />
              附件原图 / AGENT LOOP
            </div>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 14,
            bottom: -19,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: CJK,
            fontSize: 11.5,
            color: C.muted,
          }}
        >
          <StatusDot color={C.blue} size={5} />
          只做两秒承接；下面用同一套配色重绘成三个位置
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 110,
          top: 906,
          display: "flex",
          alignItems: "center",
          gap: 12,
          opacity: clamp(easeOut(frame, 385, 30)),
        }}
      >
        <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: 1.2, color: C.faint }}>
          LOOP / NOT A FIXED NUMBER OF ROUNDS
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          right: 106,
          top: 906,
          display: "flex",
          alignItems: "center",
          gap: 8,
          opacity: clamp(easeOut(frame, 385, 30)) * 0.85,
          fontFamily: CJK,
          fontSize: 11.5,
          color: C.faint,
        }}
      >
        <span style={{ width: 5, height: 5, borderRadius: 5, background: C.green }} />
        反馈来自真实执行结果
      </div>
    </>
  );
};
