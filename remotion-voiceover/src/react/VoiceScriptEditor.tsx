import {useEffect, useRef, useState} from 'react';
import {defineVoiceoverProject, getVoiceCaptions, getVoiceRange, resizeVoiceRange, retimeVoiceCaption, voiceTimeline,
  type VoiceCaption, type VoiceManifest, type VoiceoverProject, type VoiceoverStorage} from '../core/index.js';

type Row = {id: number; text: string; start: string; seconds: string; sceneId?: string};
type Draft = {baseProject: VoiceoverProject; project: VoiceoverProject; scope: string; rows: Row[]; duration: string; nextId: number};
const secondsInput = (frames: number, fps: number) => (frames / fps).toFixed(3);
const secondsFor = (text: string) => Math.max(1.5,
  (text.replace(/[\s，。！？、；：,.!?;:]/g, '').length / 4.5) + (text.match(/[，。！？、；：,.!?;:]/g)?.length ?? 0) * .25);

const syncDraft = (current: Draft, project: VoiceoverProject, rows = current.rows): Draft => {
  const before = getVoiceCaptions(current.scope, current.project), after = getVoiceCaptions(current.scope, project);
  const range = getVoiceRange(current.scope, project), previousRange = getVoiceRange(current.scope, current.project);
  return {...current, project, duration: range.durationInFrames === previousRange.durationInFrames ? current.duration :
    secondsInput(range.durationInFrames, project.fps), rows: rows.map((row, index) => {
      const old = before[current.rows.findIndex(item => item.id === row.id)], cue = after[index];
      return {...row, sceneId: cue.sceneId,
        start: !old || (cue.startFrame !== old.startFrame && row.start.trim() && Number.isFinite(Number(row.start))) ?
          secondsInput(cue.startFrame - range.from, project.fps) : row.start,
        seconds: !old || (cue.endFrame - cue.startFrame !== old.endFrame - old.startFrame && row.seconds.trim() && Number.isFinite(Number(row.seconds))) ?
          secondsInput(cue.endFrame - cue.startFrame, project.fps) : row.seconds};
    })};
};

/** Explicit slot length adds/removes a tail; the sentence timings stay intact. */
const fitRange = (project: VoiceoverProject, scope: string, frames: number) => {
  const range = getVoiceRange(scope, project), selected = new Set(getVoiceCaptions(scope, project));
  const next = resizeVoiceRange({...project, captions: []}, scope, frames);
  const delta = next.durationInFrames - project.durationInFrames;
  return defineVoiceoverProject({...next, captions: (project.captions ?? []).map(cue =>
    !selected.has(cue) && cue.startFrame >= range.from + range.durationInFrames ?
      {...cue, startFrame: cue.startFrame + delta, endFrame: cue.endFrame + delta} : cue)});
};

const updateRow = (current: Draft, id: number, field: 'text' | 'start' | 'seconds', value: string): Draft => {
  const rows = current.rows.map(row => row.id === id ? {...row, [field]: value} : row);
  const raw = {...current, rows};
  if (field === 'text' || !value.trim() || !Number.isFinite(Number(value)) || Number(value) < 0) return raw;
  const index = current.rows.findIndex(row => row.id === id), cue = getVoiceCaptions(current.scope, current.project)[index];
  const range = getVoiceRange(current.scope, current.project), frames = Math.round(Number(value) * current.project.fps);
  if (field === 'seconds' && frames < 1) return raw;
  try {
    const next = retimeVoiceCaption(current.project, current.project.captions!.indexOf(cue), field === 'seconds' ?
      {durationInFrames: frames} : {startFrame: range.from + frames});
    const synced = syncDraft(current, next, rows);
    return {...synced, rows: synced.rows.map(row => row.id === id ? {...row, [field]: value} : row)};
  } catch {return raw;} // Keep partially typed/invalid input for validation on save.
};

const updateDuration = (current: Draft, value: string): Draft => {
  const raw = {...current, duration: value};
  if (!value.trim() || !Number.isFinite(Number(value)) || Number(value) <= 0) return raw;
  const range = getVoiceRange(current.scope, current.project);
  const frames = Math.max(1, Math.round(Number(value) * current.project.fps),
    ...getVoiceCaptions(current.scope, current.project).map(cue => cue.endFrame - range.from));
  try {return {...syncDraft(current, fitRange(current.project, current.scope, frames)), duration: value};}
  catch {return raw;}
};

