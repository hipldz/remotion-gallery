import React from "react";
import {C, FONT, alpha, hueColor} from "../theme";
import {clamp01, outCubic, prog} from "../motion";
import {CAPTIONS, glyphsOf} from "../captions";

const REVEAL = 0.9;

export const Captions: React.FC<{t: number}> = ({t}) => {
  const cap = CAPTIONS.find((c) => t >= c.start - 0.02 && t <= c.end);
  if (!cap) return null;

  const glyphs = glyphsOf(cap);
  const reveal = clamp01((t - cap.start) / REVEAL);
  const shown = Math.floor(reveal * glyphs.length + 0.001);
  const out = 1 - prog(t, cap.end - 0.3, 0.3);
  const intro = outCubic(clamp01((t - cap.start) / 0.35));

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 44,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        opacity: out,
        transform: `translateY(${(1 - intro) * 6}px)`,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 1320,
          textAlign: "center",
          fontFamily: FONT.sans,
          fontSize: 42,
          fontWeight: 500,
          lineHeight: 1.5,
          letterSpacing: "0.005em",
          color: C.ink,
          textShadow: "0 2px 24px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.8)",
        }}
      >
        {glyphs.map((g, i) => (
          <span
            key={i}
            style={{
              color: g.hue ? hueColor(g.hue) : C.ink,
              opacity: i < shown ? 1 : 0.001,
              textShadow: g.hue ? `0 0 26px ${alpha(hueColor(g.hue), 0.25)}` : undefined,
            }}
          >
            {g.ch}
          </span>
        ))}
      </div>
      {cap.source && (
        <div style={{fontFamily: FONT.mono, fontSize: 11, color: C.faint, letterSpacing: "0.04em"}}>
          来源：{cap.source}
        </div>
      )}
    </div>
  );
};
