// Loaded only by the browser integration check, never by the film or preview.
import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Player, type PlayerRef } from '@remotion/player';
import { AgentMap2026 } from '../src/AgentMap2026';
import { loadProjectMetadata } from '../src/lib/metadata';
import { defaultProps, totalFrames } from '../src/lib/timeline';

const files: string[] = await (await fetch('/__project/assets')).json();
const resolved = await loadProjectMetadata(files);
const selection = resolved.timeline.filter((shot) => shot.chapterKey === 'C');
const props = { ...defaultProps, ...resolved, frameOffset: selection[0].from };

function ChapterFixture() {
  const player = useRef<PlayerRef>(null);
  useEffect(() => {
    (window as Window & { __voiceoverChapter?: unknown }).__voiceoverChapter = {
      play: () => player.current?.play(),
      seek: (frame: number) => {
        player.current?.pause();
        player.current?.seekTo(frame);
      },
    };
  }, []);
  return (
    <Player
      ref={player}
      component={AgentMap2026}
      inputProps={props}
      fps={30}
      durationInFrames={totalFrames(selection)}
      compositionWidth={1920}
      compositionHeight={1080}
      initialFrame={20}
      controls
      style={{ width: '100%' }}
    />
  );
}

document.getElementById('root')!.style.display = 'none';
const mount = document.createElement('div');
mount.id = 'chapter-fixture';
document.body.append(mount);
createRoot(mount).render(<ChapterFixture />);
