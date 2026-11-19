import type {CSSProperties, ReactNode} from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {COLORS} from '../data/story';
import {appear, arrive} from '../lib/motion';
import {FONT} from '../lib/fonts';

export const GlassPanel = ({children, image, width = 1000, height, color = COLORS.blue, rotateY = -12, rotateX = 4,
  delay = 8, style = {}, reflection = false}: {
    children?: ReactNode; image?: string; width?: number; height?: number; color?: string;
    rotateY?: number; rotateX?: number; delay?: number; style?: CSSProperties; reflection?: boolean;
  }) => {
  const f = useCurrentFrame();
  const p = arrive(f, delay, 55);
  return <div style={{position: 'absolute', width, opacity: appear(f, delay, 30),
    transform: `perspective(1800px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateY(${(1-p)*90}px) scale(${.86+p*.14})`,
    transformStyle: 'preserve-3d', ...style}}>
    <div style={{position: 'relative', padding: 12, height, borderRadius: 20, overflow: 'hidden',
      border: `1px solid ${COLORS.line}`, background: '#FFFFFF',
      boxShadow: '0 18px 60px #20212412, 0 2px 6px #20212408'}}>
      <div style={{height: 25, display: 'flex', alignItems: 'center', gap: 7, padding: '0 7px', marginBottom: 10,
        borderRadius: 6, background: COLORS.paper}}>
        {[COLORS.red, COLORS.yellow, COLORS.green].map((dot) =>
          <span key={dot} style={{width: 5, height: 5, borderRadius: 4, background: dot, opacity: .85}} />)}
        <span style={{marginLeft: 'auto', paddingRight: 8, fontFamily: FONT.mono, fontSize: 10, color: COLORS.gray, letterSpacing: 2}}>ARCHIVE / REFERENCE</span>
      </div>
      {image ? <Img src={staticFile(image)} style={{width: '100%', display: 'block', borderRadius: 9}} /> : children}
      <div style={{pointerEvents: 'none', position: 'absolute', left: 20, right: 20, top: 0, height: 2, background: `${color}65`}} />
    </div>
    {reflection && <div style={{position: 'absolute', left: '8%', right: '8%', height: 40, bottom: -50,
      background: `radial-gradient(ellipse, ${color}0a, transparent 68%)`, filter: 'blur(22px)'}} />}
  </div>;
};
