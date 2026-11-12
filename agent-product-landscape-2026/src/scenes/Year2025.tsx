import { C, fonts } from '../data/theme';
import { fade, mix, move, settle } from '../lib/cinematics';
import { At, Icon } from '../components/Primitives';
import { Note, Orb, TitleBlock } from '../components/CinematicActors';
import { Media } from '../components/Media';
import { SpeedLines } from '../components/FX';

export function Year2025({ id, f }: { id: string; f: number }) {
  if (id === 'D01')
    return (
      <>
        <TitleBlock f={f} eyebrow="2025 / 编程任务" lines={['接下完整的任务。']} x={110} y={135} size={100} />
        <At
          x={470}
          y={280}
          style={{
            fontFamily: fonts.sans,
            fontSize: 405,
            fontWeight: 600,
            lineHeight: 1,
            letterSpacing: -22,
            transform: `perspective(1900px) rotateY(${move(f, 18, 34, -17, 0)}deg) scale(${mix(1.24, 1, settle(f, 20, true))})`,
            opacity: fade(f, 18, 3),
            color: 'transparent',
            WebkitTextStroke: '3px #202124',
            textShadow: '14px 26px 2px #20212403',
          }}
        >
          2025
        </At>
        <Note f={f} start={55} x={480} y={835} size={31}>
          产品开始从“补一段代码”，转向“做完一件事”。
        </Note>
        <SpeedLines f={f} start={5} duration={32} />
      </>
    );
  if (id === 'D02') {
    const stage = Math.min(4, Math.floor(Math.max(0, f - 20) / 48));
    return (
      <>
        <TitleBlock f={f} eyebrow="FROM ISSUE TO DELIVERY" lines={['接一个 issue，交回一个 PR。']} size={87} />
        <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
          <path d="M180 700H1730" stroke="#DAE2EF" strokeWidth="3" />
          <path d={`M180 700H${move(f, 20, 220, 180, 1730)}`} stroke={C.blue} strokeWidth="3" />
          {[255, 590, 960, 1320, 1650].map((x, i) => (
            <g key={x}>
              <path d={`M${x} 700V${i % 2 ? 610 : 650}`} stroke="#C2CEDF" strokeWidth="1" />
              <circle cx={x} cy="700" r="5" fill={stage >= i ? C.blue : '#BFCAD9'} />
            </g>
          ))}
        </svg>
        <At
          x={110}
          y={440 + move(f, 10, 35, 65, 0)}
          style={{
            width: 300,
            height: 205,
            border: '1px solid #D8E0EC',
            borderRadius: 21,
            padding: 30,
            background: '#FFF',
            boxShadow: '0 25px 50px -30px #19366240',
            opacity: fade(f, 8, 15),
            transform: 'perspective(1200px) rotateY(7deg)',
          }}
        >
          <div style={{ fontFamily: fonts.mono, fontSize: 21, color: '#8995A7' }}>ISSUE #123</div>
          <div style={{ fontSize: 33, fontWeight: 600, lineHeight: 1.4, marginTop: 27 }}>
            修复
            <br />
            登录 bug
          </div>
        </At>
        <Orb x={590} y={550} color={C.blue} size={70} f={f} start={45} />
        <At x={530} y={640} style={{ fontSize: 24, color: C.gray, opacity: fade(f, 45, 15) }}>
          理解目标
        </At>
        {[0, 1, 2].map((i) => (
          <At
            key={i}
            x={835 + i * 29}
            y={435 + i * 37 + move(f, 85 + i * 8, 35, 40, 0)}
            style={{
              width: 190,
              height: 160,
              border: '1px solid #CCD9ED',
              borderRadius: 13,
              background: '#FFF',
              padding: 20,
              boxShadow: '0 15px 30px -20px #17356850',
              transform: `rotate(${(i - 1) * 5}deg)`,
              opacity: fade(f, 85 + i * 8, 15),
            }}
          >
            <Icon name="file" size={38} color={C.blue} />
            <div style={{ fontFamily: fonts.mono, fontSize: 18, marginTop: 23, color: C.green }}>
              +18 <span style={{ color: C.red }}> −6</span>
            </div>
          </At>
        ))}
        <At x={1200} y={455} style={{ width: 245, height: 190, padding: 25, opacity: fade(f, 140, 18) }}>
          <div style={{ fontSize: 27, fontWeight: 600 }}>运行测试</div>
          {['unit', 'integration', 'regression'].map((text, i) => (
            <div key={text} style={{ fontFamily: fonts.mono, fontSize: 18, color: '#7D8CA1', marginTop: 17, opacity: fade(f, 150 + i * 12, 8) }}>
              <span style={{ color: C.green }}>✓ </span>
              {text}
            </div>
          ))}
        </At>
        <At
          x={1510}
          y={432 + move(f, 206, 38, 60, 0)}
          style={{
            width: 295,
            height: 225,
            background: '#FFF',
            border: '1px solid #A9C9FE',
            borderRadius: 21,
            padding: 28,
            opacity: fade(f, 206, 18),
            boxShadow: '0 30px 65px -35px #4285F445',
          }}
        >
          <Icon name="branch" color={C.blue} size={48} />
          <div style={{ fontFamily: fonts.sans, fontSize: 35, fontWeight: 600, marginTop: 20 }}>PR #124</div>
          <div style={{ fontSize: 20, color: C.blue, marginTop: 15 }}>Ready for review</div>
        </At>
        <Note f={f} start={230} x={580} y={840} size={41}>
          修改文件、运行测试、提交 PR。
        </Note>
      </>
    );
  }
  if (id === 'D03')
    return (
      <>
        <TitleBlock f={f} eyebrow="2025.02 / 终端编程 Agent" lines={['Claude Code']} size={108} width={650} x={110} y={220} />
        <Media id="claude-code" f={f} x={800} y={330} width={960} height={570} focus={[0.07, 0.31, 0.78, 0.14]} focusAt={55} />
        <Note f={f} start={55} x={115} y={635} size={34} width={580}>
          读项目
          <br />
          改文件
          <br />
          跑命令
        </Note>
      </>
    );

  if (id === 'D06') {
    const tiles = [
      ['Cursor Background Agent', '05'],
      ['Copilot Coding Agent', '05'],
      ['Jules', '05 · Beta'],
      ['Gemini CLI', '06'],
      ['Kiro', '07 · 预览'],
      ['Qoder', '08.21'],
      ['CodeBuddy IDE / Code CLI', '07 / 09'],
      ['Codex', '10'],
    ];
    return (
      <>
        <TitleBlock f={f} eyebrow="2025 / 编程工具" lines={['编程 Agent 也多了起来。']} size={100} />
        <At x={0} y={0} style={{ width: 1920, height: 1080, perspective: 2000 }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform: `rotateX(${move(f, 0, 150, 9, 0)}deg) rotateY(${move(f, 0, 150, -7, 0)}deg) scale(${move(f, 0, 170, 1.13, 1)})`,
              transformOrigin: '960px 600px',
              transformStyle: 'preserve-3d',
            }}
          >
            {tiles.map(([name, date], i) => (
              <At
                key={name}
                x={110 + (i % 4) * 435}
                y={355 + Math.floor(i / 4) * 272 + move(f, 5 + i * 4, 35, 90, 0)}
                style={{
                  width: 400,
                  height: 228,
                  padding: 29,
                  border: '1px solid #CEDBF1',
                  borderRadius: 23,
                  background: '#FFFFFFF5',
                  opacity: fade(f, 5 + i * 4, 12),
                  transform: `translateZ(${move(f, 5 + i * 4, 42, -600, 0)}px)`,
                  boxShadow: '0 25px 50px -35px #25467445',
                }}
              >
                <div style={{ fontFamily: fonts.sans, fontSize: 20, color: '#8B9CB5' }}>2025.{date}</div>
                <div style={{ marginTop: 26, fontSize: 30, lineHeight: 1.35, fontWeight: 600 }}>{name}</div>
                <At x={29} y={196} style={{ width: 35, height: 2, background: C.blue }} />
              </At>
            ))}
          </div>
        </At>
      </>
    );
  }
  const products: Record<string, { asset: string; name: string; eyebrow: string; notes: string[]; accent: string }> = {
    D07: { asset: 'manus', name: 'Manus', eyebrow: '2025.03 / 浏览器任务', notes: ['操作浏览器', '整理内容', '交付文件'], accent: C.green },
    D08: { asset: 'deep-research', name: 'Deep Research', eyebrow: '2025.02 / CHATGPT', notes: ['查资料', '标出来源', '形成报告'], accent: C.green },
    D09: { asset: 'chatgpt-agent', name: 'ChatGPT Agent', eyebrow: '2025.07 / 浏览器与文件', notes: ['研究', '浏览器操作', '文件交付'], accent: C.green },
    D10: { asset: 'pi-agent', name: 'Pi Agent', eyebrow: '2025.11 / 终端编程', notes: ['读文件、改代码', '用扩展加功能'], accent: C.blue },
  };
  const product = products[id];
  if (product)
    return (
      <>
        <TitleBlock f={f} eyebrow={product.eyebrow} lines={[product.name]} x={110} y={220} width={555} size={76} accent={product.accent} />
        <Note f={f} start={14} x={115} y={460} width={510} size={31}>
          {product.notes.map((text) => (
            <div key={text}>{text}</div>
          ))}
        </Note>
        <Media id={product.asset} f={f} x={725} y={id === 'D10' ? 240 : 275} width={1060} height={id === 'D10' ? 675 : 630} label={false} mode="match" />
        {id === 'D10' && (
          <Note f={f} start={70} x={115} y={685} width={520} size={25} color={C.blue}>
            Pi SDK → OpenClaw
          </Note>
        )}
      </>
    );
  return null;
}
