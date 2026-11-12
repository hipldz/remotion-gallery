import rawShots from '../data/shots.json';
import type { VoiceTrack } from 'remotion-voiceover/core';

export const FPS = 30;
export type Shot = (typeof rawShots)[number];
export type TimedShot = Shot & { from: number; duration: number; vo?: string; voFrames?: number };
export type FilmProps = {
  timeline: TimedShot[];
  availableFiles: string[];
  showSubtitles: boolean;
  enableSfx: boolean;
  frameOffset: number;
  voiceTracks?: VoiceTrack[];
};

export const shots: Shot[] = rawShots;
export const baseTimeline: TimedShot[] = shots.map((s, i) => ({ ...s, from: shots.slice(0, i).reduce((n, a) => n + a.minFrames, 0), duration: s.minFrames }));
export const defaultProps: FilmProps = { timeline: baseTimeline, availableFiles: [], showSubtitles: true, enableSfx: true, frameOffset: 0 };
export const totalFrames = (timeline: TimedShot[]) => timeline.reduce((n, s) => n + s.duration, 0);
// Keep each scene's complete choreography when the edited clip becomes shorter.
export const animationFrameFor = (shot: TimedShot, localFrame: number) => (localFrame / shot.duration) * shot.animationFrames;
export const shotAt = (timeline: TimedShot[], frame: number) =>
  timeline.find((s) => frame >= s.from && frame < s.from + s.duration) ?? timeline[timeline.length - 1];

export const voiceFileFor = (id: string, files: string[]) =>
  ['wav', 'mp3', 'm4a', 'aac', 'ogg'].map((ext) => files.find((name) => name.toLowerCase() === `vo/${id.toLowerCase()}.${ext}`)).find(Boolean);

// Shared by Studio, the review player and caption export. Only elastic shots may grow.
export function resolveTiming(durations: Record<string, number>, files: string[]): TimedShot[] {
  let from = 0;
  return shots.map((shot) => {
    const vo = voiceFileFor(shot.id, files);
    const seconds = durations[shot.id];
    const voFrames = seconds === undefined ? undefined : Math.ceil(seconds * FPS);
    const needed = voFrames === undefined ? shot.minFrames : shot.voOffset + voFrames + 12;
    if (!shot.elastic && needed > shot.minFrames) {
      throw new Error(`${shot.id} 旁白需要 ${needed} 帧，但固定镜头只有 ${shot.minFrames} 帧。请缩短录音，或在 shots.json 中明确调整镜头时长。`);
    }
    const duration = shot.elastic ? Math.max(shot.minFrames, needed) : shot.minFrames;
    const timed: TimedShot = { ...shot, from, duration, vo, voFrames };
    from += duration;
    return timed;
  });
}

export type Caption = { text: string; from: number; to: number; shotId: string };
export function captionsFor(shot: TimedShot): Caption[] {
  if (!shot.narration) return [];
  const clauses = shot.narration
    .replace(/[「」‘’“”]/g, '')
    .split(/[／；，。？！]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const chunks = clauses.flatMap((text) => {
    if (text.length <= 32) return [text];
    // Prefer word boundaries for Latin product names; never cut a name mid-word.
    return text.match(/.{1,28}(?:\s|$)|.{1,28}(?=[\u3400-\u9fff])/g) ?? [text];
  });
  const start = shot.voOffset;
  const available = shot.voFrames ?? Math.max(1, shot.duration - start - 18);
  const count = chunks.reduce((sum, t) => sum + t.length, 0);
  let consumed = 0;
  return chunks.map((text) => {
    const from = shot.from + start + Math.floor((consumed / count) * available);
    consumed += text.length;
    return { text, from, to: shot.from + start + Math.floor((consumed / count) * available), shotId: shot.id };
  });
}

export const chapterInfo = [
  { key: 'P', number: '序', year: '2026', title: '回头看Agent产品', subtitle: '从今天出发，倒带到 2022' },
  { key: 'Z', number: '0', year: '', title: '四条产品路线', subtitle: '开发者工具、通用工作、流程平台和运行系统' },
  { key: 'A', number: '1', year: '2022', title: '聊天与代码补全', subtitle: 'ChatGPT · GitHub Copilot' },
  { key: 'B', number: '2', year: '2023', title: '开始用工具', subtitle: '查资料、跑代码、修改文件' },
  { key: 'C', number: '3', year: '2024', title: '有了工作环境', subtitle: '编辑器、终端和浏览器' },
  { key: 'D', number: '4', year: '2025', title: '交代一个目标', subtitle: '从一个 issue，到一个 PR' },
  { key: 'F', number: '5', year: '2026', title: '进入办公桌面', subtitle: '处理文件、接任务、看进度' },
  { key: 'G', number: '终', year: '', title: '从聊天到交付任务', subtitle: '回头看这几年的产品变化' },
];
