export type VoiceScope = string;
export type VoiceScene = {
  id: string;
  title: string;
  from: number;
  durationInFrames: number;
  recordable?: boolean;
};
export type VoiceCaption = {startFrame: number; endFrame: number; text: string; sceneId?: string};
export type VoiceoverProject = {
  fps: number;
  durationInFrames: number;
  scenes?: readonly VoiceScene[];
  captions?: readonly VoiceCaption[];
  /** A relative file path inside the consuming project's public directory. */
  manifestSrc?: string;
};
export type VoiceTrack = {
  id: string;
  scope: VoiceScope;
  src: string;
  startFrame: number;
  durationInFrames: number;
  recordedAt: string;
  /** Original audio length; spans preserve source offsets after an edit. */
  sourceDurationInFrames?: number;
  spans?: VoiceTrackSpan[];
};
export type VoiceTrackSpan = {from: number; duration: number; trimBefore: number};
export type VoiceTimeline = Pick<VoiceoverProject, 'fps' | 'durationInFrames' | 'scenes' | 'captions'>;
export type VoiceManifest = {version: 1; tracks: VoiceTrack[]; timeline?: VoiceTimeline};
export type VoiceSegment = VoiceTrack & {from: number; duration: number; trimBefore: number};
export type VoiceoverSaveOptions = {timeline?: VoiceTimeline; expectedTimeline?: VoiceTimeline};
export type VoiceoverStorage = {
  load: () => Promise<VoiceManifest>;
  save: (scope: VoiceScope, wav: Blob, options?: VoiceoverSaveOptions) => Promise<VoiceManifest>;
  remove: (scope: VoiceScope) => Promise<VoiceManifest>;
  saveTimeline?: (timeline: VoiceTimeline, expectedTimeline?: VoiceTimeline) => Promise<VoiceManifest>;
};
export const EMPTY_VOICE_MANIFEST: VoiceManifest = {version: 1, tracks: []};
export const voiceManifestSrc = (project: VoiceoverProject) => project.manifestSrc ?? 'narration/manifest.json';

export const defineVoiceoverProject = (project: VoiceoverProject): VoiceoverProject => {
  if (!Number.isFinite(project.fps) || project.fps <= 0 ||
    !Number.isInteger(project.durationInFrames) || project.durationInFrames < 1) {
    throw new Error('配音配置需要有效的帧率和总帧数');
  }
  const scenes = [...(project.scenes ?? [])].sort((a, b) => a.from - b.from);
  const ids = new Set<string>();
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    if (typeof scene.id !== 'string' || !scene.id.trim() || scene.id === 'full' || ids.has(scene.id) || typeof scene.title !== 'string' ||
      !Number.isInteger(scene.from) || scene.from < 0 || !Number.isInteger(scene.durationInFrames) ||
      scene.durationInFrames < 1 || scene.from + scene.durationInFrames > project.durationInFrames ||
      (i > 0 && scenes[i - 1].from + scenes[i - 1].durationInFrames > scene.from)) {
      throw new Error('分镜需要唯一编号、有效帧区间，且配音区间不能重叠');
    }
    ids.add(scene.id);
  }
  const captions = [...(project.captions ?? [])].sort((a, b) => a.startFrame - b.startFrame);
  for (const cue of captions) {
    if (!Number.isInteger(cue.startFrame) || cue.startFrame < 0 || !Number.isInteger(cue.endFrame) ||
      cue.endFrame <= cue.startFrame || cue.endFrame > project.durationInFrames || typeof cue.text !== 'string' ||
      (cue.sceneId !== undefined && !ids.has(cue.sceneId))) throw new Error('字幕包含无效时间或分镜编号');
  }
  const path = voiceManifestSrc(project);
  if (!path || path.startsWith('/') || path.includes('\\') || path.includes(':') ||
    path.split('/').some(part => !part || part === '.' || part === '..') || !path.endsWith('.json')) {
    throw new Error('manifestSrc 必须是 public 目录内的相对 JSON 路径');
  }
  return {...project, scenes, captions, manifestSrc: path};
};

export const isVoiceScope = (value: unknown, project: VoiceoverProject): value is VoiceScope =>
  typeof value === 'string' && (value === 'full' || (project.scenes ?? []).some(scene => scene.id === value));

export const getVoiceRange = (scope: VoiceScope, project: VoiceoverProject) => {
  if (scope === 'full') return {from: 0, durationInFrames: project.durationInFrames, title: '整片'};
  const scene = project.scenes?.find(item => item.id === scope);
  if (!scene) throw new Error('请选择有效分镜或整片录音');
  return scene;
};

