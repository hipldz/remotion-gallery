import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { chromium, expect, type Page } from '@playwright/test';
import { createServer } from 'vite';
import {
  applyVoiceTimeline,
  defineVoiceoverProject,
  getVoiceCaptions,
  parseVoiceManifest,
  resizeVoiceRange,
  voiceTimeline,
  type VoiceManifest,
  type VoiceoverProject,
} from 'remotion-voiceover/core';
import { baseTimeline, FPS } from '../src/lib/timeline';
import { createVoiceoverProject } from '../src/voiceover.config';
import { projectAssetsPlugin } from '../vite.config';

function wave(frames: number) {
  const rate = 8000;
  const body = Buffer.alloc(44 + Math.round((frames / FPS) * rate) * 2);
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
  body.writeUInt32LE(body.length - 44, 40);
  return body;
}

async function metadata(page: Page, origin: string) {
  return page.evaluate(async (origin) => {
    const module = await import(`${origin}/src/lib/metadata.ts`);
    const { defaultProps } = await import(`${origin}/src/lib/timeline.ts`);
    const files: string[] = await (await fetch(`${origin}/__project/assets`)).json();
    // Supply the static-file context that Studio and the renderer normally create.
    const previousPlayer = window.remotion_isPlayer;
    const previousFiles = window.remotion_staticFiles;
    window.remotion_isPlayer = false;
    window.remotion_staticFiles = files.map((name) => ({ name, src: `/${name}`, sizeInBytes: 0, lastModified: 0 }));
    try {
      const result = await module.calculateFilmMetadata({
        props: defaultProps,
        defaultProps,
        abortSignal: new AbortController().signal,
        compositionId: 'AgentMap2026',
        isRendering: false,
      });
      return { duration: result.durationInFrames, project: result.props.voiceProject };
    } finally {
      window.remotion_isPlayer = previousPlayer;
      window.remotion_staticFiles = previousFiles;
    }
  }, origin);
}

