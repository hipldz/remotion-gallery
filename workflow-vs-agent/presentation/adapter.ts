import { definePresentation } from "../../remotion-presentation/src/index.js";
import { Film, type FilmProps } from "../src/Film";
import { DURATION, FPS, HEIGHT, WIDTH } from "../src/data/theme";
import { fontsReady } from "../src/fonts";
import { voiceoverProject } from "../src/voiceover.config";
import { cues } from "./cues";

// This is the only presentation module that knows about Film's props.
// Empty tracks also bypass the voiceover manifest fetch in useVoiceTracks.
export const filmInputProps = {
  showSubtitles: false,
  audio: false,
  voiceTracks: [],
  voiceProject: voiceoverProject,
} satisfies FilmProps;

export const presentationDefinition = definePresentation({
  title: "Workflow vs Agent",
  fps: FPS,
  durationInFrames: DURATION,
  compositionWidth: WIDTH,
  compositionHeight: HEIGHT,
  cues,
});

export { Film, fontsReady };
