import { C, fonts } from '../data/theme';
import { fade, move } from '../lib/cinematics';
import { At } from './Primitives';
import { Note, TitleBlock } from './CinematicActors';

export function StoryBridge({
  f,
  eyebrow,
  title,
  before,
  after,
  note,
  labels = ['之前', '后来'],
  accent = C.blue,
}: {
  f: number;
  eyebrow: string;
  title: string[];
  before: string[];
  after: string[];
  note?: string;
  labels?: [string, string];
  accent?: string;
}) {
  return (
    <>
      <TitleBlock f={f} eyebrow={eyebrow} lines={title} y={115} size={82} accent={accent} />
      {[
        { x: 130, label: labels[0], lines: before },
        { x: 1045, label: labels[1], lines: after },
      ].map((card, i) => (
        <At
          key={card.label}
          x={card.x}
          y={440}
          style={{
            width: 735,
            minHeight: 270,
            padding: '36px 42px',
            border: '1px solid #D7DFEA',
            borderTop: '4px solid ' + (i ? accent : '#A8B4C5'),
            borderRadius: 22,
            background: '#FFFFFFF5',
            opacity: fade(f, 20 + i * 18, 18),
            transform: 'translateY(' + move(f, 20 + i * 18, 30, 25, 0) + 'px)',
            boxShadow: '0 24px 55px -42px #233F7450',
          }}
        >
          <div style={{ fontSize: 22, color: i ? accent : '#8894A6', fontFamily: fonts.sans, marginBottom: 25 }}>{card.label}</div>
          {card.lines.map((line) => (
            <div key={line} style={{ fontSize: 45, lineHeight: 1.45, fontWeight: 600 }}>
              {line}
            </div>
          ))}
        </At>
      ))}
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, opacity: fade(f, 45, 20) }}>
        <path d="M905 565H998M980 548L998 565L980 582" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {note && (
        <Note f={f} start={65} x={135} y={810} size={29} color="#647084">
          {note}
        </Note>
      )}
    </>
  );
}
