import { Img, staticFile, useCurrentFrame } from "remotion";
import { Trail } from "@remotion/motion-blur";
import { ASSETS, COLORS } from "../data/story";
import { GlassPanel } from "../components/GlassPanel";
import { ChapterLabel, Quote, RevealText } from "../components/Typography";
import { DnaHelix, GenomeFile, Terminal } from "../components/Instruments";
import { FONT } from "../lib/fonts";
import { appear, ease, seeded } from "../lib/motion";

export const OldChatGPT = () => {
  const f = useCurrentFrame();
  const prompt = "请解释基因组的 N50 指标。";
  const reply = "N50 是评价组装连续性的一个指标。";
  return (
    <>
      <ChapterLabel index="01" label="CHATBOT" color={COLORS.blue} subtitle="2023 / CONVERSATION & GENERATION" />
      <div style={{ position: "absolute", left: 80, top: 235, fontFamily: FONT.sans, fontSize: 232, fontWeight: 650, color: "#4285F409", letterSpacing: -12 }}>
        2023
      </div>
      <GlassPanel
        width={1240}
        rotateY={-16 + ease(f, 0, 240) * 16}
        color={COLORS.blue}
        style={{
          left: 438,
          top: 213,
          transform: `perspective(2200px) rotateY(${-16 + ease(f, 0, 240) * 16}deg) rotateX(3deg) scale(${ease(f, 0, 240, 0.94, 1.02)})`,
        }}
      >
        <div style={{ position: "relative" }}>
          <Img src={staticFile(ASSETS.chatgpt.file)} style={{ width: "100%", borderRadius: 9, display: "block" }} />
          <div
            style={{
              position: "absolute",
              left: "25%",
              right: "4%",
              bottom: "5.3%",
              height: 42,
              background: "#40414f",
              borderRadius: 5,
              display: "flex",
              alignItems: "center",
              paddingLeft: 18,
              color: "#dde1ec",
              fontFamily: FONT.chinese,
              fontSize: 20,
            }}
          >
            {prompt.slice(0, Math.floor(ease(f, 45, 126, 0, prompt.length)))}
            <span style={{ marginLeft: 2, opacity: Math.floor(f / 15) % 2 ? 0 : 1, color: COLORS.blueLight }}>|</span>
          </div>
        </div>
      </GlassPanel>
      <div
        style={{
          position: "absolute",
          left: 144,
          top: 600,
          width: 650,
          padding: "26px 30px",
          borderLeft: `2px solid ${COLORS.blueLight}60`,
          background: "#FFFFFFF0",
          borderRadius: 12,
          boxShadow: "0 8px 30px #2021240C",
          opacity: appear(f, 137, 25),
        }}
      >
        <div style={{ fontFamily: FONT.mono, fontSize: 14, letterSpacing: 3, color: COLORS.blueDeep, marginBottom: 16 }}>ASSISTANT</div>
        <div style={{ fontFamily: FONT.chinese, fontSize: 29, lineHeight: 1.6, color: "#202124" }}>
          {reply.slice(0, Math.floor(ease(f, 140, 210, 0, reply.length)))}
        </div>
      </div>
    </>
  );
};

export const TokenRain = () => {
  const f = useCurrentFrame();
  const tokens = ["N50", "ATGC", "QUAST", "contig", "BUSCO", ">S01", "182340", "ACGT", "quality", "完整度"];
  return (
    <>
      <DnaHelix style={{ left: 170, top: 55, opacity: 0.42, filter: "blur(6px)", transform: `rotate(-14deg) scale(${1 + f / 5000})` }} />
      {Array.from({ length: 45 }, (_, i) => {
        const depth = seeded(i, 3);
        const y = ((seeded(i, 7) * 1080 + f * (0.35 + depth * 0.8)) % 1220) - 100;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 120 + seeded(i, 5) * 1680,
              top: y,
              fontFamily: FONT.mono,
              fontSize: 14 + depth * 10,
              color: COLORS.blueLight,
              opacity: (0.06 + depth * 0.12) * (1 - ease(f, 80, 215) * 0.7),
              filter: depth < 0.3 ? "blur(2px)" : undefined,
            }}
          >
            {tokens[i % tokens.length]}
          </div>
        );
      })}
      <ChapterLabel index="01" label="CHATBOT" color={COLORS.blue} subtitle="WORDS BECOME A PLAN" />
      <Quote style={{ position: "absolute", left: 116, top: 205, width: 730 }}>
        请评估这批细菌基因组的组装质量，
        <br />
        找出异常样本并生成报告。
      </Quote>
      <div style={{ position: "absolute", left: 150, top: 438 }}>
        {[
          { text: "N50", size: 94, delay: 22 },
          { text: "QUAST", size: 52, delay: 45 },
          { text: "BUSCO", size: 38, delay: 62 },
        ].map(({ text, size, delay }, i) => (
          <div
            key={text}
            style={{
              marginLeft: i * 49,
              marginTop: i ? 22 : 0,
              transform: `translateY(${ease(f, delay, delay + 45, 24, 0)}px)`,
              opacity: appear(f, delay, 35),
              fontFamily: FONT.mono,
              fontSize: size,
              letterSpacing: -2,
              color: i === 0 ? COLORS.blue : COLORS.blueDeep,
              textShadow: "none",
            }}
          >
            {text}
          </div>
        ))}
      </div>
      <Terminal
        color={COLORS.blue}
        title="assembly-qc.sh / generated, not executed"
        start={93}
        step={23}
        lines={[
          { text: "# Evaluate assembly quality", color: "#5F6368" },
          { text: "quast.py samples/*.fasta \\", color: COLORS.blueLight },
          { text: "  --threads 8 -o results/quast", color: "#202124" },
          { text: "busco -i samples/S01.fasta \\", color: COLORS.blueLight },
          { text: "  -m genome -o results/busco", color: "#202124" },
        ]}
        style={{ left: 934, top: 370, width: 810, transform: `perspective(1500px) rotateY(-6deg) scale(${ease(f, 90, 300, 0.95, 1.015)})` }}
      />
      <div
        style={{ position: "absolute", left: 962, top: 738, fontFamily: FONT.mono, fontSize: 16, color: "#5F6368", letterSpacing: 2, opacity: appear(f, 220) }}
      >
        TEXT OUTPUT / NO FILE ACCESS
      </div>
    </>
  );
};

