import React from "react";
import {Composition} from "remotion";
import {DURATION, FPS, HEIGHT, WIDTH} from "./film/const";
import {Film} from "./film/Film";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="ToolCallFilm"
    component={Film}
    durationInFrames={DURATION * FPS}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
