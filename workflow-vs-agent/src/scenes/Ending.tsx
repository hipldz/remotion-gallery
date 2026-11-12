import { Img, staticFile } from "remotion";
import { Heading, Tag } from "../components/Stage";
import { C } from "../data/theme";
import type { Shot } from "../data/timeline";
import { ease, mix, range } from "../lib/motion";

const gear = (r: number) =>
  Array.from({ length: 48 }, (_, i) => {
    const a = (i / 48) * Math.PI * 2;
    const radius = i % 4 < 2 ? r : r * 0.83;
    return `${i === 0 ? "M" : "L"}${Math.cos(a) * radius},${Math.sin(a) * radius}`;
  }).join(" ") + " Z";

export function Ending({ shot, time }: { shot: Shot; time: number }) {
  if (shot.id === "S10-1") {
    const x = range(time, [0, 2.4, 4.7, 7.1, 9.8], [150, 150, -160, -10, -10]);
    const y = range(time, [0, 2.4, 4.7, 7.1, 9.8], [160, 160, 160, -160, -160]);
    const regions = ["polygon(0 0, 60% 0, 60% 55%, 0 55%)", "polygon(60% 0, 100% 0, 100% 55%, 60% 55%)", "polygon(0 55%, 100% 55%, 100% 100%, 0 100%)"];
    return (
      <>
        <Heading eyebrow="FOUR QUESTIONS TO TAKE AWAY" title="看清控制权，才能看清系统" />
        <div
          style={{
            position: "absolute",
            top: 330,
            left: 175,
            width: 1570,
            height: 515,
            overflow: "hidden",
            borderRadius: 28,
            border: "1px solid #e9e3d8",
            background: "#fbf7ef",
          }}
        >
          {regions.map((clipPath, i) => (
            <Img
              key={clipPath}
              src={staticFile("img/overview.png")}
              style={{
                position: "absolute",
                width: 1570,
                height: 1046.667,
                top: -266,
                left: 0,
                clipPath,
                transform: `translate(${x + Math.sin(time / 3 + i) * (i + 1) * 3}px,${y + Math.cos(time / 3 + i) * (i + 1) * 2}px) scale(1.13)`,
              }}
            />
          ))}
          <div style={{ position: "absolute", left: 25, top: 22, display: "flex", gap: 10 }}>
            <Tag color={C.blue}>Workflow</Tag>
            <Tag color={C.red}>Agent</Tag>
            <Tag color={C.green}>Hybrid</Tag>
          </div>
        </div>
      </>
    );
  }
  if (shot.id === "S10-2") {
    const merge = ease(time, 0.4, 3);
    const ring = ease(time, 2.6, 1.2);
    return (
      <>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(90deg, ${C.blue}0c 0%, ${C.blue}0c 50%, ${C.red}0c 50%, ${C.red}0c 100%)`,
            opacity: 1 - ring,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 480,
            left: 180 + merge * 310,
            fontSize: 81,
            color: C.blue,
            opacity: 1 - ring,
            transform: `translateX(${-merge * 90}px)`,
          }}
        >
          Workflow
        </div>
        <div
          style={{
            position: "absolute",
            top: 480,
            right: 210 + merge * 330,
            fontSize: 81,
            color: C.red,
            opacity: 1 - ring,
            transform: `translateX(${merge * 90}px)`,
          }}
        >
          Agent
        </div>
        <svg width={1920} height={1080} style={{ position: "absolute", transform: `scale(${mix(0.86, 1, ring)})`, opacity: ring }}>
          {[C.blue, C.red, C.yellow, C.green].map((c, i) => (
            <circle
              key={c}
              cx={960}
              cy={520}
              r={205}
              stroke={c}
              fill="none"
              strokeWidth={37}
              strokeDasharray={`${(2 * Math.PI * 205) / 4 - 12} ${(2 * Math.PI * 205 * 3) / 4 + 12}`}
              strokeLinecap="round"
              transform={`rotate(${i * 90 - 85 + time * 2} 960 520)`}
            />
          ))}
          <text x={960} y={515} fontSize={40} textAnchor="middle" fill={C.ink}>
            组织步骤
          </text>
          <text x={960} y={570} fontSize={40} textAnchor="middle" fill={C.ink}>
            决定下一步
          </text>
        </svg>
        <div
          style={{ position: "absolute", top: 800, left: 0, right: 0, textAlign: "center", opacity: ring, color: "#6c737c", fontSize: 28, letterSpacing: 3 }}
        >
          确定性主干 + 动态决策
        </div>
      </>
    );
  }
  const end = ease(time, 4.2, 0.8);
  const zoom = mix(1.12, 1, ease(time, 0, 0.65));
  return (
    <>
      <div style={{ opacity: 1 - end }}>
        <Heading eyebrow="NEXT / AGENT RUNTIME" title="下一篇 · Agent Runtime" />
        <svg width={1920} height={1080} style={{ position: "absolute", transform: `scale(${zoom})` }}>
          {["Turn", "Step", "Item", "Event"].map((label, i) => (
            <g key={label} transform={`translate(${565 + i * 265} ${i % 2 === 0 ? 560 : 625})`}>
              <g transform={`rotate(${time * (i % 2 ? -17 : 17)})`}>
                <path d={gear(148)} fill="white" stroke={[C.blue, C.red, C.yellow, C.green][i]} strokeWidth={4} />
                <circle r={95} fill={`${[C.blue, C.red, C.yellow, C.green][i]}0c`} />
              </g>
              <text y={12} textAnchor="middle" fontSize={36} fill={C.ink}>
                {label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 24, opacity: end }}>
        {[C.blue, C.red, C.yellow, C.green].map((color, i) => (
          <i
            key={color}
            style={{
              width: 25,
              height: 25,
              borderRadius: "50%",
              background: color,
              transform: `translateY(${-Math.sin(Math.min(1, Math.max(0, time - 4.7 - i * 0.13)) * Math.PI) * 30}px)`,
            }}
          />
        ))}
      </div>
    </>
  );
}
