import { definePresentation } from "../../remotion-presentation/src/index.js";
import { WhatIsAgent, type FilmProps } from "../src/Film";
import { FPS, HEIGHT, WIDTH } from "../src/theme";
import { TOTAL_FRAMES } from "../src/timeline";
import { fontsReady } from "../src/fonts";
import { cues } from "./cues";

// 这是唯一知道 Film 参数形状的演示模块。字幕留给录音，演示时不重复显示。
export const filmInputProps = {
  showSubtitles: false,
} satisfies FilmProps;

export const presentationDefinition = definePresentation({
  title: "Agent 是什么？",
  fps: FPS,
  durationInFrames: TOTAL_FRAMES,
  compositionWidth: WIDTH,
  compositionHeight: HEIGHT,
  cues,
});

export { WhatIsAgent, fontsReady };
