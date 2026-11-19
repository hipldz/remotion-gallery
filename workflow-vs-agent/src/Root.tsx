import { Composition, Folder, Sequence, type CalculateMetadataFunction } from "remotion";
import { Film, type FilmProps } from "./Film";
import { chapters, resolveWorkflowTimeline } from "./data/timeline";
import { DURATION, FPS, HEIGHT, WIDTH } from "./data/theme";
import { voiceoverProject } from "./voiceover.config";
import { calculateVoiceoverMetadata } from "./voiceover.metadata";

export function ChapterPreview({
  chapterIndex,
  ...props
}: FilmProps & { chapterIndex: number }) {
  const edited = resolveWorkflowTimeline(props.voiceProject ?? voiceoverProject);
  return (
    <Sequence from={-Math.round(edited.chapters[chapterIndex].start * FPS)}>
      <Film {...props} />
    </Sequence>
  );
}

export function RemotionRoot() {
  const calculateChapter: CalculateMetadataFunction<FilmProps & {chapterIndex: number}> = async (args) => {
    const resolved = await calculateVoiceoverMetadata(args);
    const props = {...args.props, ...resolved.props};
    const chapter = resolveWorkflowTimeline(props.voiceProject ?? voiceoverProject).chapters[props.chapterIndex];
    return {...resolved, props, durationInFrames: Math.round((chapter.end - chapter.start) * FPS)};
  };
  return (
    <>
      <Composition
        id="WorkflowVsAgent"
        component={Film}
        durationInFrames={DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ showSubtitles: true, audio: true }}
        calculateMetadata={calculateVoiceoverMetadata}
      />
      <Folder name="Chapters">
        {chapters.map((chapter) => (
          <Composition
            key={chapter.index}
            id={`Chapter-${String(chapter.index).padStart(2, "0")}`}
            component={ChapterPreview}
            durationInFrames={(chapter.end - chapter.start) * FPS}
            fps={FPS}
            width={WIDTH}
            height={HEIGHT}
            defaultProps={{
              showSubtitles: true,
              audio: true,
              chapterIndex: chapter.index,
            }}
            calculateMetadata={calculateChapter}
          />
        ))}
      </Folder>
    </>
  );
}
