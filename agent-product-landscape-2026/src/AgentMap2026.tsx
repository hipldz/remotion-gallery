import { useMemo } from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { C, fonts } from './data/theme';
import { animationFrameFor, motionStateFor, shotAt, type FilmProps, type TimedShot } from './lib/timeline';
import { createVoiceoverProject, resolveVoiceTimeline } from './voiceover.config';
import { buildCameraTrack, cameraAt } from './lib/camera';
import { CinemaContext, fade, focalAssets, useCinema, type CinemaState } from './lib/cinematics';
import { AssetContext } from './components/Media';
import { FilmBranding } from './components/FilmBranding';
import { WorldLayer } from './components/WorldLayer';
import { FilmOptics, ShotRig, EditBridge } from './components/FilmRig';
import { Impact, impactCues, shakeAt } from './components/FX';
import { Soundtrack } from './components/Soundtrack';
import { At } from './components/Primitives';
import { ColdOpen } from './scenes/ColdOpen';
import { Eyecatch } from './scenes/Eyecatch';
import { Prologue } from './scenes/Prologue';
import { EarlyYears } from './scenes/EarlyYears';
import { Year2024 } from './scenes/Year2024';
import { Year2025 } from './scenes/Year2025';
import { Year2026 } from './scenes/Year2026';
import { Finale } from './scenes/Finale';
import './film.css';
import './fonts';

function OriginalScene({ shot, f }: { shot: TimedShot; f: number }) {
  const props = { id: shot.id, f };
  if (shot.kind === 'CARD') return <Eyecatch chapterKey={shot.chapterKey} f={f} />;
  const content =
    shot.chapterKey === 'P' ? (
      <ColdOpen {...props} />
    ) : shot.chapterKey === 'Z' ? (
      <Prologue {...props} />
    ) : ['A', 'B'].includes(shot.chapterKey) ? (
      <EarlyYears {...props} />
    ) : shot.chapterKey === 'C' ? (
      <Year2024 {...props} />
    ) : ['D', 'E'].includes(shot.chapterKey) ? (
      <Year2025 {...props} />
    ) : shot.chapterKey === 'F' ? (
      <Year2026 {...props} />
    ) : (
      <Finale {...props} />
    );
  return <ShotRig still={['B02', 'P03'].includes(shot.id)}>{content}</ShotRig>;
}

function ShotContent({ shot }: { shot: TimedShot }) {
  const local = useCurrentFrame();
  const cinema = useCinema();
  const held = Math.min(local, shot.duration - 1);
  const motion = motionStateFor(shot, held);
  const context = { ...cinema, shot, frame: shot.from + held };
  const snapshots = [
    ...(motion.previousFrame === undefined ? [] : [{ frame: motion.previousFrame, opacity: 1 - motion.blend }]),
    { frame: motion.frame, opacity: motion.blend },
  ];
  return (
    <AbsoluteFill
      data-cinematic-shot={shot.id}
      data-motion-frame={motion.frame}
      data-motion-cue={motion.cueIndex}
      style={{ opacity: shot.from === 0 ? 1 : fade(local, 0, 12) }}
    >
      {snapshots.map((snapshot, index) => (
        <CinemaContext.Provider key={index} value={{ ...context, f: snapshot.frame }}>
          <AbsoluteFill style={{ opacity: snapshot.opacity }}>
            <OriginalScene shot={shot} f={snapshot.frame} />
          </AbsoluteFill>
        </CinemaContext.Provider>
      ))}
    </AbsoluteFill>
  );
}

const mapShots = new Set(['P06', 'Z04', 'D01', 'D06', 'G01', 'G06']);
const cleanInserts = new Set([
  'P01',
  'P02',
  'P03',
  'Z04',
  'A00',
  'A02',
  'B00',
  'B01',
  'B02',
  'C00',
  'C01',
  'C03',
  'D00',
  'D01',
  'D02',
  'D06',
  'E01',
  'F00',
  'F01',
  'F04',
  'F06',
  'G00',
  'G02',
]);

function sourceAssets(shot: TimedShot, f: number) {
  if (shot.id === 'B04') return [f < 180 ? 'cursor' : 'aider'];
  if (shot.id === 'C02') return f < 140 ? [] : ['devin'];
  if (shot.id === 'F02') return [f < 130 ? 'cowork' : 'openclaw'];
  return focalAssets[shot.id] ?? [];
}

