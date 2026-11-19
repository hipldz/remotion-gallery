import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import { chromium, expect, type Page } from "@playwright/test";
import { createServer } from "vite";
import { voiceoverPlugin, inspectVoiceWave } from "remotion-voiceover/server";
import { parseVoiceManifest } from "remotion-voiceover/core";
import { DURATION, FPS } from "../src/data/theme";
import { chapters, shots } from "../src/data/timeline";
import { voiceoverProject } from "../src/voiceover.config";

type TestWindow = typeof window & {
  __testStreams: MediaStream[];
  __voiceoverChapter?: { play: () => void; seek: (frame: number) => void };
};

function wave(seconds: number, rate = 8000) {
  const samples = Math.round(seconds * rate);
  const body = Buffer.alloc(44 + samples * 2);
  body.write("RIFF", 0);
  body.writeUInt32LE(body.length - 8, 4);
  body.write("WAVEfmt ", 8);
  body.writeUInt32LE(16, 16);
  body.writeUInt16LE(1, 20);
  body.writeUInt16LE(1, 22);
  body.writeUInt32LE(rate, 24);
  body.writeUInt32LE(rate * 2, 28);
  body.writeUInt16LE(2, 32);
  body.writeUInt16LE(16, 34);
  body.write("data", 36);
  body.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++)
    body.writeInt16LE(
      Math.round(Math.sin((i / rate) * Math.PI * 880) * 7000),
      44 + i * 2,
    );
  return body;
}

async function shortRecording(page: Page) {
  await page.getByRole("button", { name: /^(开始录音|重新录制)$/ }).click();
  await expect(page.getByTestId("voice-recorder")).toHaveAttribute(
    "data-phase",
    "recording",
    { timeout: 10000 },
  );
  await page.waitForFunction(() => window.__workflowReview!.getFrame() > 30);
  await page.getByRole("button", { name: "停止录音", exact: true }).click();
  await page.getByTestId("voice-take").waitFor();
}

async function save(page: Page) {
  await page.getByRole("button", { name: "保存并使用", exact: true }).click();
  await page
    .getByRole("button", { name: "已保存并使用", exact: true })
    .waitFor();
}

