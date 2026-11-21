import { AbsoluteFill, Composition, Sequence } from "remotion";
import { Stage } from "./design";
import { AgentLoop, Handoff, Layers, Permissions } from "./scenes/Mechanics";
import { ArchitectureRule, Evaluation, Managed, Outro } from "./scenes/LongTasks";
import { Benchmark, Context, Definition, ToolCall } from "./scenes/Opening";
import { FPS, HEIGHT, shots, TOTAL_FRAMES, WIDTH } from "./timeline";

const scenes = [
  { View: Benchmark, title: "只改 Harness，跑分涨了多少？", source: "LangChain · Terminal Bench 2.0" },
  { View: Definition, source: "LangChain · The Anatomy of an Agent Harness" },
  { View: Context, source: "OpenAI · Harness engineering" },
  { View: ToolCall, source: "《Harness的定义》" },
  { View: Permissions, source: "《Harness的定义》" },
  { View: AgentLoop, source: "《Harness的定义》" },
  { View: Layers, source: "《Harness的定义》" },
  { View: Handoff, source: "Anthropic · Effective harnesses for long-running agents" },
  { View: Evaluation, source: "Anthropic · Harness design for long-running apps" },
  { View: ArchitectureRule, source: "OpenAI · Harness engineering" },
  { View: Managed, source: "Anthropic · Scaling Managed Agents" },
  { View: Outro },
];

type FilmProps = { showSubtitles: boolean };

function Film({ showSubtitles }: FilmProps) {
  return (
    <AbsoluteFill>
      {shots.map((shot, index) => {
        const { View, title, source } = scenes[index];
        return (
          <Sequence key={shot.id} name={`${shot.id} · ${shot.title}`} from={shot.from}
            durationInFrames={shot.duration} premountFor={FPS}>
            <Stage shot={shot} title={title} source={source} subtitles={showSubtitles}><View /></Stage>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}

export function Root() {
  return (
    <Composition id="WhatIsHarness" component={Film} fps={FPS} width={WIDTH} height={HEIGHT}
      durationInFrames={TOTAL_FRAMES} defaultProps={{ showSubtitles: true }} />
  );
}
