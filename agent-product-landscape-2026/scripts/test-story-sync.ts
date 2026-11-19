import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { chromium, expect, type Page } from '@playwright/test';
import { createServer } from 'vite';
import { applyVoiceTimeline, parseVoiceManifest } from 'remotion-voiceover/core';
import { animationFrameFor, animationTimeFor, baseTimeline, captionsFor, FPS, motionSpansFor } from '../src/lib/timeline';
import { createVoiceoverProject, resolveVoiceTimeline } from '../src/voiceover.config';
import { buildCameraTrack, cameraAt } from '../src/lib/camera';
import { projectAssetsPlugin } from '../vite.config';

async function metadata(page: Page, origin: string) {
  return page.evaluate(async (origin) => {
    const { calculateFilmMetadata } = await import(`${origin}/src/lib/metadata.ts`);
    const { defaultProps } = await import(`${origin}/src/lib/timeline.ts`);
    const names: string[] = await (await fetch(`${origin}/__project/assets`)).json();
    const previous = { player: window.remotion_isPlayer, files: window.remotion_staticFiles };
    window.remotion_isPlayer = false;
    window.remotion_staticFiles = names.map((name) => ({ name, src: `/${name}`, sizeInBytes: 0, lastModified: 0 }));
    try {
      const result = await calculateFilmMetadata({
        props: defaultProps,
        defaultProps,
        abortSignal: new AbortController().signal,
        compositionId: 'AgentMap2026',
        isRendering: false,
      });
      return { duration: result.durationInFrames, project: result.props.voiceProject };
    } finally {
      window.remotion_isPlayer = previous.player;
      window.remotion_staticFiles = previous.files;
    }
  }, origin);
}

