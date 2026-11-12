import { Composition, Folder, type CalculateMetadataFunction } from 'remotion';
import { AgentMap2026 } from './AgentMap2026';
import { baseTimeline, chapterInfo, defaultProps, totalFrames, type FilmProps } from './lib/timeline';
import { calculateFilmMetadata } from './lib/metadata';

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="AgentMap2026"
        component={AgentMap2026}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={totalFrames(baseTimeline)}
        defaultProps={defaultProps}
        calculateMetadata={calculateFilmMetadata}
      />
      <Folder name="Chapters">
        {chapterInfo.map((chapter) => {
          const chapterShots = baseTimeline.filter((s) => s.chapterKey === chapter.key);
          const calculateChapter: CalculateMetadataFunction<FilmProps> = async (args) => {
            const resolved = await calculateFilmMetadata(args);
            const props = resolved.props!;
            const selection = props.timeline.filter((s) => s.chapterKey === chapter.key);
            return { ...resolved, durationInFrames: totalFrames(selection), props: { ...props, frameOffset: selection[0].from } };
          };
          return (
            <Composition
              key={chapter.key}
              id={`Chapter-${chapter.key}`}
              component={AgentMap2026}
              width={1920}
              height={1080}
              fps={30}
              durationInFrames={totalFrames(chapterShots)}
              defaultProps={{ ...defaultProps, frameOffset: chapterShots[0].from }}
              calculateMetadata={calculateChapter}
            />
          );
        })}
      </Folder>
    </>
  );
}
