import { useId } from "react";
import { C, FONT, MONO } from "../data/theme";
import { bezier, clamp, enter, type Point } from "../lib/motion";

export type NodeSpec = {
  id: string;
  x: number;
  y: number;
  label: string;
  sub?: string;
  color?: string;
  width?: number;
  height?: number;
  shape?: "box" | "pill" | "diamond" | "circle";
  delay?: number;
  muted?: boolean;
};
export type EdgeSpec = {
  from: string;
  to: string;
  at?: number;
  duration?: number;
  color?: string;
  label?: string;
  dynamic?: boolean;
  optional?: boolean;
  established?: boolean;
  controls?: [Point, Point];
  points?: [Point, Point, Point, Point];
};
export type GraphSpec = { nodes: NodeSpec[]; edges: EdgeSpec[] };

const dimensions = (n: NodeSpec) => [n.width ?? (n.shape === "pill" ? 110 : n.shape === "diamond" ? 120 : 212), n.height ?? (n.shape === "diamond" ? 120 : 88)];

export function FlowNode({ node: n, time, uid }: { node: NodeSpec; time: number; uid: string }) {
  const [w, h] = dimensions(n);
  const k = enter(time, n.delay ?? 0);
  const color = n.color ?? C.yellow;
  const opacity = n.muted ? 0.28 : 1;
  const lines = n.label.split("\n");
  return (
    <g id={`${uid}-n-${n.id}`} transform={`translate(${n.x} ${n.y}) scale(${0.65 + k * 0.35})`} opacity={clamp(k) * opacity}>
      {n.shape === "diamond" ? (
        <rect
          x={-w / 2.8}
          y={-h / 2.8}
          width={w / 1.4}
          height={h / 1.4}
          rx={15}
          transform="rotate(45)"
          fill="white"
          stroke={color}
          strokeWidth={3}
          filter={`url(#${uid}-shadow)`}
        />
      ) : n.shape === "circle" ? (
        <circle r={w / 2} fill={`${color}18`} stroke={color} strokeWidth={3} />
      ) : (
        <>
          <rect
            x={-w / 2}
            y={-h / 2}
            width={w}
            height={h}
            rx={n.shape === "pill" ? h / 2 : 24}
            fill="white"
            stroke={color === C.ink ? C.line : color}
            strokeWidth={2.5}
            filter={`url(#${uid}-shadow)`}
          />
          {color !== C.ink && <rect x={-w / 2 + 1} y={-h / 2 + 1} width={w - 2} height={h - 2} rx={23} fill={`${color}0c`} />}
          {color === C.yellow && <circle cx={-w / 2 + 19} cy={-h / 2 + 18} r={4} fill={color} />}
        </>
      )}
      <text textAnchor="middle" fill={C.ink} fontFamily={FONT} fontWeight={600} fontSize={n.shape === "diamond" ? 23 : 27}>
        {lines.map((line, i) => (
          <tspan key={i} x={0} y={-((lines.length - 1) * 16) + i * 32 + (n.sub ? -4 : 10)}>
            {line}
          </tspan>
        ))}
      </text>
      {n.sub && (
        <text y={29} textAnchor="middle" fill={C.gray} fontSize={17} fontFamily={MONO}>
          {n.sub}
        </text>
      )}
    </g>
  );
}

export function Graph({ nodes, edges, time, width = 1600, height = 520 }: GraphSpec & { time: number; width?: number; height?: number }) {
  const uid = useId().replaceAll(":", "").replaceAll("«", "").replaceAll("»", "");
  const allNodes = new Map(nodes.map((n) => [n.id, n]));
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }} role="img" aria-label="动态执行流程图">
      <defs>
        <filter id={`${uid}-shadow`} x="-30%" y="-50%" width="160%" height="220%">
          <feDropShadow dx={0} dy={8} stdDeviation={10} floodColor="#263449" floodOpacity={0.055} />
        </filter>
        <filter id={`${uid}-glow`} x="-250%" y="-250%" width="600%" height="600%">
          <feGaussianBlur stdDeviation={7} />
        </filter>
        {[C.blue, C.red, C.yellow, C.green, C.gray].map((c, i) => (
          <marker key={c} id={`${uid}-arrow-${i}`} viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
            <path d="M 1 1 L 8 5 L 1 9" fill="none" stroke={c} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        ))}
      </defs>
      <g id={`${uid}-edges`} fill="none" strokeLinecap="round" strokeLinejoin="round">
        {edges.map((e, i) => {
          const from = allNodes.get(e.from)!;
          const to = allNodes.get(e.to)!;
          const [fw] = dimensions(from);
          const [tw] = dimensions(to);
          const right = to.x >= from.x;
          const p0: Point = [from.x + (right ? fw / 2 : -fw / 2), from.y];
          const p3: Point = [to.x + (right ? -tw / 2 : tw / 2), to.y];
          const bend = Math.max(65, Math.abs(p3[0] - p0[0]) * 0.5);
          const points: [Point, Point, Point, Point] = e.points ?? [
            p0,
            e.controls?.[0] ?? [p0[0] + (right ? bend : -bend), p0[1]],
            e.controls?.[1] ?? [p3[0] + (right ? -bend : bend), p3[1]],
            p3,
          ];
          const d = `M ${points[0]} C ${points[1]} ${points[2]} ${points[3]}`;
          const k = clamp((time - (e.at ?? i * 0.6 + 0.4)) / (e.duration ?? 0.75));
          const color = e.color ?? C.blue;
          const ci = [C.blue, C.red, C.yellow, C.green, C.gray].indexOf(color as typeof C.blue);
          const token = bezier(points, k);
          const label = bezier(points, 0.5);
          return (
            <g id={`${uid}-e-${e.from}-${e.to}-${i}`} key={`${e.from}-${e.to}-${i}`}>
              <path
                d={d}
                stroke={e.established ? `${color}b0` : e.dynamic || e.optional ? C.line : `${color}78`}
                strokeWidth={e.dynamic || e.optional ? 2.5 : 4}
                strokeDasharray={!e.established && (e.dynamic || e.optional) ? "7 10" : undefined}
                opacity={clamp(time * 3)}
              />
              <path
                d={d}
                pathLength={1}
                stroke={color}
                strokeWidth={4}
                strokeDasharray={1}
                strokeDashoffset={1 - k}
                markerEnd={k > 0.99 ? `url(#${uid}-arrow-${ci < 0 ? 4 : ci})` : undefined}
                opacity={e.optional && k === 0 ? 0 : 1}
              />
              {e.label && (
                <g>
                  <rect
                    x={label[0] - e.label.length * 6 - 10}
                    y={label[1] - 34}
                    width={e.label.length * 12 + 20}
                    height={28}
                    rx={8}
                    fill="white"
                    opacity={0.94}
                  />
                  <text x={label[0]} y={label[1] - 14} textAnchor="middle" fill={C.gray} fontSize={19} fontFamily={FONT}>
                    {e.label}
                  </text>
                </g>
              )}
              {k > 0 && k < 1 && (
                <g id={`${uid}-token-${i}`}>
                  <circle cx={token[0]} cy={token[1]} r={15} fill={color} opacity={0.5} filter={`url(#${uid}-glow)`} />
                  <circle cx={token[0]} cy={token[1]} r={7} fill={color} stroke="white" strokeWidth={3} />
                </g>
              )}
            </g>
          );
        })}
      </g>
      <g id={`${uid}-nodes`}>
        {nodes.map((node, i) => (
          <FlowNode key={node.id} node={{ delay: 0.08 + i * 0.055, ...node }} time={time} uid={uid} />
        ))}
      </g>
    </svg>
  );
}
