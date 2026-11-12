import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { ASSETS, COLORS } from "../data/story";
import { LightCore, LightFilaments } from "../components/LightCore";
import { GlassPanel } from "../components/GlassPanel";
import { ChapterLabel, Credit, AccentText, RevealText } from "../components/Typography";
import { World3D } from "../components/World3D";
import { FONT } from "../lib/fonts";
import { appear, ease, seeded } from "../lib/motion";

export const Awakening = () => {
  const f = useCurrentFrame();
  const expand = ease(f, 22, 61);
  const collapse = 1 - ease(f, 72, 86);
  return (
    <AbsoluteFill style={{ background: "#FCFCFD" }}>
      <div
        style={{ position: "absolute", left: 960 - 440, top: 540 - 440, opacity: expand * collapse, transform: `scale(${(0.55 + expand * 0.45) * collapse})` }}
      >
        <LightFilaments size={880} progress={expand} id="awake-filaments" />
      </div>
      <div
        style={{
          position: "absolute",
          left: 960 - 150,
          top: 540 - 150,
          transform: `scale(${(0.015 + expand * 0.985) * collapse})`,
          opacity: f < 5 ? 0 : collapse,
        }}
      >
        <LightCore size={300} id="awake-core" />
      </div>
      <div
        style={{
          position: "absolute",
          left: 958,
          top: 538,
          width: 4,
          height: 4,
          borderRadius: 8,
          background: "#4285F4",
          opacity: (0.5 + 0.5 * Math.sin(f * 0.35)) * (1 - ease(f, 25, 43)),
          boxShadow: "0 0 0 6px #E8F0FE",
        }}
      />
    </AbsoluteFill>
  );
};

export const Announcement = () => {
  const f = useCurrentFrame();
  const zoom = ease(f, 20, 145, 1, 1.06);
  const focus = ease(f, 60, 112);
  return (
    <>
      <ChapterLabel index="PROLOGUE" label="A SIGNAL OF CHANGE" color={COLORS.blueLight} />
      <div style={{ position: "absolute", left: 116, top: 173, opacity: appear(f, 14), fontFamily: FONT.chinese }}>
        <div style={{ fontSize: 23, color: "#5F6368", letterSpacing: 8 }}>一个时代的信号</div>
        <div style={{ fontFamily: FONT.sans, fontSize: 64, fontWeight: 600, letterSpacing: -2, color: "#202124", marginTop: 17 }}>2026.11.30</div>
      </div>
      <GlassPanel
        width={1270}
        color={COLORS.blueLight}
        rotateY={-12 + ease(f, 0, 150) * 4}
        style={{
          left: 410,
          top: 328,
          transform: `perspective(1800px) rotateY(${-12 + ease(f, 0, 150) * 4}deg) rotateX(4deg) scale(${zoom})`,
          opacity: appear(f, 6, 30),
        }}
      >
        <div style={{ position: "relative", overflow: "hidden", borderRadius: 8 }}>
          <Img
            src={staticFile(ASSETS.announcement.file)}
            style={{ width: "100%", display: "block", filter: `blur(${focus * 3}px)`, opacity: 1 - focus * 0.2 }}
          />
          <Img
            src={staticFile(ASSETS.announcement.file)}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", clipPath: "inset(79% 0 5% 0)" }}
          />
          <div
            style={{
              position: "absolute",
              left: "43%",
              top: "80%",
              right: "3%",
              height: "8%",
              borderBottom: "2px solid #4285F4",
              background: "#4285F425",
              opacity: focus,
            }}
          />
        </div>
      </GlassPanel>
      <div style={{ position: "absolute", right: 216, top: 805, fontFamily: FONT.chinese, fontSize: 25, color: "#5F6368", opacity: appear(f, 83, 25) }}>
        企业版 · 暂停新售
      </div>
    </>
  );
};

