// Both the standalone page and the Remotion toolbar use this native element.
// It only consumes media streams granted to this browser tab.
(() => {
  if (
    typeof window === "undefined" ||
    !window.customElements ||
    customElements.get("remotion-recorder")
  )
    return;

  const template = document.createElement("template");
  template.innerHTML = `
    <style>
      :host { display: block; min-width: 0; color: #e9edf3; font: 15px/1.5 system-ui, sans-serif; color-scheme: dark; }
      * { box-sizing: border-box; }
      [hidden] { display: none !important; }
      .bar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
      button, a { display: inline-flex; align-items: center; justify-content: center; gap: .55em; min-height: 42px; padding: 8px 16px; border: 1px solid #d7e3f3; border-radius: 7px; background: #e6effc; color: #151d29; font: inherit; font-weight: 600; cursor: pointer; text-decoration: none; }
      button::before { content: ""; width: .72em; height: .72em; border-radius: 50%; background: #c92f42; }
      button[data-phase="recording"]::before { border-radius: 2px; }
      button:disabled { opacity: .55; cursor: default; }
      a { color: #c3dcff; background: #19273a; border-color: #4f6a8c; }
      :is(a, button, input):focus-visible { outline: 2px solid #94c3ff; outline-offset: 3px; }
      label { display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; }
      input { accent-color: #93baf1; }
      time { font: 15px/1.4 ui-monospace, monospace; font-variant-numeric: tabular-nums; }
      .message { margin: 10px 0 0; color: #b9c1cf; }
      .message:empty { display: none; }
      .error { color: #ffb6b5; }
      video { display: block; width: 100%; max-height: 50vh; margin-top: 20px; border-radius: 7px; background: #090c12; }
      :host([current-tab]) { font-size: 13px; }
      :host([current-tab]) .bar { gap: 8px; }
      :host([current-tab]) :is(button, a) { min-height: 34px; padding: 6px 10px; }
      :host([current-tab]) .message { max-width: 46ch; font-size: 12px; margin-top: 3px; }
    </style>
    <div class="bar">
      <button type="button" id="record">开始录制</button>
      <label><input type="checkbox" id="microphone" checked>麦克风</label>
      <time id="elapsed" aria-label="录制时长" hidden>00:00</time>
      <a id="download" download hidden>下载视频</a>
    </div>
    <p id="message" class="message" role="status"></p>
    <video id="preview" controls playsinline preload="metadata" aria-label="录制回放" hidden></video>
  `;

  function stopTracks(stream) {
    stream?.getTracks().forEach((track) => track.stop());
  }

  function durationText(ms) {
    const seconds = Math.max(0, Math.floor(ms / 1000));
    return [Math.floor(seconds / 60), seconds % 60]
      .map((n) => String(n).padStart(2, "0"))
      .join(":");
  }

  function captureError(error, source) {
    const device = source === "microphone" ? "麦克风" : "屏幕共享";
    switch (error.name) {
      case "NotAllowedError":
        return (
          device + "未获授权或已取消。请重新开始并在浏览器提示中允许访问。"
        );
      case "NotFoundError":
        return source === "microphone"
          ? "未找到麦克风。请连接设备，或取消勾选麦克风后只录画面。"
          : "未找到可共享的画面，请先打开演示。";
      case "NotReadableError":
        return device + "无法读取，请检查系统权限和设备。";
      default:
        return error.message || "录制未能开始，请重新选择画面和麦克风。";
    }
  }

  function mount(host) {
    const shadow = host.shadowRoot || host.attachShadow({ mode: "open" });
    shadow.replaceChildren(template.content.cloneNode(true));
    const record = shadow.getElementById("record");
    const microphone = shadow.getElementById("microphone");
    const elapsed = shadow.getElementById("elapsed");
    const download = shadow.getElementById("download");
    const preview = shadow.getElementById("preview");
    const message = shadow.getElementById("message");
    const embedded = host.hasAttribute("current-tab");
    const micAvailable = Boolean(navigator.mediaDevices?.getUserMedia);
    let take = null;
    let resultUrl = "";
    let downloaded = false;
    let clock = 0;

    function say(text, isError = false) {
      message.textContent = text;
      message.classList.toggle("error", isError);
    }

    function idle() {
      record.dataset.phase = "idle";
      record.disabled = false;
      record.textContent =
        resultUrl && !downloaded ? "替换本段并重录" : "开始录制";
      microphone.disabled = !micAvailable;
    }

    function release(current) {
      stopTracks(current.screen);
      stopTracks(current.mic);
      window.clearInterval(clock);
    }

    function reset(current) {
      release(current);
      take = null;
      idle();
    }

    function finish(current) {
      if (take !== current) return;
      const duration =
        (current.stoppedAt ?? performance.now()) - current.startedAt;
      reset(current);
      // Reveal the toolbar after capture ends, including when the encoder failed.
      host.dispatchEvent(new Event("recording-finished", { bubbles: true }));
      if (!current.parts.length) {
        say(current.note || "没有收到视频数据，请再录一段。", true);
        return;
      }
      const type = current.encoder.mimeType || current.parts[0].type;
      const blob = new Blob(current.parts, { type });
      const oldUrl = resultUrl;
      resultUrl = URL.createObjectURL(blob);
      downloaded = false;
      const extension = type.includes("mp4")
        ? "mp4"
        : type.includes("webm")
          ? "webm"
          : "video";
      const stamp = current.date.toISOString().replace(/[:.]/g, "-");
      download.href = resultUrl;
      download.download = "演示录制-" + stamp + "." + extension;
      download.hidden = false;
      if (!embedded) {
        preview.src = resultUrl;
        preview.hidden = false;
      }
      if (oldUrl) URL.revokeObjectURL(oldUrl);
      elapsed.textContent = durationText(duration);
      elapsed.hidden = false;
      idle();
      say(
        (current.note ? current.note + " " : "") + "请下载视频，再关闭此页。",
        Boolean(current.note),
      );
    }

    function stop(current, note = "") {
      if (take !== current || current.stopping) return;
      current.stopping = true;
      current.note = note;
      if (current.startedAt === null) {
        reset(current);
        say(note || "已取消录制。");
        return;
      }
      current.stoppedAt = performance.now();
      record.disabled = true;
      record.textContent = "正在生成视频…";
      if (current.encoder.state !== "inactive") current.encoder.stop();
      // The encoder emits its final dataavailable before the stop event.
      release(current);
    }

    async function start() {
      const current = {
        screen: null,
        mic: null,
        encoder: null,
        parts: [],
        date: new Date(),
        startedAt: null,
        stoppedAt: null,
        stopping: false,
        note: "",
      };
      take = current;
      const withMic = microphone.checked;
      microphone.disabled = true;
      record.textContent = "取消录制";
      preview.pause();
      say("请选择需要录制的演示标签页或窗口。");
      let source = "screen";
      try {
        // Call directly in the click handler: the picker needs a user gesture.
        const screen = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: "browser",
            frameRate: { ideal: 30, max: 30 },
          },
          audio: false,
          preferCurrentTab: embedded,
          selfBrowserSurface: embedded ? "include" : "exclude",
        });
        if (take !== current) {
          stopTracks(screen);
          return;
        }
        current.screen = screen;
        const picture = screen.getVideoTracks()[0];
        if (!picture || picture.readyState !== "live")
          throw new Error("没有可录制的画面。");
        picture.addEventListener("ended", () => stop(current), { once: true });
        const tracks = [picture];
        if (withMic) {
          source = "microphone";
          say("请允许麦克风，授权完成后开始录制。");
          const mic = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
          });
          if (take !== current) {
            stopTracks(mic);
            return;
          }
          current.mic = mic;
          const sound = mic.getAudioTracks()[0];
          if (!sound || sound.readyState !== "live")
            throw new Error("麦克风没有可用的音轨。");
          sound.addEventListener(
            "ended",
            () => stop(current, "麦克风已断开。"),
            { once: true },
          );
          tracks.push(sound);
        }
        if (picture.readyState !== "live")
          throw new Error("屏幕共享已结束，请重新开始。");
        const encoder = new MediaRecorder(new MediaStream(tracks));
        current.encoder = encoder;
        encoder.ondataavailable = (event) => {
          if (event.data.size > 0) current.parts.push(event.data);
        };
        encoder.onstop = () => finish(current);
        encoder.onerror = () => stop(current, "编码中断，请检查已录制的部分。");
        encoder.start(1000);
        current.startedAt = performance.now();
        record.dataset.phase = "recording";
        record.textContent = "停止录制";
        elapsed.textContent = "00:00";
        elapsed.hidden = false;
        clock = window.setInterval(() => {
          elapsed.textContent = durationText(
            performance.now() - current.startedAt,
          );
        }, 1000);
        say(
          embedded
            ? "录制中 · Shift+R 停止"
            : "录制中。请回到演示窗口操作，结束时点「停止共享」或回来停止录制。",
        );
        host.dispatchEvent(new Event("recording-started", { bubbles: true }));
      } catch (error) {
        if (take !== current) return;
        reset(current);
        say(captureError(error, source), true);
      }
    }

    record.onclick = () => {
      if (take) stop(take);
      else void start();
    };
    download.onclick = () => {
      downloaded = true;
      if (!take) idle();
    };
    function onKey(event) {
      if (
        take?.startedAt == null ||
        !event.shiftKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.key.toLowerCase() !== "r"
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      if (!event.repeat) stop(take);
    }
    function beforeUnload(event) {
      if (take || (resultUrl && !downloaded)) {
        event.preventDefault();
        event.returnValue = "";
      }
    }
    function pageHide() {
      if (take) stop(take);
    }
    document.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener("pagehide", pageHide);
    if (
      !window.isSecureContext ||
      !navigator.mediaDevices?.getDisplayMedia ||
      !window.MediaRecorder
    ) {
      record.disabled = true;
      microphone.disabled = true;
      say(
        "当前页面无法录屏。请用支持屏幕共享的桌面浏览器打开 localhost 或 HTTPS 地址。",
        true,
      );
    } else if (!micAvailable) {
      microphone.checked = false;
      microphone.disabled = true;
      say("当前浏览器仅支持录制画面。");
    }

    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("pagehide", pageHide);
      if (take) {
        const current = take;
        take = null;
        if (current.encoder && current.encoder.state !== "inactive")
          current.encoder.stop();
        release(current);
      }
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }

  customElements.define(
    "remotion-recorder",
    class extends HTMLElement {
      connectedCallback() {
        this.dispose ??= mount(this);
      }
      disconnectedCallback() {
        this.dispose?.();
        this.dispose = null;
      }
    },
  );
})();
