import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { chromium, expect, type Page } from '@playwright/test';
import { createServer } from 'vite';
import { inspectVoiceWave } from 'remotion-voiceover/server';
import { parseVoiceManifest } from 'remotion-voiceover/core';
import { baseTimeline } from '../src/lib/timeline';
import { createVoiceoverProject } from '../src/voiceover.config';
import { projectAssetsPlugin } from '../vite.config';

type TestWindow = typeof window & {
  __testStreams: MediaStream[];
  __voiceoverChapter?: { play: () => void; seek: (frame: number) => void };
};

function wave(seconds: number, rate = 8000) {
  const samples = Math.round(seconds * rate);
  const body = Buffer.alloc(44 + samples * 2);
  body.write('RIFF', 0);
  body.writeUInt32LE(body.length - 8, 4);
  body.write('WAVEfmt ', 8);
  body.writeUInt32LE(16, 16);
  body.writeUInt16LE(1, 20);
  body.writeUInt16LE(1, 22);
  body.writeUInt32LE(rate, 24);
  body.writeUInt32LE(rate * 2, 28);
  body.writeUInt16LE(2, 32);
  body.writeUInt16LE(16, 34);
  body.write('data', 36);
  body.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++) body.writeInt16LE(Math.round(Math.sin((i / rate) * Math.PI * 880) * 7000), 44 + i * 2);
  return body;
}

