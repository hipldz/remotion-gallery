import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Player, type PlayerRef} from '@remotion/player';
import {AgentFilm, defaultFilmProps} from '../src/Film';
import {CHAPTERS, DURATION, FPS, HEIGHT, SHOTS, WIDTH, getShot, readableColor} from '../src/data/story';
import {fmtTime} from '../src/lib/motion';
import {voiceCoverage} from 'remotion-voiceover/core';
import {VoiceRecorder, useVoiceover} from 'remotion-voiceover/react';
import {voiceoverProject} from '../src/voiceover.config';
import 'remotion-voiceover/styles.css';
import './style.css';
import './voiceover.css';

declare global {
  interface Window {
    __review?: {seekTo:(frame:number)=>void; getFrame:()=>number; play:()=>void; pause:()=>void; isMuted:()=>boolean};
  }
}

const PlayIcon = ({playing}:{playing:boolean}) => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
  {playing?<path d="M 6 4 h 4 v 16 H 6 Z M 14 4 h 4 v 16 h -4 Z"/>:<path d="M 6 3 L 21 12 L 6 21 Z"/>}
</svg>;

const Review = () => {
  const player=useRef<PlayerRef>(null);
  const initialFrame=Math.max(0,Math.min(DURATION-1,Number(new URLSearchParams(location.search).get('frame')??0)));
  const [frame,setFrame]=useState(initialFrame);
  const [playing,setPlaying]=useState(false);
  const [captions,setCaptions]=useState(true);
  const [music,setMusic]=useState(true);
  const [voiceover,setVoiceover]=useState(true);
  const [panel,setPanel]=useState<'shots'|'voice'>('shots');
  const {manifest,draft,tracks:voiceTracks,busy:recordingBusy,storage,refresh,
    setManifest:updateManifest,setBusy:updateBusy,setDraft:updateDraft}=useVoiceover(voiceoverProject);
  const [error,setError]=useState<string|null>(null);
  const current=getShot(frame);
  const inputProps=useMemo(()=>({...defaultFilmProps,showCaptions:captions,soundtrack:music,showVoiceover:voiceover||Boolean(draft),voiceTracks}),[captions,music,voiceover,voiceTracks,draft]);
  const voiceTargetCount=voiceoverProject.scenes!.filter(scene=>scene.recordable!==false).length;
  const seek=useCallback((f:number)=>{
    const next=Math.max(0,Math.min(DURATION-1,Math.round(f)));
    player.current?.seekTo(next);
    setFrame(next);
  },[]);
  useEffect(()=>{
    const onUpdate=()=>{void refresh();};
    import.meta.hot?.on('voiceover:update',onUpdate);
    return()=>{import.meta.hot?.off('voiceover:update',onUpdate);};
  },[refresh]);
  useEffect(()=>{
    const p=player.current;
    if(!p)return;
    const onFrame:Parameters<PlayerRef['addEventListener']>[1]=(event)=>{
      if(event.detail&&'frame' in event.detail)setFrame(Number(event.detail.frame));
    };
    const onPlay=()=>setPlaying(true),onPause=()=>setPlaying(false);
    p.addEventListener('frameupdate',onFrame);
    p.addEventListener('play',onPlay);
    p.addEventListener('pause',onPause);
    window.__review={seekTo:seek,getFrame:()=>p.getCurrentFrame(),play:()=>p.play(),pause:()=>p.pause(),isMuted:()=>p.isMuted()};
    return ()=>{p.removeEventListener('frameupdate',onFrame);p.removeEventListener('play',onPlay);p.removeEventListener('pause',onPause);delete window.__review;};
  },[seek]);
  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{
      if(recordingBusy)return;
      if(event.target instanceof HTMLInputElement||event.target instanceof HTMLButtonElement)return;
      if(event.code==='Space'){event.preventDefault();player.current?.toggle();}
      if(event.code==='ArrowRight'){event.preventDefault();seek((player.current?.getCurrentFrame()??0)+30);}
      if(event.code==='ArrowLeft'){event.preventDefault();seek((player.current?.getCurrentFrame()??0)-30);}
    };
    window.addEventListener('keydown',onKey);
    return()=>window.removeEventListener('keydown',onKey);
  },[seek,recordingBusy]);

  return <main className="review-shell">
    <header className="masthead">
      <div className="project-name"><span className="project-symbol">✦</span><div><p className="eyebrow">AI APPLICATIONS / 2023 — 2026</p><h1>从 ChatGPT 到 Agent</h1></div></div>
      <div className="masthead-meta"><span className="status-dot"/>分镜预览<span className="meta-divider"/>02:58<span>1920 × 1080 / 30 FPS</span></div>
    </header>
    <div className="review-layout">
      <section className="viewing-area">
        <div className="player-shell" data-testid="player-shell">
          <Player ref={player} component={AgentFilm} inputProps={inputProps} durationInFrames={DURATION} fps={FPS}
            compositionWidth={WIDTH} compositionHeight={HEIGHT} initialFrame={initialFrame} controls={false} autoPlay={false}
            clickToPlay={false} doubleClickToFullscreen style={{width:'100%',aspectRatio:'16 / 9'}}
            errorFallback={({error:playerError})=>{if(!error)setTimeout(()=>setError(playerError.message),0);return <div className="player-error">{playerError.message}</div>;}} />
          {error&&<div role="alert" className="player-error">{error}</div>}
        </div>
        <div className="transport">
          <button className="play-button" disabled={recordingBusy} aria-label={playing?'暂停':'播放'} onClick={()=>player.current?.toggle()}><PlayIcon playing={playing}/></button>
          <div className="timecode" data-testid="timecode">{fmtTime(frame)}<span>/ 02:58</span></div>
          <input aria-label="播放进度" disabled={recordingBusy} className="seek-slider" type="range" min={0} max={DURATION-1} value={frame} onChange={event=>seek(Number(event.target.value))} />
          <label className="toggle"><input type="checkbox" disabled={recordingBusy} checked={captions} onChange={event=>setCaptions(event.target.checked)} aria-label="字幕"/>字幕</label>
          <label className="toggle"><input type="checkbox" disabled={recordingBusy} checked={music} onChange={event=>setMusic(event.target.checked)} aria-label="氛围音乐"/>氛围音乐</label>
          <label className="toggle"><input type="checkbox" disabled={recordingBusy} checked={voiceover} onChange={event=>setVoiceover(event.target.checked)} aria-label="配音播放"/>配音</label>
          <button className="recording-launch" disabled={recordingBusy} onClick={()=>setPanel('voice')}>录制配音</button>
          <button className="fullscreen-button" aria-label="全屏预览" onClick={()=>player.current?.requestFullscreen()}><svg width="19" height="19" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5"><path d="M 4 9 V 4 H 9 M 15 4 H 20 V 9 M 20 15 V 20 H 15 M 9 20 H 4 V 15"/></svg></button>
        </div>
        <div className="chapter-track">
          {CHAPTERS.map(chapter=><button key={chapter.name} disabled={recordingBusy} onClick={()=>seek(chapter.start)} style={{flex:chapter.end-chapter.start,'--chapter-color':chapter.color} as React.CSSProperties}
            className={frame>=chapter.start&&frame<chapter.end?'active':''} title={`${fmtTime(chapter.start)} · ${chapter.name}`}><span className="chapter-line"/>{chapter.name}</button>)}
        </div>
        <div className="current-scene"><div><span className="shot-id" style={{color:readableColor(current.color)}}>{current.id}</span><strong>{current.title}</strong></div><span>{frame} / 5340 帧</span></div>
        <p className="review-note">2023—2026，AI 应用技术的变化<span>空格播放 / 暂停 · ← → 逐秒检查</span></p>
      </section>
      <aside className="shot-panel" aria-label="分镜列表">
        <div className="shot-panel-heading"><div className="panel-tabs" role="tablist" aria-label="审片与录音">
          <button role="tab" aria-selected={panel==='shots'} className={panel==='shots'?'selected':''} disabled={recordingBusy} onClick={()=>setPanel('shots')}>分镜</button>
          <button role="tab" aria-selected={panel==='voice'} className={panel==='voice'?'selected':''} disabled={recordingBusy} onClick={()=>setPanel('voice')}>配音</button>
        </div><span>{panel==='voice'?`${voiceCoverage(manifest.tracks,voiceoverProject)} / ${voiceTargetCount}`:'20 SHOTS'}</span></div>
        <div className="shot-list" hidden={panel!=='shots'}>
          {SHOTS.map(shot=><button key={shot.id} disabled={recordingBusy} className={`shot-item ${current.id===shot.id?'selected':''} ${manifest.tracks.some(track=>track.scope===shot.id)?'has-voice':''}`} onClick={()=>{player.current?.pause();seek(shot.start+Math.min(60,Math.floor(shot.duration/3)));}}
            data-testid={`shot-${shot.id}`} style={{'--shot-color':shot.color} as React.CSSProperties}>
            <span className="shot-number">{shot.id}</span><span className="shot-detail"><strong>{shot.title}</strong><span>{fmtTime(shot.start)} — {fmtTime(shot.start+shot.duration)}</span></span>
            <span className="shot-duration">{shot.duration/30}s</span>
          </button>)}
        </div>
        <div className="voice-panel" hidden={panel!=='voice'}><VoiceRecorder project={voiceoverProject} storage={storage} player={player} currentSceneId={current.id} frame={frame}
          manifest={manifest} onManifest={updateManifest} onBusy={updateBusy} onDraft={updateDraft} onSeek={seek}/></div>
        <div className="shot-panel-footer">{panel==='voice'?'倒计时 → 录音 → 试听 → 保存':'对话 → 工具 → 工作流 → Agent'}</div>
      </aside>
    </div>
  </main>;
};

createRoot(document.getElementById('root')!).render(<Review/>);
