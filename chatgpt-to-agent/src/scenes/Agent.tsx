import { useCurrentFrame } from "remotion";
import { ASSETS, COLORS, readableColor } from "../data/story";
import { LightCore } from "../components/LightCore";
import { GlassPanel } from "../components/GlassPanel";
import { ChapterLabel, Credit, AccentText, Quote, RevealText } from "../components/Typography";
import { DnaHelix, Terminal } from "../components/Instruments";
import { World3D } from "../components/World3D";
import { FONT } from "../lib/fonts";
import { appear, ease, hold, seeded } from "../lib/motion";

export const ThreeStreams = () => {
  const f = useCurrentFrame();
  const merge = ease(f, 7, 95);
  return (
    <>
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="streams-bloom">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>
        {[
          { d: "M -80 110 C 240 180 300 325 652 503", color: COLORS.blue },
          { d: "M 80 1020 C 400 1010 360 645 652 503", color: readableColor(COLORS.yellow) },
          { d: "M 1860 -50 C 1250 25 1100 470 652 503", color: COLORS.red },
        ].map(({ d, color }) => (
          <g key={color}>
            <path
              d={d}
              fill="none"
              stroke={color}
              strokeWidth="8"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - merge}
              filter="url(#streams-bloom)"
              opacity=".12"
            />
            <path d={d} fill="none" stroke={color} strokeWidth="2.2" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - merge} opacity=".8" />
            <path d={d} fill="none" stroke="#4285F4" strokeWidth="1" pathLength="1" strokeDasharray=".055 .945" strokeDashoffset={-merge + 0.05} opacity=".6" />
          </g>
        ))}
      </svg>
      <div style={{ position: "absolute", left: 442, top: 293, transform: `scale(${ease(f, 15, 125, 0.65, 1.05)})` }}>
        <LightCore size={420} strength={appear(f, 55, 40)} id="agent-core" />
      </div>
      <div style={{ position: "absolute", left: 116, top: 165, opacity: appear(f, 88, 26) }}>
        <RevealText text="你交代目标" start={93} size={49} />
        <RevealText text="它连续干活" start={112} size={49} accent style={{ marginTop: 8 }} />
      </div>
      <GlassPanel
        image={ASSETS.research.file}
        color={COLORS.green}
        width={790}
        rotateY={-10}
        delay={70}
        style={{ left: 982, top: 273, transform: `perspective(1800px) rotateY(-10deg) scale(${ease(f, 70, 210, 0.87, 1)})` }}
      />
      <ChapterLabel index="04" label="AI AGENT" color={COLORS.green} subtitle="2025–26 / GOAL-DRIVEN ACTION" />
      <div style={{ position: "absolute", left: 1030, top: 802, fontFamily: FONT.sans, fontSize: 25, color: "#202124", opacity: appear(f, 107, 30) }}>
        Deep Research <span style={{ color: "#8B9099", margin: "0 20px" }}> / </span> Codex
      </div>
    </>
  );
};

export const AgentOrbit = ({ duration }: { duration: number }) => {
  const f = useCurrentFrame();
  return (
    <>
      <World3D mode="orbit" duration={duration} />
      <ChapterLabel index="04" label="THE AGENT LOOP" color={COLORS.green} />
      <div
        style={{
          position: "absolute",
          right: 116,
          top: 92,
          fontFamily: FONT.chinese,
          fontSize: 19,
          color: "#5F6368",
          letterSpacing: 2,
          opacity: appear(f, 70, 30),
        }}
      >
        权限 · 次数 · 审批
      </div>
      <RevealText text="根据观察，动态选择下一步" start={204} size={49} accent style={{ position: "absolute", left: 116, bottom: 228 }} />
    </>
  );
};

