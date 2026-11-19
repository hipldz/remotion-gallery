import {Composition} from 'remotion';
import {AgentFilm, defaultFilmProps} from './Film';
import {DURATION, FPS, HEIGHT, WIDTH} from './data/story';

export const RemotionRoot = () => (
  <Composition
    id="ChatGPT-to-Agent"
    component={AgentFilm}
    durationInFrames={DURATION}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={defaultFilmProps}
  />
);
