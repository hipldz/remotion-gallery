import { useMemo } from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { C, fonts } from './data/theme';
import { animationFrameFor, shotAt, type FilmProps, type TimedShot } from './lib/timeline';
import { createVoiceoverProject, resolveVoiceTimeline } from './voiceover.config';
import { buildCameraTrack, cameraAt } from './lib/camera';
import { CinemaContext, fade, focalAssets, limit, type CinemaState } from './lib/cinematics';
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

function ShotContent({ shot }: { shot: TimedShot }) {
  const local = useCurrentFrame();
  const f = animationFrameFor(shot, local);
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
  // Keep the opening in the same light atlas as the product chapters.
  const dark = false;
  const value: CinemaState = { frame, f, shot, timeline, camera, velocity, dark };
  const impact = impactCues[shot.id as keyof typeof impactCues];
  const impactNow = !!impact && f >= impact.at && f < impact.at + 2;
  const shake = shakeAt(f, shot.id);
  const caption = project.captions!.find((c) => c.startFrame <= frame && c.endFrame > frame);
  const duration = project.durationInFrames;
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
          : dark
            ? 0.35
            : focus
              ? 0.16
              : 0.075;
  return (
    <CinemaContext.Provider value={value}>
      <AssetContext.Provider value={availableFiles}>
        <AbsoluteFill
          data-film="AgentMap2026"
          data-version="3"
          data-shot={shot.id}
          style={{ fontFamily: fonts.sans, color: C.ink, overflow: 'hidden', background: dark ? C.night : '#FCFCFD' }}
        >
          <AbsoluteFill style={{ transform: `translate(${shake.x}px,${shake.y}px)` }}>
            <WorldLayer dim={mapOpacity} blur={focus ? 5 : 0} />
            {shot.id === 'F01' && <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 55% 60%,#FEF7E0AA,transparent 80%)' }} />}
            {impactNow && <AbsoluteFill style={{ background: impact.color }} />}
            <AbsoluteFill style={{ filter: impactNow ? 'brightness(0)' : undefined }}>
              {timeline.map((s) => (
                <Sequence key={s.id} from={s.from - frameOffset} durationInFrames={s.duration} name={`${s.id} · ${s.title}`}>
                  <ShotContent shot={s} />
                </Sequence>
              ))}
            </AbsoluteFill>
            <Impact id={shot.id} f={f} />
            <EditBridge />
          </AbsoluteFill>
          <FilmOptics />
          <FilmBranding />
          {showSubtitles && caption && !impactNow && (
            <At x={100} style={{ top: 'auto', bottom: 96, width: 1720, display: 'flex', justifyContent: 'center', zIndex: 200 }}>
              <div
                data-film-caption={caption.sceneId ?? shot.id}
                style={{
                  maxWidth: 1670,
                  fontSize: 31,
                  fontWeight: 500,
                  lineHeight: 1.42,
                  letterSpacing: 0.4,
                  color: dark ? '#F1F3F7' : C.ink,
                  background: dark ? '#11151DCA' : '#FFFFFFDC',
                  padding: '6px 22px',
                  borderRadius: 8,
                  boxShadow: dark ? '0 2px 16px #0002' : '0 2px 12px #FFFFFFA0',
                }}
              >
                {caption.text}
              </div>
            </At>
          )}
          {frame < 25 && <AbsoluteFill style={{ background: '#FCFCFD', opacity: 1 - fade(frame, 0, 25), zIndex: 300 }} />}
          {frame >= duration - 18 && <AbsoluteFill style={{ background: '#000', opacity: limit((frame - duration + 18) / 17), zIndex: 300 }} />}
          <Soundtrack timeline={sourceTimeline} project={project} files={availableFiles} frameOffset={frameOffset} sfx={enableSfx} voiceTracks={voiceTracks} />
        </AbsoluteFill>
      </AssetContext.Provider>
    </CinemaContext.Provider>
  );
}
