import { C, colors, fonts } from '../data/theme';
import { fade, limit, move, useCinema } from '../lib/cinematics';
import { animationFrameFor, captionsFor } from '../lib/timeline';
import { At } from '../components/Primitives';
import { Note, Orb, TitleBlock } from '../components/CinematicActors';
import { FollowRequest } from './FollowRequest';

export function ColdOpen({ id, f }: { id: string; f: number }) {
  const { shot } = useCinema();
  if (id === 'P01') {
    const cues = captionsFor(shot);
    const historyAt = animationFrameFor(shot, (cues.find((cue) => cue.text.startsWith('那从'))?.from ?? shot.from + 248) - shot.from);
    const representativesAt = animationFrameFor(shot, (cues.find((cue) => cue.text.startsWith('我整理'))?.from ?? shot.from + 523) - shot.from);
    const historyFrame = f - historyAt;
    const representativesFrame = f - representativesAt;
    const current = [
      { name: 'WorkBuddy', detail: '帮你处理办公任务', color: C.green },
      { name: 'Codex', detail: '帮你处理编程任务', color: C.blue },
    ];
    const representatives = [
      { title: '从聊天开始', detail: 'ChatGPT', color: C.blue },
      { title: '走进代码项目', detail: 'Cursor · Codex', color: C.blue },
      { title: '再到日常工作', detail: 'Manus · WorkBuddy', color: C.green },
    ];
    return (
      <>
        <div data-intro-phase="today" style={{ position: 'absolute', inset: 0, opacity: 1 - fade(f, historyAt, 16) }}>
          <TitleBlock f={f} eyebrow="先聊聊最近这些工具" lines={['大家好。', '今天大家都在聊 AI Agent。']} y={135} size={88} />
          {current.map((item, i) => (
            <At
              key={item.name}
              x={140 + i * 855}
              y={510}
              style={{
                width: 785,
                height: 250,
                padding: 38,
                border: '1px solid #D6DEEA',
                borderRadius: 23,
                background: '#FFFFFFF5',
                opacity: fade(f, 38 + i * 18, 18),
                transform: `translateY(${move(f, 38 + i * 18, 28, 35, 0)}px)`,
              }}
            >
              <div style={{ width: 45, height: 3, background: item.color, marginBottom: 20 }} />
              <div style={{ fontSize: 76, fontWeight: 600 }}>{item.name}</div>
              <div style={{ marginTop: 20, fontSize: 30, color: '#7B879A' }}>{item.detail}</div>
            </At>
          ))}
        </div>
        <div data-intro-phase="history" style={{ position: 'absolute', inset: 0, opacity: fade(f, historyAt, 16) * (1 - fade(f, representativesAt, 16)) }}>
          <TitleBlock f={historyFrame} eyebrow="从 2022 年聊到今天" lines={['那我们往回看看。', '这中间，哪些产品火过？']} y={135} size={88} />
          {[
            { x: 140, year: '2022', name: 'ChatGPT 网页版', color: C.blue },
            { x: 1110, year: '2026', name: 'WorkBuddy · Codex', color: C.green },
          ].map((item) => (
            <At key={item.year} x={item.x} y={515} style={{ opacity: fade(historyFrame, 20, 20), width: 660 }}>
              <div style={{ fontSize: 120, fontWeight: 600, color: item.color, lineHeight: 1.1 }}>{item.year}</div>
              <div style={{ marginTop: 28, fontSize: 43, fontWeight: 500 }}>{item.name}</div>
            </At>
          ))}
          <At x={725} y={605} style={{ width: move(historyFrame, 25, 35, 0, 290), height: 2, background: '#BBC8DA', opacity: fade(historyFrame, 25, 18) }} />
          <At x={965} y={567} style={{ fontSize: 55, color: '#8DA0BA', opacity: fade(historyFrame, 42, 18) }}>
            →
          </At>
          <Note f={historyFrame} start={32} x={135} y={820} size={30}>
            从聊天、写代码，到帮你做日常工作。
          </Note>
        </div>
        <div data-intro-phase="representatives" style={{ position: 'absolute', inset: 0, opacity: fade(f, representativesAt, 16) }}>
          <TitleBlock
            f={representativesFrame}
            eyebrow="挑一些能代表不同阶段的产品"
            lines={['我整理了一些代表产品。', '今天，带大家回顾一下。']}
            y={135}
            size={88}
          />
          {representatives.map((item, i) => (
            <At
              key={item.title}
              x={140 + i * 565}
              y={540}
              style={{
                width: 510,
                height: 220,
                padding: 32,
                border: '1px solid #D6DEEA',
                borderRadius: 23,
                background: '#FFFFFFF5',
                opacity: fade(representativesFrame, 25 + i * 13, 18),
                transform: `translateY(${move(representativesFrame, 25 + i * 13, 28, 25, 0)}px)`,
              }}
            >
              <div style={{ width: 45, height: 3, background: item.color, marginBottom: 24 }} />
              <div style={{ fontSize: 42, fontWeight: 600 }}>{item.title}</div>
              <div style={{ marginTop: 25, fontSize: 35, color: '#7B879A' }}>{item.detail}</div>
            </At>
          ))}
        </div>
      </>
    );
  }
  if (id === 'P03') return <FollowRequest f={f} />;
  if (id === 'P02') {
    const agenda = [
      { title: '从聊天，到写代码', detail: 'ChatGPT、Copilot，再到 Cursor、Devin', color: C.blue },
      { title: '再看查资料、做办公', detail: 'Deep Research、Manus、ChatGPT Agent', color: C.green },
      { title: '最后聊聊现在的工作台', detail: 'Codex、WorkBuddy，以及任务怎么接着做', color: C.yellow },
    ];
    return (
      <>
        <TitleBlock f={f} eyebrow="接下来，按这三步聊" lines={['这次怎么回顾？']} size={100} />
        {agenda.map((item, i) => (
          <At
            key={item.title}
            x={140}
            y={350 + i * 162}
            style={{
              width: 1640,
              padding: '16px 0 24px',
              borderBottom: '1px solid #DEE4EC',
              opacity: fade(f, 22 + i * 26, 18),
              transform: 'translateX(' + move(f, 22 + i * 26, 30, 30, 0) + 'px)',
            }}
          >
            <div style={{ display: 'flex', gap: 38, alignItems: 'flex-start' }}>
              <div style={{ color: item.color, fontFamily: fonts.sans, fontSize: 42, paddingTop: 5 }}>{'0' + (i + 1)}</div>
              <div>
                <div style={{ fontSize: 48, fontWeight: 600 }}>{item.title}</div>
                <div style={{ marginTop: 15, fontSize: 28, color: '#78869A' }}>{item.detail}</div>
              </div>
            </div>
          </At>
        ))}
      </>
    );
  }
  if (id === 'P06') {
    const year = Math.max(2022, 2026 - Math.floor(limit((f - 58) / 162) * 5));
    const sweep = limit((f - 58) / 165);
    return (
      <>
        <TitleBlock f={f} eyebrow="REWIND / 2022—2026" lines={['先回到 2022 年。']} accent={C.blue} size={85} width={920} />
        <At
          x={1010}
          y={260}
          style={{
            fontFamily: fonts.sans,
            fontSize: 270,
            fontWeight: 600,
            letterSpacing: -15,
            color: 'transparent',
            WebkitTextStroke: '1.5px #BFC9D9',
            opacity: 0.85,
            transform: 'translateY(' + Math.sin(sweep * 5 * Math.PI) * 10 + 'px)',
          }}
        >
          {year}
        </At>
        <Note f={f} start={55} x={120} y={835} size={24}>
          2026　←　2022
        </Note>
        <At x={120} y={885} style={{ width: move(f, 55, 170, 1500, 180), height: 1, background: C.line }} />
      </>
    );
  }
  if (id === 'P07') {
    return (
      <>
        <At x={123} y={180} style={{ opacity: fade(f, 20, 20), fontSize: 21, letterSpacing: 5, color: '#8B919D' }}>
          2022 → 2026 / A PRODUCT ATLAS
        </At>
        <TitleBlock f={f} start={18} x={115} y={300} lines={['AI 工具这几年，', '是怎么变的？']} size={126} accent={C.blue} />
        <Note f={f} start={42} x={122} y={670} size={42}>
          从聊一聊，到帮你把事情做完。
        </Note>
        {colors.map((color, i) => (
          <Orb key={color} x={152 + i * 105} y={855} f={f} start={53 + i * 4} color={color} size={56} />
        ))}
      </>
    );
  }
  return null;
}
