import { C, fonts } from '../data/theme';
import { fade, move } from '../lib/cinematics';
import { At } from '../components/Primitives';
import { Note, TitleBlock } from '../components/CinematicActors';
import { ProductTower } from '../components/ProductTower';

export function Finale({ id, f }: { id: string; f: number }) {
  if (id === 'G01') {
    return (
      <>
        <TitleBlock f={f} eyebrow="回头看 / 这几年变了什么" lines={['从给建议，到帮你做事。', '这些工具，各有各的用法。']} size={76} y={105} />
        <ProductTower f={f} />
      </>
    );
  }
  if (id === 'G02') {
    const choices = [
      { title: '我想做什么？', detail: ['写代码、查资料', '还是做日常工作'], color: C.blue },
      { title: '能拿到什么结果？', detail: ['改好的代码、写好的报告', '还是整理好的文件'], color: C.green },
      { title: '哪里得自己检查？', detail: ['哪些要先确认', '做完哪里要再看看'], color: C.yellow },
    ];
    return (
      <>
        <TitleBlock f={f} eyebrow="怎么选 / 先想想你自己的事" lines={['选工具，先想想这三件事。']} size={90} />
        {choices.map((choice, i) => (
          <At
            key={choice.title}
            x={140 + i * 575}
            y={425}
            style={{
              width: 525,
              height: 325,
              padding: 35,
              background: '#FFFFFFF5',
              border: '1px solid #D6DFEB',
              borderRadius: 24,
              opacity: fade(f, 20 + i * 20, 20),
              transform: 'translateY(' + move(f, 20 + i * 20, 30, 30, 0) + 'px)',
            }}
          >
            <div style={{ fontFamily: fonts.sans, fontSize: 24, color: choice.color, marginBottom: 24 }}>{'0' + (i + 1)}</div>
            <div style={{ fontSize: 41, fontWeight: 600, lineHeight: 1.4 }}>{choice.title}</div>
            <div style={{ marginTop: 27, color: '#728096', fontSize: 30, lineHeight: 1.5 }}>
              {choice.detail.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          </At>
        ))}
        <Note f={f} start={85} x={145} y={835} size={28}>
          看自己的事，挑能帮得上忙的工具。
        </Note>
      </>
    );
  }
  if (id === 'G06') {
    return (
      <>
        <At x={160} y={280} style={{ width: 1600, height: 470, background: 'radial-gradient(ellipse,#FCFCFDEB 25%,#FCFCFD00 72%)' }} />
        <TitleBlock f={f} lines={['谢谢大家']} x={200} y={470} width={1520} size={112} center />
      </>
    );
  }
  return null;
}
