import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Player, type PlayerRef } from '@remotion/player';
import { AgentMap2026 } from './AgentMap2026';
import { assets } from './components/Media';
import { C } from './data/theme';
import { fontsReady } from './fonts';
import { loadProjectMetadata } from './lib/metadata';
import { chapterInfo, defaultProps, shotAt, totalFrames, type FilmProps } from './lib/timeline';
import { voiceCoverage } from 'remotion-voiceover/core';
import { VoiceRecorder, useVoiceover } from 'remotion-voiceover/react';
import { createVoiceoverProject, withImportedVoiceTracks } from './voiceover.config';
import 'remotion-voiceover/styles.css';
import './preview.css';

const timecode = (frame: number) => `${String(Math.floor(frame / 1800)).padStart(2, '0')}:${String(Math.floor(frame / 30) % 60).padStart(2, '0')}`;
const cleanMode = new URLSearchParams(window.location.search).has('clean');

declare global {
  interface Window {
    __agentReview?: { seekTo: (frame: number) => void; getFrame: () => number; isMuted: () => boolean; timeline: FilmProps['timeline']; ready: boolean };
  }
}

function ReviewApp() {
  const player = useRef<PlayerRef>(null);
  const [props, setProps] = useState<FilmProps>(defaultProps);
  const [frame, setFrame] = useState(90);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string[]>(['P']);
  const voiceProject = useMemo(() => createVoiceoverProject(props.timeline), [props.timeline]);
  const voice = useVoiceover(voiceProject);
  const playerProps = useMemo(() => ({ ...props, voiceTracks: voice.tracks }), [props, voice.tracks]);
  const shot = shotAt(props.timeline, frame);
  const length = totalFrames(props.timeline);
  const realShots = assets.filter((a) => props.availableFiles.includes(`shots/${a.file}`)).length;
  const voiceCount = voiceCoverage(withImportedVoiceTracks(props.timeline, voice.manifest.tracks), voiceProject);
  const narrationCount = props.timeline.filter((s) => s.narration).length;
  const refresh = useCallback(async () => {
    setReady(false);
    setError('');
    try {
      const response = await fetch('/__project/assets');
      if (!response.ok) throw new Error('无法读取本地素材清单。请用 npm run preview 启动。');
      const files: string[] = await response.json();
      const resolved = await loadProjectMetadata(files);
      await fontsReady;
      setProps((p) => ({ ...p, ...resolved }));
      setReady(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  useEffect(() => {
    const current = player.current;
    if (!current) return;
    const onFrame = (event: { detail: { frame: number } }) => setFrame(event.detail.frame);
    current.addEventListener('frameupdate', onFrame);
    return () => current.removeEventListener('frameupdate', onFrame);
  }, []);
  const seekPlayer = useCallback(
    (f: number) => {
      player.current?.pause();
      player.current?.seekTo(Math.max(0, Math.min(totalFrames(props.timeline) - 1, Math.round(f))));
      setFrame(Math.max(0, Math.min(totalFrames(props.timeline) - 1, Math.round(f))));
    },
    [props.timeline],
  );
  const seek = useCallback(
    (f: number) => {
      if (!voice.busy) seekPlayer(f);
    },
    [voice.busy, seekPlayer],
  );
  useEffect(() => {
    window.__agentReview = {
      seekTo: seek,
      getFrame: () => player.current?.getCurrentFrame() ?? frame,
      isMuted: () => player.current?.isMuted() ?? false,
      timeline: props.timeline,
      ready,
    };
  }, [seek, frame, props.timeline, ready]);
  const index = props.timeline.findIndex((s) => s.id === shot.id);
  return (
    <div className={`review-app${cleanMode ? ' clean-preview' : ''}`}>
      <aside className="sidebar">
        <div className="wordmark">
          <div className="four-dots">
            {[C.blue, C.green, C.yellow, C.red].map((c) => (
              <i key={c} style={{ background: c }} />
            ))}
          </div>
          <span>AGENT ATLAS</span>
        </div>
        <div className="side-heading">
          <span>分镜目录</span>
          <span>{props.timeline.length} SHOTS</span>
        </div>
        <nav>
          {chapterInfo.map((chapter) => {
            const items = props.timeline.filter((s) => s.chapterKey === chapter.key);
            const open = expanded.includes(chapter.key);
            return (
              <div className="chapter-nav" key={chapter.key}>
                <button
                  className={`chapter-button ${shot.chapterKey === chapter.key ? 'chapter-current' : ''}`}
                  onClick={() => setExpanded((list) => (open ? list.filter((key) => key !== chapter.key) : [...list, chapter.key]))}
                >
                  <span className="chapter-no">{chapter.number}</span>
                  <span>
                    {chapter.year || chapter.title}
                    <small>{chapter.year ? chapter.title : chapter.subtitle}</small>
                  </span>
                  <span className="expand-mark">{open ? '−' : '+'}</span>
                </button>
                {open && (
                  <div className="shot-list">
                    {items.map((s) => (
                      <button
                        className={`shot-button ${s.id === shot.id ? 'selected' : ''}`}
                        key={s.id}
                        disabled={voice.busy}
                        onClick={() => seek(s.from + Math.min(45, s.duration - 1))}
                      >
                        <span className="shot-id">{s.id}</span>
                        <span>{s.title}</span>
                        <time>{timecode(s.from)}</time>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="side-bottom">
          <span className={error ? 'status-dot error' : ready ? 'status-dot ready' : 'status-dot'} />
          <span>
            {error ? '素材需调整' : ready ? '本地工程已就绪' : '正在载入素材'}
            <small>Remotion · 仅预览，不输出视频</small>
          </span>
        </div>
      </aside>
      <main className="review-main">
        <header className="review-header">
          <div>
            <div className="eyebrow">STORY EDITION / V3 · REAL SOURCE</div>
            <h1>AI 工具这几年，是怎么变的？</h1>
          </div>
          <div className="format-meta">
            <span>V3 / SOURCE {assets.length}</span>
            <span>1920 × 1080</span>
            <span>30 FPS</span>
            <span>{timecode(length)}</span>
          </div>
        </header>
        {(error || voice.error) && (
          <div className="error-banner" role="alert">
            {error || `读取配音失败：${voice.error}`}
          </div>
        )}
        <div className="review-workspace">
          <div className="review-content">
            <section className="player-surface" aria-label="视频分镜预览">
              <Player
                ref={player}
                component={AgentMap2026}
                inputProps={playerProps}
                durationInFrames={length}
                fps={30}
                compositionWidth={1920}
                compositionHeight={1080}
                initialFrame={90}
                controls={!cleanMode && !voice.busy}
                clickToPlay={false}
                spaceKeyToPlayOrPause={!voice.busy}
                showVolumeControls
                style={{ width: '100%', aspectRatio: '16 / 9', background: '#12141a', borderRadius: cleanMode ? 0 : 12 }}
              />
            </section>
            <div className="player-tools">
              <div className="current-shot">
                <span>{shot.id}</span>
                <strong>{shot.title}</strong>
                <time>
                  {timecode(frame)} <i>/ {timecode(length)}</i>
                </time>
              </div>
              <div className="tool-actions">
                <button disabled={voice.busy} onClick={() => seek(props.timeline[Math.max(0, index - 1)].from + 35)}>
                  ← 上一镜
                </button>
                <button disabled={voice.busy} onClick={() => seek(props.timeline[Math.min(props.timeline.length - 1, index + 1)].from + 35)}>
                  下一镜 →
                </button>
                <label>
                  <input type="checkbox" checked={props.showSubtitles} onChange={(e) => setProps((p) => ({ ...p, showSubtitles: e.target.checked }))} />
                  字幕
                </label>
                <label>
                  <input type="checkbox" checked={props.enableSfx} onChange={(e) => setProps((p) => ({ ...p, enableSfx: e.target.checked }))} />
                  音效
                </label>
              </div>
            </div>
            <div className="chapter-timeline">
              {chapterInfo.map((chapter) => {
                const items = props.timeline.filter((s) => s.chapterKey === chapter.key);
                return (
                  <button
                    key={chapter.key}
                    disabled={voice.busy}
                    onClick={() => seek(items[0].from + 35)}
                    style={{ flex: totalFrames(items) }}
                    className={chapter.key === shot.chapterKey ? 'timeline-current' : ''}
                  >
                    <span>{chapter.year || (chapter.key === 'P' ? '序' : chapter.key === 'G' ? '终话' : '第 0 话')}</span>
                    <i />
                  </button>
                );
              })}
            </div>
            <div className="key-shots" aria-label="关键镜头">
              <span>快速检查</span>
              {(
                [
                  { id: 'P01', label: '新开场', at: 120 },
                  { id: 'P03', label: '求关注', at: 80 },
                  { id: 'P06', label: '倒带', at: 170 },
                  { id: 'C01', label: '破框', at: 47 },
                  { id: 'F04', label: '任务进度', at: 240 },
                  { id: 'G01', label: '回头总结', at: 150 },
                ] as const
              ).map((item) => {
                const keyShot = props.timeline.find((s) => s.id === item.id)!;
                return (
                  <button
                    key={item.id}
                    disabled={voice.busy}
                    onClick={() => seek(keyShot.from + Math.round((item.at / keyShot.animationFrames) * keyShot.duration))}
                  >
                    {item.label} / {timecode(keyShot.from)} ↗
                  </button>
                );
              })}
            </div>
            <section className="details-grid">
              <div className="narration-card">
                <div className="detail-heading">
                  <span>旁白 · {shot.id}</span>
                  <span>
                    {shot.elastic ? '弹性镜头' : '固定时长'} / {(shot.duration / 30).toFixed(1)}s
                  </span>
                </div>
                <p>{shot.narration || '本镜头无旁白，让画面和节奏说话。'}</p>
                <div className="detail-foot">
                  {voice.manifest.tracks.some((track) => track.scope === shot.id || track.scope === 'full')
                    ? '已接入浏览器配音'
                    : shot.vo
                      ? `已接入 ${shot.vo}`
                      : shot.narration
                        ? '在配音面板跟随提词录制'
                        : '无音轨'}
                </div>
              </div>
              <div className="asset-card">
                <div className="detail-heading">
                  <span>工程素材</span>
                  <button disabled={voice.busy} onClick={() => void refresh()}>
                    刷新素材 ↻
                  </button>
                </div>
                <div className="asset-counts">
                  <div>
                    <strong>
                      {realShots}
                      <i>/{assets.length}</i>
                    </strong>
                    <span>原始截图</span>
                  </div>
                  <div>
                    <strong>
                      {voiceCount}
                      <i>/{narrationCount}</i>
                    </strong>
                    <span>逐镜录音</span>
                  </div>
                  <div>
                    <strong>{props.timeline.length}</strong>
                    <span>动画分镜</span>
                  </div>
                </div>
                <p>{assets.length} 张真实截图已从原文接入，图源、裁切和原始文件校验记录见 production/source-provenance.json。</p>
              </div>
            </section>
            <footer className="review-footer">
              <span>写代码 · 做日常工作 · 跑流程 · 让任务接着做</span>
              <span>PLDZ · 源工程预览</span>
            </footer>
          </div>
          {!cleanMode && (
            <aside className="voiceover-panel" aria-label="录制配音">
              <div className="recorder-heading">
                <strong>录制配音</strong>
                <span>{narrationCount} 段旁白 · 可整片录制</span>
              </div>
              {ready ? (
                <VoiceRecorder
                  project={voiceProject}
                  player={player}
                  frame={frame}
                  currentSceneId={shot.id}
                  manifest={voice.manifest}
                  storage={voice.storage}
                  onManifest={voice.setManifest}
                  onBusy={voice.setBusy}
                  onDraft={voice.setDraft}
                  onSeek={seekPlayer}
                />
              ) : (
                <p className="recorder-loading">{error ? '请先处理素材问题。' : '正在载入分镜与提词…'}</p>
              )}
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<ReviewApp />);
