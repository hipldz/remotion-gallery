import { C, colors, fonts } from '../data/theme';
import { fade, limit, move } from '../lib/cinematics';
import { At } from '../components/Primitives';
import { KineticText, Note, Orb, TitleBlock } from '../components/CinematicActors';

export function ColdOpen({ id, f }: { id: string; f: number }) {
  if (id === 'P01') {
    const products = [
      { name: 'Codex', color: C.blue },
      { name: 'WorkBuddy', color: C.green },
    ];
    return (
      <>
        <At
          x={1120}
          y={110}
          style={{
            fontFamily: fonts.sans,
            fontSize: 300,
            fontWeight: 600,
            letterSpacing: -15,
            color: 'transparent',
            WebkitTextStroke: '1.5px #BFC9D9',
            opacity: fade(f, 0, 24) * 0.65,
          }}
        >
          2026
        </At>
        <TitleBlock f={f} eyebrow="NOW / 大家在聊的工具" lines={['2026 年了。']} size={108} width={900} accent={C.blue} />
        {products.map((product, i) => (
          <At
            key={product.name}
            x={150 + i * 860}
            y={465}
            style={{ width: 750, transform: `perspective(1200px) rotateY(${move(f, 18 + i * 12, 32, 15, 0)}deg)` }}
          >
            <KineticText f={f} start={18 + i * 12} color={product.color} size={112}>
              {product.name}
            </KineticText>
            <div style={{ marginTop: 42, width: move(f, 32 + i * 12, 30, 0, 260), height: 2, background: product.color }} />
          </At>
        ))}
        <Note f={f} start={55} x={150} y={810} size={31}>
          现在大家聊的，都是这些 AI 工具。
        </Note>
      </>
    );
  }
  if (id === 'P02') {
    return (
      <>
        <TitleBlock f={f} eyebrow="2022 → 2026 / 回头看看" lines={['这些产品，你还记得吗？']} size={92} accent={C.green} />
        <Note f={f} start={18} x={155} y={365} size={31}>
          2022.11.30
        </Note>
        <At x={150} y={445} style={{ width: 720 }}>
          <KineticText f={f} start={24} color={C.green} size={112}>
            ChatGPT
          </KineticText>
        </At>
        <Note f={f} start={42} x={155} y={625} size={34}>
          网页版上线
        </Note>
        <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
          <path d="M870 540H1070" fill="none" stroke="#BCC6D5" strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - move(f, 45, 35)} />
          <path d="M1048 528L1070 540L1048 552" fill="none" stroke="#BCC6D5" strokeWidth={2} opacity={fade(f, 70, 12)} />
        </svg>
        <At
          x={1150}
          y={350}
          style={{
            fontFamily: fonts.sans,
            fontSize: 230,
            fontWeight: 600,
            letterSpacing: -12,
            color: 'transparent',
            WebkitTextStroke: '1.5px #BFC9D9',
            opacity: fade(f, 45, 24),
          }}
        >
          2026
        </At>
        <Note f={f} start={65} x={1155} y={645} size={31} width={570}>
          直到今天
        </Note>
        <Note f={f} start={80} x={150} y={810} size={31}>
          这几年，都出现过哪些 AI 产品？
        </Note>
      </>
    );
  }
  if (id === 'P06') {
    const year = Math.max(2022, 2026 - Math.floor(limit((f - 58) / 162) * 5));
    const sweep = limit((f - 58) / 165);
    return (
      <>
        <TitleBlock f={f} eyebrow="REWIND / 2022—2026" lines={['一起回头看', '产品的发展路线。']} accent={C.blue} size={84} width={870} />
        <At
          x={960}
          y={130}
          style={{
            fontFamily: fonts.sans,
            fontSize: 300,
            fontWeight: 600,
            letterSpacing: -15,
            color: 'transparent',
            WebkitTextStroke: '1.5px #BFC9D9',
            opacity: 0.85,
            transform: `translateY(${Math.sin(sweep * 5 * Math.PI) * 10}px)`,
          }}
        >
          {year}
        </At>
        <Note f={f} start={55} x={120} y={835} size={23}>
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
        <TitleBlock f={f} start={18} x={115} y={300} lines={['回头看到 2026 年的', 'Agent 产品']} size={126} accent={C.blue} />
        <Note f={f} start={42} x={122} y={670} size={43}>
          开发者工具、通用工作、流程平台和运行系统
        </Note>
        {colors.map((color, i) => (
          <Orb key={color} x={152 + i * 105} y={855} f={f} start={53 + i * 4} color={color} size={56} />
        ))}
      </>
    );
  }
  return null;
}
