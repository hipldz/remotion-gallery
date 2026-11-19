import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Player, type PlayerRef } from "@remotion/player";
import { VoiceRecorder, useVoiceover } from "remotion-voiceover/react";
import "remotion-voiceover/styles.css";
import "./voiceover.css";
import { WhatIsAgent } from "../src/Film";
import { fontsReady } from "../src/fonts";
import { FPS, HEIGHT, WIDTH } from "../src/theme";
import { SCENES, TOTAL_FRAMES, sceneAt } from "../src/timeline";
import { voiceoverProject } from "../src/voiceover.config";

function Studio() {
  const player = useRef<PlayerRef>(null);
  const [frame, setFrame] = useState(0);
  const voice = useVoiceover(voiceoverProject);
  const duration = voice.project.durationInFrames;
  const scene = sceneAt(Math.min(Math.max(frame, 0), TOTAL_FRAMES - 1));

  const playerProps = useMemo(
    () => ({
      showSubtitles: true,
      voiceTracks: voice.tracks,
      voiceProject: voice.project,
    }),
    [voice.tracks, voice.project],
  );

  useEffect(() => {
    const current = player.current;
    if (!current) return;
    const onFrame = (event: { detail: { frame: number } }) =>
      setFrame(event.detail.frame);
    current.addEventListener("frameupdate", onFrame);
    return () => {
      current.removeEventListener("frameupdate", onFrame);
    };
  }, []);

  const seek = useCallback((next: number) => {
    player.current?.seekTo(next);
    setFrame(next);
  }, []);

  return (
    <div className="vo-layout">
      <div className="vo-main">
        <div className="vo-player">
          <Player
            ref={player}
            component={WhatIsAgent}
            inputProps={playerProps}
            durationInFrames={duration}
            compositionWidth={WIDTH}
            compositionHeight={HEIGHT}
            fps={FPS}
            controls={!voice.busy}
            clickToPlay={!voice.busy}
            spaceKeyToPlayOrPause={!voice.busy}
            doubleClickToFullscreen={false}
            acknowledgeRemotionLicense
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        <div className="vo-scenes" role="tablist" aria-label="分镜">
          {SCENES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={item.id === scene.id}
              className={item.id === scene.id ? "is-current" : undefined}
              disabled={voice.busy}
              onClick={() => seek(item.from)}
            >
              <span>{item.id}</span>
              {item.title}
            </button>
          ))}
        </div>
      </div>
      <aside className="vo-panel">
        <VoiceRecorder
          project={voice.project}
          player={player}
          frame={frame}
          currentSceneId={scene.id}
          manifest={voice.manifest}
          storage={voice.storage}
          onManifest={voice.setManifest}
          onBusy={voice.setBusy}
          onDraft={voice.setDraft}
          onSeek={seek}
        />
      </aside>
    </div>
  );
}

const container = document.getElementById("root");
if (!container) throw new Error("找不到配音页面容器");
const root = createRoot(container);

const note = {
  margin: "auto",
  padding: "32px",
  maxWidth: "640px",
  color: "#e5e7eb",
  fontFamily: "sans-serif",
  lineHeight: 1.7,
};

root.render(
  <p style={note} role="status">
    正在载入演示字体…
  </p>,
);

void fontsReady.then(
  () => {
    root.render(<Studio />);
  },
  (error: unknown) => {
    root.render(
      <div style={note} role="alert">
        <h1>字体载入失败</h1>
        <p>请确认本工程 public/fonts 下的字体文件可以访问，然后刷新页面。</p>
        <p>{error instanceof Error ? error.message : String(error)}</p>
      </div>,
    );
  },
);
