import type { CSSProperties, ReactNode } from "react";
import { interpolateColors, useCurrentFrame } from "remotion";
import { C, FONT, FPS, MONO } from "../data/theme";
import { chapters, type Shot } from "../data/timeline";
import { clamp, ease, enter, fade, mix } from "../lib/motion";

export function Background({ color = C.blue }: { color?: string }) {
  const t = useCurrentFrame() / FPS;
  return (
    <>
      <div className="paper-grid" style={{ transform: `translate(${Math.sin(t / 15) * 8}px,${Math.cos(t / 20) * 8}px)` }} />
      <div className="volume-light" style={{ background: `radial-gradient(ellipse at 70% 5%, ${color}0e, transparent 65%)` }} />
      <div className="foreground-orb" style={{ borderColor: `${color}16`, transform: `translate(${Math.sin(t / 8) * 25}px,${Math.cos(t / 11) * 15}px)` }} />
      <div className="film-grain" />
      <div className="vignette" />
    </>
  );
}

export function Heading({ eyebrow, title, accent = C.blue, children }: { eyebrow: string; title: ReactNode; accent?: string; children?: ReactNode }) {
  return (
    <div className="scene-heading">
      <div className="eyebrow" style={{ color: accent }}>
        {eyebrow}
      </div>
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </div>
  );
}

export function Tag({ children, color = C.blue, style }: { children: ReactNode; color?: string; style?: CSSProperties }) {
  return (
    <span className="tag" style={{ color, borderColor: `${color}35`, background: `${color}0b`, ...style }}>
      {children}
    </span>
  );
}