async function main() {
  const project = createVoiceoverProject(baseTimeline);
  const cache = resolve('.cache'),
    output = resolve('build/review');
  await mkdir(cache, { recursive: true });
  await mkdir(output, { recursive: true });
  const workspace = await mkdtemp(join(cache, 'story-sync-'));
  const publicDir = join(workspace, 'public');
  const recordings = [resolve('public/narration'), resolve('public/vo')];
  await cp(resolve('public'), publicDir, {
    recursive: true,
    filter: (source) => !recordings.some((directory) => source === directory || source.startsWith(directory + sep)),
  });
  const server = await createServer({
    configFile: false,
    root: resolve('.'),
    publicDir,
    plugins: [projectAssetsPlugin(publicDir)],
    optimizeDeps: { include: ['react/jsx-runtime', 'react/jsx-dev-runtime'] },
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
    const choices = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? [process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH]
      : ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].filter(existsSync);
    let launchError: unknown;
    for (const executablePath of [...choices, undefined]) {
      try {
        browser = await chromium.launch({ headless: true, executablePath });
        break;
      } catch (error) {
        launchError = error;
      }
    }
    if (!browser) throw launchError;
    page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(origin, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__agentReview?.ready);
    const range = page.getByRole('combobox', { name: '录制范围' });
    const dialog = page.getByRole('dialog');
    const open = async (scope: string) => {
      await range.selectOption(scope);
      await page!.getByRole('button', { name: '编辑稿件与时长', exact: true }).click();
    };
    const load = async () => parseVoiceManifest(await (await page!.request.get(`${origin}/api/voiceover`)).json(), project);
    const save = async () => {
      await dialog.getByRole('button', { name: '保存字幕与时间', exact: true }).click();
      await expect(dialog).toHaveCount(0);
      return applyVoiceTimeline(project, (await load()).timeline);
    };
    const seek = async (frame: number) => {
      await page!.evaluate((frame) => window.__agentReview!.seekTo(frame), frame);
      await expect.poll(() => page!.evaluate(() => window.__agentReview!.getFrame())).toBe(frame);
    };
    const film = page.locator('[data-film="AgentMap2026"]');
    const phaseOpacity = async (phase: string) =>
      Number(await page!.locator(`[data-intro-phase="${phase}"]`).evaluate((element) => getComputedStyle(element).opacity));
    const savedText = '这条字幕来自编辑器保存的最新版。';
    const historyStart = project.captions!.filter((cue) => cue.sceneId === 'P01')[2].startFrame;
    await open('P01');
    await dialog.getByRole('textbox', { name: '第 1 句正文', exact: true }).fill(savedText);
    const firstDuration = dialog.getByRole('spinbutton', { name: '第 1 句持续（秒）', exact: true });
    await firstDuration.fill(String(Number(await firstDuration.inputValue()) + 2));
    let edited = await save();
    await seek(project.captions![0].startFrame + 15);
    await expect(page.locator('[data-film-caption="P01"]')).toHaveText(savedText);
    await seek(historyStart + 2 * FPS - 1);
    assert.ok((await phaseOpacity('today')) > 0.99);
    assert.equal(await phaseOpacity('history'), 0);
    await seek(historyStart + 2 * FPS + 30);
    assert.equal(await phaseOpacity('history'), 1);

    await open('P01');
    await dialog.getByRole('spinbutton', { name: '第 1 句开始（秒）', exact: true }).fill('1.2');
    edited = await save();
    const delta = 2 * FPS + 1.2 * FPS - baseTimeline[0].voOffset;
    assert.equal(edited.durationInFrames, project.durationInFrames + delta);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__agentReview?.ready);
    await seek(historyStart + delta - 1);
    assert.equal(await phaseOpacity('history'), 0);
    await seek(historyStart + delta + 30);
    assert.equal(await phaseOpacity('history'), 1);

    // Moving Cursor's caption must also move Aider's screenshot and camera cut.
    let timeline = resolveVoiceTimeline(baseTimeline, edited);
    const oldAiderAt = animationTimeFor(timeline.find((shot) => shot.id === 'B04')!, 180);
    await open('B04');
    const cursorDuration = dialog.getByRole('spinbutton', { name: '第 1 句持续（秒）', exact: true });
    await cursorDuration.fill(String(Number(await cursorDuration.inputValue()) + 2));
    edited = await save();
    timeline = resolveVoiceTimeline(baseTimeline, edited);
    const b04 = timeline.find((shot) => shot.id === 'B04')!;
    const aiderAt = animationTimeFor(b04, 180);
    assert.equal(aiderAt, oldAiderAt + 60);
    await seek(aiderAt - 1);
    await expect(page.locator('[data-source-asset="cursor"]')).toHaveCount(1);
    await expect(page.locator('[data-source-asset="aider"]')).toHaveCount(0);
    await seek(aiderAt + 55);
    await expect(page.locator('[data-source-asset="cursor"]')).toHaveCount(0);
    await expect(page.locator('[data-source-asset="aider"]')).toHaveCount(1);
    await expect(page.locator('.film-source')).toContainText('aider.chat');
    await page.screenshot({ path: join(output, 'restored-aider.png') });

    const resolved = await metadata(page, origin);
    assert.equal(resolved.duration, edited.durationInFrames);
    assert.equal(resolved.project.captions[0].text, savedText);
    assert.equal(resolved.project.scenes[1].from, baseTimeline[1].from + delta);
    for (const cue of edited.captions!) {
      const owner = edited.scenes!.find((scene) => scene.id === cue.sceneId)!;
      assert.ok(owner && cue.startFrame >= owner.from && cue.endFrame <= owner.from + owner.durationInFrames);
    }
    const cameraTrack = buildCameraTrack(timeline);
    assert.ok(cameraTrack.every((cue, index) => index === 0 || cue.frame > cameraTrack[index - 1].frame));
    assert.ok(Number.isFinite(cameraAt(aiderAt, cameraTrack).x));

    await page.goto(`${origin}/?clean`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__agentReview?.ready);
    await expect(film).toHaveAttribute('data-cinematic-style', 'original');
    for (const shot of timeline) {
      const cue = captionsFor(shot)[0];
      await seek(cue ? cue.from + 15 : shot.from + 35);
      await expect(film).toHaveAttribute('data-shot', shot.id);
      if (cue) await expect(page.locator(`[data-film-caption="${shot.id}"]`)).toHaveText(cue.text);
    }
    const sample = async (id: string, virtualFrame: number, file: string, source?: string) => {
      const shot = timeline.find((shot) => shot.id === id)!;
      await seek(animationTimeFor(shot, virtualFrame));
      await expect(film).toHaveAttribute('data-shot', id);
      if (source) await expect(page!.locator(`[data-source-asset="${source}"]`)).toHaveCount(1);
      await page!.screenshot({ path: join(output, file) });
    };
    await sample('P06', 100, 'restored-rewind.png');
    await sample('B02', 205, 'restored-tools-return.png');
    const request = timeline.find((shot) => shot.id === 'B02')!;
    const returnedAt = animationTimeFor(request, 145);
    assert.ok(animationFrameFor(request, returnedAt - request.from - 1) < 145);
    assert.equal(animationFrameFor(request, returnedAt - request.from), 145);
    await sample('C01', 45, 'restored-orb-jump.png');
    await sample('C02', 245, 'restored-devin.png', 'devin');
    await sample('C03', 150, 'restored-web-morph.png');
    await sample('D02', 250, 'restored-check-delivery.png');
    await sample('F02', 200, 'restored-openclaw.png', 'openclaw');
    const f02 = timeline.find((shot) => shot.id === 'F02')!;
    const openAt = animationTimeFor(f02, 130);
    await seek(openAt - 1);
    await expect(page.locator('[data-source-asset="cowork"]')).toHaveCount(1);
    await expect(page.locator('[data-source-asset="openclaw"]')).toHaveCount(0);
    await seek(openAt + 65);
    await expect(page.locator('[data-source-asset="cowork"]')).toHaveCount(0);
    await expect(page.locator('[data-source-asset="openclaw"]')).toHaveCount(1);

    const swarm = timeline.find((shot) => shot.id === 'F04')!;
    const splitAt = animationTimeFor(swarm, 145);
    await seek(splitAt - 1);
    await expect(page.locator('[data-agent-orbit]')).toHaveAttribute('data-agent-count', '1');
    await seek(splitAt + 95);
    await expect(page.locator('[data-agent-orbit]')).toHaveAttribute('data-agent-count', '10');
    const holdAt = animationTimeFor(swarm, 340) + 20;
    await seek(holdAt);
    const firstOrbit = await page.locator('[data-agent-orbit]').innerHTML();
    await seek(holdAt + 60);
    await expect(film).toHaveAttribute('data-animation-frame', '340');
    await expect(page.locator('[data-agent-orbit]')).toHaveAttribute('data-agent-count', '10');
    assert.notEqual(await page.locator('[data-agent-orbit]').innerHTML(), firstOrbit, 'Orbits and task progress continue during a spoken hold');
    await page.screenshot({ path: join(output, 'restored-swarm.png') });

    const follow = timeline.find((shot) => shot.id === 'P03')!;
    await seek(captionsFor(follow).at(-1)!.to - 15);
    assert.equal(await page.locator('[data-follow-request]').evaluate((element) => getComputedStyle(element).opacity), '1');
    await page.screenshot({ path: join(output, 'restored-follow.png') });
    const next = timeline.find((shot) => shot.id === 'A03')!;
    await seek(next.from + 6);
    const overlapping = page.locator('[data-cinematic-shot]');
    await expect(overlapping).toHaveCount(2);
    assert.equal(await overlapping.first().evaluate((element) => getComputedStyle(element).opacity), '1');
    assert.ok(Number(await overlapping.last().evaluate((element) => getComputedStyle(element).opacity)) > 0);
    await page.screenshot({ path: join(output, 'restored-transition.png') });

    // Verify semantic anchors also survive inserted and deleted sentences.
    const originalCues = edited.captions!.filter((cue) => cue.sceneId === b04.id);
    const inserted = {
      ...edited,
      captions: [
        ...edited.captions!.filter((cue) => cue.sceneId !== b04.id),
        originalCues[0],
        { ...originalCues[0], text: '这里补一句说明。', startFrame: originalCues[0].endFrame - 1, endFrame: originalCues[0].endFrame },
        ...originalCues.slice(1),
      ],
    };
    const withInsert = resolveVoiceTimeline(timeline, inserted).find((shot) => shot.id === b04.id)!;
    assert.equal(animationTimeFor(withInsert, 180), aiderAt);
    const withDelete = resolveVoiceTimeline(timeline, { ...edited, captions: edited.captions!.filter((cue) => cue !== originalCues[0]) }).find(
      (shot) => shot.id === b04.id,
    )!;
    assert.ok(motionSpansFor(withDelete).every((span) => span.beat.cueIndex >= 1));

    // Keep the last sentence visible when the editor removes the final pause.
    const lastCue = edited.captions!.at(-1)!;
    const lastScene = edited.scenes!.at(-1)!;
    const ending = {
      fps: project.fps,
      durationInFrames: lastCue.endFrame,
      scenes: edited.scenes!.map((scene) => (scene.id === lastScene.id ? { ...scene, durationInFrames: lastCue.endFrame - scene.from } : scene)),
      captions: edited.captions!,
    };
    const tailEdit = await page.request.patch(`${origin}/api/voiceover`, { data: { timeline: ending } });
    assert.equal(tailEdit.status(), 200, await tailEdit.text());
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(
      (frames) => window.__agentReview?.ready && window.__agentReview.timeline.at(-1)!.from + window.__agentReview.timeline.at(-1)!.duration === frames,
      ending.durationInFrames,
    );
    await seek(lastCue.endFrame - 10);
    await expect(page.locator(`[data-film-caption="${lastScene.id}"]`)).toHaveText(lastCue.text);
    await expect(page.locator('[data-film-outro]')).toHaveCount(0);
    await page.screenshot({ path: join(output, 'restored-ending.png') });
    assert.deepEqual(errors, []);
    await writeFile(
      join(output, 'story-sync-check.json'),
      JSON.stringify(
        {
          passed: true,
          isolatedStorage: true,
          originalCinematicStyle: true,
          latestEditorTextWins: true,
          actualCueFramesDrivePictures: true,
          preservedSceneIds: true,
          allShotsChecked: timeline.length,
          cleanPreview: true,
          savedAndReloaded: true,
          studioAndRenderMetadata: true,
          cursorAiderCutFollowsEdits: true,
          requestReturnFollowsSpeech: true,
          coworkOpenclawCutFollowsSpeech: true,
          oneToTenAgentsFollowsSpeech: true,
          orbitContinuesDuringHold: true,
          insertedDeletedCuesPreserveAnchors: true,
          followPictureHoldsThroughSpeech: true,
          transitionsOverlap: true,
          finalSpeechHoldsWithoutTail: true,
          initialDurationSeconds: project.durationInFrames / FPS,
          durationSeconds: edited.durationInFrames / FPS,
          errors,
        },
        null,
        2,
      ),
    );
    console.log(
      'PASS: original cinematic effects, exact editor text/timing, 42 shots, product cuts, request/return, one-to-ten orbits, transitions, and render metadata.',
    );
  } catch (failure) {
    await page?.screenshot({ path: join(output, 'story-sync-failure.png') }).catch(() => undefined);
    console.error('Story test browser errors:', errors);
    throw failure;
  } finally {
    await browser?.close();
    await server.close();
    const checked = resolve(workspace);
    assert.ok(checked.startsWith(cache + sep) && checked !== cache);
    await rm(checked, { recursive: true, force: true });
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
