import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame } from "remotion";
import { C as palette, FONT, MONO } from "../../what-is-agent/src/theme";
import { FPS, shots, TOTAL_FRAMES, type Shot } from "./timeline";

export const C = {
  ...palette,
  white: palette.paper,
  blueInk: palette.blueDeep,
  greenInk: palette.greenDeep,
  yellowInk: palette.yellowDeep,
  redInk: palette.redDeep,
};
export const CONTENT_WIDTH = 1680;

const ShotContext = createContext<Shot | null>(null);
const AccentContext = createContext<string>(C.blue);
const brand = [C.blue, C.green, C.yellow, C.red];
const sections = [
  ["实验", C.blue], ["定义", C.blue], ["上下文", C.blue], ["工具", C.green],
  ["权限", C.yellow], ["执行循环", C.blue], ["运行时", C.blue], ["长任务", C.green],
  ["验收", C.green], ["架构约束", C.yellow], ["托管架构", C.blue], ["收束", C.blue],
] as const;

const cueAt = (shot: Shot, fragment: string, fallback: number) => {
  const cue = shot.cues.find((item) => item.text.includes(fragment));
  return cue ? cue.start / FPS : fallback;
};

export function useBeat() {
  const frame = useCurrentFrame();
  const shot = useContext(ShotContext);
  if (!shot) throw new Error("Scene must be inside a Stage");
  const at = (fragment: string, fallback: number) => cueAt(shot, fragment, fallback);
  return { time: frame / FPS, at };
}

export const useAccent = () => useContext(AccentContext);

