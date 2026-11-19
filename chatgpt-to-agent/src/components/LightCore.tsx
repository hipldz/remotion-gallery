import {useCurrentFrame} from 'remotion';
import {COLORS} from '../data/story';
import {ease} from '../lib/motion';

export const LightCore = ({size = 300, strength = 1, color, id = 'core'}: {size?: number; strength?: number; color?: string; id?: string}) => {
  const f = useCurrentFrame();
  const breath = .9 + Math.sin(f / 17) * .045 + Math.sin(f / 43) * .035;
  const colors = [COLORS.blue, COLORS.red, COLORS.yellow, COLORS.green];
  return <div data-core={id} style={{position: 'relative', width: size, height: size, transform: `scale(${breath})`, opacity: strength}}>
    <svg width={size} height={size} viewBox="0 0 400 400" style={{overflow: 'visible', position: 'absolute', inset: 0}}>
      <circle cx="200" cy="200" r="132" fill="none" stroke={COLORS.line} strokeWidth="1" opacity=".7" />
      {/* Original four-blade geometry, with solid Google accent colors. */}
      {[0, 90, 180, 270].map((rotation, i) => <g key={rotation} transform={`rotate(${rotation+8*Math.sin(f/150)} 200 200)`}>
        <path d="M 196 183 C 191 142, 188 101, 200 31 C 211 106, 227 143, 221 181 C 215 193, 205 196, 196 183 Z"
          fill={color ?? colors[i]} />
        <circle cx="200" cy="68" r="5" fill="#FFFFFF" opacity=".75" />
      </g>)}
      <circle cx="200" cy="200" r="13" fill={color ?? COLORS.blue} />
      <circle cx="200" cy="200" r="5" fill="#FFFFFF" />
    </svg>
  </div>;
};

export const LightFilaments = ({progress = 1, size = 800, id = 'filaments'}: {progress?: number; size?: number; id?: string}) => {
  const f = useCurrentFrame();
  return <svg data-filaments={id} width={size} height={size} viewBox="0 0 1000 1000" style={{position: 'absolute', overflow: 'visible'}}>
    {[COLORS.blue, COLORS.yellow, COLORS.red].map((color, index) => {
      const points = Array.from({length: 100}, (_, i) => {
        const t = i / 99;
        const a = t * Math.PI * 3 + index * Math.PI * 2/3 + f/150;
        const r = 15 + t * 450;
        return `${500+Math.cos(a)*r},${500+Math.sin(a)*r}`;
      }).join(' ');
      return <polyline key={color} points={points} fill="none" stroke={color} strokeWidth="2.2" opacity=".7"
        pathLength="1" strokeDasharray="1" strokeDashoffset={1-ease(progress, 0, 1)} />;
    })}
  </svg>;
};
