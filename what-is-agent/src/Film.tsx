import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import "./fonts";
import "./film.css";
import { Backdrop, Captions, Masthead } from "./components/Chrome";
import { SCENES, sceneAt } from "./timeline";
import { S01Open } from "./scenes/S01Open";
import { S02Anthropic } from "./scenes/S02Anthropic";
import { S03OpenAI } from "./scenes/S03OpenAI";
import { S04Foundations } from "./scenes/S04Foundations";
import { S05Synthesis } from "./scenes/S05Synthesis";
import { S06Loop } from "./scenes/S06Loop";
import { S07Bounds } from "./scenes/S07Bounds";
import { S08Close } from "./scenes/S08Close";
import { SceneGate } from "./components/Chrome";

export type FilmProps = {
  showSubtitles?: boolean;
};

const SceneBody = ({ id }: { id: (typeof SCENES)[number]["id"] }) => {
  switch (id) {
    case "S01":
      return <S01Open />;
    case "S02":
      return <S02Anthropic />;
    case "S03":
      return <S03OpenAI />;
    case "S04":
      return <S04Foundations />;
    case "S05":
      return <S05Synthesis />;
    case "S06":
      return <S06Loop />;
    case "S07":
      return <S07Bounds />;
    case "S08":
      return <S08Close />;
    default:
      return null;
  }
};

export const WhatIsAgent = ({ showSubtitles = true }: FilmProps) => {
  const frame = useCurrentFrame();
  const scene = sceneAt(frame);

  return (
    <AbsoluteFill className="film">
      <Backdrop accent={scene.accent} />
      <Masthead scene={scene} frame={frame} />

      {SCENES.map((item) => (
        <Sequence
          key={item.id}
          name={`${item.id} · ${item.label} · ${item.title}`}
          from={item.from}
          durationInFrames={item.duration}
        >
          <SceneGate duration={item.duration}>
            <SceneBody id={item.id} />
          </SceneGate>
        </Sequence>
      ))}

      {showSubtitles ? <Captions frame={frame} /> : null}
    </AbsoluteFill>
  );
};
