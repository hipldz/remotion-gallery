import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { Player, type PlayerRef } from "@remotion/player";
import {
  definePresentation,
  initialPresentationState,
  transitionPresentation,
} from "./controller.js";
import type {
  PresentationAction,
  PresentationDefinition,
  PresentationState,
} from "./types.js";
import "./presentation.css";
import "../recorder/recorder.js";

export type PresentationProps<Props extends Record<string, unknown>> = {
  component: ComponentType<Props>;
  inputProps: Props;
  definition: PresentationDefinition;
};

const statusLabels = { holding: "停留", playing: "播放中", paused: "已暂停" };

function timecode(frame: number, fps: number): string {
  const seconds = Math.floor(frame / fps);
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function isEditing(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(
      target.closest(
        "input, textarea, select, [contenteditable]:not([contenteditable='false'])",
      ),
    )
  );
}

/**
 * One muted Player, driven by authored frame intervals. Keep definition and
 * inputProps stable; use a React key when replacing a presentation entirely.
 * The toolbar recorder captures the browser surface independently of Player.
 */
export function Presentation<Props extends Record<string, unknown>>({
  component,
  inputProps,
  definition: providedDefinition,
}: PresentationProps<Props>) {
  const definition = useMemo(
    () => definePresentation(providedDefinition),
    [providedDefinition],
  );
  const root = useRef<HTMLElement>(null);
  const player = useRef<PlayerRef>(null);
  const [state, setState] = useState<PresentationState>(
    initialPresentationState,
  );
  const latestState = useRef(state);
  const activePlayback = useRef(false);
  const startedRun = useRef(-1);
  const [overview, setOverview] = useState(false);
  const [clean, setClean] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has("clean"),
  );
  const [fullscreen, setFullscreen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const cue = definition.cues[state.index];

  const send = useCallback(
    (action: PresentationAction) => {
      const next = transitionPresentation(
        latestState.current,
        action,
        definition.cues.length,
      );
      if (next === latestState.current) return;
      // Stop the old playback before React commits a different frame range.
      activePlayback.current = false;
      player.current?.pause();
      latestState.current = next;
      setState(next);
    },
    [definition.cues.length],
  );

  useEffect(() => {
    const current = player.current;
    if (!current) return;
    const onEnded = () => {
      if (!activePlayback.current || latestState.current.status !== "playing")
        return;
      activePlayback.current = false;
      const finished = definition.cues[latestState.current.index];
      // outFrame is inclusive. Explicit seeking also synchronizes frame refs.
      current.seekTo(finished.holdFrame);
      send({ type: "finish" });
    };
    const onError = (event: { detail: { error: Error } }) => {
      activePlayback.current = false;
      current.pause();
      if (latestState.current.status === "playing") send({ type: "toggle" });
      setError(event.detail.error.message);
    };
    const keepMuted = () => {
      if (!current.isMuted()) current.mute();
    };
    current.addEventListener("ended", onEnded);
    current.addEventListener("error", onError);
    current.addEventListener("mutechange", keepMuted);
    current.mute();
    return () => {
      activePlayback.current = false;
      current.pause();
      current.removeEventListener("ended", onEnded);
      current.removeEventListener("error", onError);
      current.removeEventListener("mutechange", keepMuted);
    };
  }, [definition, send]);

  useEffect(() => {
    const current = player.current;
    if (!current) return;
    activePlayback.current = false;
    current.pause();
    if (state.status === "holding") {
      current.seekTo(cue.holdFrame);
      return;
    }
    if (state.status === "paused" || error) return;
    if (startedRun.current !== state.run) {
      current.seekTo(cue.fromFrame);
      startedRun.current = state.run;
    }
    activePlayback.current = true;
    current.play();
  }, [cue, state.run, state.status, error]);

  const toggleFullscreen = useCallback(async () => {
    const element = root.current;
    if (!element) return;
    setNotice("");
    try {
      if (document.fullscreenElement === element) {
        await document.exitFullscreen();
      } else {
        if (!element.requestFullscreen)
          throw new Error(
            "当前浏览器不支持全屏，请使用浏览器全屏或按 C 隐藏控件。",
          );
        await element.requestFullscreen();
        setOverview(false);
        setClean(true);
      }
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : String(reason));
    }
  }, []);

  useEffect(() => {
    const element = root.current;
    const focusStage = () => element?.focus({ preventScroll: true });
    const revealDownload = () => {
      setOverview(false);
      setClean(false);
    };
    element?.addEventListener("recording-started", focusStage);
    element?.addEventListener("recording-finished", revealDownload);
    const onFullscreen = () => {
      const isFullscreen = document.fullscreenElement === root.current;
      setFullscreen(isFullscreen);
      if (!isFullscreen) setClean(false);
    };
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => {
      element?.removeEventListener("recording-started", focusStage);
      element?.removeEventListener("recording-finished", revealDownload);
      document.removeEventListener("fullscreenchange", onFullscreen);
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.composedPath()[0] ?? event.target;
      if (
        event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        isEditing(target)
      )
        return;
      // Preserve native activation when a toolbar button has keyboard focus.
      if (
        (event.key === " " || event.key === "Enter") &&
        target instanceof Element &&
        target.closest("button, a")
      )
        return;
      const key = event.key.toLowerCase();
      const actions: Record<string, PresentationAction> = {
        arrowright: { type: "next" },
        pagedown: { type: "next" },
        " ": { type: "next" },
        enter: { type: "next" },
        arrowleft: { type: "previous" },
        pageup: { type: "previous" },
        r: { type: "replay" },
        p: { type: "toggle" },
        home: { type: "goto", index: 0 },
        end: { type: "goto", index: definition.cues.length - 1 },
      };
      const action = actions[key];
      if (!action && !["o", "f", "c", "escape"].includes(key)) return;
      event.preventDefault();
      if (event.repeat) return;
      if (key === "escape") {
        setOverview(false);
        setClean(false);
      } else if (key === "o") {
        setOverview((open) => !open);
      } else if (key === "f") {
        void toggleFullscreen();
      } else if (key === "c") {
        setOverview(false);
        setClean((value) => !value);
      } else if (action && !error) {
        setOverview(false);
        send(action);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [definition.cues.length, error, send, toggleFullscreen]);

  const navigate = (index: number) => {
    send({ type: "goto", index });
    setOverview(false);
  };

  return (
    <section
      ref={root}
      tabIndex={-1}
      className={`rmp-shell${clean ? " rmp-clean" : ""}`}
      aria-label={definition.title}
    >
      <header className="rmp-header rmp-ui">
        <div className="rmp-heading">
          <span className="rmp-mark" aria-hidden="true">
            ▰
          </span>
          <div>
            <span className="rmp-eyebrow">PRESENTATION</span>
            <h1>{definition.title}</h1>
          </div>
        </div>
        {createElement("remotion-recorder", { "current-tab": "" })}
        <button
          type="button"
          onClick={() => setOverview((open) => !open)}
          aria-expanded={overview}
          aria-controls="rmp-directory"
        >
          目录 <kbd>O</kbd>
        </button>
      </header>

      <div className="rmp-stage">
        <div
          className="rmp-screen"
          style={{
            aspectRatio: `${definition.compositionWidth} / ${definition.compositionHeight}`,
            width: `min(100cqw, calc(100cqh * ${definition.compositionWidth / definition.compositionHeight}))`,
          }}
        >
          <Player
            ref={player}
            component={component}
            inputProps={inputProps}
            durationInFrames={definition.durationInFrames}
            fps={definition.fps}
            compositionWidth={definition.compositionWidth}
            compositionHeight={definition.compositionHeight}
            inFrame={cue.fromFrame}
            outFrame={cue.holdFrame}
            initialFrame={definition.cues[0].holdFrame}
            initiallyMuted
            autoPlay={false}
            loop={false}
            controls={false}
            clickToPlay={false}
            doubleClickToFullscreen={false}
            spaceKeyToPlayOrPause={false}
            moveToBeginningWhenEnded={false}
            acknowledgeRemotionLicense
            style={{ width: "100%", height: "100%" }}
            errorFallback={({ error: playerError }) => (
              <div className="rmp-player-error" role="alert">
                画面加载失败：{playerError.message}
              </div>
            )}
          />
        </div>
      </div>

      <footer className="rmp-footer rmp-ui">
        <div className="rmp-current" aria-live="polite" aria-atomic="true">
          <span className="rmp-count">
            {String(state.index + 1).padStart(2, "0")}{" "}
            <span>/ {definition.cues.length}</span>
          </span>
          <div>
            <span className="rmp-chapter">
              {cue.chapter ?? definition.title}
            </span>
            <strong>{cue.title}</strong>
          </div>
          <span className={`rmp-status rmp-status-${state.status}`}>
            {statusLabels[state.status]}
          </span>
        </div>
        <div className="rmp-controls">
          <button
            type="button"
            disabled={
              Boolean(error) ||
              (state.index === 0 && state.status === "holding")
            }
            onClick={() => send({ type: "previous" })}
          >
            ← 上一步
          </button>
          <button
            type="button"
            disabled={Boolean(error)}
            onClick={() => send({ type: "replay" })}
            title="从当前段开头重播（R）"
          >
            重播 <kbd>R</kbd>
          </button>
          <button
            type="button"
            disabled={Boolean(error)}
            onClick={() => send({ type: "toggle" })}
            title="播放、暂停或继续当前段（P）"
          >
            {state.status === "playing"
              ? "暂停"
              : state.status === "paused"
                ? "继续"
                : "播放本段"}{" "}
            <kbd>P</kbd>
          </button>
          <button
            className="rmp-next"
            type="button"
            disabled={
              Boolean(error) ||
              state.status === "playing" ||
              state.index === definition.cues.length - 1
            }
            onClick={() => send({ type: "next" })}
          >
            下一步 →
          </button>
          <span className="rmp-control-separator" aria-hidden="true" />
          <button
            type="button"
            onClick={() => {
              setOverview(false);
              setClean(true);
            }}
            title="C 显示或隐藏控件"
          >
            隐藏控件 <kbd>C</kbd>
          </button>
          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            title="全屏时自动隐藏控件（F）"
          >
            {fullscreen ? "退出全屏" : "全屏"} <kbd>F</kbd>
          </button>
        </div>
        <div className="rmp-help">
          <span>← / → 或翻页笔切换 · 空格下一步 · 到点自动停留</span>
          <span>
            停留画面 {timecode(cue.holdFrame, definition.fps)} · 全片静音
          </span>
        </div>
      </footer>

      {overview && (
        <aside
          className="rmp-directory rmp-ui"
          id="rmp-directory"
          aria-label="演示目录"
        >
          <div className="rmp-directory-header">
            <div>
              <span className="rmp-eyebrow">OUTLINE</span>
              <h2>选择讲解位置</h2>
            </div>
            <button
              type="button"
              onClick={() => setOverview(false)}
              aria-label="关闭目录"
            >
              关闭 ×
            </button>
          </div>
          <nav aria-label="演示停留点">
            {definition.cues.map((item, index) => (
              <button
                type="button"
                key={item.id}
                disabled={Boolean(error)}
                aria-current={index === state.index ? "step" : undefined}
                onClick={() => navigate(index)}
              >
                <span className="rmp-directory-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  <small>{item.chapter ?? definition.title}</small>
                  <strong>{item.title}</strong>
                </span>
                <time>{timecode(item.holdFrame, definition.fps)}</time>
              </button>
            ))}
          </nav>
          {cue.notes && (
            <p className="rmp-notes">
              <b>当前讲解备注</b>
              {cue.notes}
            </p>
          )}
        </aside>
      )}
      {(error || notice) && (
        <div className="rmp-message rmp-ui" role="alert">
          <span>{error ? `播放失败：${error}。请刷新页面重试。` : notice}</span>
          {!error && (
            <button type="button" onClick={() => setNotice("")}>
              关闭
            </button>
          )}
        </div>
      )}
    </section>
  );
}
