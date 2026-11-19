// 整部片子只有一个合成、一张画布、一台摄像机。没有章节页，没有翻页转场。
import React from "react";
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import voiceover from "./voiceover.json";
import {cameraAt, worldTransform} from "./camera";
import {C, FONT} from "./theme";
import {clamp01, prog} from "./ease";
import {Backdrop, CaptionScrim} from "./layers/Backdrop";
import {Captions} from "./layers/Captions";
import {Hud} from "./layers/Hud";
import {TraceLegend} from "./layers/TraceLegend";
import {EndCard} from "./layers/EndCard";
import {HookZone} from "./zones/HookZone";
import {QuestionZone} from "./zones/QuestionZone";
import {TrackZone} from "./zones/TrackZone";
import {HostedZone} from "./zones/HostedZone";
import {TraceZone} from "./zones/TraceZone";
import {PitfallZone} from "./zones/PitfallZone";

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const cam = cameraAt(t);
  const fadeIn = clamp01(prog(t, 0, 0.8));

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, fontFamily: FONT.sans, overflow: "hidden"}}>
      {voiceover.enabled && <Audio src={staticFile(voiceover.src)} />}
      <Backdrop t={t} cam={cam} frame={frame} />

      {/* 画布：所有区域都在这里，镜头在它们之间移动 */}
      <div style={{position: "absolute", left: 0, top: 0, width: 0, height: 0, transformOrigin: "0 0", transform: worldTransform(cam)}}>
        <HookZone t={t} />
        <QuestionZone t={t} />
        <TrackZone t={t} />
        <HostedZone t={t} />
        <TraceZone t={t} />
        <PitfallZone t={t} />
      </div>

      {/* 屏幕层 */}
      <TraceLegend t={t} />
      <Hud t={t} />
      <CaptionScrim />
      <Captions t={t} />
      <EndCard t={t} />
      <AbsoluteFill style={{backgroundColor: C.bg, opacity: 1 - fadeIn, pointerEvents: "none"}} />
    </AbsoluteFill>
  );
};
