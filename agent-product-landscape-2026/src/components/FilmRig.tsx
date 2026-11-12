import type { ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';
import { fade, limit, move, useCinema } from '../lib/cinematics';

export function ShotRig({ children, still = false }: { children: ReactNode; still?: boolean }) {
  const { f, shot } = useCinema();
  const camera =
    shot.id === 'F04'
      ? { scale: f >= 302 ? 1 : move(f, 0, 300, 1, 1.16), r: f >= 302 ? 0 : move(f, 100, 200, 0, -3) }
      : { scale: still ? 1 : move(f, 0, shot.minFrames, 1, 1.018), r: 0 };
  return (
    <AbsoluteFill style={{ perspective: 2200 }}>
      <AbsoluteFill
        style={{ transform: `scale(${camera.scale}) rotate(${camera.r}deg)`, transformOrigin: '960px 540px', transformStyle: 'flat', isolation: 'isolate' }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export function FilmOptics() {
  const { frame, dark, velocity } = useCinema();
  const whip = limit(Math.abs(velocity) / 95);
  const finalVignette = dark ? 0.5 : 0.045;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, opacity: dark ? 0.048 : 0.025, mixBlendMode: dark ? 'screen' : 'multiply' }}>
        <filter id="film-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="2" seed={17 + (Math.floor(frame / 3) % 5)} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="1920" height="1080" filter="url(#film-grain)" />
      </svg>
      <AbsoluteFill
        style={{ background: `radial-gradient(ellipse at 50% 45%, transparent 43%, ${dark ? '#03070D' : '#253449'} 130%)`, opacity: finalVignette }}
      />
      {whip > 0.1 && (
        <>
          <AbsoluteFill style={{ background: 'linear-gradient(90deg,#4285F400,#4285F40A 35%,transparent 70%,#EA433508)', opacity: whip }} />
          <svg width="1920" height="1080" style={{ opacity: whip * 0.17 }}>
            {Array.from({ length: 22 }, (_, i) => (
              <path
                key={i}
                d={`M${((i * 213 + frame * 51) % 2400) - 300} ${170 + i * 37}h${200 + (i % 4) * 140}`}
                stroke={dark ? '#fff' : '#5F6368'}
                strokeWidth={i % 4 === 0 ? 2 : 1}
              />
            ))}
          </svg>
        </>
      )}
    </AbsoluteFill>
  );
}

export function EditBridge() {
  const { f, shot } = useCinema();
  // Short directional match cuts, not a blanket crossfade on every scene.
  if (!['B03', 'D03', 'D07', 'F02', 'F07'].includes(shot.id) || f >= 11) return null;
  const p = move(f, 0, 11);
  return (
    <AbsoluteFill
      style={{ background: '#F9FAFC', clipPath: `polygon(${p * 115 - 15}% 0,100% 0,100% 100%,${p * 115 - 30}% 100%)`, opacity: 1 - fade(f, 7, 4) }}
    />
  );
}
