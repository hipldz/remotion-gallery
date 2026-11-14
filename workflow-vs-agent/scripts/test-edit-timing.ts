import assert from 'node:assert/strict';
import {cp, mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {join, resolve, sep} from 'node:path';
import {chromium, expect, type Page} from '@playwright/test';
import {createServer} from 'vite';
import {voiceoverPlugin} from 'remotion-voiceover/server';
import {applyVoiceTimeline, defineVoiceoverProject, getVoiceCaptions, parseVoiceManifest, resizeVoiceRange,
  voiceTimeline, type VoiceManifest, type VoiceoverProject} from 'remotion-voiceover/core';
import {voiceoverProject} from '../src/voiceover.config';
import {FPS} from '../src/data/theme';

const wave = (frames: number) => {
  const rate = 8000, body = Buffer.alloc(44 + Math.round(frames / FPS * rate) * 2);
  body.write('RIFF', 0); body.writeUInt32LE(body.length - 8, 4); body.write('WAVEfmt ', 8);
  body.writeUInt32LE(16, 16); body.writeUInt16LE(1, 20); body.writeUInt16LE(1, 22);
  body.writeUInt32LE(rate, 24); body.writeUInt32LE(rate * 2, 28); body.writeUInt16LE(2, 32); body.writeUInt16LE(16, 34);
  body.write('data', 36); body.writeUInt32LE(body.length - 44, 40);
  return body;
};

async function metadata(page: Page, origin: string) {
  return page.evaluate(async origin => {
    const module = await import(`${origin}/src/voiceover.metadata.ts`);
    const result = await module.calculateVoiceoverMetadata({props: {showSubtitles: true, audio: true},
      defaultProps: {showSubtitles: true, audio: true}, abortSignal: new AbortController().signal,
      compositionId: 'WorkflowVsAgent', isRendering: false});
    return {duration: result.durationInFrames, project: result.props.voiceProject};
  }, origin);
}

async function main() {
  const cache = resolve('.cache'), output = resolve('build/review');
  await mkdir(cache, {recursive: true}); await mkdir(output, {recursive: true});
  const workspace = await mkdtemp(join(cache, 'voiceover-edit-'));
  const publicDir = join(workspace, 'public'), originalNarration = resolve('public/narration');
  await cp(resolve('public'), publicDir, {recursive: true,
    filter: source => source !== originalNarration && !source.startsWith(originalNarration + sep)});
  await mkdir(join(publicDir, 'narration'), {recursive: true});
  await writeFile(join(publicDir, 'narration/manifest.json'), '{"version":1,"tracks":[]}\n');
  const firstId = voiceoverProject.scenes![0].id, secondId = voiceoverProject.scenes![1].id;
  let baseline = resizeVoiceRange(voiceoverProject, firstId, 11 * FPS);
  baseline = resizeVoiceRange(baseline, secondId, 3 * FPS);
  const secondStart = baseline.scenes![1].from;
  baseline = defineVoiceoverProject({...baseline, captions: [
    ...baseline.captions!.filter(cue => cue.sceneId !== firstId && cue.sceneId !== secondId),
    {sceneId: firstId, startFrame: 0, endFrame: 8 * FPS, text: '第一句需要八秒。'},
    {sceneId: firstId, startFrame: 8 * FPS, endFrame: 11 * FPS, text: '第二句需要三秒。'},
    {sceneId: secondId, startFrame: secondStart, endFrame: secondStart + 3 * FPS, text: '第二个镜头的口播。'},
  ]});
  const server = await createServer({configFile: false, root: resolve('.'), publicDir,
    optimizeDeps: {force: true, include: ['react/jsx-runtime', 'react/jsx-dev-runtime']},
    plugins: [voiceoverPlugin({project: voiceoverProject, projectRoot: workspace})],
    server: {host: '127.0.0.1', port: 0, watch: {ignored: ['**/build/**', '**/.cache/**']}}});
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined, page: Page | undefined;
  const errors: string[] = [];
  try {
    await server.listen();
    const address = server.httpServer!.address();
    assert.ok(address && typeof address !== 'string');
    const origin = `http://127.0.0.1:${address.port}`;
    const patch = await fetch(`${origin}/api/voiceover`, {method: 'PATCH', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({timeline: voiceTimeline(baseline), expectedTimeline: voiceTimeline(voiceoverProject)})});
    assert.equal(patch.status, 200, await patch.text());
    for (const [scope, frames] of [['full', baseline.durationInFrames], [secondId, 3 * FPS]] as const) {
      const seeded = await fetch(`${origin}/api/voiceover?scope=${scope}`, {method: 'POST', body: new Uint8Array(wave(frames))});
      assert.equal(seeded.status, 200);
    }
    const load = async (): Promise<VoiceManifest> => parseVoiceManifest(await (await fetch(`${origin}/api/voiceover`)).json(), voiceoverProject);
    const before = await load();
    const fullSource = before.tracks.find(track => track.scope === 'full')!;
    const nextSource = before.tracks.find(track => track.scope === secondId)!;
    const choices = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? [process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH] :
      ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].filter(existsSync);
    let launchError: unknown;
    for (const executablePath of [...choices, undefined]) {
      try {browser = await chromium.launch({headless: true, executablePath}); break;} catch (failure) {launchError = failure;}
    }
    if (!browser) throw launchError;
    page = await browser.newPage({viewport: {width: 1366, height: 768}});
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin, {waitUntil: 'networkidle'});
    await page.waitForFunction(() => window.__workflowReview?.ready);
    await page.getByRole('combobox', {name: '录制范围'}).selectOption(firstId);
    const dialog = page.getByRole('dialog');
    const open = async () => {await page!.getByRole('button', {name: '编辑稿件与时长'}).click();};
    const save = async () => {
      await dialog.getByRole('button', {name: '保存字幕与时间'}).click();
      await expect(dialog).toHaveCount(0);
      return applyVoiceTimeline(voiceoverProject, (await load()).timeline);
    };
    const assertRipple = async (project: VoiceoverProject, frames: number) => {
      assert.equal(project.scenes![0].durationInFrames, 11 * FPS + frames);
      assert.equal(project.scenes![1].from, secondStart + frames);
      assert.equal(project.scenes![1].durationInFrames, 3 * FPS);
      assert.equal(project.durationInFrames, baseline.durationInFrames + frames);
      const saved = await load();
      assert.deepEqual(saved.timeline!.captions!.map(cue => cue.sceneId), baseline.captions!.map(cue => cue.sceneId));
      assert.equal(saved.tracks.find(track => track.scope === secondId)!.startFrame, secondStart + frames);
      assert.equal(saved.tracks.find(track => track.scope === secondId)!.src, nextSource.src);
      assert.equal(saved.tracks.find(track => track.scope === 'full')!.src, fullSource.src);
      assert.equal(saved.tracks.find(track => track.scope === 'full')!.spans!.find(span => span.from === secondStart + frames)!.trimBefore, secondStart);
      await expect.poll(() => page!.evaluate(id => window.__workflowReview!.shots.find(shot => shot.id === id)!.start, secondId))
        .toBe((secondStart + frames) / FPS);
      const resolved = await metadata(page!, origin);
      assert.equal(resolved.duration, project.durationInFrames);
      assert.equal(resolved.project.scenes[1].from, secondStart + frames);
    };

    // This failed before the fix: changing duration left the next start at eight seconds.
    await open();
    await dialog.getByRole('spinbutton', {name: '第 1 句持续（秒）'}).fill('10');
    await expect.poll(async () => Number(await dialog.getByRole('spinbutton', {name: '第 2 句开始（秒）'}).inputValue())).toBe(10);
    await expect.poll(async () => Number(await dialog.getByRole('spinbutton', {name: '片段时长（秒）', exact: true}).inputValue())).toBe(13);
    await page.screenshot({path: join(output, 'voice-edit-ripple.png')});
    const scoped = await save();
    await assertRipple(scoped, 2 * FPS);
    assert.deepEqual(getVoiceCaptions(firstId, scoped).map(cue => [cue.startFrame, cue.endFrame]), [[0, 10 * FPS], [10 * FPS, 13 * FPS]]);
    console.log('PASS: editing a sentence immediately moves the next sentence and, on save, the next scene and its audio.');

    // Full-film editing must grow the owning scene and preserve all scene associations.
    await page.getByRole('combobox', {name: '录制范围'}).selectOption('full');
    await open();
    await dialog.getByRole('spinbutton', {name: '第 1 句持续（秒）'}).fill('12');
    await expect.poll(async () => Number(await dialog.getByRole('spinbutton', {name: '第 2 句开始（秒）'}).inputValue())).toBe(12);
    await expect.poll(async () => Number(await dialog.getByRole('spinbutton', {name: '第 3 句开始（秒）'}).inputValue())).toBe((secondStart + 4 * FPS) / FPS);
    await assertRipple(await save(), 4 * FPS);

    await open();
    await dialog.getByRole('spinbutton', {name: '第 1 句持续（秒）'}).fill('10.067');
    const fractional = await save(), fractionalDelta = Math.round(10.067 * FPS) - 8 * FPS;
    await assertRipple(fractional, fractionalDelta);
    assert.equal(getVoiceCaptions(firstId, fractional)[1].startFrame, Math.round(10.067 * FPS));

    // Clearing a number field while typing must retain the last valid timing for the next delta.
    await open();
    await dialog.getByRole('spinbutton', {name: '第 1 句持续（秒）'}).fill('');
    await dialog.getByRole('spinbutton', {name: '第 1 句持续（秒）'}).fill('8');
    const restored = await save();
    assert.equal(restored.scenes![1].from, secondStart);
    assert.equal(restored.durationInFrames, baseline.durationInFrames);
    await page.reload({waitUntil: 'networkidle'});
    await page.waitForFunction(() => window.__workflowReview?.ready);
    assert.equal((await metadata(page, origin)).project.scenes[1].from, secondStart);

    // Explicit scene-length editing remains a ripple edit without stretching sentence durations.
    await page.getByRole('combobox', {name: '录制范围'}).selectOption(firstId);
    await open();
    await dialog.getByRole('spinbutton', {name: '片段时长（秒）', exact: true}).fill('13');
    const extended = await save();
    await assertRipple(extended, 2 * FPS);
    assert.equal(getVoiceCaptions(firstId, extended)[0].endFrame, 8 * FPS);
    await page.evaluate(frame => window.__workflowReview!.seekTo(frame), secondStart + 2 * FPS);
    await expect(page.getByRole('combobox', {name: '录制范围'})).toHaveValue(secondId);
    const sourceFiles = [fullSource.src, nextSource.src];
    for (const source of sourceFiles) assert.ok((await readFile(join(publicDir, source))).length > 44);
    assert.deepEqual(errors, []);
    await writeFile(join(output, 'voice-edit-check.json'), JSON.stringify({passed: true, isolatedStorage: true,
      scopedSentenceRipple: true, fullFilmSceneRipple: true, preservedSceneIds: true, fractionalAndRepeatedEdits: true,
      clearedInput: true, explicitSceneDuration: true, previewAndMetadata: true, existingAudioOffsets: true,
      beforeSecondSceneStart: secondStart / FPS, afterSecondSceneStart: extended.scenes![1].from / FPS,
      sourceFilesPreserved: true, errors}, null, 2));
    console.log('PASS: full-film edits, fractional/shortened/repeated timing, refresh, Studio/render metadata and audio offsets.');
  } catch (failure) {
    await page?.screenshot({path: join(output, 'voice-edit-failure.png')}).catch(() => undefined);
    console.error('Edit test browser errors:', errors);
    console.error('Edit test alerts:', await page?.getByRole('alert').allTextContents().catch(() => []));
    throw failure;
  } finally {
    await browser?.close(); await server.close();
    const checked = resolve(workspace);
    assert.ok(checked.startsWith(cache + sep) && checked !== cache);
    await rm(checked, {recursive: true, force: true});
  }
}
main().catch(error => {console.error(error); process.exitCode = 1;});