export const getVoiceCaptions = (scope: VoiceScope, project: VoiceoverProject) => {
  if (scope === 'full') return [...(project.captions ?? [])];
  const range = getVoiceRange(scope, project);
  return (project.captions ?? []).filter(cue => cue.sceneId === scope ||
    (cue.sceneId === undefined && cue.startFrame < range.from + range.durationInFrames && cue.endFrame > range.from));
};

export const voiceTimeline = (project: VoiceoverProject): VoiceTimeline => ({
  fps: project.fps, durationInFrames: project.durationInFrames,
  scenes: [...(project.scenes ?? [])], captions: [...(project.captions ?? [])],
});

/** Saved timing is data shared by the preview, Studio metadata and render. */
export const applyVoiceTimeline = (project: VoiceoverProject, timeline?: VoiceTimeline): VoiceoverProject => {
  if (timeline === undefined) return project;
  if (!timeline || typeof timeline !== 'object' || timeline.fps !== project.fps ||
    !Array.isArray(timeline.scenes) || !Array.isArray(timeline.captions)) throw new Error('字幕时间轴格式或帧率不正确');
  const next = defineVoiceoverProject({...project, ...timeline, manifestSrc: project.manifestSrc});
  const ids = new Set((project.scenes ?? []).map(scene => scene.id));
  if (next.scenes!.length !== ids.size || next.scenes!.some(scene => !ids.has(scene.id))) {
    throw new Error('字幕时间轴的分镜与当前工程不一致');
  }
  return next;
};

/** Change a slot and move later scenes/captions together, preserving gaps. */
export const resizeVoiceRange = (project: VoiceoverProject, scope: VoiceScope, durationInFrames: number): VoiceoverProject => {
  if (!Number.isInteger(durationInFrames) || durationInFrames < 1) throw new Error('请输入有效的片段时长');
  const range = getVoiceRange(scope, project);
  if (durationInFrames === range.durationInFrames) return project;
  const delta = durationInFrames - range.durationInFrames;
  if (scope === 'full' && project.scenes?.length) {
    const lastCaption = project.captions?.at(-1);
    const lastScene = project.scenes.find(scene => lastCaption && lastCaption.startFrame >= scene.from &&
      lastCaption.startFrame < scene.from + scene.durationInFrames) ?? project.scenes.at(-1)!;
    return resizeVoiceRange(project, lastScene.id, lastScene.durationInFrames + delta);
  }
  const end = range.from + range.durationInFrames;
  const map = (frame: number) => frame <= range.from ? frame : frame >= end ? frame + delta :
    range.from + Math.round((frame - range.from) * durationInFrames / range.durationInFrames);
  return defineVoiceoverProject({...project, durationInFrames: project.durationInFrames + delta,
    scenes: (project.scenes ?? []).map(scene => scene.id === scope ? {...scene, durationInFrames} :
      scene.from >= end ? {...scene, from: scene.from + delta} : scene),
    captions: (project.captions ?? []).map(cue => {
      const startFrame = Math.min(project.durationInFrames + delta - 1, map(cue.startFrame));
      return {...cue, startFrame, endFrame: Math.max(startFrame + 1, map(cue.endFrame))};
    }),
  });
};

/** Insert/remove speech time inside a scene and ripple every later cue and scene. */
export const retimeVoiceCaption = (project: VoiceoverProject, index: number,
  timing: {startFrame?: number; durationInFrames?: number}): VoiceoverProject => {
  const cue = project.captions?.[index];
  if (!Number.isInteger(index) || !cue) throw new Error('请选择有效字幕');
  const startFrame = timing.startFrame ?? cue.startFrame;
  const durationInFrames = timing.durationInFrames ?? cue.endFrame - cue.startFrame;
  if (!Number.isInteger(startFrame) || startFrame < 0 || !Number.isInteger(durationInFrames) || durationInFrames < 1) {
    throw new Error('字幕需要有效起点和时长');
  }
  const previous = project.captions?.[index - 1];
  if (previous && startFrame < previous.endFrame) throw new Error('字幕不能与上一句重叠');
  const scene = project.scenes?.find(item => cue.sceneId !== undefined ? item.id === cue.sceneId :
    cue.startFrame >= item.from && cue.endFrame <= item.from + item.durationInFrames);
  if (scene && (startFrame < scene.from || cue.endFrame > scene.from + scene.durationInFrames)) {
    throw new Error('字幕需要位于所属分镜内');
  }
  const endFrame = startFrame + durationInFrames;
  const delta = endFrame - cue.endFrame;
  if (startFrame === cue.startFrame && endFrame === cue.endFrame) return project;
  const next = scene ? resizeVoiceRange({...project, captions: []}, scene.id, scene.durationInFrames + delta) :
    {...project, durationInFrames: project.durationInFrames + delta,
      scenes: (project.scenes ?? []).map(item => item.from >= cue.endFrame ? {...item, from: item.from + delta} : item)};
  return defineVoiceoverProject({...next, captions: project.captions!.map((item, at) => at === index ?
    {...item, startFrame, endFrame} : item.startFrame >= cue.endFrame ?
      {...item, startFrame: item.startFrame + delta, endFrame: item.endFrame + delta} : item)});
};

