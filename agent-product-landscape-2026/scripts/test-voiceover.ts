import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { chromium, expect } from '@playwright/test';
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
  await writeFile(fakeMic, wave(20, 48000));
  const server = await createServer({
    configFile: false,
    root: resolve('.'),
    publicDir,
    plugins: [projectAssetsPlugin(publicDir)],
    server: { host: '127.0.0.1', port: 0 },
  });
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
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
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__agentReview?.ready);
    const recorder = page.getByTestId('voice-recorder');
    await expect(recorder).toBeVisible();
    const range = page.getByRole('combobox', { name: '录制范围' });
    assert.equal(await range.locator('option').count(), 32);
    assert.equal(await range.inputValue(), 'P01');
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
    await page.getByTestId('voice-take').waitFor({ timeout: 15000 });
    assert.ok(!(await page.evaluate(() => window.__agentReview!.isMuted())));
    assert.ok(
      await page.evaluate(() => (window as TestWindow).__testStreams.every((stream) => stream.getTracks().every((track) => track.readyState === 'ended'))),
    );
    const download = page.waitForEvent('download');
    await page.getByRole('link', { name: '下载 WAV', exact: true }).click();
    assert.equal((await download).suggestedFilename(), 'P01-voiceover.wav');
    await page.getByRole('button', { name: '跟画面试听', exact: true }).click();
    await expect(recorder).toHaveAttribute('data-phase', 'audition');
    await expect(recorder).toHaveAttribute('data-phase', 'idle', { timeout: 20000 });
    await page.getByRole('button', { name: '保存并使用', exact: true }).click();
    await page.getByRole('button', { name: '已保存并使用', exact: true }).waitFor();
    const project = createVoiceoverProject(baseTimeline);
    const load = async () => parseVoiceManifest(await (await fetch(`${url}/api/voiceover`)).json(), project);
    let manifest = await load();
    assert.equal(manifest.tracks.length, 1);
    const first = manifest.tracks[0];
    assert.equal(first.scope, 'P01');
    assert.ok(first.durationInFrames >= 175 && first.durationInFrames <= 180);
    const savedWave = await readFile(join(publicDir, first.src));
    inspectVoiceWave(savedWave);
    let energy = 0;
    for (let offset = 44; offset < savedWave.length; offset += 2) energy += Math.abs(savedWave.readInt16LE(offset));
    assert.ok(energy / ((savedWave.length - 44) / 2) > 10);
    assert.equal((await fetch(`${url}/${first.src}`)).status, 200, 'New recordings must be served without a Vite reload');
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByTestId('saved-voice').waitFor();
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
    await expect(range).toHaveValue('P02');
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
    const tooLong = await fetch(`${url}/api/voiceover?scope=P01`, { method: 'POST', body: wave(7) });
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
    assert.equal((await fetch(`${url}/api/voiceover?scope=full`, { method: 'POST', body: wave(project.durationInFrames / 30) })).status, 200);
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
          invalidUploadsRejected: true,
          deniedPermission: true,
          mobile: true,
          cleanCanvas: true,
          studioManifestLoading: true,
          chapterOffsets: true,
          errors,
        },
        null,
        2,
      ),
    );
    console.log(
      'PASS: invalid uploads, permission denial, mobile layout, clean canvas, Studio-style manifest loading, chapter audio/source offsets. User recordings untouched; no video rendered.',
    );
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
