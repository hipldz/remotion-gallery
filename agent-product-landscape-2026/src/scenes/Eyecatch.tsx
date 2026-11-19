import { AbsoluteFill } from 'remotion';
import { C, colors, fonts } from '../data/theme';
import { chapterInfo } from '../lib/timeline';
import { fade, mix, move, settle } from '../lib/cinematics';
import { At } from '../components/Primitives';
import { KineticText } from '../components/CinematicActors';
import { SpeedLines } from '../components/FX';

export function Eyecatch({ chapterKey, f }: { chapterKey: string; f: number }) {
  const chapter = chapterInfo.find((c) => c.key === chapterKey)!;
  const exit = move(f, 48, 12, 0, 2200);
  const quick = chapterKey === 'D';
  return (
    <AbsoluteFill style={{ background: '#FCFCFD' }}>
      <At x={-exit * 0.18} y={0} style={{ width: 1920, height: 1080, opacity: 1 - fade(f, 50, 10) }}>
        {chapter.year && (
          <At
            x={820}
            y={110}
            style={{
              fontFamily: fonts.sans,
              fontSize: 420,
              fontWeight: 600,
              letterSpacing: -24,
              color: 'transparent',
              WebkitTextStroke: '1px #DDE2EA',
              transform: `perspective(2000px) rotateY(-18deg) translateX(${move(f, 0, 40, 110, 0)}px)`,
            }}
          >
            {chapter.year}
          </At>
        )}
        <At x={120} y={208} style={{ fontSize: 25, color: '#8E95A2', letterSpacing: 6, opacity: fade(f, 8, 13) }}>
          {chapterKey === 'G' ? '終話' : `第 ${chapter.number} 话`}
        </At>
        <At x={110} y={338} style={{ width: 1670, transform: `translateY(${(1 - settle(f, 12, quick)) * 18}px)` }}>
          <KineticText f={f} start={10} size={chapter.year ? 172 : 114}>
            {chapter.year || chapter.title}
          </KineticText>
          <div style={{ marginTop: 24 }}>
            <KineticText f={f} start={16} size={chapter.year ? 65 : 34} color={chapter.year ? C.ink : '#6F7786'}>
              {chapter.year ? chapter.title : chapter.subtitle}
            </KineticText>
          </div>
        </At>
        <At x={125} y={855} style={{ fontFamily: fonts.sans, fontSize: 17, letterSpacing: 5, color: '#9BA2AF', opacity: fade(f, 18, 15) }}>
          AGENT ATLAS / CHAPTER {chapter.number}
        </At>
      </At>
      {colors.map((color, i) => {
        const enter = move(f, i * 2, quick ? 6 : 10, -2150, 0);
        const leave = move(f, 46 + i * 2, 12, 0, 2200);
        return (
          <At key={color} x={enter + leave} y={0} style={{ width: 1920, height: 1080, pointerEvents: 'none' }}>
            <svg width="1920" height="1080">
              <path d={`M${1370 + i * 130} -250L${1545 + i * 130} -250L${1110 + i * 130} 1330L${935 + i * 130} 1330Z`} fill={color} />
              <path d={`M${1370 + i * 130} -250L${1382 + i * 130} -250L${947 + i * 130} 1330L${935 + i * 130} 1330Z`} fill="#FFF" opacity={0.13} />
            </svg>
          </At>
        );
      })}
      {quick && <SpeedLines f={f} start={11} duration={18} />}
      <At x={0} y={mix(1080, 0, fade(f, 58, 2))} style={{ width: 1920, height: 1080, background: '#FCFCFD' }} />
    </AbsoluteFill>
  );
}
