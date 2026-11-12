import { useCurrentFrame } from "remotion";
import { ASSETS, COLORS } from "../data/story";
import { ChapterLabel, Quote, RevealText } from "../components/Typography";
import { GlassPanel } from "../components/GlassPanel";
import { World3D } from "../components/World3D";
import { FONT } from "../lib/fonts";
import { appear, ease } from "../lib/motion";
import { noise3D } from "@remotion/noise";

export const LightPipeline = ({ duration }: { duration: number }) => {
  const f = useCurrentFrame();
  return (
    <>
      <World3D mode="workflow" duration={duration} />
      <ChapterLabel index="03" label="WORKFLOW" color={COLORS.red} subtitle="2023–24 / DECLARED ORCHESTRATION" />
      <div style={{ position: "absolute", left: 116, bottom: 230, display: "flex", alignItems: "center", gap: 23 }}>
        {["节点", "连线", "条件", "执行引擎"].map((text, i) => (
          <div
            key={text}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 23,
              opacity: appear(f, 20 + i * 32, 28),
              fontFamily: FONT.chinese,
              fontSize: 35,
              color: i === 3 ? "#B3261E" : "#5F6368",
            }}
          >
            {i > 0 && <span style={{ fontFamily: FONT.sans, color: "#8B9099", fontSize: 30 }}>+</span>}
            {text}
          </div>
        ))}
      </div>
    </>
  );
};

const platforms = [
  { name: "n8n", asset: ASSETS.n8n },
  { name: "Dify", asset: ASSETS.dify },
  { name: "扣子", asset: ASSETS.coze },
];
export const PlatformOrbit = () => {
  const f = useCurrentFrame();
  const focus = f < 78 ? 0 : f < 153 ? 1 : 2;
  const orbit = ease(f, 0, 240, -24, 24);
  return (
    <>
      <ChapterLabel index="03" label="LOWER THE BARRIER" color={COLORS.red} />
      <div style={{ position: "absolute", left: 116, top: 179, fontFamily: FONT.chinese, fontSize: 43, color: "#202124", opacity: appear(f, 12) }}>
        让模型，进入真实业务
      </div>
      <div style={{ position: "absolute", inset: 0, transform: `perspective(2200px) rotateY(${orbit * 0.22}deg) translateX(${orbit}px)` }}>
        {platforms.map((platform, i) => {
          const active = i === focus;
          const transition = ease(f, focus === 0 ? 0 : focus === 1 ? 76 : 151, focus === 0 ? 28 : focus === 1 ? 100 : 178);
          return (
            <div
              key={platform.name}
              style={{
                position: "absolute",
                left: 128 + i * 560,
                top: 355 + (i === 1 ? -28 : 18),
                width: 540,
                zIndex: active ? 3 : 1,
                transform: `scale(${active ? 1.08 + transition * 0.03 : 0.9})`,
                transformOrigin: "center center",
              }}
            >
              <GlassPanel
                image={platform.asset.file}
                color={COLORS.red}
                width={540}
                rotateY={(1 - i) * 21}
                rotateX={4}
                delay={8 + i * 12}
                style={{ position: "relative", left: 0, top: 0, opacity: active ? 1 : 0.53, filter: active ? "none" : "blur(1.8px)" }}
              />
              <div
                style={{
                  position: "relative",
                  marginTop: 28,
                  fontFamily: FONT.sans,
                  fontSize: 36,
                  fontWeight: 600,
                  color: active ? "#202124" : "#5F6368",
                  textAlign: "center",
                }}
              >
                {platform.name}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 150,
          right: 150,
          height: 1,
          top: 795,
          opacity: 0.25,
          background: "linear-gradient(90deg,transparent,#EA4335,transparent)",
          boxShadow: "0 0 24px #EA433560",
        }}
      />
    </>
  );
};

export const TrackEnd = () => {
  const f = useCurrentFrame();
  const unknown = ease(f, 120, 210);
  const drift = noise3D("goal-mist", f / 200, 0, 0) * 28;
  return (
    <>
      <ChapterLabel index="03" label="THE EDGE OF THE PLAN" color={COLORS.red} />
      <div style={{ position: "absolute", inset: 0, transform: `perspective(1200px) rotateX(22deg) rotateY(${ease(f, 0, 300, 0, -11)}deg)` }}>
        <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
          {[0, 1].map((i) => (
            <path key={i} d={`M 140 ${560 + i * 55} L ${1630 - unknown * 450} ${560 + i * 55}`} fill="none" stroke={COLORS.red} strokeWidth="2" opacity=".65" />
          ))}
          {Array.from({ length: 18 }, (_, i) => (
            <line
              key={i}
              x1={170 + i * 80}
              x2={170 + i * 80}
              y1="550"
              y2="625"
              stroke={COLORS.red}
              strokeWidth="1"
              opacity={i > 12 ? 0.35 * (1 - unknown) : 0.25}
            />
          ))}
          {[0, 1, 2, 3].map((i) => {
            const x = 160 + ((f * 3 + i * 300) % 1300) * (1 - unknown * 0.2);
            return (
              <g key={i} opacity={1 - unknown}>
                <circle cx={x} cy="587" r="6" fill="#EA4335" style={{ filter: "drop-shadow(0 0 14px #EA4335)" }} />
                <path d={`M ${x - 60} 587 L ${x - 8} 587`} stroke={COLORS.red} strokeWidth="2" opacity=".5" />
              </g>
            );
          })}
        </svg>
      </div>
      <div
        style={{
          position: "absolute",
          left: 116,
          top: 232,
          display: "flex",
          gap: 50,
          opacity: 1 - unknown,
          fontFamily: FONT.chinese,
          fontSize: 38,
          color: "#B3261E",
        }}
      >
        {["可重复", "可审计", "可预测"].map((text, i) => (
          <div key={text} style={{ opacity: appear(f, i * 25, 25) }}>
            {text}
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 380 + drift,
          top: 306,
          width: 960,
          height: 330,
          opacity: unknown,
          background: "radial-gradient(ellipse,#34A85316,#34A85308 40%,transparent 70%)",
          filter: "blur(38px)",
        }}
      />
      <Quote
        start={129}
        style={{ position: "absolute", left: 380, top: 272, width: 960, fontSize: 26, textAlign: "center", borderLeft: 0, paddingLeft: 0, color: "#202124" }}
      >
        检查这 30 个样本，失败的先排查，
        <br />
        最后给我异常清单和报告。
      </Quote>
      <RevealText text="只给目标，没有步骤？" start={169} size={72} style={{ position: "absolute", left: 0, right: 0, top: 642, textAlign: "center" }} />
      <div
        style={{
          position: "absolute",
          left: 1124,
          top: 498,
          width: 150,
          height: 180,
          opacity: unknown,
          background: "linear-gradient(90deg,transparent,#FCFCFD)",
          filter: "blur(12px)",
        }}
      />
    </>
  );
};
