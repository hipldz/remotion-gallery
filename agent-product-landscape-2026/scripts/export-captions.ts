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
  `# 录音与剪辑提示 · 7–8 分钟动效科普 V4.1\n\n优先使用 vendor 编辑器保存到 public/narration/manifest.json 的当前字幕和时间。每句保留分镜关联，原版特效按实际切点推进，进入之后保持阅读画面。初始按自然口语估时，真人朗读可逐句打点；镜头末尾留白参与叠化。\n\n| 镜头 | 入点 | 时长 | 类型 | 末尾留白 | 旁白 |\n|---|---|---|---|---|---|\n${cueSheet}\n`,
);
console.log(
  `Exported ${captions.length} caption cues, SRT, VTT, timing.json, narration-cues.md. ${timeline.filter((shot) => shot.vo).length} imported voice files detected.`,
);