export function tween(time: number, at: number, duration = 0.55) {
  return interpolate(time, [at, at + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
}

const timecode = (frame: number) => {
  const seconds = Math.floor(frame / FPS);
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
};

function Backdrop({ accent }: { accent: string }) {
  return (
    <div className="film-bg" aria-hidden="true">
      <div className="bg-wash-a" style={{
        background: `radial-gradient(1100px 720px at 84% -8%, ${accent}14, ${accent}06 39%, transparent 72%)`,
      }} />
      <div className="bg-wash-b" style={{
        background: `radial-gradient(880px 540px at 2% 108%, ${accent}0e, transparent 68%)`,
      }} />
      <div className="dot-grid" />
      <div className="bg-ring" style={{ borderColor: `${accent}28` }} />
      <div className="bg-hairline" />
      <div className="grain" />
      <div className="top-color-rule">
        {brand.map((color) => <i key={color} style={{ backgroundColor: color }} />)}
      </div>
    </div>
  );
}

const keyTerms = /^(Agent|Harness|LangChain|Anthropic|OpenAI|Codex|MCP|Session|Sandbox|getEvents)$/;

export function Stage({ shot, title, source, subtitles, children }: {
  shot: Shot; title?: string; source?: string; subtitles: boolean; children: ReactNode;
}) {
  const frame = useCurrentFrame();
  const time = frame / FPS;
  const current = shot.cues.find((cue) => frame >= cue.start && frame < cue.end);
  const [chapter, accent] = sections[Number(shot.id.slice(1)) - 1];
  const index = shot.id.slice(1);
  const count = String(shots.length).padStart(2, "0");
  const enter = shot.id === "S01" ? tween(time, 2, 0.5) : tween(time, 0, 0.36);
  const leave = shot.id === "S12" ? tween(time, cueAt(shot, "好，这期就聊到这儿", 19.7), 0.42) : 0;
  const headerOpacity = enter * (1 - leave);
  const captionOpacity = current
    ? Math.min(1, (frame - current.start + 1) / 4, (current.end - frame) / 4)
    : 0;
  return (
    <ShotContext.Provider value={shot}>
      <AccentContext.Provider value={accent}>
        <AbsoluteFill className="film" data-shot={shot.id}>
          <Backdrop accent={accent} />
          <div className="film-masthead">
            <div className="masthead-brand">
              <span className="bars" aria-hidden="true">
                {brand.map((color, i) => <i key={color} style={{ height: [9, 15, 12, 16][i], backgroundColor: color }} />)}
              </span>
              <b>PLDZ</b>
              <span className="muted">/ AGENT HARNESS</span>
              <span>HIPLDZ.COM</span>
            </div>
            <div className="masthead-meta">
              <span className="chapter">{index} / {count} · {chapter}</span>
              <span className="dot" />
              <span className="time">{timecode(shot.from + frame)} / {timecode(TOTAL_FRAMES)}</span>
            </div>
          </div>
          <div className="scene-header" style={{ opacity: headerOpacity, left: 120,
            transform: `translateY(${(1 - enter) * 9}px)` }}>
            <div className="scene-eyebrow">
              <span className="tick" style={{ backgroundColor: accent }} />
              <span className="index">{index}</span><span>/</span><span className="label">{chapter}</span>
            </div>
            <h1 className="scene-title" style={{ marginBottom: 0 }}>{title ?? shot.title}</h1>
          </div>
          {source && <div className="source-badge" style={{ opacity: headerOpacity }}>
            <span className="source-dot" style={{ backgroundColor: accent }} />
            <span className="source-label">来源</span><span>{source}</span>
          </div>}
          <div style={{ position: "absolute", top: 240, left: 120, width: CONTENT_WIDTH, height: 620 }}>
            {children}
          </div>
          {subtitles && current && (
            <div className="film-caption-wrap" data-caption style={{ opacity: captionOpacity }}>
              <div className="film-caption" style={{ whiteSpace: "normal" }}>
                {current.text.split(/\b(Agent|Harness|LangChain|Anthropic|OpenAI|Codex|MCP|Session|Sandbox|getEvents)\b/).map((part, i) =>
                  keyTerms.test(part) ? <b key={i}>{part}</b> : <span key={i}>{part}</span>,
                )}
              </div>
            </div>
          )}
        </AbsoluteFill>
      </AccentContext.Provider>
    </ShotContext.Provider>
  );
}

export function Reveal({ when = 0, until, children, style }: {
  when?: number; until?: number; children: ReactNode; style?: CSSProperties;
}) {
  const time = useCurrentFrame() / FPS;
  if (time < when || (until !== undefined && time >= until + 0.32)) return null;
  const enter = Math.min(1, spring({
    frame: (time - when) * FPS, fps: FPS, durationInFrames: 21,
    config: { damping: 24, stiffness: 105 },
  }));
  const leave = until === undefined ? 0 : tween(time, until, 0.32);
  return <div style={{ position: "absolute", inset: 0, ...style, opacity: enter * (1 - leave),
    transform: `translateY(${17 * (1 - enter) - leave * 8}px)` }}>{children}</div>;
}

export function SeriesTitle({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "grid", placeContent: "center",
      textAlign: "center", transform: "translateY(-43px)" }}>
      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 134, lineHeight: 1.12,
        letterSpacing: -5.2 }}>{children}</div>
      {subtitle && <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
        marginTop: 22, gap: 17, fontSize: 27, color: C.body }}>
        <span style={{ width: 36, height: 1, backgroundColor: C.line }} />
        {subtitle}
        <span style={{ width: 36, height: 1, backgroundColor: C.line }} />
      </div>}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 43 }} aria-hidden="true">
        {brand.map((color) => <i key={color} style={{ display: "block", width: 20, height: 4,
          borderRadius: 3, backgroundColor: color }} />)}
      </div>
    </div>
  );
}

export function Label({ children, x, y, color = C.muted, size = 27 }: {
  children: ReactNode; x: number; y: number; color?: string; size?: number;
}) {
  return <div style={{ position: "absolute", left: x, top: y, color, fontSize: size, fontWeight: 600 }}>
    {children}
  </div>;
}

export function TopicTabs({ active }: { active: string }) {
  const accent = useAccent();
  return <div style={{ display: "flex", gap: 14, position: "absolute", left: 0, top: 0 }}>
    {["上下文", "工具", "权限"].map((topic) => (
      <span key={topic} style={{ borderRadius: 9, padding: "7px 17px", fontSize: 22,
        fontWeight: topic === active ? 650 : 450, fontFamily: MONO,
        backgroundColor: topic === active ? `${accent}13` : C.white, color: C.body,
        border: `1px solid ${topic === active ? `${accent}52` : C.line}` }}>{topic}</span>
    ))}
  </div>;
}
