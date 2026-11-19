import rawShots from '../data/shots.json';
import type { VoiceoverProject, VoiceTrack } from 'remotion-voiceover/core';

export const FPS = 30;
export type ScriptCue = { text: string; startFrame: number; endFrame: number; beatId: string; focus: number; editorIndex?: number };
export type MotionBeat = { cueIndex: number; from: number; to: number; frames: number };
export type Shot = {
  id: string;
  title: string;
  chapter: string;
  chapterKey: string;
  minFrames: number;
  animationFrames: number;
  originalFrom: number;
  kind: string;
  elastic: boolean;
  narration: string;
  voOffset: number;
  tailFrames: number;
  cues: ScriptCue[];
  motion?: MotionBeat[];
};
export type TimedShot = Shot & { from: number; duration: number; vo?: string; voFrames?: number; captionCues?: Caption[] };
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
export function motionSpansFor(shot: TimedShot) {
  const captions = captionsFor(shot);
  const populated = (shot.motion ?? []).flatMap((beat, index, beats) => {
    const end = beats[index + 1]?.cueIndex ?? Infinity;
    const cue = captions.find((entry) => entry.scriptIndex !== undefined && entry.scriptIndex >= beat.cueIndex && entry.scriptIndex < end);
    return cue ? [{ beat, caption: cue }] : [];
  });
  return populated.map((entry, index) => ({
    ...entry,
    start: index === 0 ? 0 : Math.max(0, entry.caption.from - shot.from - 6),
    end: populated[index + 1] ? Math.max(0, populated[index + 1].caption.from - shot.from - 6) : shot.duration,
  }));
}

export function motionStateFor(shot: TimedShot, localFrame: number) {
  const local = Math.max(0, Math.min(localFrame, shot.duration - 1));
  if (shot.kind === 'CARD') {
    const exit = shot.duration - 16;
    const frame = local < 44 ? local : local < exit ? 44 : 48 + ((local - exit) * 12) / 16;
    return { frame, previousFrame: undefined, blend: 1, cueIndex: -1 };
  }
  if (['P01', 'P03', 'P07'].includes(shot.id)) return { frame: local, previousFrame: undefined, blend: 1, cueIndex: -1 };
  const spans = motionSpansFor(shot);
  const index = spans.findIndex((span) => local >= span.start && local < span.end);
  const active = spans[Math.max(0, index)] ?? spans.at(-1);
  if (!active) return { frame: Math.min(local, shot.animationFrames - 1), previousFrame: undefined, blend: 1, cueIndex: -1 };
  const elapsed = Math.max(0, local - active.start);
  const frames = Math.max(1, Math.min(active.beat.frames, active.end - active.start - 1));
  const progress = Math.max(0, Math.min(1, elapsed / frames));
  return {
    frame: active.beat.from + (active.beat.to - active.beat.from) * progress,
    previousFrame: index > 0 && elapsed < 12 ? spans[index - 1].beat.to : undefined,
    blend: index > 0 ? Math.min(1, elapsed / 12) : 1,
    cueIndex: active.beat.cueIndex,
  };
}

export const animationFrameFor = (shot: TimedShot, localFrame: number) => motionStateFor(shot, localFrame).frame;

/** Real frame of a visual event, shared by sound effects and the cinematic rig. */
export function animationTimeFor(shot: TimedShot, virtualFrame: number) {
  if (['P01', 'P03', 'P07'].includes(shot.id) || shot.kind === 'CARD') return shot.from + Math.round(virtualFrame);
  const span = motionSpansFor(shot).find((entry) => virtualFrame >= entry.beat.from && virtualFrame <= entry.beat.to);
  if (!span) return shot.from + Math.min(shot.duration - 1, Math.round(virtualFrame));
  const frames = Math.max(1, Math.min(span.beat.frames, span.end - span.start - 1));
  const progress = (virtualFrame - span.beat.from) / Math.max(1, span.beat.to - span.beat.from);
  return shot.from + span.start + Math.round(progress * frames);
}
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

export type Caption = { text: string; from: number; to: number; shotId: string; scriptIndex?: number };
export function captionsFor(shot: TimedShot): Caption[] {
  if (shot.captionCues !== undefined) return shot.captionCues;
  const spoken = (shot.cues.at(-1)?.endFrame ?? shot.voOffset) - shot.voOffset;
  const ratio = shot.voFrames !== undefined && spoken > 0 ? shot.voFrames / spoken : 1;
  return shot.cues.map((cue, scriptIndex) => {
    const from = shot.from + shot.voOffset + Math.round((cue.startFrame - shot.voOffset) * ratio);
    const to = shot.from + shot.voOffset + Math.round((cue.endFrame - shot.voOffset) * ratio);
    return { text: cue.text, from, to: Math.max(from + 1, to), shotId: shot.id, scriptIndex };
  });
}

export const chapterInfo = [
  {
    key: 'P',
    number: '序',
    year: '2026',
    title: '从今天的任务说起',
    subtitle: '问题、例子和回顾路线',
  },
  {
    key: 'Z',
    number: '图',
    year: '',
    title: '先看这张图',
    subtitle: '工具、流程与任务支撑',
  },
  {
    key: 'A',
    number: '1',
    year: '2022',
    title: '回答与补全',
    subtitle: '建议怎样变成实际操作',
  },
  {
    key: 'B',
    number: '2',
    year: '2023',
    title: '接上工具，进入项目',
    subtitle: '调用、结果和下一步',
  },
  {
    key: 'C',
    number: '3',
    year: '2024',
    title: '一整套工作环境',
    subtitle: '运行、观察、修改和验证',
  },
  {
    key: 'D',
    number: '4',
    year: '2025',
    title: '目标与验收',
    subtitle: '怎么交代，怎样检查',
  },
  {
    key: 'E',
    number: '5',
    year: '2025',
    title: '研究与办公',
    subtitle: '资料、证据和文件产物',
  },
  {
    key: 'F',
    number: '6',
    year: '2026',
    title: '工作台与长任务',
    subtitle: '任务状态、进度和接续',
  },
  {
    key: 'G',
    number: '终',
    year: '',
    title: '回到自己的任务',
    subtitle: '从三个问题开始选工具',
  },
];