const MovingCode = () => {
  const f = useCurrentFrame();
  const strike = ease(f, 12, 85);
  const rebound = ease(f, 89, 126);
  const carry = ease(f, 168, 222);
  const x = 210 + strike * 475 - rebound * 125 + carry * 590;
  const shake = f >= 86 && f <= 91 ? Math.sin(f * 3) * 5 : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: x + shake,
        top: 432 + carry * 50,
        width: 570,
        padding: "25px 28px",
        transform: `perspective(1500px) rotateY(${-7 + carry * 7}deg)`,
        border: `1px solid ${COLORS.blue}70`,
        borderRadius: 13,
        background: "#FFFFFFee",
        boxShadow: `0 0 30px ${COLORS.blue}15, 0 25px 60px #20212414`,
        fontFamily: FONT.mono,
        color: COLORS.blueDeep,
        fontSize: 20,
      }}
    >
      <div style={{ fontSize: 13, color: "#5F6368", letterSpacing: 3, marginBottom: 18 }}>GENERATED CODE</div>
      <div>quast.py samples/*.fasta</div>
      <div style={{ marginTop: 11, color: "#5F6368" }}> -o results/quast</div>
    </div>
  );
};

export const GlassWall = () => {
  const f = useCurrentFrame();
  const hit = appear(f, 85, 4) * (1 - ease(f, 91, 145));
  const activate = appear(f, 184, 30);
  return (
    <>
      <ChapterLabel index="01" label="THE LIMIT" color={COLORS.blue} />
      <RevealText
        text="能推理出下一步 ≠ 能执行下一步"
        start={18}
        size={51}
        style={{ position: "absolute", left: 180, top: 202, fontWeight: 500, letterSpacing: -1 }}
      />
      <div
        style={{
          position: "absolute",
          left: 1140,
          top: 304,
          height: 480,
          width: 3,
          background: `linear-gradient(transparent,${COLORS.blueLight}9a,transparent)`,
          boxShadow: `0 0 ${20 + hit * 70}px ${COLORS.blue}65`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 1128,
          top: 300,
          width: 58,
          height: 490,
          transform: "perspective(850px) rotateY(73deg)",
          border: `1px solid ${COLORS.blueLight}20`,
          background: "linear-gradient(90deg,#4285F408,#4285F425,#4285F406)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 1110 - 100 * hit,
          top: 492 - 100 * hit,
          width: hit * 200,
          height: hit * 200,
          borderRadius: "50%",
          border: `2px solid ${COLORS.blueLight}`,
          transform: "scaleX(.32)",
          opacity: hit,
          filter: "blur(1px)",
        }}
      />
      {[0, 1, 2].map((i) => (
        <GenomeFile
          key={i}
          label={`S0${i + 1}.fasta`}
          color={activate ? COLORS.blueLight : "#8B9099"}
          style={{ left: 1310 + i * 115, top: 336 + i * 18, opacity: 0.65 + activate * 0.35 }}
        />
      ))}
      <Terminal
        title="shell / waiting for a human"
        start={184}
        step={18}
        color={activate ? COLORS.blue : "#8B9099"}
        lines={[{ text: "$ quast.py samples/*.fasta", color: COLORS.blueLight }, { text: "Reading assemblies..." }, { text: "QC complete.", color: "#1967D2" }]}
        style={{ left: 1280, top: 568, width: 520, opacity: 0.35 + activate * 0.65, padding: 20 }}
      />
      <Trail layers={4} lagInFrames={0.4} trailOpacity={0.13}>
        <MovingCode />
      </Trail>
      <svg
        width="720"
        height="280"
        viewBox="0 0 720 280"
        style={{
          position: "absolute",
          left: 725 + ease(f, 144, 220, 0, 320),
          top: 627,
          opacity: appear(f, 144, 24) * (1 - ease(f, 220, 240)),
          transform: `translateY(${ease(f, 144, 183, 130, 0)}px)`,
        }}
      >
        <path
          d="M 140 276 C 138 233 155 201 181 186 L 325 158 C 359 146 390 114 419 102 L 481 73 C 499 66 515 71 516 85 C 517 99 488 119 452 143 L 520 143 C 545 143 545 164 526 170 L 472 185 C 449 227 398 245 336 245 L 259 276"
          fill="#E8F0FEa0"
          stroke="#4285F4"
          strokeWidth="2.5"
        />
        <path d="M 180 186 C 224 174 230 157 274 158 L 353 166" fill="none" stroke="#4285F4" strokeWidth="2" />
      </svg>
      <div style={{ position: "absolute", left: 116, bottom: 217, fontFamily: FONT.mono, fontSize: 16, color: "#5F6368", letterSpacing: 2 }}>
        LANGUAGE <span style={{ margin: "0 40px", color: COLORS.blueLight }}>|</span> EXECUTION
      </div>
    </>
  );
};
