import React from "react";
import {C, alpha} from "../theme";
import {ZONE, zoneAlpha, type ZoneName} from "../zones";

const GLOW: Record<ZoneName, string> = {
  hook: C.violet,
  question: C.red,
  track: C.blue,
  hosted: C.violet,
  trace: C.blue,
  pitfall: C.green,
};

export const Backdrop: React.FC<{t: number}> = ({t}) => (
  <>
    {/* 点阵跟着画布走：镜头一移动，能感到空间在动 */}
    <div
      style={{
        position: "absolute",
        left: -2400,
        top: -1200,
        width: 12400,
        height: 5400,
        backgroundImage: "radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)",
        backgroundSize: "34px 34px",
        opacity: 0.55,
        maskImage: "radial-gradient(ellipse 60% 55% at 50% 50%, #000 30%, transparent 78%)",
        WebkitMaskImage: "radial-gradient(ellipse 60% 55% at 50% 50%, #000 30%, transparent 78%)",
      }}
    />

    {/* 每个区域一团很淡的柔光，颜色只提示这一段在讲什么 */}
    {(Object.keys(ZONE) as ZoneName[]).map((name) => {
      const z = ZONE[name];
      const a = zoneAlpha(name, t);
      return (
        <div
          key={name}
          style={{
            position: "absolute",
            left: z.x + z.w / 2 - 900,
            top: z.y + z.h / 2 - 700,
            width: 1800,
            height: 1400,
            background: `radial-gradient(closest-side, ${alpha(GLOW[name], 0.085 * a)}, transparent)`,
            pointerEvents: "none",
          }}
        />
      );
    })}
  </>
);

export const Vignette: React.FC = () => (
  <>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(120% 100% at 50% 42%, transparent 42%, rgba(0,0,0,0.55) 100%)",
        pointerEvents: "none",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 260,
        background: "linear-gradient(180deg, transparent, rgba(3,5,9,0.72))",
        pointerEvents: "none",
      }}
    />
  </>
);