const SampleCube = ({ index, frame }: { index: number; frame: number }) => {
  const scanned = Math.floor(ease(frame, 29, 142, 0, 30));
  const failure = index === 16 && frame >= 107 && frame < 272;
  const anomaly = (index === 3 || index === 26) && scanned > index;
  const pass = scanned > index && !failure && !anomaly;
  const color = failure ? COLORS.red : anomaly ? COLORS.yellow : pass ? COLORS.green : "#AEB4BE";
  const pulse = failure ? 0.65 + 0.35 * Math.sin(frame / 7) : 1;
  return (
    <div
      data-sample={`S${(index + 1).toString().padStart(2, "0")}`}
      data-state={failure ? "failed" : anomaly ? "anomaly" : pass ? "passed" : "pending"}
      style={{ width: 126, height: 111, position: "relative", opacity: appear(frame, index * 1.2, 30) }}
    >
      <svg
        width="126"
        height="87"
        viewBox="0 0 126 87"
        style={{ filter: `drop-shadow(0 0 ${failure ? 17 : pass ? 8 : 3}px ${color}${failure ? "80" : "38"})` }}
      >
        <path d="M 18 25 L 64 7 L 107 25 L 64 44 Z" fill={`${color}38`} stroke={color} opacity={pulse} strokeWidth="1.1" />
        <path d="M 18 25 L 64 44 L 64 77 L 18 57 Z" fill={`${color}12`} stroke={color} strokeWidth=".8" opacity={pulse} />
        <path d="M 64 44 L 107 25 L 107 57 L 64 77 Z" fill={`${color}20`} stroke={color} strokeWidth=".8" opacity={pulse} />
        {scanned > index && <circle cx="64" cy="26" r={failure ? 5 : 3} fill={color} opacity={pulse} />}
      </svg>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 15,
          color: failure ? "#B3261E" : anomaly ? "#8D6600" : pass ? "#188038" : "#5F6368",
          textAlign: "center",
          marginTop: 1,
        }}
      >
        S{(index + 1).toString().padStart(2, "0")}
      </div>
    </div>
  );
};

const Report = ({ frame }: { frame: number }) => {
  const p = appear(frame, 313, 38);
  return (
    <div
      data-testid="qc-report"
      style={{
        position: "absolute",
        left: 1143,
        top: 338,
        width: 620,
        padding: "29px 34px 31px",
        opacity: p,
        transform: `perspective(1600px) rotateY(-6deg) translateY(${(1 - p) * 28}px)`,
        border: "1px solid #34A85355",
        borderRadius: 16,
        background: "linear-gradient(140deg,#FFFFFFee,#F8F9FAe8)",
        boxShadow: "0 24px 80px #20212414",
        fontFamily: FONT.sans,
      }}
    >
      <div style={{ fontFamily: FONT.mono, fontSize: 14, letterSpacing: 3, color: "#188038" }}>QC REPORT / REPRODUCIBLE</div>
      <div style={{ display: "flex", alignItems: "baseline", marginTop: 22, gap: 16 }}>
        <span style={{ fontSize: 56, color: "#202124", fontWeight: 600 }}>30</span>
        <span style={{ fontFamily: FONT.chinese, fontSize: 22, color: "#5F6368" }}>个样本</span>
        <span style={{ marginLeft: "auto", fontSize: 34, color: readableColor(COLORS.yellow), fontFamily: FONT.chinese }}>异常清单：2</span>
      </div>
      <svg width="535" height="92" style={{ marginTop: 22 }}>
        {Array.from({ length: 30 }, (_, i) => {
          const h = (28 + seeded(i, 14) * 50) * ease(frame, 326 + i * 0.7, 355 + i * 0.7);
          return (
            <rect
              key={i}
              x={i * 17.8}
              y={85 - h}
              width="9"
              height={h}
              rx="2"
              fill={i === 3 || i === 26 ? COLORS.yellow : i === 16 ? COLORS.blueLight : "#34A853"}
              opacity=".85"
            />
          );
        })}
        <path d="M 0 85 L 535 85" stroke="#DADCE055" />
      </svg>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 26,
          borderTop: "1px solid #DADCE0",
          paddingTop: 19,
          marginTop: 15,
          fontFamily: FONT.mono,
          fontSize: 18,
        }}
      >
        <span style={{ color: readableColor(COLORS.yellow) }}>S04</span>
        <span style={{ color: "#202124" }}>N50 below threshold</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 16, fontFamily: FONT.mono, fontSize: 18 }}>
        <span style={{ color: readableColor(COLORS.yellow) }}>S27</span>
        <span style={{ color: "#202124" }}>High contig count</span>
      </div>
      <div style={{ fontFamily: FONT.chinese, fontSize: 21, color: "#202124", marginTop: 26 }}>未解决问题与证据</div>
      <div style={{ fontFamily: FONT.chinese, fontSize: 17, color: "#5F6368", marginTop: 9 }}>2 个指标异常待复核 · 日志与命令已保留</div>
      <div style={{ fontFamily: FONT.mono, fontSize: 14, color: "#188038", marginTop: 20 }}>report.html + metrics.tsv + run.log</div>
    </div>
  );
};

