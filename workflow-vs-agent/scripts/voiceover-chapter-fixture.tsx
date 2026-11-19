// Loaded only by the browser integration test; this is the actual Studio chapter component.
import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Player, type PlayerRef } from "@remotion/player";
import { ChapterPreview } from "../src/Root";
import { chapters } from "../src/data/timeline";
import { FPS, WIDTH, HEIGHT } from "../src/data/theme";

const chapterIndex = 2;
const chapter = chapters[chapterIndex];
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
      component={ChapterPreview}
      inputProps={{ chapterIndex, showSubtitles: true, audio: true }}
      fps={FPS}
      durationInFrames={(chapter.end - chapter.start) * FPS}
      compositionWidth={WIDTH}
      compositionHeight={HEIGHT}
      initialFrame={20}
      controls
      style={{ width: "100%" }}
    />
  );
}

document.getElementById("root")!.style.display = "none";
const mount = document.createElement("div");
mount.id = "chapter-fixture";
document.body.append(mount);
createRoot(mount).render(<ChapterFixture />);
