import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ASSETS, CHAPTERS, COLORS, getShot, type SceneId } from "../data/story";
import "./film-branding.css";

const chapterTitles = [
  "序章：从 ChatGPT 到 Agent",
  "能力：一层层叠加",
  "Chatbot：你问我答",
  "Tool Use：模型调用工具",
  "Workflow：预先搭好的流程",
  "Agent：自己决定下一步",
  "控制权：下一步由谁决定",
];

const sources: Partial<Record<SceneId, string>> = {
  S02: ASSETS.announcement.source,
  S03: "来源：X 网友帖子 · 作者自称扣子内部工程师，身份未经核实",
  S06: ASSETS.chatgpt.source,
  S13: "图源：n8n Community · Dify 官方文档 · 扣子官方文档",
  S15: ASSETS.research.source,
};

export const FilmBranding = () => {
  const frame = useCurrentFrame();
  const shot = getShot(frame);
  const chapter = CHAPTERS.find((item) => frame >= item.start && frame < item.end) ?? CHAPTERS[CHAPTERS.length - 1];
  const chapterIndex = CHAPTERS.indexOf(chapter);
  const source = sources[shot.id];

  return (
    <AbsoluteFill className="film-branding" data-film-shot={shot.id}>
      <div className="film-masthead">
        <div className="film-brand">
          <span className="brand-rule" aria-hidden="true">
            {[COLORS.blue, COLORS.red, COLORS.yellow, COLORS.green].map((color) => (
              <i key={color} style={{ background: color }} />
            ))}
          </span>
          <span>
            <b>PLDZ</b> / AGENT ARCHITECTURE
          </span>
          <a className="film-website" href="https://hipldz.com" target="_blank" rel="noreferrer">
            hipldz.com
          </a>
        </div>
        <span className="film-chapter">{chapterTitles[chapterIndex]}</span>
      </div>
      <div className="film-folio">
        {String(chapterIndex).padStart(2, "0")} <span style={{ margin: "0 12px" }}>—</span> CHATGPT TO AGENT
      </div>
      {source && <div className="film-source">{source}</div>}
    </AbsoluteFill>
  );
};
