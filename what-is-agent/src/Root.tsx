import { Composition } from "remotion";
import { WhatIsAgent, type FilmProps } from "./Film";
import { HEIGHT, FPS, WIDTH } from "./theme";
import { TOTAL_FRAMES } from "./timeline";

const defaultProps: FilmProps = {
  showSubtitles: true,
};

export const RemotionRoot = () => (
  <Composition
    id="WhatIsAgent"
    component={WhatIsAgent}
    width={WIDTH}
    height={HEIGHT}
    fps={FPS}
    durationInFrames={TOTAL_FRAMES}
    defaultProps={defaultProps}
  />
);
