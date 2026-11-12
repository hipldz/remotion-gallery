import {useEffect, useRef, useState} from 'react';
import {defineVoiceoverProject, getVoiceCaptions, getVoiceRange, resizeVoiceRange, voiceTimeline,
  type VoiceCaption, type VoiceManifest, type VoiceoverProject, type VoiceoverStorage} from '../core/index.js';

type Row = {id: number; text: string; start: string; seconds: string; sceneId?: string};
const secondsFor = (text: string) => Math.max(1.5,
  (text.replace(/[\s，。！？、；：,.!?;:]/g, '').length / 4.5) + (text.match(/[，。！？、；：,.!?;:]/g)?.length ?? 0) * .25);

export const VoiceScriptEditor = ({project, scope, storage, disabled, onManifest, onBusy, onSeek}: {
  project: VoiceoverProject; scope: string; storage: VoiceoverStorage; disabled: boolean;
  onManifest: (manifest: VoiceManifest) => void; onBusy: (busy: boolean) => void; onSeek: (frame: number) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [duration, setDuration] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const sequence = useRef(0);
  const range = getVoiceRange(scope, project);
  const latestEnd = Math.max(0, ...rows.map(row => Number(row.start) + Number(row.seconds)));
  const nextSeconds = Math.max(Number(duration) || 0, latestEnd);
  useEffect(() => {if (open) dialog.current?.showModal();}, [open]);
  const show = () => {
    setRows(getVoiceCaptions(scope, project).map(cue => ({id: sequence.current++, text: cue.text,
      start: ((cue.startFrame - range.from) / project.fps).toFixed(3),
      seconds: ((cue.endFrame - cue.startFrame) / project.fps).toFixed(3), sceneId: cue.sceneId})));
    setDuration((range.durationInFrames / project.fps).toFixed(3));
    setError(null); setOpen(true);
  };
  const update = (id: number, field: 'text' | 'start' | 'seconds', value: string) =>
    setRows(current => current.map(row => row.id === id ? {...row, [field]: value} : row));
  const estimate = () => {
    let at = Number(rows[0]?.start) || 0;
    const fitted = rows.map(row => {
      const seconds = Math.round(secondsFor(row.text) * 10) / 10;
      const next = {...row, start: at.toFixed(3), seconds: seconds.toFixed(1)};
      at += seconds;
      return next;
    });
    setRows(fitted); setDuration(Math.max(range.durationInFrames / project.fps, at + .3).toFixed(3));
  };
  const save = async () => {
    if (!storage.saveTimeline) return;
    setError(null);
    try {
      if (!Number.isFinite(nextSeconds) || nextSeconds <= 0 || !Number.isFinite(Number(duration)) || Number(duration) <= 0) {
        throw new Error('请输入大于 0 的片段时长');
      }
      let previousEnd = 0;
      const captions: VoiceCaption[] = rows.map(row => {
        const startFrame = range.from + Math.round(Number(row.start) * project.fps);
        const endFrame = startFrame + Math.round(Number(row.seconds) * project.fps);
        if (!row.text.trim() || !row.start.trim() || !row.seconds.trim() || !Number.isFinite(startFrame) ||
          !Number.isFinite(endFrame) || startFrame < range.from + previousEnd || endFrame <= startFrame) {
          throw new Error('每句需要正文、有效时间，且不能与上一句重叠');
        }
        previousEnd = endFrame - range.from;
        return {text: row.text.trim(), startFrame, endFrame, ...(scope !== 'full' ? {sceneId: scope} : {})};
      });
      const selected = new Set(getVoiceCaptions(scope, project));
      const frames = Math.max(1, Math.round(Number(duration) * project.fps), ...captions.map(cue => cue.endFrame - range.from));
      const next = resizeVoiceRange({...project, captions: []}, scope, frames);
      const delta = next.durationInFrames - project.durationInFrames;
      const others = (project.captions ?? []).filter(cue => !selected.has(cue)).map(cue =>
        cue.startFrame >= range.from + range.durationInFrames ?
          {...cue, startFrame: cue.startFrame + delta, endFrame: cue.endFrame + delta} : cue);
      const resolved = defineVoiceoverProject({...next, captions: [...others, ...captions]});
      setSaving(true); onBusy(true);
      onManifest(await storage.saveTimeline(voiceTimeline(resolved), voiceTimeline(project)));
      onSeek(range.from); setOpen(false);
    } catch (failure) {setError(failure instanceof Error ? failure.message : '无法保存稿件');}
    finally {setSaving(false); onBusy(false);}
  };
  return <>
    <button className="voice-edit-button" disabled={disabled || !storage.saveTimeline} onClick={show}>编辑稿件与时长</button>
    {open && <dialog className="voice-editor" ref={dialog} onCancel={event => {if (saving) event.preventDefault(); else setOpen(false);}}
      onClose={() => setOpen(false)} aria-labelledby="voice-editor-title">
      <form onSubmit={event => {event.preventDefault(); void save();}}>
        <div className="voice-editor-header"><div><h2 id="voice-editor-title">{range.title} · 口播稿</h2>
          <p>一句一条字幕。读不完可以加时间，后面的分镜会一起顺延。</p></div>
          <button type="button" disabled={saving} onClick={() => setOpen(false)} aria-label="关闭稿件编辑">×</button></div>
        <div className="voice-editor-tools"><label>片段时长（秒）<input aria-label="片段时长（秒）" type="number" min="0.001" step="any"
          value={duration} disabled={saving} onChange={event => setDuration(event.target.value)}/></label>
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
              onClick={() => setRows(current => current.filter(item => item.id !== row.id))}>删除</button>
          </div>)}
          <button className="voice-add-cue" type="button" disabled={saving} onClick={() => setRows(current => [...current,
            {id: sequence.current++, text: '', start: latestEnd.toFixed(3), seconds: '3'}])}>＋ 增加一句字幕</button>
        </div>
        <div className="voice-editor-footer"><p>{(range.durationInFrames / project.fps).toFixed(1)} 秒 → {nextSeconds.toFixed(1)} 秒
          {nextSeconds > range.durationInFrames / project.fps && ` · 后续顺延 ${(nextSeconds - range.durationInFrames / project.fps).toFixed(1)} 秒`}</p>
          {error && <div className="voice-error" role="alert">{error}</div>}
          <button className="voice-button primary" type="submit" disabled={saving}>{saving ? '正在保存…' : '保存字幕与时间'}</button></div>
      </form>
    </dialog>}
  </>;
};