export type VoiceCueTiming = {index: number; startFrame: number; endFrame: number};

/** Sentence buttons mark actual speech. Unread sentences keep their allotted time. */
export const alignVoiceRecording = (project: VoiceoverProject, scope: VoiceScope, frames: number,
  timings: readonly VoiceCueTiming[] = []): VoiceoverProject => {
  const range = getVoiceRange(scope, project);
  const cues = getVoiceCaptions(scope, project);
  if (scope === 'full' || !timings.length || !cues.length) {
    return resizeVoiceRange(project, scope, Math.max(range.durationInFrames, frames));
  }
  const marked = new Map<number, VoiceCueTiming>();
  let previousEnd = 0, extra = 0;
  for (const timing of timings) {
    const cue = cues[timing.index];
    if (!cue || !Number.isInteger(timing.startFrame) || !Number.isInteger(timing.endFrame) ||
      timing.startFrame < previousEnd || timing.endFrame <= timing.startFrame || timing.endFrame > frames) {
      throw new Error('朗读标记包含无效时间');
    }
    marked.set(timing.index, timing);
    previousEnd = timing.endFrame;
    extra = Math.max(extra, timing.endFrame - (cue.endFrame - range.from));
  }
  const next = resizeVoiceRange(project, scope, Math.max(range.durationInFrames + extra, frames));
  const selected = new Set(cues);
  let shift = 0;
  const replacements = cues.map((cue, index) => {
    const timing = marked.get(index);
    if (timing) {
      shift = Math.max(shift, timing.endFrame - (cue.endFrame - range.from));
      return {...cue, startFrame: range.from + timing.startFrame, endFrame: range.from + timing.endFrame};
    }
    return {...cue, startFrame: cue.startFrame + shift, endFrame: cue.endFrame + shift};
  });
  // Use the original list for identity; resize creates new caption objects.
  const others = (project.captions ?? []).filter(cue => !selected.has(cue)).map(cue =>
    cue.startFrame >= range.from + range.durationInFrames ?
      {...cue, startFrame: cue.startFrame + next.durationInFrames - project.durationInFrames,
        endFrame: cue.endFrame + next.durationInFrames - project.durationInFrames} : cue);
  return defineVoiceoverProject({...next, captions: [...others, ...replacements]});
};

const timingBoundaries = (source: VoiceoverProject, target: VoiceoverProject) => {
  const targetScenes = new Map((target.scenes ?? []).map(scene => [scene.id, scene]));
  const points = [{source: 0, target: 0}, ...(source.scenes ?? []).flatMap(scene => {
    const next = targetScenes.get(scene.id);
    if (!next) throw new Error('时间轴的分镜与当前工程不一致');
    return [{source: scene.from, target: next.from},
      {source: scene.from + scene.durationInFrames, target: next.from + next.durationInFrames}];
  }), {source: source.durationInFrames, target: target.durationInFrames}];
  return [...new Map(points.map(point => [point.source, point])).values()].sort((a, b) => a.source - b.source);
};

/** Map edited picture time to the original choreography without speeding up speech. */
export const mapVoiceFrame = (frame: number, source: VoiceoverProject, target: VoiceoverProject) => {
  const points = timingBoundaries(source, target);
  const at = Math.max(0, Math.min(source.durationInFrames - 1, frame));
  const index = points.findIndex((point, i) => i > 0 && point.source > at);
  const right = points[index], left = points[index - 1];
  return Math.min(target.durationInFrames - 1, Math.floor(left.target +
    (at - left.source) / (right.source - left.source) * (right.target - left.target)));
};

