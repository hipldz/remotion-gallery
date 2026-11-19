import React from "react";
import {Composition} from "remotion";
import {Film} from "./film/Film";
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from "./film/theme";
import "./styles/film.css";

export const Root: React.FC = () => (
  <Composition id="ToolCallFilm" component={Film} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
);
