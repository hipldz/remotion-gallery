import { C, fonts } from '../data/theme';
import { arc, fade, f2, mix, move, projectMap, settle, useCinema } from '../lib/cinematics';
import { At, Chip, Icon } from '../components/Primitives';
import { Burst, JumpingOrb, Note, Orb, TitleBlock } from '../components/CinematicActors';
import { Media } from '../components/Media';

export function Year2024({ id, f }: { id: string; f: number }) {
  const cinema = useCinema();
  if (id === 'C01') {
    const end = projectMap(6933, -300, cinema.camera),
      t = f2(f),
      pressure = move(t, 0, 30);
    return (
      <>
        <TitleBlock f={f} eyebrow="2024 / OUT OF THE BOX" lines={['离开聊天框。']} size={106} />
        {f < 34 && (
          <At
            x={300}
            y={390}
            style={{
              width: 600 + pressure * 55,
              height: 325,
              background: '#F5FAF7',
              border: `2px solid ${C.green}`,
              borderRadius: `40px ${40 + pressure * 65}px ${40 + pressure * 65}px 40px`,
              transform: `scaleY(${1 - pressure * 0.025})`,
              boxShadow: '0 30px 70px -45px #34A85335',
            }}
          >
            <At x={30} y={26} style={{ fontSize: 18, color: '#8BAC95', letterSpacing: 2 }}>
              CHAT WINDOW
            </At>
          </At>
        )}
        {f < 36 ? (
          <Orb x={mix(600, 855, pressure)} y={550} f={100} color={C.green} size={66} squash={pressure * 0.8} />
        ) : (
          <JumpingOrb f={f} start={36} duration={27} from={[855, 550]} to={[end.x, end.y]} color={C.blue} height={235} size={66} />
        )}
        <Burst f={f} at={31} x={900} y={540} radius={590} count={42} />
        <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, opacity: fade(f, 45, 25) }}>
          <path d={`M${end.x - 700} ${end.y}L${end.x + 800} ${end.y}`} stroke={C.blue} strokeWidth={3} />
          <circle cx={end.x} cy={end.y} r={move(f, 64, 24, 6, 80)} fill="none" stroke={C.blue} opacity={1 - fade(f, 64, 24)} strokeWidth="2" />
        </svg>
        <Note f={f} start={72} x={1160} y={755} color={C.blue} size={35}>
          不止回答，开始动手。
        </Note>
      </>
    );
  }
  if (id === 'C02') {
    const slots = [
      ['code', '代码'],
      ['terminal', '终端'],
      ['browser', '浏览器'],
      ['file', '文件'],
    ];
    const current = Math.floor(f / 31) % 4;
    return (
      <>
        <TitleBlock f={f} eyebrow="2024.03 / 自己的工作环境" lines={['Devin']} x={110} y={190} width={600} size={112} />
        <Note f={f} start={38} x={115} y={560} size={34} width={550}>
          看代码、跑命令，
          <br />
          上网、改文件，
          <br />
          再把结果交回来。
        </Note>
        {f < 178 && (
          <At x={750} y={320} style={{ width: 1010, height: 550, perspective: 1800, opacity: 1 - fade(f, 140, 35) }}>
            <div style={{ position: 'absolute', inset: '10px -4px -12px 6px', borderRadius: 35, background: '#D9E1ED' }} />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                padding: 28,
                borderRadius: 35,
                border: '1px solid #CAD7EC',
                background: '#FFF',
                transform: `rotateX(${move(f, 0, 140, 16, 0)}deg) rotateY(${move(f, 0, 140, -9, 0)}deg)`,
                boxShadow: '0 30px 70px -35px #23416F30',
              }}
            >
              {slots.map(([icon, name], i) => (
                <At
                  key={name}
                  x={26 + (i % 2) * 480}
                  y={26 + Math.floor(i / 2) * 250}
                  style={{
                    width: 455,
                    height: 226,
                    borderRadius: 24,
                    background: current === i ? C.blue50 : '#F8FAFC',
                    border: '1px solid #E3E8EF',
                    padding: 28,
                    transform: `translateZ(${current === i ? 12 : 0}px)`,
                  }}
                >
                  <Icon name={icon} size={58} color={C.blue} />
                  <div style={{ fontSize: 29, marginTop: 20, color: '#6E7C90' }}>{name}</div>
                </At>
              ))}
              <Orb x={(current % 2) * 480 + 340} y={Math.floor(current / 2) * 250 + 130 + arc((f % 31) / 31, 45)} f={100} color={C.blue} size={50} />
            </div>
          </At>
        )}
        {f >= 140 && <Media id="devin" f={f - 140} mode="match" x={750} y={320} width={1010} height={550} />}
        <At x={115} y={820} style={{ opacity: fade(f, 300, 18), display: 'flex', gap: 12 }}>
          <Chip color="#818B9B" style={{ fontSize: 24 }}>
            演示 ≠ 实用
          </Chip>
          <Chip color={C.blue} style={{ fontSize: 24 }}>
            方向已出现
          </Chip>
        </At>
      </>
    );
  }
  if (id === 'C03') {
    const p = move(f, 40, 65);
    const prompt = '做一个记账小网页';
    return (
      <>
        <TitleBlock f={f} eyebrow="2024 / 一句话做出应用" lines={['Replit Agent · Bolt.new']} y={100} size={96} />
        <At
          x={mix(470, 245, p)}
          y={mix(475, 350, p)}
          style={{
            width: mix(980, 1430, p),
            height: mix(110, 470, p),
            border: '1px solid #D4DDEA',
            borderRadius: 26,
            background: '#FFF',
            boxShadow: '0 35px 85px -45px #233F7430',
            overflow: 'hidden',
          }}
        >
          {p < 0.35 ? (
            <At x={35} y={28} style={{ fontSize: 38, color: C.ink }}>
              {prompt.slice(0, Math.floor(f / 3))}
              <span style={{ color: C.blue, opacity: Math.floor(f / 11) % 2 ? 0 : 1 }}>▏</span>
            </At>
          ) : (
            <>
              <div style={{ height: 60, background: '#EAF1FD', padding: '16px 30px', fontSize: 24, color: C.blue, fontWeight: 600 }}>我的记账本</div>
              {[0, 1, 2].map((i) => (
                <At
                  key={i}
                  x={35 + i * 455 + move(f, 55 + i * 7, 40, (i - 1) * 180, 0)}
                  y={110 + move(f, 55 + i * 7, 40, 100, 0)}
                  style={{
                    width: 420,
                    height: 140,
                    border: '1px solid #E0E7F1',
                    borderRadius: 19,
                    padding: 24,
                    background: '#F8FAFE',
                    opacity: fade(f, 55 + i * 7, 15),
                  }}
                >
                  <div style={{ fontSize: 20, color: '#8C97A8' }}>{['本月支出', '本月收入', '收支结余'][i]}</div>
                  <div style={{ fontFamily: fonts.sans, fontSize: 43, marginTop: 15 }}>¥ {['2,680', '8,000', '5,320'][i]}</div>
                </At>
              ))}
              {[0, 1, 2].map((i) => (
                <At
                  key={i}
                  x={35}
                  y={290 + i * 44}
                  style={{ height: 20, width: move(f, 95 + i * 5, 30, 0, 1340 - i * 100), background: '#EFF2F7', borderRadius: 8 }}
                />
              ))}
            </>
          )}
        </At>
        <At x={1290} y={790 - move(f, 120, 40, 0, 42)} style={{ opacity: fade(f, 116, 15), transform: `scale(${settle(f, 118, true)})` }}>
          <Chip color={C.blue} filled style={{ fontSize: 25 }}>
            ✓ 运行　↑ 部署
          </Chip>
        </At>
        <Note f={f} start={100} x={245} y={875} size={25}>
          Replit Agent · 2024.09　　/　　Bolt.new · 2024.10　　/　　Vibe Coding
        </Note>
      </>
    );
  }
  if (id === 'C04')
    return (
      <>
        <TitleBlock f={f} eyebrow="2024.11 / 编辑器里的 Agent" lines={['Windsurf · Cline']} y={100} size={96} />
        <Media id="windsurf" f={f} x={100} y={350} width={825} height={520} tilt={2} />
        <Media id="cline" f={f} x={995} y={350} width={825} height={520} delay={5} tilt={-2} />
        <Note f={f} start={55} x={500} y={884} size={37} color={C.blue}>
          读文件 · 改代码 · 跑命令
        </Note>
      </>
    );

  if (id === 'C05') {
    const active = Math.min(2, Math.floor(Math.max(0, f - 30) / 58));
    return (
      <>
        <TitleBlock f={f} eyebrow="WORKFLOW / 编排可复用的流程" lines={['n8n · Dify · Coze']} y={100} size={108} accent={C.yellow} />
        {['n8n', 'dify', 'coze'].map((name, i) => (
          <Media
            key={name}
            id={name}
            f={f}
            x={110 + i * 500}
            y={425 + (i === active ? -42 : 30)}
            width={710}
            height={390}
            rotation={[-6, 0, 6][i]}
            tilt={i === active ? 0 : (i - 1) * 4}
            delay={i * 6}
            style={{ zIndex: i === active ? 30 : 10, opacity: i === active ? 1 : 0.68 }}
          />
        ))}
        <Note f={f} start={95} x={110} y={885} color="#8A7429" size={28}>
          连接模型、工具和数据，按步骤运行。
        </Note>
      </>
    );
  }
  return null;
}
