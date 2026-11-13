import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { applyVoiceTimeline, parseVoiceManifest } from 'remotion-voiceover/core';
import { createVoiceoverProject, resolveVoiceTimeline } from '../src/voiceover.config';
import { readVoiceTimeline } from './voiceover-files';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceTimeline = readVoiceTimeline(path.join(root, 'public'));
const base = createVoiceoverProject(sourceTimeline);
const manifestFile = path.join(root, 'public/narration/manifest.json');
const manifest = existsSync(manifestFile) ? parseVoiceManifest(JSON.parse(readFileSync(manifestFile, 'utf8')), base) : undefined;
const project = applyVoiceTimeline(base, manifest?.timeline);
const timeline = resolveVoiceTimeline(sourceTimeline, project);
const captions = project.captions!.map((cue) => ({ text: cue.text, from: cue.startFrame, to: cue.endFrame }));
const format = (frame: number, separator: string) => {
  const ms = Math.round((frame / 30) * 1000);
  return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}${separator}${String(ms % 1000).padStart(3, '0')}`;
};
const srt = captions.map((c, i) => `${i + 1}\n${format(c.from, ',')} --> ${format(c.to, ',')}\n${c.text}\n`).join('\n');
const vtt = `WEBVTT\n\n${captions.map((c) => `${format(c.from, '.')} --> ${format(c.to, '.')}\n${c.text}\n`).join('\n')}`;
const production = path.join(root, 'production');
mkdirSync(production, { recursive: true });
writeFileSync(path.join(production, 'agent-map.srt'), srt);
writeFileSync(path.join(production, 'agent-map.vtt'), vtt);
writeFileSync(path.join(production, 'timing.json'), JSON.stringify(timeline, null, 2) + '\n');
const cueSheet = timeline
  .map(
    (s) =>
      `| ${s.id} | ${format(s.from, '.')} | ${(s.duration / 30).toFixed(1)}s | ${s.elastic ? '弹性' : '固定'} | ${(s.tailFrames / 30).toFixed(1)}s | ${s.narration || '—'} |`,
  )
  .join('\n');
writeFileSync(
  path.join(production, 'narration-cues.md'),
  `# 录音与剪辑提示 · V3\n\n按 Storyboard.md 的新剧本生成。真人提词与字幕共用时间线，末尾留白让音乐与画面参与转场。字幕仍按句子长度估算，未做语音强制对齐。\n\n| 镜头 | 入点 | 时长 | 类型 | 末尾留白 | 旁白 |\n|---|---|---|---|---|---|\n${cueSheet}\n`,
);
console.log(
  `Exported ${captions.length} caption cues, SRT, VTT, timing.json, narration-cues.md. ${timeline.filter((shot) => shot.vo).length} imported voice files detected.`,
);
