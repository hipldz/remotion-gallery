import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {noise3D} from '@remotion/noise';
import {COLORS} from '../data/story';
import {seeded} from '../lib/motion';

export const Atmosphere = ({color = COLORS.blue, grid = false}: {color?: string; grid?: boolean}) => {
  const f = useCurrentFrame();
  const drift = noise3D('paper-drift', f / 650, 0, 0) * 35;
  return <AbsoluteFill style={{background: COLORS.bg, overflow: 'hidden'}}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 38%, #FFFFFF 0%, #FCFCFD 62%, #F8F9FA 100%)'}} />
    <AbsoluteFill style={{backgroundImage: 'linear-gradient(#E6EBF550 1px, transparent 1px), linear-gradient(90deg, #E6EBF550 1px, transparent 1px)',
      backgroundSize: '96px 96px', opacity: .38, maskImage: 'radial-gradient(ellipse, black 10%, transparent 75%)'}} />
    <div style={{position: 'absolute', left: 340 + drift, top: 40, width: 1250, height: 850,
      background: `radial-gradient(ellipse, ${color}05, transparent 68%)`}} />
    {grid && <div style={{position: 'absolute', left: -1000, right: -1000, height: 1800, top: 560,
      transform: `perspective(650px) rotateX(69deg) translateY(${f / 25}px)`, transformOrigin: 'top center',
      backgroundImage: 'linear-gradient(#DADCE045 1px, transparent 1px), linear-gradient(90deg, #DADCE045 1px, transparent 1px)',
      backgroundSize: '110px 110px', maskImage: 'linear-gradient(transparent, black 22%, transparent 78%)'}} />}
    {Array.from({length: 24}, (_, i) => {
      const depth = seeded(i, 5);
      return <div key={i} style={{position: 'absolute',
        left: seeded(i, 3) * 2120 - 100 + Math.sin(f / 300 + i) * 8,
        top: seeded(i, 7) * 1200 - 100 - f * .012,
        width: 2 + depth * 2, height: 2 + depth * 2, borderRadius: '50%',
        background: i % 6 === 0 ? color : COLORS.line, opacity: .12 + depth * .08}} />;
    })}
  </AbsoluteFill>;
};

export const FilmFinish = () => {
  const frame = useCurrentFrame();
  const noise = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".82" numOctaves="3" stitchTiles="stitch" seed="12"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>';
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill style={{opacity: .018, backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(noise)}")`,
      backgroundSize: '280px 280px', backgroundPosition: `${frame % 3 * 40}px ${frame % 5 * 24}px`, mixBlendMode: 'multiply'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 50%, #20212408 100%)'}} />
  </AbsoluteFill>;
};