async function main() {
  const cache = resolve(".cache");
  const output = resolve("build/review");
  await mkdir(cache, { recursive: true });
  await mkdir(output, { recursive: true });
  const workspace = await mkdtemp(join(cache, "voiceover-e2e-"));
  const publicDir = join(workspace, "public");
  // All generated takes live in a disposable copy, separate from user recordings.
  await cp(resolve("public"), publicDir, { recursive: true });
  await mkdir(join(publicDir, "narration"), { recursive: true });
  await writeFile(
    join(publicDir, "narration/manifest.json"),
    '{"version":1,"tracks":[]}\n',
  );
  const fakeMic = join(workspace, "fake-microphone.wav");
  await writeFile(fakeMic, wave(20, 48000));
  const server = await createServer({
    configFile: false,
    optimizeDeps: {force: true, include: ['react/jsx-runtime', 'react/jsx-dev-runtime']},
    root: resolve("."),
    publicDir,
    plugins: [
      voiceoverPlugin({ project: voiceoverProject, projectRoot: workspace }),
    ],
    server: {
      host: "127.0.0.1",
      port: 0,
      watch: { ignored: ["**/build/**", "**/.cache/**"] },
    },
  });
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  try {
    await server.listen();
    const address = server.httpServer!.address();
    assert.ok(address && typeof address !== "string");
    const url = `http://127.0.0.1:${address.port}`;
    const executables: (string | undefined)[] = process.env
      .PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? [process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH]
      : [
          "C:/Program Files/Google/Chrome/Application/chrome.exe",
          "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
        ].filter(existsSync);
    if (!process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH)
      executables.push(undefined);
    let launchError: unknown;
    for (const executablePath of executables) {
      try {
        browser = await chromium.launch({
          headless: true,
          executablePath,
          args: [
            "--use-fake-ui-for-media-stream",
            "--use-fake-device-for-media-stream",
            `--use-file-for-fake-audio-capture=${fakeMic}`,
          ],
        });
        break;
      } catch (error) {
        launchError = error;
      }
    }
    if (!browser) throw launchError;
    const context = await browser.newContext({
      permissions: ["microphone"],
      viewport: { width: 1800, height: 1100 },
    });
    await context.addInitScript(() => {
      const original = navigator.mediaDevices.getUserMedia.bind(
        navigator.mediaDevices,
      );
      (window as TestWindow).__testStreams = [];
      navigator.mediaDevices.getUserMedia = async (options) => {
        const stream = await original(options);
        (window as TestWindow).__testStreams.push(stream);
        return stream;
      };
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForFunction(() => window.__workflowReview?.ready);
    const recorder = page.getByTestId("voice-recorder");
    const range = page.getByRole("combobox", { name: "录制范围" });
    await expect(recorder).toBeVisible();
    assert.equal(await range.locator("option").count(), 40);
    await expect(range).toHaveValue("S0-1");
    await expect(page.getByRole("combobox", {name: "录音时间方式"})).toHaveValue("reading");
    await page.getByRole("combobox", {name: "录音时间方式"}).selectOption("fixed");
    assert.equal(
      await page.evaluate(() => (window as TestWindow).__testStreams.length),
      0,
    );
    assert.ok(!(await page.getByLabel("朗读稿").innerText()).includes("**"));
    await page.screenshot({
      path: join(output, "voice-recorder-desktop.png"),
      fullPage: true,
    });

    await page.getByRole("button", { name: "开始录音", exact: true }).click();
    await expect(recorder).toHaveAttribute("data-phase", "countdown");
    await expect(
      page.getByRole("button", { name: "下一镜", exact: true }),
    ).toBeDisabled();
    await page.getByRole("button", { name: "取消录音", exact: true }).click();
    await expect(recorder).toHaveAttribute("data-phase", "idle");
    assert.equal(await page.getByTestId("voice-take").count(), 0);
    assert.ok(
      await page.evaluate(() =>
        (window as TestWindow).__testStreams.every((stream) =>
          stream.getTracks().every((track) => track.readyState === "ended"),
        ),
      ),
    );

    await page.getByRole("button", { name: "开始录音", exact: true }).click();
    await expect(recorder).toHaveAttribute("data-phase", "recording", {
      timeout: 10000,
    });
    assert.ok(await page.evaluate(() => window.__workflowReview!.isMuted()));
    await page.waitForFunction(() => window.__workflowReview!.getFrame() > 15);
    await expect(recorder.locator('[data-active="true"]')).toHaveCount(1);
    await page.screenshot({
      path: join(output, "voice-recorder-recording.png"),
      fullPage: true,
    });
    await page.getByTestId("voice-take").waitFor({ timeout: 15000 });
    assert.ok(!(await page.evaluate(() => window.__workflowReview!.isMuted())));
    assert.ok(
      await page.evaluate(() =>
        (window as TestWindow).__testStreams.every((stream) =>
          stream.getTracks().every((track) => track.readyState === "ended"),
        ),
      ),
    );
    const download = page.waitForEvent("download");
    await page.getByRole("link", { name: "下载 WAV", exact: true }).click();
    assert.equal((await download).suggestedFilename(), "S0-1-voiceover.wav");
    await page.getByRole("button", { name: "跟画面试听", exact: true }).click();
    await expect(recorder).toHaveAttribute("data-phase", "audition");
    await expect(recorder).toHaveAttribute("data-phase", "idle", {
      timeout: 15000,
    });
    await save(page);
    const load = async () =>
      parseVoiceManifest(
        await (await fetch(`${url}/api/voiceover`)).json(),
        voiceoverProject,
      );
    let manifest = await load();
    assert.equal(manifest.tracks.length, 1);
    const first = manifest.tracks[0];
    assert.equal(first.scope, "S0-1");
    const firstScene = voiceoverProject.scenes!.find((scene) => scene.id === first.scope)!;
    assert.ok(first.durationInFrames >= firstScene.durationInFrames - 5 && first.durationInFrames <= firstScene.durationInFrames);
    const savedWave = await readFile(join(publicDir, first.src));
    inspectVoiceWave(savedWave);
    let energy = 0;
    for (let offset = 44; offset < savedWave.length; offset += 2)
      energy += Math.abs(savedWave.readInt16LE(offset));
    assert.ok(energy / ((savedWave.length - 44) / 2) > 10);
    assert.equal((await fetch(`${url}/${first.src}`)).status, 200);
    await page.reload({ waitUntil: "networkidle" });
    await page.getByTestId("saved-voice").waitFor();
    await shortRecording(page);
    await save(page);
    manifest = await load();
    assert.equal(manifest.tracks.length, 1);
    assert.notEqual(manifest.tracks[0].id, first.id);
    const retaken = manifest.tracks[0];
    assert.ok(existsSync(join(publicDir, first.src)));
    await page.getByRole("button", { name: "录下一段", exact: true }).click();
    await expect(range).toHaveValue("S0-2");
    await range.selectOption("full");
    await shortRecording(page);
    await save(page);
    manifest = await load();
    const shortFull = manifest.tracks.find((track) => track.scope === "full")!;
    assert.ok(shortFull && shortFull.startFrame === 0);
    await page
      .getByRole("button", { name: "完成本次录音", exact: true })
      .click();
    await range.selectOption("S0-1");
    await page.getByRole("button", { name: "移除配音", exact: true }).click();
    await page.getByTestId("saved-voice").waitFor({ state: "detached" });
    manifest = await load();
    assert.deepEqual(
      manifest.tracks.map((track) => track.scope),
      ["full"],
    );
    assert.ok(
      existsSync(join(publicDir, retaken.src)),
      "Removal keeps original WAV files",
    );
    await page.evaluate(() => window.__workflowReview!.seekTo(15));
    await page.waitForFunction(
      (src) =>
        [...document.querySelectorAll("audio")].some((audio) =>
          audio.src.endsWith(src),
        ),
      shortFull.src,
    );
    console.log(
      "PASS: fake-microphone recording, countdown/cancel, auto-stop, prompts, audition, WAV download, save/reload, retake, next shot, full-film recording and removal.",
    );

    assert.equal(
      (
        await fetch(`${url}/api/voiceover?scope=bad`, {
          method: "POST",
          body: savedWave,
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await fetch(`${url}/api/voiceover?scope=S0-1`, {
          method: "POST",
          body: "invalid",
        })
      ).status,
      400,
    );
    const denied = await context.newPage();
    await denied.addInitScript(() => {
      navigator.mediaDevices.getUserMedia = async () => {
        throw new DOMException("Denied", "NotAllowedError");
      };
    });
    await denied.goto(url, { waitUntil: "networkidle" });
    await denied.getByRole("button", { name: "开始录音", exact: true }).click();
    await denied
      .getByRole("alert")
      .filter({ hasText: "麦克风权限未开启" })
      .waitFor();
    await denied.close();
    await page.setViewportSize({ width: 390, height: 844 });
    await recorder.scrollIntoViewIfNeeded();
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    );
    await page.screenshot({
      path: join(output, "voice-recorder-mobile.png"),
      fullPage: true,
    });

    assert.equal(
      (
        await fetch(`${url}/api/voiceover?scope=full`, {
          method: "POST",
          body: wave(DURATION / FPS),
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await fetch(`${url}/api/voiceover?scope=S2-2`, {
          method: "POST",
          body: wave(1),
        })
      ).status,
      200,
    );
    manifest = await load();
    const full = manifest.tracks.find((track) => track.scope === "full")!;
    const retake = manifest.tracks.find((track) => track.scope === "S2-2")!;
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`${url}/?clean&frame=3600`, { waitUntil: "networkidle" });
    assert.equal(await recorder.count(), 0);
    assert.equal(
      await page
        .locator(".player-shell")
        .evaluate((element) =>
          Math.round(element.getBoundingClientRect().width),
        ),
      1920,
    );
    await page.addScriptTag({
      type: "module",
      url: `${url}/scripts/voiceover-chapter-fixture.tsx`,
    });
    await page.waitForFunction(() =>
      Boolean((window as TestWindow).__voiceoverChapter),
    );
    const checkAudio = async (source: string, time: number) => {
      await page.waitForFunction(
        ({ src, seconds }) =>
          [
            ...document.querySelectorAll<HTMLAudioElement>(
              "#chapter-fixture audio",
            ),
          ].some(
            (audio) =>
              audio.src.endsWith(src) &&
              Math.abs(audio.currentTime - seconds) < 1,
          ),
        { src: source, seconds: time },
      );
    };
    await page.evaluate(() =>
      (window as TestWindow).__voiceoverChapter!.play(),
    );
    await checkAudio(full.src, chapters[2].start + 20 / FPS);
    const chapterFrom = chapters[2].start * FPS;
    const retakeFrame =
      shots.find((shot) => shot.id === "S2-2")!.start * FPS - chapterFrom;
    await page.evaluate(
      (frame) => (window as TestWindow).__voiceoverChapter!.seek(frame),
      retakeFrame + 3,
    );
    await page.evaluate(() =>
      (window as TestWindow).__voiceoverChapter!.play(),
    );
    await checkAudio(retake.src, 0.1);
    const resumeFrame = shots.find((shot) => shot.id === "S2-3")!.start * FPS;
    await page.evaluate(
      (frame) => (window as TestWindow).__voiceoverChapter!.seek(frame),
      resumeFrame - chapterFrom + 3,
    );
    await page.evaluate(() =>
      (window as TestWindow).__voiceoverChapter!.play(),
    );
    await checkAudio(full.src, (resumeFrame + 3) / FPS);
    await page.waitForFunction(() =>
      [
        ...document.querySelectorAll<HTMLAudioElement>(
          "#chapter-fixture audio",
        ),
      ].some(
        (audio) =>
          audio.src.endsWith("sb_reverie.mp3") &&
          Math.abs(audio.volume - 0.045) < 0.002,
      ),
    );

    // The second music clip must use the full-film voice clock after the crossfade.
    await page.goto(`${url}/?clean&frame=6900`, { waitUntil: "networkidle" });
    await page.waitForFunction(() =>
      [...document.querySelectorAll("audio")].some(
        (audio) =>
          audio.src.endsWith("sb_reverie.mp3") &&
          Math.abs(audio.volume - 0.045) < 0.002,
      ),
    );
    await page.goto(url, { waitUntil: "networkidle" });
    await page.getByLabel("配乐与音效", { exact: true }).uncheck();
    await page.evaluate(() => window.__workflowReview!.seekTo(6 * 30));
    await page.waitForFunction(
      (src) =>
        [...document.querySelectorAll("audio")].some((audio) =>
          audio.src.endsWith(src),
        ),
      full.src,
    );
    assert.equal(
      await page.locator('audio[src$="sb_reverie.mp3"]').count(),
      0,
      "Music toggle must leave voice playback enabled",
    );
    assert.deepEqual(errors, []);
    await writeFile(
      join(output, "voiceover-check.json"),
      JSON.stringify(
        {
          passed: true,
          isolatedStorage: true,
          fakeMicrophone: true,
          recordingSlots: 39,
          prompts: 107,
          countdownCancel: true,
          autoStop: true,
          audition: true,
          wavDownload: true,
          saveReload: true,
          retake: true,
          fullFilm: true,
          removal: true,
          deniedPermission: true,
          mobile: true,
          cleanCanvas: true,
          studioManifestLoading: true,
          chapterOffsets: true,
          musicDucking: true,
          musicCrossfade: true,
          musicToggleKeepsVoice: true,
          errors,
        },
        null,
        2,
      ),
    );
    console.log(
      "PASS: invalid uploads, denied permission, mobile/clean layouts, Studio chapter loading/source offsets, music ducking across the crossfade and independent voice playback. User recordings untouched; no video rendered.",
    );
  } finally {
    await browser?.close();
    await server.close();
    const checked = resolve(workspace);
    assert.ok(
      checked.startsWith(cache + sep) && checked !== cache,
      "Cleanup must stay inside the test cache",
    );
    await rm(checked, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
