import { Composition, Folder, Sequence } from "remotion";
import { Film, type FilmProps } from "./Film";
import { chapters } from "./data/timeline";
import { DURATION, FPS, HEIGHT, WIDTH } from "./data/theme";

export function ChapterPreview({
  chapterIndex,
  ...props
}: FilmProps & { chapterIndex: number }) {
  return (
    <Sequence from={-chapters[chapterIndex].start * FPS}>
      <Film {...props} />
    </Sequence>
  );
}

export function RemotionRoot() {
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
          />
        ))}
      </Folder>
    </>
  );
}
