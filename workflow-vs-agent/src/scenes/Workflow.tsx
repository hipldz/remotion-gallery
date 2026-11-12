import { useCurrentFrame } from "remotion";
import { Graph } from "../components/Graph";
import { Card, ChapterCard, Heading, Tag } from "../components/Stage";
import { makePattern, patternInfo } from "../data/patterns";
import { C, FPS } from "../data/theme";
import { shots } from "../data/timeline";
import { clamp, ease, mix, range, type Point } from "../lib/motion";

const places: Point[] = [
  [0, 0],
  [1900, 650],
  [0, 1300],
  [-1900, 1950],
  [0, 2600],
];

const workflowShots = shots.filter((shot) => shot.act === 2);
const chapterStart = workflowShots[0].start;
const patternShots = patternInfo.map(
  (_, i) => workflowShots.find((shot) => shot.id === `S2-${i + 2}`)!,
);
const patternStarts = patternShots.map((shot) => shot.start - chapterStart);
const introDuration = patternStarts[0];
const overviewStart = workflowShots.at(-1)!.start - chapterStart;
const patternNames = ["提示词链", "路由", "并行", "统筹与执行", "评估与改进"];

function WorkflowIntro({ time }: { time: number }) {
  return (
    <div
      data-workflow-intro
      style={{
        opacity:
          ease(time, 2.1, 0.5) * (1 - ease(time, introDuration - 0.65, 0.5)),
      }}
    >
      <Heading
        eyebrow="ANTHROPIC / BUILDING EFFECTIVE AGENTS"
        title="文章里的五种常见 Workflow 搭法"
      />
      <div
        style={{
          position: "absolute",
          left: 160,
          right: 160,
          top: 350,
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 24,
        }}
      >
        {patternInfo.map((pattern, i) => (
          <Card
            key={pattern.key}
            time={time}
            delay={2.1 + i * 0.12}
            color={C.blue}
            style={{
              gridColumn:
                i === 3 ? "2 / span 2" : i === 4 ? "4 / span 2" : "span 2",
              height: 168,
              padding: "25px 30px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <span style={{ fontSize: 28, color: C.blue }}>
                {pattern.number}
              </span>
              <span style={{ fontSize: 34, fontWeight: 550 }}>
                {patternNames[i]}
              </span>
            </div>
            <div style={{ fontSize: 25, color: "#7d8590", marginTop: 20 }}>
              {pattern.name}
            </div>
          </Card>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 160,
          right: 160,
          top: 790,
          textAlign: "center",
          fontSize: 28,
          color: C.gray,
        }}
      >
        不同任务，可以采用不同的搭法
      </div>
    </div>
  );
}

export function WorkflowAct() {
  const time = useCurrentFrame() / FPS;
  let cx = 0;
  let cy = 0;
  for (let i = 1; i < 5; i++) {
    const k = ease(time, patternStarts[i] - 0.55, 1.05);
    cx += (places[i][0] - places[i - 1][0]) * k;
    cy += (places[i][1] - places[i - 1][1]) * k;
  }
  const overview = ease(time, overviewStart, 1.8);
  cx = mix(cx, 0, overview);
  cy = mix(cy, 1300, overview);
  const zoom = mix(
    range(time, [introDuration - 0.5, introDuration], [0.82, 1]),
    0.195,
    overview,
  );
  const patternStep = patternStarts.filter((start) => time >= start).length;
  return (
    <>
      <WorkflowIntro time={time} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          perspective: 1600,
          opacity: ease(time, introDuration - 0.5, 0.5),
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 935,
            top: mix(515, 510, overview),
            transformOrigin: "0 0",
            transform: `scale(${zoom}) translate(${-cx}px,${-cy}px) rotateX(${mix(10, 0, ease(time, 1.5, 2))}deg)`,
          }}
        >
          <svg
            width={7000}
            height={5000}
            viewBox="-3500 -1000 7000 5000"
            style={{
              position: "absolute",
              left: -3500,
              top: -1000,
              opacity: (1 - overview) * 0.3,
            }}
          >
            <path
              d="M 0 0 C 1800 0 2000 350 1900 650 S -100 1100 0 1300 S -2100 1750 -1900 1950 S 100 2300 0 2600"
              fill="none"
              stroke={`${C.blue}30`}
              strokeWidth={8}
              strokeDasharray="15 25"
            />
          </svg>
          {patternInfo.map((p, i) => {
            const x = mix(places[i][0], (i - 2) * 1750, overview);
            const y = mix(places[i][1], 1300, overview);
            const patternTime = clamp(
              ((time - patternStarts[i]) * 10) /
                (patternShots[i].end - patternShots[i].start),
              0,
              9.99,
            );
            return (
              <div
                key={p.key}
                style={{
                  position: "absolute",
                  left: x - 800,
                  top: y - 340,
                  width: 1600,
                  height: 680,
                }}
              >
                <div
                  className="eyebrow"
                  style={{ color: C.blue, fontSize: 24 }}
                >
                  WORKFLOW PATTERN / {p.number}
                </div>
                <div
                  style={{
                    fontSize: 59,
                    fontWeight: 550,
                    letterSpacing: -1,
                    marginTop: 10,
                  }}
                >
                  {p.name}
                </div>
                <div style={{ color: "#7d8590", fontSize: 25, marginTop: 12 }}>
                  {p.summary}
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: 165,
                    width: 1600,
                    height: 470,
                  }}
                >
                  <Graph
                    {...makePattern(p.key, patternTime)}
                    time={patternTime}
                  />
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: 620,
                    left: 0,
                    right: 0,
                    textAlign: "center",
                  }}
                >
                  <Tag color={C.blue}>{p.example}</Tag>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 270,
          right: 66,
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          gap: 9,
          opacity: ease(time, introDuration, 0.6),
          zIndex: 5,
        }}
      >
        <span
          style={{
            fontSize: 17,
            color: C.gray,
            writingMode: "vertical-rl",
            letterSpacing: 6,
            marginBottom: 12,
          }}
        >
          五种模式
        </span>
        {[4, 3, 2, 1, 0].map((i) => (
          <div
            key={i}
            style={{
              width: 17,
              height: 46,
              borderRadius: 5,
              background: i < patternStep ? C.blue : "#e9eef5",
              boxShadow:
                patternStep === 5
                  ? `0 0 ${12 + Math.sin(time * 5) * 4}px ${C.blue}50`
                  : undefined,
            }}
          />
        ))}
        <span style={{ color: C.blue, fontSize: 20, marginTop: 8 }}>
          {patternStep}/5
        </span>
      </div>
      {time > overviewStart + 1.8 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 660,
            textAlign: "center",
            transform: `scale(${mix(1.4, 1, ease(time, overviewStart + 1.8, 0.25))}) rotate(-4deg)`,
            opacity: ease(time, overviewStart + 1.8, 0.15),
          }}
        >
          <span
            style={{
              border: `5px solid ${C.blue}`,
              color: C.blue,
              background: "#fffffff5",
              padding: "15px 40px",
              borderRadius: 9,
              fontSize: 65,
              fontWeight: 650,
            }}
          >
            仍然是 Workflow
          </span>
        </div>
      )}
      {time < 2.6 && (
        <div style={{ opacity: 1 - ease(time, 2, 0.55) }}>
          <ChapterCard shot={shots.find((s) => s.id === "S2-1")!} time={time} />
        </div>
      )}
    </>
  );
}