export const ThirtySamples = () => {
  const f = useCurrentFrame();
  const focus = hold(f, 134, 298, 30);
  const scan = ease(f, 25, 140, 0, 570);
  return (
    <>
      <DnaHelix color={COLORS.green} style={{ left: 155, top: 58, opacity: 0.19, filter: "blur(9px)", transform: "rotate(-21deg) scale(1.4)" }} />
      <DnaHelix color={COLORS.blue} style={{ right: 140, top: 50, opacity: 0.1, filter: "blur(10px)", transform: "rotate(23deg) scale(1.2)" }} />
      <ChapterLabel index="04" label="THIRTY SAMPLES, ONE GOAL" color={COLORS.green} />
      <Quote style={{ position: "absolute", left: 116, top: 178, fontSize: 25, width: 1450 }}>
        检查这 30 个样本，失败的先排查，最后给我异常清单和可复现的报告。
      </Quote>
      <div
        style={{
          position: "absolute",
          left: 154 - focus * 40,
          top: 311 - focus * 18,
          width: 874,
          transform: `perspective(1800px) rotateY(${-7 + focus * 4}deg) rotateX(5deg) scale(${1 + focus * 0.07})`,
          transformOrigin: "center center",
          filter: `blur(${focus * 0.7}px)`,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,126px)", gap: "2px 13px" }}>
          {Array.from({ length: 30 }, (_, i) => (
            <SampleCube key={i} index={i} frame={f} />
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            top: scan,
            left: 0,
            right: 0,
            height: 2,
            background: "linear-gradient(90deg,transparent,#4285F4aa,transparent)",
            boxShadow: "0 0 30px #4285F4",
            opacity: 1 - ease(f, 134, 160),
          }}
        />
      </div>
      <Terminal
        color={f < 270 ? COLORS.red : COLORS.green}
        title="S17 / autonomous recovery"
        start={152}
        step={22}
        lines={[
          { text: "$ run_quast samples/S17.fasta", color: "#1967D2" },
          { text: "ERROR: contig file truncated", color: "#B3261E" },
          { text: "> inspect log; validate input", color: "#188038" },
          { text: "> repair input; adjust parameters", color: "#188038" },
          { text: "$ rerun --validated-input", color: "#4285F4" },
          { text: "SUCCESS: metrics recovered", color: "#188038" },
        ]}
        style={{ left: 912, top: 351, width: 830, opacity: focus, transform: `translateX(${(1 - focus) * 45}px)` }}
      />
      <div style={{ position: "absolute", left: 963, top: 708, fontFamily: FONT.chinese, fontSize: 26, color: "#188038", opacity: hold(f, 279, 316, 10) }}>
        调整参数 → 重新运行 → 恢复成功
      </div>
      <Report frame={f} />
      <Credit style={{ bottom: 190 }}>演示数据 · 程序化实验室背景</Credit>
      <div style={{ position: "absolute", right: 132, bottom: 190, fontFamily: FONT.chinese, fontSize: 21, color: "#8D6600", letterSpacing: 0.5 }}>
        <span style={{ fontFamily: FONT.sans, marginRight: 10 }}>△</span>Agent 也会犯错，结论需要验证
      </div>
    </>
  );
};
