import {chromium} from '@playwright/test';
import {createServer} from 'vite';
import react from '@vitejs/plugin-react';
import {voiceoverPlugin} from 'remotion-voiceover/server';
import {parseVoiceManifest} from 'remotion-voiceover/core';
import {voiceoverProject} from '../src/voiceover.config';
import {cp, mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {join, resolve, sep} from 'node:path';
import assert from 'node:assert/strict';

const main = async () => {
  const project = resolve('.');
  const cache = resolve(project, '.cache');
  await mkdir(cache, {recursive: true});
  const workspace = await mkdtemp(join(cache, 'voiceover-e2e-'));
  const output = resolve('build/review'); await mkdir(output, {recursive: true});
  // A separate local preview server and copied public folder keep every test take
  // away from the user's real recordings. The microphone input is a synthetic tone.
  await cp(resolve('public'), join(workspace, 'public'), {recursive: true});
  await writeFile(join(workspace, 'public/narration/manifest.json'), '{"version":1,"tracks":[]}\n');
  const rate = 48000, samples = rate * 20;
  const wave = Buffer.alloc(44 + samples * 2);
  wave.write('RIFF', 0); wave.writeUInt32LE(wave.length - 8, 4); wave.write('WAVEfmt ', 8);
  wave.writeUInt32LE(16, 16); wave.writeUInt16LE(1, 20); wave.writeUInt16LE(1, 22);
  wave.writeUInt32LE(rate, 24); wave.writeUInt32LE(rate * 2, 28); wave.writeUInt16LE(2, 32); wave.writeUInt16LE(16, 34);
  wave.write('data', 36); wave.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++) wave.writeInt16LE(Math.round(Math.sin(i / rate * Math.PI * 880) * 7000), 44 + i * 2);
  const fakeMic = join(workspace, 'fake-microphone.wav'); await writeFile(fakeMic, wave);
  const server = await createServer({
    configFile: false, root: resolve('preview'), publicDir: join(workspace, 'public'),
    plugins: [react(), voiceoverPlugin({project: voiceoverProject, projectRoot: workspace})],
    server: {host: '127.0.0.1', port: 4174, strictPort: true, watch: {ignored: ['**/public/narration/**']}},
  });
  await server.listen();
  const executablePath = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
  const browser = await chromium.launch({headless: true, executablePath, args: [
    '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-audio-capture=${fakeMic}`,
  ]});
  const errors: string[] = [];
  try {
    const context = await browser.newContext({permissions: ['microphone'], viewport: {width: 1600, height: 1060}});
    await context.addInitScript(() => {
      const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      (window as unknown as {capturedStreams: MediaStream[]}).capturedStreams = [];
      navigator.mediaDevices.getUserMedia = async options => {
        const stream = await original(options);
        (window as unknown as {capturedStreams: MediaStream[]}).capturedStreams.push(stream);
        return stream;
      };
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:4174', {waitUntil: 'networkidle'});
    await page.waitForFunction(() => Boolean(window.__review));
    assert.equal(await page.evaluate(() => (window as unknown as {capturedStreams: MediaStream[]}).capturedStreams.length), 0, 'No microphone access before clicking Record');
    await page.getByRole('button', {name: '录制配音', exact: true}).click();
    assert.equal(await page.getByRole('combobox', {name: '录制范围'}).inputValue(), 'S02');
    await page.screenshot({path: join(output, 'voice-recorder.png'), fullPage: true});
    await page.getByRole('button', {name: '开始录音', exact: true}).click();
    await page.waitForFunction(() => document.querySelector('[data-testid="voice-recorder"]')?.getAttribute('data-phase') === 'countdown');
    await page.getByRole('button', {name: '取消录音', exact: true}).click();
    await page.waitForFunction(() => document.querySelector('[data-testid="voice-recorder"]')?.getAttribute('data-phase') === 'idle');
    assert.equal(await page.getByTestId('voice-take').count(), 0);
    assert.ok(await page.evaluate(() => (window as unknown as {capturedStreams: MediaStream[]}).capturedStreams.every(stream => stream.getTracks().every(track => track.readyState === 'ended'))));

    await page.getByRole('button', {name: '开始录音', exact: true}).click();
    await page.waitForFunction(() => document.querySelector('[data-testid="voice-recorder"]')?.getAttribute('data-phase') === 'recording');
    assert.ok(await page.evaluate(() => window.__review!.isMuted()), 'Mute the movie while recording');
    await page.waitForFunction(() => window.__review!.getFrame() > 110);
    await page.screenshot({path: join(output, 'voice-recorder-recording.png'), fullPage: true});
    await page.getByRole('button', {name: '停止录音', exact: true}).click();
    await page.getByTestId('voice-take').waitFor({timeout: 15000});
    assert.ok(!(await page.evaluate(() => window.__review!.isMuted())), 'Restore original playback sound');
    assert.ok(await page.evaluate(() => (window as unknown as {capturedStreams: MediaStream[]}).capturedStreams.every(stream => stream.getTracks().every(track => track.readyState === 'ended'))));
    const download = page.waitForEvent('download');
    await page.getByRole('link', {name: '下载 WAV', exact: true}).click();
    assert.equal((await download).suggestedFilename(), 'S02-voiceover.wav');
    await page.getByRole('button', {name: '跟画面试听', exact: true}).click();
    await page.waitForFunction(() => document.querySelector('[data-testid="voice-recorder"]')?.getAttribute('data-phase') === 'idle', {timeout: 15000});
    await page.getByRole('button', {name: '保存并使用', exact: true}).click();
    await page.getByRole('button', {name: '已保存并使用', exact: true}).waitFor();
    let manifest = parseVoiceManifest(await (await fetch('http://127.0.0.1:4174/api/voiceover')).json(), voiceoverProject);
    assert.equal(manifest.tracks.length, 1); assert.equal(manifest.tracks[0].scope, 'S02'); assert.equal(manifest.tracks[0].startFrame, 90);
    const savedWave = await readFile(join(workspace, 'public', manifest.tracks[0].src));
    assert.equal(savedWave.toString('ascii', 0, 4), 'RIFF'); assert.equal(savedWave.readUInt32LE(24), 48000);
    let recordedEnergy = 0;
    for (let at = 44; at < savedWave.length; at += 2) recordedEnergy += Math.abs(savedWave.readInt16LE(at));
    assert.ok(recordedEnergy / ((savedWave.length - 44) / 2) > 10, 'The captured WAV must contain actual microphone samples');
    await page.reload({waitUntil: 'networkidle'});
    await page.getByRole('tab', {name: '配音', exact: true}).click();
    await page.getByTestId('saved-voice').waitFor();
    await page.evaluate(() => window.__review!.seekTo(180));
    await page.waitForFunction(() => document.querySelector('[data-shot="S02"]')?.getAttribute('data-shot-frame') === '90');
    await page.screenshot({path: join(output, 'voice-recorder-saved.png'), fullPage: true});

    // Record all 5 seconds: automatic stopping must honor this scene's time slot.
    await page.getByRole('button', {name: '开始录音', exact: true}).click();
    await page.waitForFunction(() => document.querySelector('[data-testid="voice-recorder"]')?.getAttribute('data-phase') === 'recording');
    await page.getByTestId('voice-take').waitFor({timeout: 15000});
    await page.getByRole('button', {name: '保存并使用', exact: true}).click();
    await page.getByRole('button', {name: '已保存并使用', exact: true}).waitFor();
    manifest = parseVoiceManifest(await (await fetch('http://127.0.0.1:4174/api/voiceover')).json(), voiceoverProject);
    assert.ok(manifest.tracks[0].durationInFrames >= 145 && manifest.tracks[0].durationInFrames <= 150);
    assert.equal(manifest.tracks.length, 1, 'Retake replaces the active scene take');
    await page.getByRole('button', {name: '录下一段', exact: true}).click();
    assert.equal(await page.getByRole('combobox', {name: '录制范围'}).inputValue(), 'S03');
    await page.getByRole('combobox', {name: '录制范围'}).selectOption('full');
    await page.getByRole('button', {name: '开始录音', exact: true}).click();
    await page.waitForFunction(() => document.querySelector('[data-testid="voice-recorder"]')?.getAttribute('data-phase') === 'recording');
    await page.waitForFunction(() => window.__review!.getFrame() > 30);
    await page.getByRole('button', {name: '停止录音', exact: true}).click();
    await page.getByTestId('voice-take').waitFor();
    await page.getByRole('button', {name: '保存并使用', exact: true}).click();
    await page.getByRole('button', {name: '已保存并使用', exact: true}).waitFor();
    manifest = parseVoiceManifest(await (await fetch('http://127.0.0.1:4174/api/voiceover')).json(), voiceoverProject);
    assert.ok(manifest.tracks.some(track => track.scope === 'full' && track.startFrame === 0));
    assert.ok(manifest.tracks.some(track => track.scope === 'S02'));
    const badScope = await fetch('http://127.0.0.1:4174/api/voiceover?scope=../../Storyboard.md', {method: 'POST', body: savedWave});
    assert.equal(badScope.status, 400);
    const badAudio = await fetch('http://127.0.0.1:4174/api/voiceover?scope=S03', {method: 'POST', body: 'invalid audio'});
    assert.equal(badAudio.status, 400);

    const denied = await context.newPage();
    await denied.addInitScript(() => {navigator.mediaDevices.getUserMedia = async () => {throw new DOMException('Denied', 'NotAllowedError');};});
    await denied.goto('http://127.0.0.1:4174', {waitUntil: 'networkidle'});
    await denied.getByRole('button', {name: '录制配音', exact: true}).click();
    await denied.getByRole('button', {name: '开始录音', exact: true}).click();
    await denied.getByRole('alert').filter({hasText: '麦克风权限未开启'}).waitFor();
    await denied.screenshot({path: join(output, 'voice-permission-denied.png'), fullPage: true});
    assert.deepEqual(errors, []);
    await writeFile(join(output, 'voiceover-check.json'), JSON.stringify({passed: true, fakeMicrophone: true, isolatedStorage: true,
      countdownCancel: true, tracksReleased: true, recordingClock: true, movieMuted: true, audition: true,
      wavDownload: true, saveReload: true, autoStop: true, nextScene: true, fullFilm: true, deniedPermission: true,
      invalidUploadsRejected: true, errors}, null, 2));
    console.log('PASS: fake-microphone recording, countdown/cancel, WAV download, synchronized audition, save/reload, scene retakes, auto-stop, full-film mode, denied permission. User recordings untouched. No video rendered.');
  } finally {
    await browser.close(); await server.close();
    const checked = resolve(workspace);
    if (!checked.startsWith(cache + sep)) throw new Error('Unsafe test cleanup path');
    await rm(checked, {recursive: true, force: true});
  }
};
main().catch(error => {console.error(error); process.exitCode = 1;});