async function main() {
  const firstShot = baseTimeline.find((shot) => shot.id === 'P01')!;
  const firstShotSeconds = firstShot.duration / 30;
  const firstShotTimeout = firstShotSeconds * 1000 + 5000;
  const cache = resolve('.cache');
  const output = resolve('build/review');
  await mkdir(cache, { recursive: true });
  await mkdir(output, { recursive: true });
  const workspace = await mkdtemp(join(cache, 'voiceover-e2e-'));
  // Every test recording is saved to this copy, never to the user's public dir.
  const publicDir = join(workspace, 'public');
  await cp(resolve('public'), publicDir, { recursive: true });
  // Existing imported VO would change the edit, so keep this fixture deterministic.
  const copiedVo = resolve(publicDir, 'vo');
  assert.ok(copiedVo.startsWith(resolve(cache) + sep) && copiedVo.startsWith(resolve(workspace) + sep));
  await rm(copiedVo, { recursive: true, force: true });
  await mkdir(join(publicDir, 'vo'));
  await mkdir(join(publicDir, 'narration'), { recursive: true });
  await writeFile(join(publicDir, 'narration/manifest.json'), '{"version":1,"tracks":[]}\n');
  const fakeMic = join(workspace, 'fake-microphone.wav');
  await writeFile(fakeMic, wave(firstShotSeconds + 5, 48000));
  const server = await createServer({
    configFile: false,
    root: resolve('.'),
    publicDir,
    plugins: [projectAssetsPlugin(publicDir)],
    optimizeDeps: { include: ['react/jsx-runtime', 'react/jsx-dev-runtime'] },
    server: { host: '127.0.0.1', port: 0 },
  });
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  let diagnosticPage: Page | undefined;
  const errors: string[] = [];
  try {
    await server.listen();
    const address = server.httpServer!.address();
    assert.ok(address && typeof address !== 'string');
    const url = `http://127.0.0.1:${address.port}`;
    const executables: (string | undefined)[] = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? [process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH]
      : ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].filter(existsSync);
    if (!process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) executables.push(undefined);
    let launchError: unknown;
    for (const executablePath of executables) {
      try {
        browser = await chromium.launch({
          headless: true,
          executablePath,
          args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-audio-capture=${fakeMic}`],
        });
        break;
      } catch (error) {
        launchError = error;
      }
    }
    if (!browser) throw launchError;
    const context = await browser.newContext({ permissions: ['microphone'], viewport: { width: 1800, height: 1100 } });
    await context.addInitScript(() => {
      const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      (window as TestWindow).__testStreams = [];
      navigator.mediaDevices.getUserMedia = async (options) => {
        const stream = await original(options);
        (window as TestWindow).__testStreams.push(stream);
        return stream;
      };
    });
    const page = await context.newPage();
    diagnosticPage = page;
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__agentReview?.ready);
    const recorder = page.getByTestId('voice-recorder');
    await expect(recorder).toBeVisible();
    const range = page.getByRole('combobox', { name: '录制范围' });
    assert.equal(await range.locator('option').count(), baseTimeline.filter((shot) => shot.narration).length + 1);
    assert.equal(await range.inputValue(), 'P01');
    const timingMode = page.getByRole('combobox', { name: '录音时间方式' });
    await expect(timingMode).toHaveValue('reading');
    await expect(page.getByRole('button', { name: '编辑稿件与时长', exact: true })).toBeEnabled();
    // Keep legacy coverage for auto-stop, then exercise V2 reading separately.
    await timingMode.selectOption('fixed');
    assert.equal(await page.evaluate(() => (window as TestWindow).__testStreams.length), 0);
    await page.screenshot({ path: join(output, 'voice-recorder-desktop.png'), fullPage: true });

    await page.getByRole('button', { name: '开始录音', exact: true }).click();
    await expect(recorder).toHaveAttribute('data-phase', 'countdown');
    await expect(page.getByRole('button', { name: '下一镜 →', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: '取消录音', exact: true }).click();
    await expect(recorder).toHaveAttribute('data-phase', 'idle');
    assert.equal(await page.getByTestId('voice-take').count(), 0);
    assert.ok(
      await page.evaluate(() => (window as TestWindow).__testStreams.every((stream) => stream.getTracks().every((track) => track.readyState === 'ended'))),
    );

    await page.getByRole('button', { name: '开始录音', exact: true }).click();
    await expect(recorder).toHaveAttribute('data-phase', 'recording', { timeout: 10000 });
    assert.ok(await page.evaluate(() => window.__agentReview!.isMuted()));
    await page.waitForFunction(() => window.__agentReview!.getFrame() > 15);
    await expect(recorder.locator('[data-active="true"]')).toHaveCount(1);
    await page.screenshot({ path: join(output, 'voice-recorder-recording.png'), fullPage: true });
    await page.getByTestId('voice-take').waitFor({ timeout: firstShotTimeout });
    assert.ok(!(await page.evaluate(() => window.__agentReview!.isMuted())));
    assert.ok(
      await page.evaluate(() => (window as TestWindow).__testStreams.every((stream) => stream.getTracks().every((track) => track.readyState === 'ended'))),
    );
    const download = page.waitForEvent('download');
    await page.getByRole('link', { name: '下载 WAV', exact: true }).click();
    assert.equal((await download).suggestedFilename(), 'P01-voiceover.wav');
    await page.getByRole('button', { name: '跟画面试听', exact: true }).click();
    await expect(recorder).toHaveAttribute('data-phase', 'audition');
    await expect(recorder).toHaveAttribute('data-phase', 'idle', { timeout: firstShotTimeout });
    await page.getByRole('button', { name: '保存并使用', exact: true }).click();
    await page.getByRole('button', { name: '已保存并使用', exact: true }).waitFor();
    const project = createVoiceoverProject(baseTimeline);
    const load = async () => parseVoiceManifest(await (await fetch(`${url}/api/voiceover`)).json(), project);
    let manifest = await load();
    assert.equal(manifest.tracks.length, 1);
    const first = manifest.tracks[0];
    assert.equal(first.scope, 'P01');
    assert.ok(first.durationInFrames >= firstShot.duration - 5 && first.durationInFrames <= firstShot.duration);
    const savedWave = await readFile(join(publicDir, first.src));
    inspectVoiceWave(savedWave);
    let energy = 0;
    for (let offset = 44; offset < savedWave.length; offset += 2) energy += Math.abs(savedWave.readInt16LE(offset));
    assert.ok(energy / ((savedWave.length - 44) / 2) > 10);
    assert.equal((await fetch(`${url}/${first.src}`)).status, 200, 'New recordings must be served without a Vite reload');
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByTestId('saved-voice').waitFor();
    await timingMode.selectOption('fixed');
    await page.screenshot({ path: join(output, 'voice-recorder-saved.png'), fullPage: true });
    await page.getByRole('button', { name: '开始录音', exact: true }).click();
    await expect(recorder).toHaveAttribute('data-phase', 'recording', { timeout: 10000 });
    await page.waitForFunction(() => window.__agentReview!.getFrame() > 30);
    await page.getByRole('button', { name: '停止录音', exact: true }).click();
    await page.getByTestId('voice-take').waitFor();
    await page.getByRole('button', { name: '保存并使用', exact: true }).click();
    await page.getByRole('button', { name: '已保存并使用', exact: true }).waitFor();
    manifest = await load();
    assert.equal(manifest.tracks.length, 1);
    assert.notEqual(manifest.tracks[0].id, first.id);
    assert.ok(existsSync(join(publicDir, first.src)), 'Retakes preserve original WAV files');
    await page.getByRole('button', { name: '录下一段', exact: true }).click();
    await expect(range).toHaveValue(baseTimeline.filter((shot) => shot.narration)[1].id);
    await range.selectOption('full');
    await page.getByRole('button', { name: '开始录音', exact: true }).click();
    await expect(recorder).toHaveAttribute('data-phase', 'recording', { timeout: 10000 });
    await page.waitForFunction(() => window.__agentReview!.getFrame() > 30);
    await page.getByRole('button', { name: '停止录音', exact: true }).click();
    await page.getByTestId('voice-take').waitFor();
    await page.getByRole('button', { name: '保存并使用', exact: true }).click();
    await page.getByRole('button', { name: '已保存并使用', exact: true }).waitFor();
    manifest = await load();
    assert.ok(manifest.tracks.some((track) => track.scope === 'full' && track.startFrame === 0));
    assert.ok(manifest.tracks.some((track) => track.scope === 'P01'));
    console.log(
      'PASS: countdown/cancel, real audio samples from fake microphone, auto-stop, synchronized audition, download, save/reload, retake, next shot, full-film recording.',
    );

    const badScope = await fetch(`${url}/api/voiceover?scope=../bad`, { method: 'POST', body: savedWave });
    assert.equal(badScope.status, 400);
    const badAudio = await fetch(`${url}/api/voiceover?scope=P02`, { method: 'POST', body: 'invalid audio' });
    assert.equal(badAudio.status, 400);
    const tooLong = await fetch(`${url}/api/voiceover?scope=P01`, { method: 'POST', body: wave(firstShotSeconds + 1) });
    assert.equal(tooLong.status, 400);
    const denied = await context.newPage();
    await denied.addInitScript(() => {
      navigator.mediaDevices.getUserMedia = async () => {
        throw new DOMException('Denied', 'NotAllowedError');
      };
    });
    await denied.goto(url, { waitUntil: 'networkidle' });
    await denied.getByRole('button', { name: '开始录音', exact: true }).click();
    await denied.getByRole('alert').filter({ hasText: '麦克风权限未开启' }).waitFor();
    await denied.close();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'networkidle' });
    await recorder.scrollIntoViewIfNeeded();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    await page.screenshot({ path: join(output, 'voice-recorder-mobile.png'), fullPage: true });
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`${url}/?clean`, { waitUntil: 'networkidle' });
    assert.equal(await recorder.count(), 0);
    assert.equal(await page.locator('.player-surface').evaluate((element) => Math.round(element.getBoundingClientRect().width)), 1920);

    // This Player receives no voiceTracks, as in Studio. Verify manifest loading
    // and source offsets when the entire film is cropped to an independent chapter.
    // Save a full-length, 48 kHz take for the final 7–8 minute edit.
    // Use Playwright's request client for large binary fixtures on Windows.
    const longFilmWave = wave(project.durationInFrames / 30, 48000);
    assert.equal(Math.round(inspectVoiceWave(longFilmWave).duration * 30), project.durationInFrames);
    const fullUpload = await page.request.post(`${url}/api/voiceover?scope=full`, { data: longFilmWave, timeout: 60000 });
    assert.equal(fullUpload.status(), 200, await fullUpload.text());
    assert.equal((await fetch(`${url}/api/voiceover?scope=C01`, { method: 'POST', body: wave(1) })).status, 200);
    manifest = await load();
    const full = manifest.tracks.find((track) => track.scope === 'full')!;
    const retake = manifest.tracks.find((track) => track.scope === 'C01')!;
    await page.addScriptTag({ type: 'module', url: `${url}/scripts/voiceover-chapter-fixture.tsx` });
    await page.waitForFunction(() => Boolean((window as TestWindow).__voiceoverChapter));
    const chapterFrom = baseTimeline.find((shot) => shot.id === 'C00')!.from;
    const checkAudio = async (src: string, expectedTime: number) => {
      await page.waitForFunction(
        ({ source, time }) =>
          [...document.querySelectorAll<HTMLAudioElement>('#chapter-fixture audio')].some(
            (audio) => audio.src.endsWith(source) && Math.abs(audio.currentTime - time) < 1,
          ),
        { source: src, time: expectedTime },
      );
    };
    await page.evaluate(() => (window as TestWindow).__voiceoverChapter!.play());
    await checkAudio(full.src, (chapterFrom + 20) / 30);
    const retakeFrame = baseTimeline.find((shot) => shot.id === 'C01')!.from - chapterFrom;
    await page.evaluate((frame) => (window as TestWindow).__voiceoverChapter!.seek(frame), retakeFrame + 3);
    await page.evaluate(() => (window as TestWindow).__voiceoverChapter!.play());
    await checkAudio(retake.src, 0.1);
    const resumeFrame = baseTimeline.find((shot) => shot.id === 'C02')!.from;
    await page.evaluate((frame) => (window as TestWindow).__voiceoverChapter!.seek(frame), resumeFrame - chapterFrom + 3);
    await page.evaluate(() => (window as TestWindow).__voiceoverChapter!.play());
    await checkAudio(full.src, (resumeFrame + 3) / 30);
    await page.waitForFunction(() => {
      const music = [...document.querySelectorAll<HTMLAudioElement>('#chapter-fixture audio')].find((audio) => audio.src.endsWith('/audio/music.mp3'));
      return music && Math.abs(music.volume - 0.2) < 0.00001;
    });

    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__agentReview?.ready);
    await range.selectOption('P01');
    await page.getByRole('button', { name: '编辑稿件与时长', exact: true }).click();
    const dialog = page.getByRole('dialog');
    while (await dialog.getByRole('button', { name: /^删除第/ }).count()) {
      await dialog
        .getByRole('button', { name: /^删除第/ })
        .first()
        .click();
    }
    await dialog.getByRole('button', { name: '＋ 增加一句字幕', exact: true }).click();
    const editedText = '这是升级后按朗读节奏录制的字幕。';
    await dialog.getByRole('textbox', { name: '第 1 句正文', exact: true }).fill(editedText);
    await dialog.getByRole('spinbutton', { name: '第 1 句持续（秒）', exact: true }).fill('1');
    await dialog.getByRole('spinbutton', { name: '片段时长（秒）', exact: true }).fill('1.2');
    await dialog.getByRole('button', { name: '保存字幕与时间', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await page.waitForFunction(() => window.__agentReview!.timeline[0].duration === 36);
    manifest = await load();
    assert.equal(manifest.timeline!.captions![0].text, editedText);
    assert.equal(manifest.timeline!.durationInFrames, project.durationInFrames - firstShot.duration + 36);
    await expect(timingMode).toHaveValue('reading');
    await page.getByRole('button', { name: '开始录音', exact: true }).click();
    await expect(recorder).toHaveAttribute('data-phase', 'recording', { timeout: 10000 });
    await page.waitForTimeout(2200);
    await expect(recorder).toHaveAttribute('data-phase', 'recording');
    await page.getByRole('button', { name: '停止录音', exact: true }).click();
    await page.getByTestId('voice-take').waitFor();
    const extendedFrames = await page.evaluate(() => window.__agentReview!.timeline[0].duration);
    assert.ok(extendedFrames > 36, 'Reading continues past the planned cut');
    await page.getByRole('button', { name: '保存并使用', exact: true }).click();
    await page.getByRole('button', { name: '已保存并使用', exact: true }).waitFor();
    manifest = await load();
    assert.equal(manifest.timeline!.scenes![0].durationInFrames, extendedFrames);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction((frames) => window.__agentReview?.timeline[0].duration === frames, extendedFrames);
    await page.evaluate(() => window.__agentReview!.seekTo(10));
    await expect(page.locator('[data-film-caption="P01"]')).toHaveText(editedText);
    await page.screenshot({ path: join(output, 'voice-recorder-v2.png'), fullPage: true });
    // The chapter fixture loads the same saved project used by Studio metadata.
    await page.addScriptTag({ type: 'module', url: `${url}/scripts/voiceover-chapter-fixture.tsx?v2` });
    await page.waitForFunction(() => Boolean((window as TestWindow).__voiceoverChapter));
    const chapterDelta = extendedFrames - firstShot.duration;
    await page.evaluate(() => (window as TestWindow).__voiceoverChapter!.play());
    await checkAudio(full.src, (chapterFrom + 20) / 30);
    assert.equal(manifest.timeline!.scenes!.find((scene) => scene.id === 'C00')!.from, chapterFrom + chapterDelta);
    assert.deepEqual(errors, []);
    await writeFile(
      join(output, 'voiceover-check.json'),
      JSON.stringify(
        {
          passed: true,
          isolatedStorage: true,
          fakeMicrophone: true,
          autoStop: true,
          audition: true,
          wavDownload: true,
          saveReload: true,
          retake: true,
          fullFilm: true,
          longFilmUploadBytes: longFilmWave.length,
          fullLength48KhzUpload: true,
          invalidUploadsRejected: true,
          deniedPermission: true,
          mobile: true,
          cleanCanvas: true,
          studioManifestLoading: true,
          chapterOffsets: true,
          constantBackgroundMusic: true,
          readingPastCut: true,
          scriptEditing: true,
          editedTimelineReload: true,
          editedChapterOffsets: true,
          errors,
        },
        null,
        2,
      ),
    );
    console.log(
      'PASS: invalid uploads, permission denial, mobile layout, clean canvas, Studio-style manifest loading, chapter offsets, V2 script edits, reading past cuts, and edited timeline reload. User recordings untouched; no video rendered.',
    );
  } catch (failure) {
    await diagnosticPage?.screenshot({ path: join(output, 'voice-recorder-failure.png'), fullPage: true }).catch(() => undefined);
    console.error('Voiceover test browser errors:', errors);
    console.error(
      'Voiceover test alerts:',
      await diagnosticPage
        ?.getByRole('alert')
        .allTextContents()
        .catch(() => []),
    );
    throw failure;
  } finally {
    await browser?.close();
    await server.close();
    const checked = resolve(workspace);
    assert.ok(checked.startsWith(cache + sep) && checked !== cache, 'Test cleanup must remain inside .cache');
    await rm(checked, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
