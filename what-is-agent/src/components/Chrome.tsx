import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { captionAt, SCENES, timecode, TOTAL_FRAMES, type Scene } from "../timeline";
import { easeOut, fadeWindow, springIn } from "../lib/motion";

export const Backdrop = ({ accent }: { accent: string }) => (
  <div className="film-bg">
    <div
      className="bg-wash-a"
      style={{
        background: `radial-gradient(1100px 720px at 84% -8%, ${accent}14 0%, ${accent}06 39%, transparent 72%)`,
      }}
    />
    <div
      className="bg-wash-b"
      style={{
        background: `radial-gradient(880px 540px at 2% 108%, ${accent}09 0%, transparent 68%)`,
      }}
    />
    <div className="dot-grid" />
    <div className="bg-ring" style={{ borderColor: `${accent}1f` }} />
    <div className="bg-hairline" />
    <div className="grain" />
    <div className="top-color-rule">
      <i style={{ background: C.blue }} />
      <i style={{ background: C.green }} />
      <i style={{ background: C.yellow }} />
      <i style={{ background: C.red }} />
    </div>
  </div>
);

export const Masthead = ({ scene, frame }: { scene: Scene; frame: number }) => {
  const intro = scene.id !== "S01" ? 1 : easeOut(frame, 12, 20);
  return (
    <div className="film-masthead" style={{ opacity: 0.35 + intro * 0.65 }}>
      <div className="masthead-brand">
        <span className="bars">
          <i style={{ height: 9, background: C.blue }} />
          <i style={{ height: 15, background: C.green }} />
          <i style={{ height: 12, background: C.yellow }} />
          <i style={{ height: 16, background: C.red }} />
        </span>
        <b>PLDZ</b>
        <span className="muted">/ AGENT, DEFINED</span>
      </div>
      <div className="masthead-meta">
        <span className="chapter">
          {String(scene.index).padStart(2, "0")} / {String(SCENES.length).padStart(2, "0")} · {scene.label}
        </span>
        <span className="dot" />
        <span className="time">
          {timecode(frame)} / {timecode(TOTAL_FRAMES)}
        </span>
      </div>
    </div>
  );
};

export const SourceBadge = ({
  text,
  color = C.blue,
  label = "SOURCE",
  style,
}: {
  text: string;
  color?: string;
  label?: string;
  style?: CSSProperties;
}) => (
  <div className="source-badge" style={style}>
    <span className="source-dot" style={{ background: color }} />
    <span className="source-label">{label}</span>
    <span>{text}</span>
  </div>
);

export const SceneHeader = ({
  scene,
  title,
  subtitle,
  source,
  sourceColor = scene.accent,
  sourceLabel = "SOURCE",
  width = 1260,
}: {
  scene: Scene;
  title?: ReactNode;
  subtitle?: ReactNode;
  source?: string;
  sourceColor?: string;
  sourceLabel?: string;
  width?: number;
}) => {
  const frame = useCurrentFrame();
  const entry = springIn(frame, 0, { damping: 22, stiffness: 100 });
  return (
    <>
      <div
        className="scene-header"
        style={{
          width,
          opacity: 0.62 + entry * 0.38,
          transform: `translateY(${(1 - entry) * 10}px)`,
        }}
      >
        <div className="scene-eyebrow">
          <span className="tick" style={{ background: scene.accent }} />
          <span className="index">{String(scene.index).padStart(2, "0")}</span>
          <span style={{ color: "#C2C8CF" }}>/</span>
          <span>{String(SCENES.length).padStart(2, "0")}</span>
          <span style={{ color: "#C2C8CF" }}>/</span>
          <span className="label">{scene.label}</span>
        </div>
        <div className="scene-title">{title ?? scene.title}</div>
        {subtitle ? <div className="scene-subtitle">{subtitle}</div> : null}
      </div>
      {source ? <SourceBadge text={source} color={sourceColor} label={sourceLabel} /> : null}
    </>
  );
};

export const SceneGate = ({
  children,
  duration,
}: {
  children: ReactNode;
  duration: number;
}) => {
  const frame = useCurrentFrame();
  const entry = springIn(frame, 0, { damping: 26, stiffness: 95 });
  const exit = frame > duration - 9 ? 1 - easeOut(frame, duration - 9, 9) : 0;
  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT,
        opacity: 0.64 + entry * 0.36 - exit * 0.22,
        transform: `translateY(${(1 - entry) * 11}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const captionTokens = (text: string) =>
  text.split(/(Agent|Workflow|Anthropic|OpenAI)/g).filter(Boolean);

export const Captions = ({ frame }: { frame: number }) => {
  const cue = captionAt(frame);
  if (!cue) return null;
  const visible = fadeWindow(frame, cue.from, cue.to, 6);
  const rise = easeOut(frame, cue.from, 10);
  return (
    <div
      className="film-caption-wrap"
      style={{
        opacity: visible,
        transform: `translateY(${(1 - rise) * 8}px)`,
      }}
    >
      <div className="film-caption">
        {captionTokens(cue.text).map((part, i) =>
          ["Agent", "Workflow", "Anthropic", "OpenAI"].includes(part) ? (
            <b key={`${part}-${i}`}>{part}</b>
          ) : (
            <span key={`text-${i}`}>{part}</span>
          ),
        )}
      </div>
    </div>
  );
};
