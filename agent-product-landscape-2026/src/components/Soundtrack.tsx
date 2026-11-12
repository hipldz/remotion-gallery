import { useMemo } from 'react';
import { Html5Audio, Sequence, staticFile } from 'remotion';
import type { VoiceTrack } from 'remotion-voiceover/core';
import { Voiceover, useVoiceTracks } from 'remotion-voiceover/react';
import { musicVolumeAt } from '../lib/music';
import type { TimedShot } from '../lib/timeline';
import { createVoiceoverProject, withImportedVoiceTracks } from '../voiceover.config';
import { impactCues } from './FX';

export function Soundtrack({
  timeline,
  files,
  frameOffset,
  sfx,
  voiceTracks,
}: {
  timeline: TimedShot[];
  files: string[];
  frameOffset: number;
  sfx: boolean;
  voiceTracks?: VoiceTrack[];
}) {
  const project = useMemo(() => createVoiceoverProject(timeline), [timeline]);
  const recorded = useVoiceTracks(project, voiceTracks);
  const tracks = useMemo(() => withImportedVoiceTracks(timeline, recorded), [timeline, recorded]);
  const music = ['audio/music.wav', 'audio/music.mp3', 'audio/music.m4a'].find((name) => files.includes(name));
  return (
    <>
      <Sequence from={-frameOffset} durationInFrames={project.durationInFrames} layout="none" name="真人配音">
        <Voiceover project={project} tracks={tracks} />
      </Sequence>
      {music && (
        <Html5Audio
          src={staticFile(music)}
          name="背景音乐"
          loop
          loopVolumeCurveBehavior="extend"
          volume={(localFrame) => musicVolumeAt(localFrame + frameOffset, timeline)}
        />
      )}
      {sfx &&
        timeline.flatMap((shot) => {
          const impact = impactCues[shot.id as keyof typeof impactCues];
          const cues: { at: number; name: string; volume: number }[] = [];
          if (impact) cues.push({ at: impact.at, name: 'impact', volume: 0.45 });
          if (shot.kind === 'CARD' || shot.id === 'P06') cues.push({ at: 2, name: 'swoosh', volume: 0.2 });
          if (shot.id === 'F04') [30, 60, 90].forEach((at) => cues.push({ at, name: 'pop', volume: 0.18 }));
          return cues
            .filter((cue) => files.includes(`sfx/${cue.name}.wav`))
            .map((cue, i) => (
              <Sequence
                key={`${shot.id}-${i}`}
                from={shot.from - frameOffset + Math.round((cue.at / shot.animationFrames) * shot.duration)}
                durationInFrames={16}
                name={`${shot.id} · ${cue.name}`}
                layout="none"
              >
                <Html5Audio src={staticFile(`sfx/${cue.name}.wav`)} volume={cue.volume} />
              </Sequence>
            ));
        })}
    </>
  );
}
