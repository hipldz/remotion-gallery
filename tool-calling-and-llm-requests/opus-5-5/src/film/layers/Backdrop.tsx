// 背景：锁定在画布上的点阵（镜头移动时能感到空间在走）+ 随段落变色的柔光 + 暗角 + 颗粒
import React from "react";
import type {Cam} from "../camera";
import {C, alpha} from "../theme";
import {fadeIO} from "../ease";

const GLOWS: Array<{a: number; b: number; color: string}> = [
  {a: 0, b: 22.6, color: C.violet},
  {a: 21.6, b: 64.4, color: C.blue},
  {a: 63.6, b: 87.0, color: C.blue},
  {a: 86.4, b: 103.8, color: C.amber},
  {a: 103.0, b: 125.6, color: C.green},
  {a: 124.8, b: 146.6, color: C.violet},
  {a: 145.8, b: 160.0, color: C.green},
  {a: 159.0, b: 181, color: C.blue},
];

export const Backdrop: React.FC<{t: number; cam: Cam; frame: number}> = ({t, cam, frame}) => {
  const grid = 44 * cam.z;
  const ox = 960 - cam.x * cam.z;
  const oy = 540 - cam.y * cam.z;
  const glows = GLOWS.map((g) => ({...g, w: fadeIO(t, g.a, g.b, 1.4, 1.4)})).filter((g) => g.w > 0);
  return (
    <>
      <div style={{position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 38%, ${C.bg2} 0%, ${C.bg} 72%)`}} />
      {glows.map((g, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            opacity: g.w,
            background: [
              `radial-gradient(ellipse 900px 600px at ${30 + 8 * Math.sin(t * 0.13)}% ${18 + 6 * Math.cos(t * 0.11)}%, ${alpha(g.color, 0.12)}, transparent 70%)`,
              `radial-gradient(ellipse 800px 520px at ${78 + 6 * Math.cos(t * 0.09)}% ${86 + 5 * Math.sin(t * 0.12)}%, ${alpha(g.color, 0.07)}, transparent 70%)`,
            ].join(", "),
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(${alpha(C.text, 0.075)} ${Math.max(0.8, 1.1 * cam.z)}px, transparent ${Math.max(1.2, 1.6 * cam.z)}px)`,
          backgroundSize: `${grid}px ${grid}px`,
          backgroundPosition: `${ox}px ${oy}px`,
        }}
      />
      <div style={{position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)"}} />
      {/* 颗粒：逐帧平移，避免“死”的数字感 */}
      <div
        style={{
          position: "absolute",
          inset: -200,
          opacity: 0.05,
          mixBlendMode: "overlay",
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          transform: `translate(${(frame * 37) % 200}px, ${(frame * 61) % 200}px)`,
        }}
      />
    </>
  );
};

/** 底部渐暗，保证字幕在任何画面上都读得清 */
export const CaptionScrim: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 260,
      background: "linear-gradient(180deg, rgba(7,10,16,0) 0%, rgba(7,10,16,0.62) 55%, rgba(7,10,16,0.82) 100%)",
      pointerEvents: "none",
    }}
  />
);
