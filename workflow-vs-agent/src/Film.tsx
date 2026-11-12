import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import type { VoiceTrack } from "remotion-voiceover/core";
import { Voiceover, useVoiceTracks } from "remotion-voiceover/react";
import {
  Background,
  Camera,
  ChapterCard,
  sourceFor,
  Subtitles,
} from "./components/Stage";
import { Soundtrack } from "./components/Soundtrack";
import {
  AgentConcept,
  Foundation,
  Misconceptions,
  Opening,
} from "./scenes/Concepts";
import { Boundaries, Choosing, QualityControl } from "./scenes/Engineering";
import { Ending } from "./scenes/Ending";
import { Products } from "./scenes/Products";
import { Systems } from "./scenes/Systems";
import { WorkflowAct } from "./scenes/Workflow";
import { C, FPS } from "./data/theme";
import { actColor, chapters, shotAt, shots, type Shot } from "./data/timeline";
import { voiceoverProject } from "./voiceover.config";
import "./fonts";
import "./film.css";

export type FilmProps = {
  showSubtitles?: boolean;
  audio?: boolean;
  voiceTracks?: VoiceTrack[];
};
export const defaultProps = {
  showSubtitles: true,
  audio: true,
} satisfies FilmProps;

function ShotScene({ shot }: { shot: Shot }) {
  const time = useCurrentFrame() / FPS;
  if (shot.title.startsWith("章节卡"))
    return <ChapterCard shot={shot} time={time} />;
  let scene;
  switch (shot.act) {
    case 0:
      scene = <Opening shot={shot} time={time} />;
      break;
    case 1:
      scene = <Foundation shot={shot} time={time} />;
      break;
    case 3:
      scene = <AgentConcept shot={shot} time={time} />;
      break;
    case 4:
      scene = <Misconceptions time={time} />;
      break;
    case 5:
      scene = <Boundaries shot={shot} time={time} />;
      break;
    case 6:
      scene = <Choosing shot={shot} time={time} />;
      break;
    case 7:
      scene = <QualityControl shot={shot} time={time} />;
      break;
    case 8:
      scene = <Products shot={shot} time={time} />;
      break;
    case 9:
      scene = <Systems shot={shot} time={time} />;
      break;
    case 10:
      scene = <Ending shot={shot} time={time} />;
      break;
    default:
      throw new Error(`未实现镜头 ${shot.id}`);
  }
  const mode = shot.camera.match(/`([A-Z]+)`/)?.[1] ?? "PUSH";
  return (
    <Camera time={time} duration={shot.end - shot.start} mode={mode}>
      {scene}
    </Camera>
  );
}

export function Film({
  showSubtitles = true,
  audio = true,
  voiceTracks,
}: FilmProps) {
  const frame = useCurrentFrame();
  const tracks = useVoiceTracks(voiceoverProject, voiceTracks);
  const shot = shotAt(frame);
  const chapter = chapters[shot.act];
  const hero = shot.id === "S3-4" || shot.id === "S6-4";
  return (
    <AbsoluteFill className="film" data-shot={shot.id}>
      <Background color={actColor(shot.act)} />
      {shots
        .filter((s) => s.act !== 2)
        .map((s) => (
          <Sequence
            key={s.id}
            name={`${s.id} · ${s.title}`}
            from={Math.round(s.start * FPS)}
            durationInFrames={Math.round((s.end - s.start) * FPS)}
          >
            <ShotScene shot={s} />
          </Sequence>
        ))}
      <Sequence
        name="02 · Workflow / 连续蓝图运镜"
        from={36 * FPS}
        durationInFrames={60 * FPS}
      >
        <WorkflowAct />
      </Sequence>
      {!hero && (
        <div className="film-masthead">
          <div className="film-brand">
            <span className="brand-rule">
              {[C.blue, C.red, C.yellow, C.green].map((color) => (
                <i key={color} style={{ background: color }} />
              ))}
            </span>
            <span>
              <b>PLDZ</b> / AGENT ARCHITECTURE
            </span>
            <a
              className="film-website"
              href="https://hipldz.com"
              target="_blank"
              rel="noreferrer"
            >
              hipldz.com
            </a>
          </div>
          <span>{chapter.title.replace("：把画线的笔交出去", "")}</span>
        </div>
      )}
      {!hero && (
        <div className="film-folio">
          {String(shot.act).padStart(2, "0")}{" "}
          <span style={{ margin: "0 12px" }}>—</span> WORKFLOW VS AGENT
        </div>
      )}
      <div className="film-source">{sourceFor(shot)}</div>
      {showSubtitles && <Subtitles shot={shot} seconds={frame / FPS} />}
      <Voiceover project={voiceoverProject} tracks={tracks} />
      {audio && <Soundtrack voiceTracks={tracks} />}
    </AbsoluteFill>
  );
}
