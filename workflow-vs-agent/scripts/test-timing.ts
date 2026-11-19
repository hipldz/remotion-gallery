import assert from 'node:assert/strict';
import {cp, mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {join, resolve, sep} from 'node:path';
import {chromium, expect, type Page} from '@playwright/test';
import {createServer} from 'vite';
import {voiceoverPlugin, inspectVoiceWave} from 'remotion-voiceover/server';
import {applyVoiceTimeline, getVoiceCaptions, parseVoiceManifest, type VoiceManifest} from 'remotion-voiceover/core';
import {voiceoverProject} from '../src/voiceover.config';
import {FPS} from '../src/data/theme';

const wave = (seconds: number, rate = 48000) => {
  const body = Buffer.alloc(44 + Math.round(seconds * rate) * 2);
  body.write('RIFF', 0); body.writeUInt32LE(body.length - 8, 4); body.write('WAVEfmt ', 8);
  body.writeUInt32LE(16, 16); body.writeUInt16LE(1, 20); body.writeUInt16LE(1, 22);
  body.writeUInt32LE(rate, 24); body.writeUInt32LE(rate * 2, 28); body.writeUInt16LE(2, 32); body.writeUInt16LE(16, 34);
  body.write('data', 36); body.writeUInt32LE(body.length - 44, 40);
  for (let at = 44; at < body.length; at += 2) body.writeInt16LE(Math.round(Math.sin((at - 44) / 2 / rate * Math.PI * 880) * 8000), at);
  return body;
};

async function fitsViewport(page: Page, width: number, height: number) {
  await page.setViewportSize({width, height});
  await page.waitForFunction(() => {
    const panel = document.querySelector('.voiceover-panel')!, recorder = document.querySelector('.voice-recorder')!;
    return panel.clientHeight > 0 && recorder.clientHeight > 0;
  });
  const geometry = await page.evaluate(() => {
    const panel = document.querySelector('.voiceover-panel')!, recorder = document.querySelector('.voice-recorder')!;
    const bounds = panel.getBoundingClientRect();
    return {pageWidth: document.documentElement.scrollWidth, pageHeight: document.documentElement.scrollHeight,
      panelBottom: bounds.bottom, panelHeight: panel.clientHeight, panelContent: panel.scrollHeight,
      recorderHeight: recorder.clientHeight, recorderContent: recorder.scrollHeight};
  });
  assert.ok(geometry.pageWidth <= width + 1, JSON.stringify(geometry));
  assert.ok(geometry.pageHeight <= height + 1, JSON.stringify(geometry));
  assert.ok(geometry.panelBottom <= height + 1, JSON.stringify(geometry));
  assert.ok(geometry.panelContent <= geometry.panelHeight + 1, JSON.stringify(geometry));
  assert.ok(geometry.recorderContent <= geometry.recorderHeight + 1, JSON.stringify(geometry));
}

async function main() {
  const cache = resolve('.cache'), output = resolve('build/review');
  await mkdir(cache, {recursive: true}); await mkdir(output, {recursive: true});
  const workspace = await mkdtemp(join(cache, 'voiceover-timing-'));
  const publicDir = join(workspace, 'public');
  await cp(resolve('public'), publicDir, {recursive: true});
  await mkdir(join(publicDir, 'narration'), {recursive: true});
  await writeFile(join(publicDir, 'narration/manifest.json'), '{"version":1,"tracks":[]}\n');
  const fakeMic = join(workspace, 'microphone.wav');
  await writeFile(fakeMic, wave(20));
  const server = await createServer({configFile: false, root: resolve('.'), publicDir,
    optimizeDeps: {force: true, include: ['react/jsx-runtime', 'react/jsx-dev-runtime']},
    plugins: [voiceoverPlugin({project: voiceoverProject, projectRoot: workspace})],
    server: {host: '127.0.0.1', port: 0, watch: {ignored: ['**/build/**', '**/.cache/**']}}});
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  let diagnosticPage: Page | undefined;
  const errors: string[] = [];
  try {
    await server.listen();
    const address = server.httpServer!.address();
    assert.ok(address && typeof address !== 'string');
    const origin = `http://127.0.0.1:${address.port}`;
    const seeded = await fetch(`${origin}/api/voiceover?scope=full`, {method: 'POST', body: new Uint8Array(wave(voiceoverProject.durationInFrames / FPS, 8000))});
    assert.equal(seeded.status, 200);
    const choices = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? [process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH] :
      ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].filter(existsSync);
    let launchError: unknown;
    for (const executablePath of [...choices, undefined]) {
      try {browser = await chromium.launch({headless: true, executablePath, args: [
        '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-audio-capture=${fakeMic}`,
      ]}); break;} catch (failure) {launchError = failure;}
    }
    if (!browser) throw launchError;
    const context = await browser.newContext({permissions: ['microphone'], viewport: {width: 1366, height: 768}});
    const page = await context.newPage();
    diagnosticPage = page;
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin, {waitUntil: 'networkidle'});
    await page.waitForFunction(() => window.__workflowReview?.ready);
    const recorder = page.getByTestId('voice-recorder');
    const scope = 'S0-1';
    await page.getByRole('combobox', {name: '录制范围'}).selectOption(scope);
    await expect(page.getByRole('combobox', {name: '录音时间方式'})).toHaveValue('reading');
    await fitsViewport(page, 1366, 768);

    // Create the exact 8-second subtitle from the reported real-world problem.
    await page.getByRole('button', {name: '编辑稿件与时长'}).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('spinbutton', {name: '片段时长（秒）', exact: true})).toHaveAttribute('step', 'any');
    while (await dialog.getByRole('button', {name: /删除第/}).count() > 1) {
      await dialog.getByRole('button', {name: /删除第/}).last().click();
    }
    const firstText = '这句字幕原计划八秒，我会按自己的节奏读完。';
    await dialog.getByRole('textbox', {name: '第 1 句正文'}).fill(firstText);
    await dialog.getByRole('spinbutton', {name: '第 1 句开始（秒）'}).fill('0');
    await dialog.getByRole('spinbutton', {name: '第 1 句持续（秒）'}).fill('8');
    await dialog.getByRole('spinbutton', {name: '片段时长（秒）', exact: true}).fill('8');
    await dialog.getByRole('button', {name: '保存字幕与时间'}).click();
    await expect(dialog).toHaveCount(0);
    const load = async (): Promise<VoiceManifest> => parseVoiceManifest(await (await fetch(`${origin}/api/voiceover`)).json(), voiceoverProject);
    const before = await load(), beforeProject = applyVoiceTimeline(voiceoverProject, before.timeline);
    assert.equal(beforeProject.scenes!.find(scene => scene.id === scope)!.durationInFrames, FPS * 8);

    await page.getByRole('button', {name: '开始录音', exact: true}).click();
    await expect(recorder).toHaveAttribute('data-phase', 'recording', {timeout: 10000});
    await page.waitForFunction(() => Number(document.querySelector('.voice-status strong')?.textContent?.replace('s', '')) > 10.1,
      undefined, {timeout: 15000});
    await expect(recorder).toHaveAttribute('data-phase', 'recording');
    assert.ok(await page.evaluate(() => window.__workflowReview!.getFrame()) < FPS * 8, 'Picture holds while the speaker finishes');
    await expect(page.getByLabel('朗读稿')).toContainText(firstText);
    await page.getByRole('button', {name: '停止录音', exact: true}).click();
    await page.getByTestId('voice-take').waitFor();
    for (const [width, height] of [[1280, 720], [1366, 768], [1440, 900], [1920, 1080], [390, 844]]) {
      await fitsViewport(page, width, height);
    }
    await page.setViewportSize({width: 1366, height: 768});
    await page.screenshot({path: join(output, 'voice-timing-desktop.png')});
    await page.getByRole('button', {name: '跟画面试听', exact: true}).click();
    await expect(recorder).toHaveAttribute('data-phase', 'audition');
    await expect(recorder).toHaveAttribute('data-phase', 'idle', {timeout: 15000});
    await page.getByRole('button', {name: '保存并使用', exact: true}).click();
    await page.getByRole('button', {name: '已保存并使用', exact: true}).waitFor();
    const saved = await load(), savedProject = applyVoiceTimeline(voiceoverProject, saved.timeline);
    const take = saved.tracks.find(track => track.scope === scope)!;
    assert.ok(take.durationInFrames >= FPS * 10);
    const actualWave = inspectVoiceWave(await readFile(join(publicDir, take.src)));
    assert.ok(actualWave.duration >= 10, 'The WAV must contain all speech past eight seconds');
    const extra = savedProject.durationInFrames - beforeProject.durationInFrames;
    assert.equal(extra, take.durationInFrames - FPS * 8);
    assert.equal(savedProject.scenes![1].from - beforeProject.scenes![1].from, extra);
    assert.equal(getVoiceCaptions(scope, savedProject)[0].endFrame, take.durationInFrames);
    console.log('PASS: an 8-second cue records over 10 seconds, holds the picture, saves the full WAV and ripples following scenes.');

    await page.reload({waitUntil: 'networkidle'});
    await page.getByTestId('saved-voice').waitFor();
    const metadata = await page.evaluate(async origin => {
      const module = await import(`${origin}/src/voiceover.metadata.ts`);
      const result = await module.calculateVoiceoverMetadata({props: {showSubtitles: true, audio: true},
        defaultProps: {showSubtitles: true, audio: true}, abortSignal: new AbortController().signal,
        compositionId: 'WorkflowVsAgent', isRendering: false});
      return {duration: result.durationInFrames, timeline: result.props.voiceProject, tracks: result.props.voiceTracks};
    }, origin);
    assert.equal(metadata.duration, savedProject.durationInFrames);
    assert.equal(metadata.tracks.find((track: {scope: string}) => track.scope === scope).durationInFrames, take.durationInFrames);
    const full = saved.tracks.find(track => track.scope === 'full')!;
    const sourceSceneEnd = beforeProject.scenes![0].from + beforeProject.scenes![0].durationInFrames;
    assert.equal(full.spans!.find(span => span.from === savedProject.scenes![1].from)!.trimBefore, sourceSceneEnd);
    await page.evaluate(frame => window.__workflowReview!.seekTo(frame), savedProject.scenes![1].from + 3);
    await page.evaluate(() => window.__workflowReview!.play());
    await page.waitForFunction(({src, seconds}) => [...document.querySelectorAll('audio')].some(audio =>
      audio.src.endsWith(src) && !audio.paused && Math.abs(audio.currentTime - seconds) < .4),
      {src: full.src, seconds: (sourceSceneEnd + 3) / FPS});
    await page.evaluate(() => window.__workflowReview!.pause());
    await page.evaluate(frame => window.__workflowReview!.seekTo(frame), FPS * 9);
    await expect(page.locator('.player-shell').getByText(firstText, {exact: true})).toBeVisible();

    // Add another subtitle without recording again, then check SRT and persistence.
    await page.getByRole('button', {name: '编辑稿件与时长'}).click();
    await dialog.getByRole('button', {name: '＋ 增加一句字幕'}).click();
    const addedText = '这里可以补充一句新的口播字幕。';
    await dialog.getByRole('textbox', {name: '第 2 句正文'}).fill(addedText);
    await dialog.getByRole('spinbutton', {name: '第 2 句持续（秒）'}).fill('3.067');
    await dialog.getByRole('button', {name: '保存字幕与时间'}).click();
    await expect(dialog).toHaveCount(0);
    const withAddition = await load(), addedProject = applyVoiceTimeline(voiceoverProject, withAddition.timeline);
    assert.equal(getVoiceCaptions(scope, addedProject).length, 2);
    assert.equal(getVoiceCaptions(scope, addedProject)[1].text, addedText);
    assert.equal(getVoiceCaptions(scope, addedProject)[1].endFrame - getVoiceCaptions(scope, addedProject)[1].startFrame, Math.round(3.067 * FPS));
    assert.equal(withAddition.tracks.find(track => track.scope === scope)!.src, take.src);
    const downloaded = page.waitForEvent('download');
    await page.getByRole('link', {name: '下载 SRT ↗'}).click();
    const download = await downloaded, file = await download.path();
    assert.ok(file);
    const srt = await readFile(file, 'utf8');
    assert.ok(srt.includes(addedText));
    assert.ok(srt.includes('00:00:10,'), 'Export must use actual spoken timestamps');
    await page.evaluate(frame => window.__workflowReview!.seekTo(frame), getVoiceCaptions(scope, addedProject)[1].startFrame + 2);
    await expect(page.locator('.player-shell').getByText(addedText, {exact: true})).toBeVisible();
    await page.setViewportSize({width: 1366, height: 768});
    await page.getByRole('button', {name: '编辑稿件与时长'}).click();
    await page.screenshot({path: join(output, 'voice-script-editor.png')});
    await page.getByRole('button', {name: '关闭稿件编辑'}).click();
    await page.getByRole('button', {name: '开始录音', exact: true}).click();
    await expect(recorder).toHaveAttribute('data-phase', 'recording', {timeout: 10000});
    await page.waitForFunction(() => Number(document.querySelector('.voice-status strong')?.textContent?.replace('s', '')) > .4);
    await page.getByRole('button', {name: '读完，下一句'}).click();
    await expect(page.getByLabel('朗读稿')).toContainText(addedText);
    await page.waitForFunction(() => Number(document.querySelector('.voice-status strong')?.textContent?.replace('s', '')) > .8);
    await page.keyboard.press('Space');
    await page.getByTestId('voice-take').waitFor();
    await expect(recorder).toHaveAttribute('data-phase', 'idle');
    await page.getByRole('button', {name: '放弃这次'}).click();
    assert.deepEqual(errors, []);
    await writeFile(join(output, 'voice-timing-check.json'), JSON.stringify({passed: true, isolatedStorage: true,
      overlongRecording: true, actualSeconds: actualWave.duration, rippleFrames: extra, metadataDuration: metadata.duration,
      scriptEditing: true, addedCaptions: true, updatedSrt: true, sentenceShortcut: true, existingAudioOffsets: true,
      viewportSizes: ['1280×720', '1366×768', '1440×900', '1920×1080', '390×844'], errors}, null, 2));
    console.log('PASS: viewport fits, audition, reload, Studio/render metadata, added subtitles and updated SRT. User recordings untouched.');
  } catch (failure) {
    if (diagnosticPage) {
      await diagnosticPage.screenshot({path: join(output, 'voice-timing-failure.png')}).catch(() => undefined);
      console.error('Timing test browser errors:', errors);
      console.error('Timing test alerts:', await diagnosticPage.getByRole('alert').allTextContents().catch(() => []));
    }
    throw failure;
  } finally {
    await browser?.close(); await server.close();
    const checked = resolve(workspace);
    assert.ok(checked.startsWith(cache + sep) && checked !== cache);
    await rm(checked, {recursive: true, force: true});
  }
}
main().catch(error => {console.error(error); process.exitCode = 1;});
