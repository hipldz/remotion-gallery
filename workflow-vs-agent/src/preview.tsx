import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Player, type PlayerRef } from "@remotion/player";
import { Film } from "./Film";
import { chapters as sourceChapters, resolveWorkflowTimeline, shots as sourceShots, timecode } from "./data/timeline";
import { C, DURATION, FPS, HEIGHT, WIDTH } from "./data/theme";
import { fontsReady } from "./fonts";
import { VoiceRecorder, useVoiceover } from "remotion-voiceover/react";
import { voiceoverProject } from "./voiceover.config";
import { voiceCaptionsToSrt } from "remotion-voiceover/core";
import "remotion-voiceover/styles.css";
import "./preview.css";

declare global {
  interface Window {
    __workflowReview?: {
      ready: boolean;
      seekTo: (frame: number) => void;
      getFrame: () => number;
      isMuted: () => boolean;
      play: () => void;
      pause: () => void;
      shots: typeof sourceShots;
      chapters: typeof sourceChapters;
    };
  }
}

const query = new URLSearchParams(window.location.search);
const clean = query.has("clean");
const initialFrame = Math.max(
  0,
  Math.min(DURATION - 1, Number(query.get("frame")) || 0),
);

function ReviewApp() {
  const player = useRef<PlayerRef>(null);
  const [frame, setFrame] = useState(initialFrame);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [subtitles, setSubtitles] = useState(true);
  const [audio, setAudio] = useState(true);
  const [expanded, setExpanded] = useState<number[]>([0]);
  const voice = useVoiceover(voiceoverProject);
  const duration = voice.project.durationInFrames;
  const {shots, chapters, shotAt} = useMemo(() => resolveWorkflowTimeline(voice.project), [voice.project]);
  const srtDownload = useMemo(() => `data:application/x-subrip;charset=utf-8,${encodeURIComponent(voiceCaptionsToSrt(voice.project))}`, [voice.project]);
  const playerProps = useMemo(
    () => ({ showSubtitles: subtitles, audio, voiceTracks: voice.tracks, voiceProject: voice.project }),
    [subtitles, audio, voice.tracks, voice.project],
  );
  const recordableCount = voiceoverProject.scenes!.filter(
    (scene) => scene.recordable,
  ).length;
  const shot = shotAt(frame);
  const currentIndex = shots.findIndex((s) => s.id === shot.id);
  const currentCue = shot.subtitles.find(
    (cue) => frame / FPS >= cue.start && frame / FPS < cue.end,
  );
  const seekPlayer = useCallback((next: number) => {
    const target = Math.max(0, Math.min(duration - 1, Math.round(next)));
    player.current?.pause();
    player.current?.seekTo(target);
    setFrame(target);
  }, [duration]);
  const seekTo = useCallback(
    (next: number) => {
      if (!voice.busy) seekPlayer(next);
    },
    [voice.busy, seekPlayer],
  );

  useEffect(() => {
    fontsReady
      .then(() => setReady(true))
      .catch((reason) => setError(String(reason)));
  }, []);
  useEffect(() => {
    const update = () => {if (!voice.busy) void voice.refresh();};
    import.meta.hot?.on('voiceover:update', update);
    return () => {import.meta.hot?.off('voiceover:update', update);};
  }, [voice.refresh, voice.busy]);
  useEffect(() => {
    const current = player.current;
    if (!current) return;
    const onFrame = (event: { detail: { frame: number } }) =>
      setFrame(event.detail.frame);
    const onError = (event: { detail: { error: Error } }) =>
      setError(event.detail.error.message);
    current.addEventListener("frameupdate", onFrame);
    current.addEventListener("error", onError);
    return () => {
      current.removeEventListener("frameupdate", onFrame);
      current.removeEventListener("error", onError);
    };
  }, []);
  useEffect(() => {
    window.__workflowReview = {
      ready,
      seekTo,
      getFrame: () => player.current?.getCurrentFrame() ?? frame,
      isMuted: () => player.current?.isMuted() ?? false,
      play: () => {
        if (!voice.busy) player.current?.play();
      },
      pause: () => player.current?.pause(),
      shots,
      chapters,
    };
  }, [ready, seekTo, frame, voice.busy, shots, chapters]);

  return (
    <div className={`review-app${clean ? " clean-preview" : ""}`}>
      {!clean && (
        <aside className="review-sidebar">
          <div className="review-brand">
            <div className="four-dots">
              {[C.blue, C.red, C.yellow, C.green].map((c) => (
                <i key={c} style={{ background: c }} />
              ))}
            </div>
            <b>PLDZ MOTION</b>
          </div>
          <div className="project-label">AGENT ARCHITECTURE / 02</div>
          <h1>
            Workflow
            <br />
            <span>vs</span> Agent
          </h1>
          <div className="sidebar-description">
            是什么，有何区别，该怎么选？
          </div>
          <div className="directory-label">
            <span>分镜目录</span>
            <span>{shots.length} SHOTS</span>
          </div>
          <nav aria-label="章节和镜头">
            {chapters.map((chapter) => {
              const open = expanded.includes(chapter.index);
              const active = shot.act === chapter.index;
              return (
                <div
                  className={`chapter-item${active ? " active" : ""}`}
                  key={chapter.index}
                >
                  <div className="chapter-row">
                    <button
                      className="chapter-link"
                      disabled={voice.busy}
                      onClick={() => {
                        seekTo(chapter.start * FPS);
                        setExpanded((value) =>
                          value.includes(chapter.index)
                            ? value
                            : [...value, chapter.index],
                        );
                      }}
                    >
                      <span className="chapter-num">
                        {String(chapter.index).padStart(2, "0")}
                      </span>
                      <span className="chapter-text">
                        {chapter.title.split("：")[0]}
                      </span>
                      <small>{timecode(chapter.start * FPS)}</small>
                    </button>
                    <button
                      className="expand-button"
                      onClick={() =>
                        setExpanded((value) =>
                          value.includes(chapter.index)
                            ? value.filter((id) => id !== chapter.index)
                            : [...value, chapter.index],
                        )
                      }
                      aria-label={`${open ? "收起" : "展开"}第 ${chapter.index} 幕`}
                    >
                      {open ? "−" : "+"}
                    </button>
                  </div>
                  {open && (
                    <div className="shot-list">
                      {shots
                        .filter((s) => s.act === chapter.index)
                        .map((s) => (
                          <button
                            key={s.id}
                            disabled={voice.busy}
                            onClick={() => seekTo(s.start * FPS)}
                            className={s.id === shot.id ? "selected" : ""}
                          >
                            <span>{s.id}</span>
                            <b>
                              {s.title
                                .replace("★ ", "")
                                .replace("英雄镜头：", "")}
                            </b>
                            <small>{Number((s.end - s.start).toFixed(1))}s</small>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          <div className="sidebar-footer">
            <span className="status-dot" />
            {error
              ? "字体载入失败"
              : ready
                ? "本地素材已就绪"
                : "正在载入字体…"}
            <span>REMOTION</span>
          </div>
        </aside>
      )}
      <main className="review-main">
        {!clean && (
          <header className="review-header">
            <div>
              <span className="review-overline">
                STORYBOARD REVIEW / VOICEOVER
              </span>
              <h2>
                分镜预览
                <span>
                  {timecode(duration)} / {chapters.length} 幕 / {shots.length} 镜
                </span>
              </h2>
            </div>
            <div className="spec-tags">
              <span>1920 × 1080</span>
              <span>30 FPS</span>
              <span>真人配音</span>
            </div>
          </header>
        )}
        {voice.error && !clean && (
          <div className="voice-load-error" role="alert">
            读取配音失败：{voice.error}
          </div>
        )}
        <div className="review-workspace">
          <div className="review-content">
            <div className="player-shell">
              <Player
                ref={player}
                component={Film}
                inputProps={playerProps}
                durationInFrames={duration}
                compositionWidth={WIDTH}
                compositionHeight={HEIGHT}
                fps={FPS}
                controls={!clean && !voice.busy}
                clickToPlay={!clean && !voice.busy}
                spaceKeyToPlayOrPause={!clean && !voice.busy}
                initialFrame={initialFrame}
                numberOfSharedAudioTags={12}
                style={{ width: "min(100cqw, calc(100cqh * 16 / 9))", aspectRatio: "16 / 9" }}
                acknowledgeRemotionLicense
              />
              {error && <div className="preview-error">{error}</div>}
            </div>
            {!clean && (
              <>
                <div className="review-transport">
                  <div className="shot-indicator">
                    <span className="live-dot" />
                    {shot.id}
                    <span className="transport-separator">/</span>
                    {shot.title.replace("★ ", "")}
                  </div>
                  <div className="transport-actions">
                    <button
                      onClick={() =>
                        seekTo(shots[Math.max(0, currentIndex - 1)].start * FPS)
                      }
                      disabled={voice.busy || currentIndex === 0}
                      aria-label="上一镜"
                    >
                      ← 上一镜
                    </button>
                    <button
                      onClick={() =>
                        seekTo(
                          shots[Math.min(shots.length - 1, currentIndex + 1)]
                            .start * FPS,
                        )
                      }
                      disabled={voice.busy || currentIndex === shots.length - 1}
                      aria-label="下一镜"
                    >
                      下一镜 →
                    </button>
                    <span className="transport-time">
                      {timecode(frame)} <span>/ {timecode(duration)}</span>
                    </span>
                  </div>
                </div>
                <div className="film-timeline" aria-label="全片时间轴">
                  {chapters.map((chapter) => (
                    <button
                      key={chapter.index}
                      disabled={voice.busy}
                      title={`${timecode(chapter.start * FPS)} · ${chapter.title}`}
                      style={{
                        flex: chapter.end - chapter.start,
                        background:
                          frame / FPS >= chapter.start
                            ? [
                                C.blue,
                                C.blue,
                                C.blue,
                                C.red,
                                C.red,
                                C.green,
                                C.green,
                                C.green,
                                C.red,
                                C.red,
                                C.blue,
                              ][chapter.index]
                            : "#e2e5e9",
                      }}
                      onClick={() => seekTo(chapter.start * FPS)}
                      aria-label={`跳转第 ${chapter.index} 幕`}
                    />
                  ))}
                  <i style={{ left: `${(frame / duration) * 100}%` }} />
                </div>
                <div className="review-notes">
                  <div>
                    <div className="review-overline">ON SCREEN / 当前字幕</div>
                    <p>{currentCue?.text.replaceAll("**", "") ?? "—"}</p>
                    <div className="camera-note">
                      {shot.camera.replaceAll("`", "").replaceAll("**", "")}
                    </div>
                  </div>
                  <div className="review-options">
                    <label>
                      <input
                        type="checkbox"
                        disabled={voice.busy}
                        checked={subtitles}
                        onChange={(event) => setSubtitles(event.target.checked)}
                      />
                      显示字幕
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        disabled={voice.busy}
                        checked={audio}
                        onChange={(event) => setAudio(event.target.checked)}
                      />
                      配乐与音效
                    </label>
                    <a href={srtDownload} download="workflow-vs-agent.srt">
                      下载 SRT ↗
                    </a>
                  </div>
                </div>
                <footer className="review-footer">
                  <span>
                    蓝 · 预设路径　红 · 运行时决策　黄 · LLM　绿 · 检查与确认
                  </span>
                  <span>按空格播放 / 暂停 · 点击目录跳转</span>
                </footer>
              </>
            )}
          </div>
          {!clean && (
            <aside className="voiceover-panel" aria-label="录制配音">
              <div className="recorder-heading">
                <strong>录制配音</strong>
                <span>{recordableCount} 段旁白 · 时长跟着朗读调整</span>
              </div>
              {ready ? (
                <VoiceRecorder
                  project={voice.project}
                  player={player}
                  frame={frame}
                  currentSceneId={shot.id}
                  manifest={voice.manifest}
                  storage={voice.storage}
                  onManifest={voice.setManifest}
                  onBusy={voice.setBusy}
                  onDraft={voice.setDraft}
                  onProject={voice.setProjectDraft}
                  onSeek={seekPlayer}
                />
              ) : (
                <p className="recorder-loading">
                  {error ? "请先处理字体载入问题。" : "正在载入字体与提词…"}
                </p>
              )}
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<ReviewApp />);
