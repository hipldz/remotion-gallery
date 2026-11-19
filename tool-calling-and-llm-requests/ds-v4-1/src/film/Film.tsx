import React from "react";
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from "remotion";
import {C} from "./theme";
import {cameraAt, worldStyle} from "./camera";
import {Backdrop, Vignette} from "./layers/Backdrop";
import {Captions} from "./layers/Captions";
import {EndCard} from "./layers/EndCard";
import {Hud} from "./layers/Hud";
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

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, overflow: "hidden"}}>
      <div style={worldStyle(cam)}>
        <Backdrop t={t} />
        <HookZone t={t} />
        <QuestionZone t={t} />
        <TrackZone t={t} />
        <HostedZone t={t} />
        <TraceZone t={t} />
        <PitfallZone t={t} />
      </div>

      <Vignette />
      <Captions t={t} />
      <Hud t={t} />
      <EndCard t={t} />
    </AbsoluteFill>
  );
};
