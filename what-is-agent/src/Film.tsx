import { AbsoluteFill, Freeze, Sequence, useCurrentFrame } from "remotion";
import type { VoiceoverProject, VoiceTrack } from "remotion-voiceover/core";
import { Voiceover, useVoiceTracks } from "remotion-voiceover/react";
import "./fonts";
import "./film.css";
import { Backdrop, Captions, Masthead, SceneGate } from "./components/Chrome";
import { SCENES, TOTAL_FRAMES, sceneAt } from "./timeline";
import { S01Open } from "./scenes/S01Open";
import { S02Anthropic } from "./scenes/S02Anthropic";
import { S03OpenAI } from "./scenes/S03OpenAI";
import { S04Foundations } from "./scenes/S04Foundations";
import { S05Synthesis } from "./scenes/S05Synthesis";
import { S06Loop } from "./scenes/S06Loop";
import { S07Bounds } from "./scenes/S07Bounds";
import { S08Close } from "./scenes/S08Close";
import { voiceoverProject as authoredProject } from "./voiceover.config";
import { Soundtrack } from "./Soundtrack";

export type FilmProps = {
  showSubtitles?: boolean;
  audio?: boolean;
  voiceTracks?: VoiceTrack[];
  voiceProject?: VoiceoverProject;
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

/**
 * 录音后镜头可能变长或变短。这里按比例映射回镜头自己的帧序，
 * 再用 Freeze 冻结，等于把整镜动画拉伸到新的时长，动作与口播仍对得上。
 */
const ScaledScene = ({
  id,
  sourceFrames,
  wallFrames,
}: {
  id: (typeof SCENES)[number]["id"];
  sourceFrames: number;
  wallFrames: number;
}) => {
  const frame = useCurrentFrame();
  const source = Math.min(
    sourceFrames - 1,
    Math.floor((frame / wallFrames) * sourceFrames),
  );
  return (
    <Freeze frame={source}>
      <SceneGate duration={sourceFrames}>
        <SceneBody id={id} />
      </SceneGate>
    </Freeze>
  );
};

export const WhatIsAgent = ({
  showSubtitles = true,
  audio = true,
  voiceTracks,
  voiceProject = authoredProject,
}: FilmProps) => {
  const frame = useCurrentFrame();
  const tracks = useVoiceTracks(voiceProject, voiceTracks);
  const scale = voiceProject.durationInFrames / TOTAL_FRAMES;
  const sourceFrame = Math.min(
    TOTAL_FRAMES - 1,
    Math.floor(frame / scale),
  );
  const scene = sceneAt(sourceFrame);

  return (
    <AbsoluteFill className="film">
      <Backdrop accent={scene.accent} />
      <Masthead scene={scene} frame={sourceFrame} />

      {SCENES.map((item) => {
        const wallFrames = Math.max(1, Math.round(item.duration * scale));
        return (
          <Sequence
            key={item.id}
            name={`${item.id} · ${item.label} · ${item.title}`}
            from={Math.round(item.from * scale)}
            durationInFrames={wallFrames}
          >
            <ScaledScene
              id={item.id}
              sourceFrames={item.duration}
              wallFrames={wallFrames}
            />
          </Sequence>
        );
      })}

      {showSubtitles ? <Captions frame={sourceFrame} /> : null}
      {audio ? <Soundtrack project={voiceProject} tracks={tracks} /> : null}
      <Voiceover project={voiceProject} tracks={tracks} />
    </AbsoluteFill>
  );
};