const appendRow = (current: Draft): Draft => {
  const project = current.project, range = getVoiceRange(current.scope, project);
  const last = getVoiceCaptions(current.scope, project).at(-1);
  const owner = current.scope !== 'full' ? project.scenes?.find(scene => scene.id === current.scope) :
    project.scenes?.find(scene => last?.sceneId === scene.id) ?? project.scenes?.find(scene => last &&
      last.startFrame >= scene.from && last.endFrame <= scene.from + scene.durationInFrames) ??
    project.scenes?.find(scene => scene.recordable !== false);
  const startFrame = last?.endFrame ?? owner?.from ?? range.from;
  const duration = Math.max(1, Math.round(3 * project.fps)), endFrame = startFrame + duration;
  let next = project;
  if (owner && endFrame > owner.from + owner.durationInFrames) next = fitRange(project, owner.id, endFrame - owner.from);
  else if (endFrame > project.durationInFrames) next = fitRange(project, 'full', endFrame);
  next = defineVoiceoverProject({...next, captions: [...(next.captions ?? []),
    {text: '', startFrame, endFrame, ...(owner ? {sceneId: owner.id} : {})}]});
  const rows = [...current.rows, {id: current.nextId, text: '', start: secondsInput(startFrame - range.from, project.fps),
    seconds: secondsInput(duration, project.fps), sceneId: owner?.id}];
  return {...syncDraft(current, next, rows), nextId: current.nextId + 1};
};

