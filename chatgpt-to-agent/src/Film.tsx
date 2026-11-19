import { Fragment } from "react";
import { AbsoluteFill, Audio, Easing, Freeze, staticFile, useCurrentFrame } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { COLORS, DURATION, FPS, SHOTS, TRANSITION, type Shot } from "./data/story";
import { ensureFonts, FONT } from "./lib/fonts";
import { ease } from "./lib/motion";
import { Atmosphere, FilmFinish } from "./components/Atmosphere";
import { Captions } from "./components/Captions";
import { FilmBranding } from "./components/FilmBranding";
import { optical } from "./components/OpticalTransition";
import { Awakening, Announcement, AnonymousPost, TitleSequence, CapabilityLayers } from "./scenes/Intro";
import { OldChatGPT, TokenRain, GlassWall } from "./scenes/Chatbot";
import { JsonRequest, CapsuleJourney, TaskMaze } from "./scenes/Tools";
import { LightPipeline, PlatformOrbit, TrackEnd } from "./scenes/Workflow";
import { ThreeStreams, AgentOrbit, ThirtySamples } from "./scenes/Agent";
import { ControlSplit, ThreeSentences, Closing } from "./scenes/Ending";
import { Voiceover, useVoiceTracks } from "remotion-voiceover/react";
import { voiceoverVolume, type VoiceTrack } from "remotion-voiceover/core";
import { voiceoverProject } from "./voiceover.config";

export type FilmProps = { showCaptions: boolean; soundtrack: boolean; channelName: string; showVoiceover?: boolean; voiceTracks?: VoiceTrack[] };
export const defaultFilmProps: FilmProps = { showCaptions: true, soundtrack: true, showVoiceover: true, channelName: "持续学习，持续构建" };

const ShotContent = ({ shot, channelName }: { shot: Shot; channelName: string }) => {
  switch (shot.id) {
    case "S01":
      return <Awakening />;
    case "S02":
      return <Announcement />;
    case "S03":
      return <AnonymousPost />;
    case "S04":
      return <TitleSequence />;
    case "S05":
      return <CapabilityLayers duration={shot.duration} />;
    case "S06":
      return <OldChatGPT />;
    case "S07":
      return <TokenRain />;
    case "S08":
      return <GlassWall />;
    case "S09":
      return <JsonRequest />;
    case "S10":
      return <CapsuleJourney duration={shot.duration} />;
    case "S11":
      return <TaskMaze />;
    case "S12":
      return <LightPipeline duration={shot.duration} />;
    case "S13":
      return <PlatformOrbit />;
    case "S14":
      return <TrackEnd />;
    case "S15":
      return <ThreeStreams />;
    case "S16":
      return <AgentOrbit duration={shot.duration} />;
    case "S17":
      return <ThirtySamples />;
    case "S18":
      return <ControlSplit />;
    case "S19":
      return <ThreeSentences />;
    case "S20":
      return <Closing channelName={channelName} />;
  }
};

const Scene = ({ shot, leadingHandle, channelName }: { shot: Shot; leadingHandle: number; channelName: string }) => {
  const local = useCurrentFrame();
  const f = Math.max(0, local - leadingHandle);
  return (
    <AbsoluteFill data-shot={shot.id} data-shot-frame={f} style={{ overflow: "hidden" }}>
      <Freeze frame={f}>
        <Atmosphere color={shot.color} grid={shot.chapter === "tools" || shot.chapter === "workflow"} />
        <ShotContent shot={shot} channelName={channelName} />
      </Freeze>
    </AbsoluteFill>
  );
};

export const AgentFilm = (props: FilmProps) => {
  ensureFonts();
  const f = useCurrentFrame();
  const tracks = useVoiceTracks(voiceoverProject, props.voiceTracks);
  return (
    <AbsoluteFill style={{ background: COLORS.bg, color: COLORS.ink, fontFamily: FONT.sans, overflow: "hidden" }}>
      <TransitionSeries>
        {SHOTS.map((shot, i) => {
          const first = i === 0,
            last = i === SHOTS.length - 1;
          const leading = first ? 0 : TRANSITION / 2;
          const trailing = last ? 0 : TRANSITION / 2;
          const kind =
            i === 0 || i === 3 || i === 4 || i === 7 || i === 13 || i === 18 ? "light" : i === 1 || i === 2 || i === 5 || i === 12 ? "focus" : "dissolve";
          return (
            <Fragment key={shot.id}>
              <TransitionSeries.Sequence durationInFrames={shot.duration + leading + trailing} name={`${shot.id} · ${shot.title}`}>
                <Scene shot={shot} leadingHandle={leading} channelName={props.channelName} />
              </TransitionSeries.Sequence>
              {!last && (
                <TransitionSeries.Transition
                  presentation={optical(kind, SHOTS[i + 1].color)}
                  timing={linearTiming({ durationInFrames: TRANSITION, easing: Easing.inOut(Easing.cubic) })}
                />
              )}
            </Fragment>
          );
        })}
      </TransitionSeries>
      <FilmFinish />
      <FilmBranding />
      <Captions enabled={props.showCaptions} />
      {props.showVoiceover !== false && <Voiceover project={voiceoverProject} tracks={tracks} />}
      {props.soundtrack && (
        <Audio
          src={staticFile("audio/calming-ambient-technology.mp3")}
          volume={(audioFrame) =>
            voiceoverVolume(audioFrame, props.showVoiceover === false ? [] : tracks, voiceoverProject, {
              normal: 0.08,
              ducked: 0.03,
              fadeFrames: Math.round(FPS * 0.4),
            }) *
            ease(audioFrame, 0, 2 * FPS) *
            (1 - ease(audioFrame, DURATION - 4 * FPS, DURATION - 1))
          }
        />
      )}
      <AbsoluteFill style={{ background: "#000", opacity: ease(f, DURATION - 22, DURATION - 1), pointerEvents: "none", zIndex: 30 }} />
    </AbsoluteFill>
  );
};