export function Card({
  children,
  time = 1,
  delay = 0,
  color,
  style,
  className = "",
}: {
  children: ReactNode;
  time?: number;
  delay?: number;
  color?: string;
  style?: CSSProperties;
  className?: string;
}) {
  const k = enter(time, delay);
  return (
    <div
      className={`graphic-card ${className}`}
      style={{
        opacity: clamp(k),
        transform: `translateY(${(1 - k) * 45}px) scale(${0.95 + k * 0.05})`,
        borderColor: color ? `${color}60` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Camera({ time, duration, mode = "PUSH", children }: { time: number; duration: number; mode?: string; children: ReactNode }) {
  const k = ease(time, 0, duration);
  const entry = 1 - ease(time, 0, 0.45);
  const scale = mode === "PULL" ? mix(1.055, 1, k) : mode === "ORBIT" ? 1.02 : mix(1, 1.045, k);
  const rotateY = mode === "ORBIT" ? mix(-5, 5, k) : 0;
  const rotateX = mode === "CRANE" ? mix(6, 0, k) : 0;
  const x = mode === "TRACK" ? mix(24, -24, k) : entry * 22;
  const angle = mode === "DUTCH" ? Math.sin(time * 1.7) * 0.9 : 0;
  return (
    <div className="camera-space">
      <div
        className="camera"
        style={{ transform: `translate3d(${x}px,0,0) scale(${scale}) rotateY(${rotateY}deg) rotateX(${rotateX}deg) rotateZ(${angle}deg)` }}
      >
        {children}
      </div>
    </div>
  );
}

export function Letterbox({ time, duration }: { time: number; duration: number }) {
  const k = Math.min(ease(time, 0, 0.6), 1 - ease(time, duration - 0.5, 0.5));
  return (
    <>
      <div className="letterbox top" style={{ height: 138 * k }} />
      <div className="letterbox bottom" style={{ height: 138 * k }} />
    </>
  );
}

export function ChapterCard({ shot, time }: { shot: Shot; time: number }) {
  const chapter = chapters[shot.act];
  const color = shot.act < 3 ? C.blue : shot.act < 5 || shot.act > 7 ? C.red : C.green;
  const out = ease(time, shot.end - shot.start - 0.32, 0.3);
  const label = [
    "一个问题",
    "先用搭积木打个比方",
    "Workflow：预先画好的线",
    "Agent：把画线的笔交出去",
    "回头看：那些误判信号",
    "自主，但有边界",
    "什么时候用哪个",
    "一个真实的组合",
    "产品里，它们怎么组合",
    "拆开看真实的 Agent 系统",
    "结论",
  ][chapter.index];
  const number = String(shot.act < 5 ? shot.act : shot.act - 1).padStart(2, "0");
  return (
    <div className="chapter-card" style={{ transform: `translateX(${-out * 2200}px)`, filter: `blur(${out * 18}px)` }}>
      <div className="chapter-ghost" style={{ color }}>
        {number}
      </div>
      <div className="chapter-sweep">
        {[C.blue, C.red, C.yellow, C.green].map((c, i) => (
          <i
            key={c}
            style={{ background: c, transform: `translateX(${mix(-620 - i * 70, 0, ease(time, i * 0.1, 0.65))}px) scale(${enter(time, 0.25 + i * 0.1)})` }}
          />
        ))}
      </div>
      <div className="eyebrow" style={{ color }}>
        CHAPTER {number} / AGENT ARCHITECTURE
      </div>
      <h1 style={{ opacity: ease(time, 0.22, 0.45), transform: `translateY(${(1 - ease(time, 0.22, 0.45)) * 18}px)` }}>{label}</h1>
      {shot.act === 8 && (
        <div className="chapter-options">
          <Tag color={C.blue}>A · 流程中的 Agent</Tag>
          <Tag color={C.red}>B · Agent 的流程工具</Tag>
          <Tag color={C.green}>C · 托管运行时</Tag>
        </div>
      )}
    </div>
  );
}

export function RichText({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(\*\*.+?\*\*|Workflow|Agent)/g)
        .filter(Boolean)
        .map((part, i) => {
          const clean = part.replaceAll("**", "");
          const color = clean.includes("Workflow") ? C.blue : clean.includes("Agent") || part.startsWith("**") ? C.red : undefined;
          return (
            <span key={i} style={{ color, fontWeight: color ? 650 : undefined }}>
              {clean}
            </span>
          );
        })}
    </>
  );
}

export function Subtitles({ shot, seconds }: { shot: Shot; seconds: number }) {
  const cue = shot.subtitles.find((s) => seconds >= s.start && seconds < s.end);
  if (!cue) return null;
  const k = fade(seconds, cue.start, cue.end, 0.18);
  return (
    <div className="subtitle-wrap" data-caption={cue.text.replaceAll("**", "")} style={{ opacity: k, transform: `translateY(${(1 - k) * 8}px)` }}>
      <div className="subtitle">
        <RichText text={cue.text} />
      </div>
    </div>
  );
}

export const sourceFor = (shot: Shot) => {
  if (shot.id === "S0-4") return "Anthropic · Building effective agents / OpenAI · A practical guide to building agents";
  if (shot.act === 2 || ["S1-2", "S1-3", "S3-2", "S3-3", "S3-4", "S6-4"].includes(shot.id)) return "图示改绘自 Anthropic · Building effective agents";
  if (shot.id === "S8-2") return "Dify Docs · Agent node";
  if (shot.id === "S8-3") return "n8n Docs · AI Agent node";
  if (shot.id === "S8-4") return "n8n Docs / Coze Docs · Workflow as a tool";
  if (["S3-5", "S5-2", "S5-3", "S6-2"].includes(shot.id)) return "OpenAI · A practical guide to building agents";
  if (["S9-2", "S9-3"].includes(shot.id)) return "Anthropic · How we built our multi-agent research system";
  if (shot.id === "S9-4") return "OpenAI · ChatGPT agent / Deep research System Card";
  if (shot.id === "S9-5") return "Anthropic · Effective harnesses for long-running agents";
  if (shot.id === "S9-6") return "Anthropic · Harness design for long-running application development";
  if (shot.id === "S9-7") return "Anthropic · Scaling Managed Agents";
  return "";
};

export function Pen({ time, handing = false }: { time: number; handing?: boolean }) {
  const progress = ease(time, 1.5, 3);
  const color = handing ? interpolateColors(progress, [0, 1], [C.blue, C.red]) : C.blue;
  return (
    <svg width={440} height={260} viewBox="0 0 440 260" style={{ overflow: "visible" }}>
      <g transform={`translate(${handing ? mix(-140, 110, progress) : 0} ${Math.sin(time) * 6}) rotate(-30 220 130)`}>
        <rect x={70} y={108} width={270} height={43} rx={12} fill="white" stroke={color} strokeWidth={3} />
        <rect x={88} y={116} width={208} height={27} rx={4} fill={color} fillOpacity={0.13} />
        <path d="M340 108 L390 130 L340 151Z" fill={color} />
        <path d="M65 112 H20 V148 H65" fill="none" stroke={color} strokeWidth={3} />
        <path d="M115 108 V88 H280" fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" />
      </g>
    </svg>
  );
}

export const monoStyle: CSSProperties = { fontFamily: MONO, fontSize: 25 };
export const bodyStyle: CSSProperties = { fontFamily: FONT, fontSize: 32, color: C.ink };