export const VoiceScriptEditor = ({project, scope, storage, disabled, onManifest, onBusy, onSeek}: {
  project: VoiceoverProject; scope: string; storage: VoiceoverStorage; disabled: boolean;
  onManifest: (manifest: VoiceManifest) => void; onBusy: (busy: boolean) => void; onSeek: (frame: number) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const range = getVoiceRange(scope, project);
  const rows = draft?.rows ?? [], duration = draft?.duration ?? '';
  const latestEnd = Math.max(0, ...rows.map(row => Number(row.start) + Number(row.seconds)).filter(Number.isFinite));
  const nextSeconds = Math.max(Number(duration) || 0, latestEnd);
  const ripple = draft ? (draft.project.durationInFrames - draft.baseProject.durationInFrames) / project.fps : 0;
  useEffect(() => {if (open) dialog.current?.showModal();}, [open]);
  const show = () => {
    const rows = getVoiceCaptions(scope, project).map((cue, id) => ({id, text: cue.text,
      start: secondsInput(cue.startFrame - range.from, project.fps),
      seconds: secondsInput(cue.endFrame - cue.startFrame, project.fps), sceneId: cue.sceneId}));
    setDraft({baseProject: project, project, scope, rows, duration: secondsInput(range.durationInFrames, project.fps), nextId: rows.length});
    setError(null); setOpen(true);
  };
  const update = (id: number, field: 'text' | 'start' | 'seconds', value: string) => {
    setError(null); setDraft(current => current ? updateRow(current, id, field, value) : current);
  };
  const estimate = () => {
    setError(null);
    setDraft(current => {
      if (!current) return current;
      let fitted = current;
      for (const row of current.rows) fitted = updateRow(fitted, row.id, 'seconds', (Math.round(secondsFor(row.text) * 10) / 10).toFixed(1));
      const range = getVoiceRange(fitted.scope, fitted.project);
      const end = Math.max(range.durationInFrames, ...getVoiceCaptions(fitted.scope, fitted.project).map(cue =>
        cue.endFrame - range.from + Math.round(.3 * fitted.project.fps)));
      return updateDuration(fitted, secondsInput(end, fitted.project.fps));
    });
  };
  const save = async () => {
    if (!storage.saveTimeline || !draft) return;
    setError(null);
    try {
      const editScope = draft.scope, editRange = getVoiceRange(editScope, draft.project), fps = draft.project.fps;
      if (!Number.isFinite(nextSeconds) || nextSeconds <= 0 || !Number.isFinite(Number(duration)) || Number(duration) <= 0) {
        throw new Error('请输入大于 0 的片段时长');
      }
      let previousEnd = 0;
      const captions: VoiceCaption[] = rows.map(row => {
        const startFrame = editRange.from + Math.round(Number(row.start) * fps);
        const endFrame = startFrame + Math.round(Number(row.seconds) * fps);
        if (!row.text.trim() || !row.start.trim() || !row.seconds.trim() || !Number.isFinite(startFrame) ||
          !Number.isFinite(endFrame) || startFrame < editRange.from + previousEnd || endFrame <= startFrame) {
          throw new Error('每句需要正文、有效时间，且不能与上一句重叠');
        }
        previousEnd = endFrame - editRange.from;
        const sceneId = editScope !== 'full' ? editScope : row.sceneId;
        return {text: row.text.trim(), startFrame, endFrame, ...(sceneId !== undefined ? {sceneId} : {})};
      });
      const frames = Math.max(1, Math.round(Number(duration) * fps), ...captions.map(cue => cue.endFrame - editRange.from));
      const next = fitRange(draft.project, editScope, frames);
      const selected = new Set(getVoiceCaptions(editScope, next));
      const others = (next.captions ?? []).filter(cue => !selected.has(cue));
      for (const cue of captions) {
        const owner = next.scenes?.find(scene => scene.id === cue.sceneId);
        if (owner && (cue.startFrame < owner.from || cue.endFrame > owner.from + owner.durationInFrames)) {
          throw new Error('每句字幕需要位于所属分镜内');
        }
      }
      const resolved = defineVoiceoverProject({...next, captions: [...others, ...captions]});
      setSaving(true); onBusy(true);
      onManifest(await storage.saveTimeline(voiceTimeline(resolved), voiceTimeline(draft.baseProject)));
      onSeek(editRange.from); setOpen(false);
    } catch (failure) {setError(failure instanceof Error ? failure.message : '无法保存稿件');}
    finally {setSaving(false); onBusy(false);}
  };
  return <>
    <button className="voice-edit-button" disabled={disabled || !storage.saveTimeline} onClick={show}>编辑稿件与时长</button>
    {open && <dialog className="voice-editor" ref={dialog} onCancel={event => {if (saving) event.preventDefault(); else setOpen(false);}}
      onClose={() => setOpen(false)} aria-labelledby="voice-editor-title">
      <form onSubmit={event => {event.preventDefault(); void save();}}>
        <div className="voice-editor-header"><div><h2 id="voice-editor-title">{range.title} · 口播稿</h2>
          <p>改一句时长，后面的字幕和镜头会一起顺延。开始时间从当前范围起点计算。</p></div>
          <button type="button" disabled={saving} onClick={() => setOpen(false)} aria-label="关闭稿件编辑">×</button></div>
        <div className="voice-editor-tools"><label>片段时长（秒）<input aria-label="片段时长（秒）" type="number" min="0.001" step="any"
          value={duration} disabled={saving} onChange={event => {const value = event.target.value; setError(null);
            setDraft(current => current ? updateDuration(current, value) : current);}}/></label>
          <button type="button" disabled={saving || !rows.length} onClick={estimate}>按正常语速估算</button></div>
        <div className="voice-editor-rows">
          {rows.map((row, index) => <div className="voice-editor-row" key={row.id}>
            <textarea aria-label={`第 ${index + 1} 句正文`} placeholder="输入这一句要说的话" value={row.text} disabled={saving}
              onChange={event => update(row.id, 'text', event.target.value)}/>
            <label>开始（秒）<input aria-label={`第 ${index + 1} 句开始（秒）`} type="number" min="0" step="any" value={row.start}
              disabled={saving} onChange={event => update(row.id, 'start', event.target.value)}/></label>
            <label>持续（秒）<input aria-label={`第 ${index + 1} 句持续（秒）`} type="number" min="0.001" step="any" value={row.seconds}
              disabled={saving} onChange={event => update(row.id, 'seconds', event.target.value)}/></label>
            <button type="button" aria-label={`删除第 ${index + 1} 句`} disabled={saving}
              onClick={() => setDraft(current => {
                if (!current) return current;
                const cue = getVoiceCaptions(current.scope, current.project)[current.rows.findIndex(item => item.id === row.id)];
                const next = defineVoiceoverProject({...current.project, captions: current.project.captions!.filter(item => item !== cue)});
                return syncDraft(current, next, current.rows.filter(item => item.id !== row.id));
              })}>删除</button>
          </div>)}
          <button className="voice-add-cue" type="button" disabled={saving}
            onClick={() => setDraft(current => current ? appendRow(current) : current)}>＋ 增加一句字幕</button>
        </div>
        <div className="voice-editor-footer"><p>{(range.durationInFrames / project.fps).toFixed(1)} 秒 → {nextSeconds.toFixed(1)} 秒
          {ripple !== 0 && ` · 后续${ripple > 0 ? '顺延' : '提前'} ${Math.abs(ripple).toFixed(1)} 秒`}</p>
          {error && <div className="voice-error" role="alert">{error}</div>}
          <button className="voice-button primary" type="submit" disabled={saving}>{saving ? '正在保存…' : '保存字幕与时间'}</button></div>
      </form>
    </dialog>}
  </>;
};
