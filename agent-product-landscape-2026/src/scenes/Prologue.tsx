import { C } from '../data/theme';
import { fade, move } from '../lib/cinematics';
import { At } from '../components/Primitives';
import { Note, TitleBlock } from '../components/CinematicActors';

export function Prologue({ id, f }: { id: string; f: number }) {
  if (id !== 'Z04') return null;
  const entrances = [
    { name: '写代码', detail: '改代码、跑测试，直接帮你改项目', color: C.blue },
    { name: '日常工作', detail: '查资料、写报告、整理文件', color: C.green },
  ];
  const support = [
    { name: '提前排好步骤', detail: '总在重复的事，先把步骤排好', color: C.yellow },
    { name: '让任务接着做', detail: '管工具、记进度，停了还能接着做', color: C.red },
  ];
  return (
    <>
      <TitleBlock f={f} eyebrow="读图 / 这几种工具，各做什么" lines={['先认一下图上的颜色。']} size={85} />
      {entrances.map((item, i) => (
        <At
          key={item.name}
          x={145 + i * 850}
          y={350}
          style={{
            width: 780,
            height: 235,
            padding: 37,
            border: '1px solid #D6DFEB',
            borderTop: '4px solid ' + item.color,
            borderRadius: 24,
            background: '#FFFFFFF5',
            opacity: fade(f, 20 + i * 12, 18),
            transform: 'translateY(' + move(f, 20 + i * 12, 28, 25, 0) + 'px)',
          }}
        >
          <div style={{ color: item.color, fontSize: 42, fontWeight: 600 }}>{item.name}</div>
          <div style={{ marginTop: 32, fontSize: 30, color: '#738197' }}>{item.detail}</div>
        </At>
      ))}
      <At
        x={145}
        y={675}
        style={{ width: 1630, height: 145, display: 'flex', gap: 90, borderTop: '1px solid #DDE4ED', paddingTop: 27, opacity: fade(f, 60, 20) }}
      >
        {support.map((item) => (
          <div key={item.name} style={{ width: 700, display: 'flex', alignItems: 'flex-start', gap: 23 }}>
            <span style={{ marginTop: 14, width: 38, height: 3, background: item.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 31, color: item.color, fontWeight: 600 }}>{item.name}</div>
              <div style={{ marginTop: 15, fontSize: 26, color: '#738197' }}>{item.detail}</div>
            </div>
          </div>
        ))}
      </At>
      <Note f={f} start={85} x={150} y={850} size={24}>
        后面就沿着这几条线，一段段往前看。
      </Note>
    </>
  );
}