export function AgentMap2026({ timeline: sourceTimeline, availableFiles, showSubtitles, enableSfx, frameOffset, voiceTracks, voiceProject }: FilmProps) {
  const project = useMemo(() => voiceProject ?? createVoiceoverProject(sourceTimeline), [voiceProject, sourceTimeline]);
  const timeline = useMemo(() => resolveVoiceTimeline(sourceTimeline, project), [sourceTimeline, project]);
  const frame = useCurrentFrame() + frameOffset;
  const shot = shotAt(timeline, frame);
  const f = animationFrameFor(shot, frame - shot.from);
  const track = useMemo(() => buildCameraTrack(timeline), [timeline]);
  const camera = cameraAt(frame, track),
    previous = cameraAt(Math.max(0, frame - 1), track);
  const velocity = (camera.x - previous.x) * camera.z;
  const value: CinemaState = { frame, f, shot, timeline, camera, velocity, dark: false, visualAssets: sourceAssets(shot, f) };
  const impact = impactCues[shot.id as keyof typeof impactCues];
  const impactNow = !!impact && f >= impact.at && f < impact.at + 2;
  const shake = shakeAt(f, shot.id);
  const caption = project.captions!.find((cue) => cue.startFrame <= frame && cue.endFrame > frame);
  const focus = !!focalAssets[shot.id];
  const mapOpacity =
    shot.id === 'P07'
      ? 1 - fade(f, 0, 22)
      : cleanInserts.has(shot.id)
        ? 0
        : mapShots.has(shot.id)
          ? shot.id === 'G01'
            ? 1 - fade(f, 58, 45) * 0.93
            : 1
          : focus
            ? 0.16
            : 0.075;
  const outroFrom = Math.max(project.durationInFrames - 18, project.captions!.at(-1)?.endFrame ?? 0);
  const outroDuration = project.durationInFrames - outroFrom;
  return (
    <CinemaContext.Provider value={value}>
      <AssetContext.Provider value={availableFiles}>
        <AbsoluteFill
          data-film="AgentMap2026"
          data-version="4.1"
          data-shot={shot.id}
          data-animation-frame={f}
          data-cinematic-style="original"
          style={{ fontFamily: fonts.sans, color: C.ink, overflow: 'hidden', background: '#FCFCFD' }}
        >
          <AbsoluteFill style={{ transform: `translate(${shake.x}px,${shake.y}px)` }}>
            <WorldLayer dim={mapOpacity} blur={focus ? 5 : 0} />
            {shot.id === 'F01' && <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 55% 60%,#FEF7E0AA,transparent 80%)' }} />}
            {impactNow && <AbsoluteFill style={{ background: impact.color }} />}
            <AbsoluteFill style={{ filter: impactNow ? 'brightness(0)' : undefined }}>
              {timeline
                .filter((entry) => entry.from + entry.duration > frameOffset)
                .map((entry, index, selection) => (
                  <Sequence
                    key={entry.id}
                    from={entry.from - frameOffset}
                    durationInFrames={entry.duration + (index < selection.length - 1 ? 12 : 0)}
                    name={`${entry.id} · ${entry.title}`}
                  >
                    <ShotContent shot={entry} />
                  </Sequence>
                ))}
            </AbsoluteFill>
            <Impact id={shot.id} f={f} />
            <EditBridge />
          </AbsoluteFill>
          <FilmOptics />
          <FilmBranding />
          {showSubtitles && caption && (
            <At x={100} style={{ top: 'auto', bottom: 96, width: 1720, display: 'flex', justifyContent: 'center', zIndex: 200 }}>
              <div
                data-film-caption={caption.sceneId ?? shot.id}
                data-caption-start={caption.startFrame}
                data-caption-end={caption.endFrame}
                style={{
                  maxWidth: 1670,
                  fontFamily: fonts.chinese,
                  fontSize: 31,
                  fontWeight: 500,
                  lineHeight: 1.42,
                  letterSpacing: 0.4,
                  color: C.ink,
                  background: '#FFFFFFDC',
                  padding: '6px 22px',
                  borderRadius: 8,
                  boxShadow: '0 2px 12px #FFFFFFA0',
                }}
              >
                {caption.text}
              </div>
            </At>
          )}
          {frame < 25 && <AbsoluteFill style={{ background: '#FCFCFD', opacity: 1 - fade(frame, 0, 25), zIndex: 145 }} />}
          {outroDuration > 1 && frame >= outroFrom && (
            <AbsoluteFill data-film-outro style={{ background: '#000', opacity: fade(frame, outroFrom, outroDuration - 1), zIndex: 250 }} />
          )}
          <Soundtrack timeline={sourceTimeline} project={project} files={availableFiles} frameOffset={frameOffset} sfx={enableSfx} voiceTracks={voiceTracks} />
        </AbsoluteFill>
      </AssetContext.Provider>
    </CinemaContext.Provider>
  );
}
