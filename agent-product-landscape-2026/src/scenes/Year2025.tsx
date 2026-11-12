import { C, fonts } from '../data/theme';
import { fade, move } from '../lib/cinematics';
import { At, Icon } from '../components/Primitives';
import { Note, Orb, TitleBlock } from '../components/CinematicActors';
import { Media } from '../components/Media';
import { StoryBridge } from '../components/StoryBridge';
import { PopularityBadge } from '../components/PopularityBadge';

export function Year2025({ id, f }: { id: string; f: number }) {
  if (id === 'D01') {
    return (
      <StoryBridge
        f={f}
        eyebrow="2025 / 交代好任务，做完你再看"
        title={['交代好任务，做完再来看。']}
        before={['你说一步', '它做一步']}
        after={['你说想做到什么', '它先做，你来检查']}
        note="每次要做的事不一样，做法也得跟着变。"
      />
    );
  }
  if (id === 'D02') {
    const stage = Math.min(4, Math.floor(Math.max(0, f - 20) / 48));
    return (
      <>
        <TitleBlock f={f} eyebrow="修一个 bug / 做完给你检查" lines={['修个 bug，改完给你看。']} size={87} />
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
          看看怎么改
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
          <div style={{ fontSize: 27, fontWeight: 600 }}>跑跑测试</div>
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
          <div style={{ fontSize: 20, color: C.blue, marginTop: 15 }}>等你检查</div>
        </At>
        <Note f={f} start={230} x={580} y={840} size={41}>
          改完了，给你检查。
        </Note>
      </>
    );
  }

  if (id === 'D03') {
    return (
      <>
        <TitleBlock f={f} eyebrow="2025.02 / 在终端里做事" lines={['Claude Code']} size={98} width={650} x={110} y={200} />
        <Media id="claude-code" f={f} x={800} y={330} width={960} height={570} focus={[0.07, 0.31, 0.78, 0.14]} focusAt={55} />
        <Note f={f} start={40} x={115} y={525} size={33} width={580}>
          看代码
          <br />
          改文件
          <br />
          跑命令
        </Note>
        <PopularityBadge id="claude-code" f={f} x={115} y={770} label="Claude Code 仓库" />
      </>
    );
  }
  if (id === 'D06') {
    const groups = [
      { label: '在终端里', products: ['Claude Code · Pi', 'Gemini CLI · Codex CLI'], detail: '它边做，你边看', color: C.blue },
      { label: '交给云端', products: ['Devin · Jules', 'Copilot Coding Agent'], detail: '做好了，再回来看结果', color: C.blueDeep },
    ];
    return (
      <>
        <TitleBlock f={f} eyebrow="2025 / 两种常见的用法" lines={['在终端里看，还是交给云端？']} size={86} />
        {groups.map((group, i) => (
          <At
            key={group.label}
            x={120 + i * 885}
            y={375}
            style={{
              width: 795,
              height: 330,
              padding: 38,
              background: '#FFFFFFF5',
              border: '1px solid #D3DFEF',
              borderTop: '4px solid ' + group.color,
              borderRadius: 24,
              opacity: fade(f, 20 + i * 15, 20),
              transform: 'translateY(' + move(f, 20 + i * 15, 30, 35, 0) + 'px)',
            }}
          >
            <div style={{ fontSize: 35, color: group.color, fontWeight: 600, marginBottom: 30 }}>{group.label}</div>
            {group.products.map((name) => (
              <div key={name} style={{ fontFamily: fonts.sans, fontSize: 31, lineHeight: 1.65 }}>
                {name}
              </div>
            ))}
            <div style={{ marginTop: 20, fontSize: 24, color: '#7A889D' }}>{group.detail}</div>
          </At>
        ))}
        <PopularityBadge id="gemini-cli" f={f} x={150} y={755} label="Gemini CLI 仓库" start={45} compact />
        <Note f={f} start={65} x={1025} y={785} size={28} width={700}>
          做在哪里不一样，最后都得检查。
        </Note>
      </>
    );
  }
  if (id === 'E01') {
    return (
      <StoryBridge
        f={f}
        eyebrow="2025 / 也能帮人查资料、做报告"
        title={['不光写代码，', '还能查资料、做报告。']}
        labels={['先从写代码开始', '也能做这些事']}
        before={['改代码、跑测试', '围着一个项目做事']}
        after={['查资料、写报告', '整理文档、处理表格']}
        note="浏览器和文件都能用了，就能试试更多事情。"
        accent={C.green}
      />
    );
  }
  const products: Record<string, { asset: string; name: string; eyebrow: string; notes: string[]; accent: string }> = {
    D08: {
      asset: 'deep-research',
      name: 'Deep Research',
      eyebrow: '2025.02 / 查资料，带出处',
      notes: ['找资料，整理成报告', '也列出资料的出处'],
      accent: C.green,
    },
    D07: { asset: 'manus', name: 'Manus', eyebrow: '2025.03 / 找资料，做成文件', notes: ['打开网页，找资料', '整理成文件给你'], accent: C.green },
    D09: {
      asset: 'chatgpt-agent',
      name: 'ChatGPT Agent',
      eyebrow: '2025.07 / 查完资料，接着做',
      notes: ['先查资料', '再用浏览器接着做'],
      accent: C.green,
    },
    D10: {
      asset: 'pi-agent',
      name: 'Pi Agent',
      eyebrow: '2025.11 / 先用基本工具，需要什么再加',
      notes: ['先用几样基本工具', '需要什么，再自己加'],
      accent: C.blue,
    },
  };
  const product = products[id];
  if (!product) return null;
  return (
    <>
      <TitleBlock f={f} eyebrow={product.eyebrow} lines={[product.name]} x={110} y={200} width={575} size={76} accent={product.accent} />
      <Note f={f} start={30} x={115} y={465} width={555} size={31}>
        {product.notes.map((text) => (
          <div key={text}>{text}</div>
        ))}
      </Note>
      <Media id={product.asset} f={f} x={725} y={id === 'D10' ? 240 : 275} width={1060} height={id === 'D10' ? 675 : 630} label={false} mode="match" />
      {id === 'D10' && <PopularityBadge id="pi-agent" f={f} x={115} y={765} label="Pi 项目仓库" />}
    </>
  );
}
