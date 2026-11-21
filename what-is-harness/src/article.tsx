import { Img } from "remotion";
import { C, tween, useAccent, useBeat } from "./design";
import loop from "../Harness的定义/Images_attachments/02-agent-loop.png";
import longRun from "../Harness的定义/Images_attachments/05-long-running-harness.png";
import events from "../Harness的定义/Images_attachments/image 1.png";
import definition from "../Harness的定义/Images_attachments/image 2.png";
import longRunSource from "../Harness的定义/Images_attachments/image 3.png";
import evaluation from "../Harness的定义/Images_attachments/image 4.png";
import context from "../Harness的定义/Images_attachments/image 5.png";
import codex from "../Harness的定义/Images_attachments/image 6.png";
import managed from "../Harness的定义/Images_attachments/image 7.png";
import sandbox from "../Harness的定义/Images_attachments/image.png";

const figures = {
  loop: { src: loop, width: 1440, height: 781, alt: "文章图 4 · Agent 执行循环" },
  longRun: { src: longRun, width: 1440, height: 865, alt: "文章图 6 · 初始化、增量开发与验收" },
  events: { src: events, width: 1734, height: 685, alt: "文章图 9 · Session 与 Harness 之间的 getEvents" },
  definition: { src: definition, width: 1865, height: 813, alt: "文章图 1 · LangChain 的 Harness 定义" },
  longRunSource: { src: longRunSource, width: 1773, height: 602, alt: "文章图 5 · Anthropic 的长任务研究" },
  evaluation: { src: evaluation, width: 1781, height: 610, alt: "文章图 7 · Anthropic 的应用开发研究" },
  context: { src: context, width: 1795, height: 503, alt: "文章图 3 · OpenAI 关于 AGENTS.md 的原文" },
  codex: { src: codex, width: 1816, height: 912, alt: "文章图 8 · OpenAI 的 Harness engineering 原文" },
  managed: { src: managed, width: 1819, height: 944, alt: "文章图 2 · Session、Harness 与 Sandbox 的关系" },
  sandbox: { src: sandbox, width: 1735, height: 562, alt: "文章图 10 · Harness 与 Sandbox 独立部署" },
};

type Region = readonly [left: number, top: number, width: number, height: number];
type Focus = { region: Region; at: number; until?: number; color?: string };

export function ArticleImage({ name, region, moveTo, focus = [], x = 0, y = 0, w = 1680, h = 590 }: {
  name: keyof typeof figures; region?: Region; x?: number; y?: number; w?: number; h?: number;
  moveTo?: { region: Region; at: number };
  focus?: Focus[];
}) {
  const { time } = useBeat();
  const accent = useAccent();
  const figure = figures[name];
  const initial = region ?? [0, 0, figure.width, figure.height];
  const progress = moveTo ? tween(time, moveTo.at, 1.05) : 0;
  const [left, top, width, height] = initial.map((start, i) =>
    moveTo ? start + (moveTo.region[i] - start) * progress : start,
  );
  const scale = Math.min(w / width, h / height);
  return (
    <div className="paper-surface" style={{
      position: "absolute",
      left: x + (w - width * scale) / 2 - 10,
      top: y + (h - height * scale) / 2 - 10,
      width: width * scale + 20,
      height: height * scale + 20,
      borderRadius: 18,
      padding: 9,
    }}>
      <div className="screenshot-window" style={{ width: width * scale, height: height * scale, borderRadius: 10 }}>
        <Img src={figure.src} alt={figure.alt} style={{
          left: -left * scale, top: -top * scale, width: figure.width * scale, height: figure.height * scale,
        }} />
        {focus.map(({ region: [fx, fy, fw, fh], at, until, color = accent }) => {
          const show = tween(time, at, 0.38) * (until === undefined ? 1 : 1 - tween(time, until, 0.28));
          return <div key={at} aria-hidden="true" style={{
            position: "absolute", left: (fx - left) * scale, top: (fy - top) * scale,
            width: fw * scale, height: fh * scale, borderRadius: 12, opacity: show,
            border: `2px solid ${color}`, boxShadow: `0 0 0 3px ${color}20`,
            pointerEvents: "none",
          }} />;
        })}
      </div>
      <span className="mono" style={{ position: "absolute", bottom: -31, left: 0, fontSize: 13,
        letterSpacing: 1, color: C.muted, display: "flex", alignItems: "center", gap: 9 }}>
        <i aria-hidden="true" style={{ width: 16, height: 2, borderRadius: 1, backgroundColor: accent }} />
        {figure.alt}
      </span>
    </div>
  );
}

type Note = { title: string; detail?: string; when?: number; color?: string };

export function ArticleNotes({ items, x, y, w, horizontal = false }: {
  items: Note[]; x: number; y: number; w: number; horizontal?: boolean;
}) {
  const { time } = useBeat();
  const accent = useAccent();
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, display: "flex",
      flexDirection: horizontal ? "row" : "column", gap: horizontal ? 24 : 16 }}>
      {items.map(({ title, detail, when = 0, color = accent }) => {
        const progress = tween(time, when);
        return (
          <div key={title} className="paper-surface" style={{
            flex: horizontal ? 1 : undefined, borderLeft: `3px solid ${color}`,
            borderRadius: 14, background: `linear-gradient(110deg, ${color}0a, #fff 72%)`,
            padding: "14px 19px 16px", opacity: progress, transform: `translateY(${(1 - progress) * 14}px)`,
          }}>
            <div style={{ fontSize: 32, fontWeight: 650, lineHeight: 1.26 }}>{title}</div>
            {detail && <div className="cjk" style={{ marginTop: 7, fontSize: 24, lineHeight: 1.36, color: C.body }}>{detail}</div>}
          </div>
        );
      })}
    </div>
  );
}