const trackSpans = (track: VoiceTrack): VoiceTrackSpan[] => track.spans ??
  [{from: track.startFrame, duration: track.durationInFrames, trimBefore: 0}];

/** Ripple edits keep later audio at the correct original WAV offset. */
export const retimeVoiceTracks = (tracks: readonly VoiceTrack[], source: VoiceoverProject, target: VoiceoverProject): VoiceTrack[] => {
  if (JSON.stringify(voiceTimeline(source)) === JSON.stringify(voiceTimeline(target))) return [...tracks];
  const boundaries = timingBoundaries(source, target);
  return tracks.flatMap(track => {
    const spans = trackSpans(track).flatMap(span => boundaries.slice(0, -1).flatMap((left, index) => {
      const right = boundaries[index + 1];
      const begin = Math.max(span.from, left.source), end = Math.min(span.from + span.duration, right.source);
      const from = left.target + begin - left.source;
      const duration = Math.min(end - begin, right.target - from);
      return duration > 0 ? [{from, duration, trimBefore: span.trimBefore + begin - span.from}] : [];
    }));
    if (!spans.length) return [];
    const merged: VoiceTrackSpan[] = [];
    for (const span of spans) {
      const previous = merged.at(-1);
      if (previous && previous.from + previous.duration === span.from && previous.trimBefore + previous.duration === span.trimBefore) {
        previous.duration += span.duration;
      } else merged.push({...span});
    }
    const startFrame = merged[0].from;
    const durationInFrames = merged.at(-1)!.from + merged.at(-1)!.duration - startFrame;
    return [{...track, startFrame, durationInFrames, spans: merged,
      sourceDurationInFrames: track.sourceDurationInFrames ?? track.durationInFrames}];
  });
};

export const parseVoiceManifest = (value: unknown, project: VoiceoverProject): VoiceManifest => {
  if (!value || typeof value !== 'object' || !('tracks' in value) || !Array.isArray(value.tracks) ||
    ('version' in value && value.version !== 1)) throw new Error('配音清单格式不正确');
  const scopes = new Set<string>();
  const ids = new Set<string>();
  const timeline = 'timeline' in value ? value.timeline as VoiceTimeline : undefined;
  const effective = applyVoiceTimeline(project, timeline);
  const tracks = value.tracks.map((entry: unknown): VoiceTrack => {
    if (!entry || typeof entry !== 'object') throw new Error('配音条目格式不正确');
    const t = entry as Record<string, unknown>;
    if (typeof t.id !== 'string' || !t.id || ids.has(t.id) || !isVoiceScope(t.scope, project) || scopes.has(t.scope) ||
      typeof t.src !== 'string' || !t.src || typeof t.recordedAt !== 'string' ||
      !Number.isInteger(t.startFrame) || !Number.isInteger(t.durationInFrames) || Number(t.durationInFrames) < 1) {
      throw new Error('配音条目包含无效文件、时间或重复录制范围');
    }
    const range = getVoiceRange(t.scope, effective);
    if (Number(t.startFrame) < range.from || Number(t.startFrame) + Number(t.durationInFrames) > range.from + range.durationInFrames) {
      throw new Error('配音条目超出所选录制范围');
    }
    if (t.sourceDurationInFrames !== undefined && (!Number.isInteger(t.sourceDurationInFrames) || Number(t.sourceDurationInFrames) < 1)) {
      throw new Error('配音的源音频时长不正确');
    }
    if (t.spans !== undefined) {
      if (!Array.isArray(t.spans) || !t.spans.length) throw new Error('配音的音频区间不正确');
      let stop = Number(t.startFrame);
      for (const span of t.spans) {
        if (!span || !Number.isInteger(span.from) || !Number.isInteger(span.duration) || !Number.isInteger(span.trimBefore) ||
          span.from < stop || span.duration < 1 || span.trimBefore < 0 ||
          span.from + span.duration > Number(t.startFrame) + Number(t.durationInFrames) ||
          span.trimBefore + span.duration > Number(t.sourceDurationInFrames ?? t.durationInFrames)) throw new Error('配音的音频区间不正确');
        stop = span.from + span.duration;
      }
    }
    ids.add(t.id); scopes.add(t.scope);
    return {...t} as VoiceTrack;
  });
  return {version: 1, tracks, ...(timeline ? {timeline: voiceTimeline(effective)} : {})};
};