async function main() {
  const cache = resolve('.cache');
  const output = resolve('build/review');
  await mkdir(cache, { recursive: true });
  await mkdir(output, { recursive: true });
  const workspace = await mkdtemp(join(cache, 'voiceover-edit-'));
  const publicDir = join(workspace, 'public');
  const recordings = [resolve('public/narration'), resolve('public/vo')];
  await cp(resolve('public'), publicDir, {
    recursive: true,
    filter: (source) => !recordings.some((directory) => source === directory || source.startsWith(directory + sep)),
  });
  await mkdir(join(publicDir, 'narration'), { recursive: true });
  await writeFile(join(publicDir, 'narration/manifest.json'), '{"version":1,"tracks":[]}\n');
  const project = createVoiceoverProject(baseTimeline);
  const firstId = project.scenes![0].id;
  const secondId = project.scenes![1].id;
  let baseline = resizeVoiceRange(project, firstId, 11 * FPS);
  baseline = resizeVoiceRange(baseline, secondId, 3 * FPS);
  const secondStart = baseline.scenes![1].from;
  baseline = defineVoiceoverProject({
    ...baseline,
    captions: [
      ...baseline.captions!.filter((cue) => cue.sceneId !== firstId && cue.sceneId !== secondId),
      { sceneId: firstId, startFrame: 0, endFrame: 8 * FPS, text: '第一句需要八秒。' },
      { sceneId: firstId, startFrame: 8 * FPS, endFrame: 11 * FPS, text: '第二句需要三秒。' },
      { sceneId: secondId, startFrame: secondStart, endFrame: secondStart + 3 * FPS, text: '第二个镜头的口播。' },
    ],
  });
  const server = await createServer({
    configFile: false,
    root: resolve('.'),
    publicDir,
    optimizeDeps: { force: true, include: ['react/jsx-runtime', 'react/jsx-dev-runtime'] },
    plugins: [projectAssetsPlugin(publicDir)],
    server: { host: '127.0.0.1', port: 0 },
  });
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  let page: Page | undefined;
  const errors: string[] = [];
  try {
    await server.listen();
    const address = server.httpServer!.address();
    assert.ok(address && typeof address !== 'string');
    const origin = `http://127.0.0.1:${address.port}`;
    const patch = await fetch(`${origin}/api/voiceover`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeline: voiceTimeline(baseline), expectedTimeline: voiceTimeline(project) }),
    });
    assert.equal(patch.status, 200, await patch.text());
    for (const [scope, frames] of [
      ['full', baseline.durationInFrames],
      [secondId, 3 * FPS],
    ] as const) {
      const seeded = await fetch(`${origin}/api/voiceover?scope=${scope}`, { method: 'POST', body: new Uint8Array(wave(frames)) });
      assert.equal(seeded.status, 200);
    }
    const load = async (): Promise<VoiceManifest> => parseVoiceManifest(await (await fetch(`${origin}/api/voiceover`)).json(), project);
    const before = await load();
    const fullSource = before.tracks.find((track) => track.scope === 'full')!;
    const nextSource = before.tracks.find((track) => track.scope === secondId)!;
    const choices = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? [process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH]
      : ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].filter(existsSync);
    let launchError: unknown;
    for (const executablePath of [...choices, undefined]) {
      try {
        browser = await chromium.launch({ headless: true, executablePath });
        break;
      } catch (failure) {
        launchError = failure;
      }
    }
    if (!browser) throw launchError;
    page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(origin, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__agentReview?.ready);
    await page.getByRole('combobox', { name: '录制范围' }).selectOption(firstId);
    const dialog = page.getByRole('dialog');
    const open = async () => {
      await page!.getByRole('button', { name: '编辑稿件与时长' }).click();
    };
    const save = async () => {
      await dialog.getByRole('button', { name: '保存字幕与时间' }).click();
      await expect(dialog).toHaveCount(0);
      return applyVoiceTimeline(project, (await load()).timeline);
    };
    const assertRipple = async (edited: VoiceoverProject, frames: number) => {
      assert.equal(edited.scenes![0].durationInFrames, 11 * FPS + frames);
      assert.equal(edited.scenes![1].from, secondStart + frames);
      assert.equal(edited.scenes![1].durationInFrames, 3 * FPS);
      assert.equal(edited.durationInFrames, baseline.durationInFrames + frames);
      const saved = await load();
      assert.deepEqual(
        saved.timeline!.captions!.map((cue) => cue.sceneId),
        baseline.captions!.map((cue) => cue.sceneId),
      );
      assert.equal(saved.tracks.find((track) => track.scope === secondId)!.startFrame, secondStart + frames);
      assert.equal(saved.tracks.find((track) => track.scope === secondId)!.src, nextSource.src);
      assert.equal(saved.tracks.find((track) => track.scope === 'full')!.src, fullSource.src);
      assert.equal(saved.tracks.find((track) => track.scope === 'full')!.spans!.find((span) => span.from === secondStart + frames)!.trimBefore, secondStart);
      await expect.poll(() => page!.evaluate(() => window.__agentReview!.timeline[1].from)).toBe(secondStart + frames);
      assert.equal(await page!.evaluate(() => window.__agentReview!.timeline[0].animationFrames), baseTimeline[0].animationFrames);
      const resolved = await metadata(page!, origin);
      assert.equal(resolved.duration, edited.durationInFrames);
      assert.equal(resolved.project.scenes[1].from, secondStart + frames);
    };

    await open();
    await dialog.getByRole('spinbutton', { name: '第 1 句持续（秒）' }).fill('10');
    await expect.poll(async () => Number(await dialog.getByRole('spinbutton', { name: '第 2 句开始（秒）' }).inputValue())).toBe(10);
    await expect.poll(async () => Number(await dialog.getByRole('spinbutton', { name: '片段时长（秒）', exact: true }).inputValue())).toBe(13);
    await page.screenshot({ path: join(output, 'voice-edit-ripple.png') });
    const scoped = await save();
    await assertRipple(scoped, 2 * FPS);
    assert.deepEqual(
      getVoiceCaptions(firstId, scoped).map((cue) => [cue.startFrame, cue.endFrame]),
      [
        [0, 10 * FPS],
        [10 * FPS, 13 * FPS],
      ],
    );
    await page.evaluate((frame) => window.__agentReview!.seekTo(frame), 10 * FPS + 1);
    await expect(page.locator(`[data-film-caption="${firstId}"]`)).toHaveText('第二句需要三秒。');
    console.log('PASS: changing a sentence duration updates the next sentence, scene, existing audio and on-screen captions.');

    await page.getByRole('combobox', { name: '录制范围' }).selectOption('full');
    await open();
    await dialog.getByRole('spinbutton', { name: '第 1 句持续（秒）' }).fill('12');
    await expect.poll(async () => Number(await dialog.getByRole('spinbutton', { name: '第 2 句开始（秒）' }).inputValue())).toBe(12);
    await expect.poll(async () => Number(await dialog.getByRole('spinbutton', { name: '第 3 句开始（秒）' }).inputValue())).toBe((secondStart + 4 * FPS) / FPS);
    await assertRipple(await save(), 4 * FPS);

    await open();
    await dialog.getByRole('spinbutton', { name: '第 1 句开始（秒）' }).fill('0.5');
    await expect.poll(async () => Number(await dialog.getByRole('spinbutton', { name: '第 2 句开始（秒）' }).inputValue())).toBe(12.5);
    const delayed = await save();
    await assertRipple(delayed, 4.5 * FPS);
    assert.equal(getVoiceCaptions(firstId, delayed)[0].startFrame, 0.5 * FPS);
    await open();
    await dialog.getByRole('spinbutton', { name: '第 1 句开始（秒）' }).fill('0');
    await assertRipple(await save(), 4 * FPS);

    await open();
    await dialog.getByRole('spinbutton', { name: '第 1 句持续（秒）' }).fill('10.067');
    const fractional = await save();
    const fractionalDelta = Math.round(10.067 * FPS) - 8 * FPS;
    await assertRipple(fractional, fractionalDelta);
    assert.equal(getVoiceCaptions(firstId, fractional)[1].startFrame, Math.round(10.067 * FPS));

    await open();
    await dialog.getByRole('spinbutton', { name: '第 1 句持续（秒）' }).fill('');
    await dialog.getByRole('spinbutton', { name: '第 1 句持续（秒）' }).fill('8');
    const restored = await save();
    assert.equal(restored.scenes![1].from, secondStart);
    assert.equal(restored.durationInFrames, baseline.durationInFrames);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__agentReview?.ready);
    await expect.poll(() => page!.evaluate(() => window.__agentReview!.timeline[1].from)).toBe(secondStart);
    assert.equal((await metadata(page, origin)).project.scenes[1].from, secondStart);

    await page.getByRole('combobox', { name: '录制范围' }).selectOption(firstId);
    await open();
    await dialog.getByRole('spinbutton', { name: '片段时长（秒）', exact: true }).fill('13');
    const extended = await save();
    await assertRipple(extended, 2 * FPS);
    assert.equal(getVoiceCaptions(firstId, extended)[0].endFrame, 8 * FPS);
    await page.evaluate((frame) => window.__agentReview!.seekTo(frame), secondStart + 2 * FPS);
    await expect(page.getByRole('combobox', { name: '录制范围' })).toHaveValue(secondId);
    for (const source of [fullSource.src, nextSource.src]) assert.ok((await readFile(join(publicDir, source))).length > 44);
    assert.deepEqual(errors, []);
    await writeFile(
      join(output, 'voice-edit-check.json'),
      JSON.stringify(
        {
          passed: true,
          isolatedStorage: true,
          scopedSentenceRipple: true,
          fullFilmSceneRipple: true,
          editedStartTime: true,
          fractionalAndRepeatedEdits: true,
          clearedInput: true,
          explicitSceneDuration: true,
          preservedSceneIds: true,
          preservedChoreography: true,
          onScreenCaptions: true,
          previewAndMetadata: true,
          existingAudioOffsets: true,
          sourceFilesPreserved: true,
          beforeSecondSceneStart: secondStart / FPS,
          afterSecondSceneStart: extended.scenes![1].from / FPS,
          errors,
        },
        null,
        2,
      ),
    );
    console.log('PASS: start times, full-film edits, fractional/shortened/repeated timing, reload and Studio/render metadata.');
  } catch (failure) {
    await page?.screenshot({ path: join(output, 'voice-edit-failure.png') }).catch(() => undefined);
    console.error('Edit test browser errors:', errors);
    console.error(
      'Edit test alerts:',
      await page
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
