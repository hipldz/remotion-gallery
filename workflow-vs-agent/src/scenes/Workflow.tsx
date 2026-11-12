import { useCurrentFrame } from "remotion";
import { Graph } from "../components/Graph";
import { ChapterCard, Tag } from "../components/Stage";
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

export function WorkflowAct() {
  const time = useCurrentFrame() / FPS;
  let cx = 0;
  let cy = 0;
  for (let i = 1; i < 5; i++) {
    const k = ease(time, 4 + i * 10 - 0.55, 1.05);
    cx += (places[i][0] - places[i - 1][0]) * k;
    cy += (places[i][1] - places[i - 1][1]) * k;
  }
  const overview = ease(time, 54, 1.8);
  cx = mix(cx, 0, overview);
  cy = mix(cy, 1300, overview);
  const zoom = mix(range(time, [0, 4], [0.82, 1]), 0.195, overview);
  const smart = Math.min(5, Math.max(0, Math.floor((time - 3.5) / 10)));
  return (
    <>
      <div style={{ position: "absolute", inset: 0, perspective: 1600 }}>
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
            style={{ position: "absolute", left: -3500, top: -1000, opacity: (1 - overview) * 0.3 }}
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
            return (
              <div key={p.key} style={{ position: "absolute", left: x - 800, top: y - 340, width: 1600, height: 680 }}>
                <div className="eyebrow" style={{ color: C.blue, fontSize: 24 }}>
                  WORKFLOW PATTERN / {p.number}
                </div>
                <div style={{ fontSize: 59, fontWeight: 550, letterSpacing: -1, marginTop: 10 }}>{p.name}</div>
                <div style={{ color: "#7d8590", fontSize: 25, marginTop: 12 }}>{p.summary}</div>
                <div style={{ position: "absolute", top: 165, width: 1600, height: 470 }}>
                  <Graph {...makePattern(p.key, clamp(time - 4 - i * 10, 0, 9.99))} time={clamp(time - 4 - i * 10, 0, 9.99)} />
                </div>
                <div style={{ position: "absolute", top: 620, left: 0, right: 0, textAlign: "center" }}>
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
          opacity: ease(time, 2, 0.6),
          zIndex: 5,
        }}
      >
        <span style={{ fontSize: 17, color: C.gray, writingMode: "vertical-rl", letterSpacing: 6, marginBottom: 12 }}>聪明度</span>
        {[4, 3, 2, 1, 0].map((i) => (
          <div
            key={i}
            style={{
              width: 17,
              height: 46,
              borderRadius: 5,
              background: i < smart ? C.blue : "#e9eef5",
              boxShadow: smart === 5 ? `0 0 ${12 + Math.sin(time * 5) * 4}px ${C.blue}50` : undefined,
            }}
          />
        ))}
        <span style={{ color: C.blue, fontSize: 20, marginTop: 8 }}>{smart}/5</span>
      </div>
      {time > 55.8 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 660,
            textAlign: "center",
            transform: `scale(${mix(1.4, 1, ease(time, 55.8, 0.25))}) rotate(-4deg)`,
            opacity: ease(time, 55.8, 0.15),
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
