import rawShots from '../data/shots.json';
import type { VoiceoverProject, VoiceTrack } from 'remotion-voiceover/core';

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
  voiceProject?: VoiceoverProject;
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
    const needed = voFrames === undefined ? shot.minFrames : shot.voOffset + voFrames + shot.tailFrames;
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
    // Keep commas within a spoken phrase; explicit pauses and sentence endings set the breaks.
    .split(/[／；。？！]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const chunks = clauses.flatMap((text) => {
    if (text.length <= 32) return [text];
    // Prefer word boundaries for Latin product names; never cut a name mid-word.
    return text.match(/.{1,28}(?:\s|$)|.{1,28}(?=[\u3400-\u9fff])/g) ?? [text];
  });
  const start = shot.voOffset;
  const available = shot.voFrames ?? Math.max(1, shot.duration - start - shot.tailFrames);
  const count = chunks.reduce((sum, t) => sum + t.length, 0);
  let consumed = 0;
  return chunks.map((text) => {
    const from = shot.from + start + Math.floor((consumed / count) * available);
    consumed += text.length;
    return { text, from, to: shot.from + start + Math.floor((consumed / count) * available), shotId: shot.id };
  });
}

export const chapterInfo = [
  {
    key: 'P',
    number: '序',
    year: '2026',
    title: '先聊聊这些 Agent',
    subtitle: '从 2022 年回顾到今天',
  },
  {
    key: 'Z',
    number: '图',
    year: '',
    title: '先认一下图上的颜色',
    subtitle: '这几种工具，各做什么',
  },
  {
    key: 'A',
    number: '1',
    year: '2022',
    title: '聊天和补代码',
    subtitle: '你问问题，它给建议',
  },
  {
    key: 'B',
    number: '2',
    year: '2023',
    title: 'AI 开始动手了',
    subtitle: '用工具，也能改项目',
  },
  {
    key: 'C',
    number: '3',
    year: '2024',
    title: '进到项目里干活',
    subtitle: '改代码、用浏览器、跑测试',
  },
  {
    key: 'D',
    number: '4',
    year: '2025',
    title: '交给它做，做完你再看',
    subtitle: '给个目标，做完来检查',
  },
  {
    key: 'E',
    number: '5',
    year: '2025',
    title: '不光写代码',
    subtitle: '查资料、做报告、整理文件',
  },
  {
    key: 'F',
    number: '6',
    year: '2026',
    title: '把事情放到工作台',
    subtitle: '放在一起，看进度、查结果',
  },
  {
    key: 'G',
    number: '终',
    year: '',
    title: '这几年，变了些什么',
    subtitle: '这些工具，各有各的用法',
  },
];