/** A scene retake replaces its entire slot; a short retake leaves silence there. */
export const resolveVoiceSegments = (tracks: readonly VoiceTrack[], project: VoiceoverProject): VoiceSegment[] => {
  const full = tracks.find(track => track.scope === 'full');
  const overrides = (project.scenes ?? []).flatMap(scene => {
    const track = tracks.find(item => item.scope === scene.id);
    return track ? [{scene, track}] : [];
  });
  const boundaries = [...new Set([0, project.durationInFrames,
    ...overrides.flatMap(({scene}) => [scene.from, scene.from + scene.durationInFrames])])].sort((a, b) => a - b);
  const result: VoiceSegment[] = [];
  for (let i = 0; i < boundaries.length - 1; i++) {
    const start = boundaries[i], stop = boundaries[i + 1];
    const take = overrides.find(({scene}) => start >= scene.from && start < scene.from + scene.durationInFrames)?.track ?? full;
    if (!take) continue;
    for (const span of trackSpans(take)) {
      const from = Math.max(start, span.from);
      const end = Math.min(stop, span.from + span.duration);
      if (end <= from) continue;
      const piece = {...take, from, duration: end - from, trimBefore: span.trimBefore + from - span.from};
      const previous = result.at(-1);
      if (previous && previous.id === piece.id && previous.from + previous.duration === piece.from &&
        previous.trimBefore + previous.duration === piece.trimBefore) previous.duration += piece.duration;
      else result.push(piece);
    }
  }
  return result;
};

export const voiceCoverage = (tracks: readonly VoiceTrack[], project: VoiceoverProject) => {
  const scenes = (project.scenes ?? []).filter(scene => scene.recordable !== false);
  const segments = resolveVoiceSegments(tracks, project);
  if (!scenes.length) return segments.length ? 1 : 0;
  return scenes.filter(scene => segments.some(segment => segment.from < scene.from + scene.durationInFrames &&
    segment.from + segment.duration > scene.from)).length;
};

export const voiceSeconds = (track: VoiceTrack, project: VoiceoverProject) => ((track.sourceDurationInFrames ?? track.durationInFrames) / project.fps).toFixed(1);
export const voiceDurationLabel = (frames: number, fps: number) => {
  const seconds = frames / fps;
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round((seconds - minutes * 60) * 10) / 10;
  return minutes ? `${minutes} 分 ${remainder} 秒` : `${remainder} 秒`;
};

export const voiceCaptionsToSrt = (project: VoiceoverProject) => {
  const stamp = (frame: number) => {
    const milliseconds = Math.round(frame / project.fps * 1000);
    const pad = (value: number, digits = 2) => String(value).padStart(digits, '0');
    return `${pad(Math.floor(milliseconds / 3600000))}:${pad(Math.floor(milliseconds / 60000) % 60)}:${pad(Math.floor(milliseconds / 1000) % 60)},${pad(milliseconds % 1000, 3)}`;
  };
  return (project.captions ?? []).map((cue, index) =>
    `${index + 1}\n${stamp(cue.startFrame)} --> ${stamp(cue.endFrame)}\n${cue.text}\n`).join('\n');
};

export const previewVoiceTracks = (manifest: VoiceManifest, draft: VoiceTrack | null) =>
  draft ? draft.scope === 'full' ? [draft] : [...manifest.tracks.filter(track => track.scope !== draft.scope), draft] : manifest.tracks;

/** Continuous ducking intervals avoid music bumps at scene cuts. */
export const voiceoverVolume = (frame: number, tracks: readonly VoiceTrack[], project: VoiceoverProject,
  options: {normal?: number; ducked?: number; fadeFrames?: number} = {}) => {
  const intervals = resolveVoiceSegments(tracks, project).reduce<{start: number; end: number}[]>((all, segment) => {
    const previous = all.at(-1);
    if (previous && previous.end >= segment.from) previous.end = Math.max(previous.end, segment.from + segment.duration);
    else all.push({start: segment.from, end: segment.from + segment.duration});
    return all;
  }, []);
  const fade = options.fadeFrames ?? Math.max(1, Math.round(project.fps * .2));
  const smooth = (value: number) => {const t = Math.min(1, Math.max(0, value)); return t * t * (3 - 2 * t);};
  const amount = Math.max(0, ...intervals.map(interval => fade > 0
    ? smooth((frame - interval.start + fade) / (2 * fade)) * (1 - smooth((frame - interval.end + fade) / (2 * fade)))
    : Number(frame >= interval.start && frame < interval.end)));
  const normal = options.normal ?? .75, ducked = options.ducked ?? .2;
  return normal + (ducked - normal) * amount;
};