export const AnonymousPost = () => {
  const f = useCurrentFrame();
  const peel = ease(f, 65, 160);
  return (
    <>
      <ChapterLabel index="PROLOGUE" label="THE QUESTION" color={COLORS.green} />
      <GlassPanel
        image={ASSETS.post.file}
        color={COLORS.green}
        width={890}
        rotateY={8}
        style={{
          left: 510 + peel * 420,
          top: 200 - peel * 45,
          opacity: 1 - peel * 0.77,
          filter: `blur(${peel * 7}px)`,
          transform: `perspective(1800px) rotateY(8deg) scale(${1 - peel * 0.23})`,
        }}
      />
      <div
        style={{ position: "absolute", left: 210, top: 325, transform: `translateZ(0) scale(${ease(f, 90, 285, 1, 1.035)})`, transformOrigin: "left center" }}
      >
        <RevealText text="workflow 不是被 AI 淘汰的" start={69} size={49} color="#202124" style={{ fontWeight: 400, letterSpacing: -1 }} />
        <div style={{ display: "flex", alignItems: "baseline", gap: 28, marginTop: 38 }}>
          <RevealText text="是被" start={126} size={44} color="#5F6368" />
          <RevealText text="模型自己会规划" start={143} size={93} accent style={{ fontWeight: 700 }} />
        </div>
        <RevealText text="淘汰的。" start={174} size={49} color="#202124" style={{ marginTop: 17, fontWeight: 400 }} />
        <div
          style={{
            height: 2,
            width: ease(f, 145, 223, 0, 780),
            marginTop: 30,
            background: "linear-gradient(90deg,#4285F4,#34A853,#EA4335,transparent)",
            filter: "none",
          }}
        />
      </div>
    </>
  );
};

export const TitleSequence = () => {
  const f = useCurrentFrame();
  const p = appear(f, 22, 65);
  const track = ease(f, 0, 270, -25, 25);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${track}px) scale(${ease(f, 0, 270, 1, 1.045)})` }}>
        <div
          style={{
            position: "absolute",
            left: 228,
            right: 228,
            top: 710,
            height: 1,
            background: "linear-gradient(90deg,#4285F4 0% 25%,#EA4335 25% 50%,#FBBC04 50% 75%,#34A853 75% 100%)",
            boxShadow: "none",
          }}
        />
        {Array.from({ length: 48 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 240 + seeded(i, 3) * 1420,
              top: 701 + (seeded(i, 4) - 0.5) * 22,
              width: seeded(i, 5) * 3 + 1,
              height: seeded(i, 5) * 3 + 1,
              borderRadius: "50%",
              background: [COLORS.blue, COLORS.red, COLORS.yellow, COLORS.green][i % 4],
              opacity: appear(f, i * 0.3, 30) * 0.7,
              boxShadow: "none",
            }}
          />
        ))}
        <div style={{ position: "absolute", left: 230, top: 749, fontFamily: FONT.sans, fontSize: 40, color: COLORS.blue, opacity: appear(f, 10) }}>2023</div>
        <div style={{ position: "absolute", right: 227, top: 749, fontFamily: FONT.sans, fontSize: 40, opacity: appear(f, 35) }}>
          <AccentText>{Math.floor(ease(f, 10, 80, 2023, 2026))}</AccentText>
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 280,
            textAlign: "center",
            fontFamily: FONT.sans,
            opacity: p,
            letterSpacing: ease(f, 20, 95, 25, -5),
            transform: `translateY(${(1 - p) * 25}px)`,
          }}
        >
          <div
            style={{ fontFamily: FONT.chinese, fontSize: 27, fontWeight: 400, color: "#5F6368", letterSpacing: 5, marginBottom: 31 }}
            data-testid="opening-topic"
          >
            2023—2026，AI 应用技术的变化
          </div>
          <div style={{ fontSize: 126, fontWeight: 650, color: "#202124", whiteSpace: "nowrap" }}>
            <span style={{ fontSize: 53, fontWeight: 400, marginRight: 24, letterSpacing: 0 }}>从</span>ChatGPT
            <span style={{ fontSize: 53, fontWeight: 400, margin: "0 24px", letterSpacing: 0 }}>到</span>
            <AccentText>Agent</AccentText>
          </div>
          <div style={{ fontFamily: FONT.chinese, fontSize: 24, color: "#5F6368", letterSpacing: 3, marginTop: 45, opacity: appear(f, 80, 30) }}>
            对话 → 工具调用 → 工作流 → Agent
          </div>
        </div>
      </div>
      <div
        style={{ position: "absolute", left: 116, top: 112, fontFamily: FONT.mono, fontSize: 15, letterSpacing: 4, color: "#5F6368", opacity: appear(f, 10) }}
      >
        AI APPLICATIONS / 2023 — 2026
      </div>
    </>
  );
};

export const CapabilityLayers = ({ duration }: { duration: number }) => {
  const f = useCurrentFrame();
  return (
    <>
      <World3D mode="layers" duration={duration} />
      <ChapterLabel index="THE MAP" label="LAYERS OF CAPABILITY" color={COLORS.green} />
      <div style={{ position: "absolute", left: 116, bottom: 229, opacity: appear(f, 190, 35) }}>
        <RevealText text="叠加，不是替代" start={192} size={53} accent />
      </div>
      <Credit style={{ left: "auto", right: 156 }}>年份为产品演化分段</Credit>
    </>
  );
};
