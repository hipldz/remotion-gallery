import { C, fonts } from '../data/theme';
import { fade, mix, move } from '../lib/cinematics';
import { At, Chip, Cursor, Icon } from '../components/Primitives';
import { GlyphTile, Note, Orb, Signal, TitleBlock } from '../components/CinematicActors';
import { Media } from '../components/Media';

export function EarlyYears({ id, f }: { id: string; f: number }) {
  if (id === 'A01')
    return (
      <>
        <At x={100} y={70} style={{ fontFamily: fonts.sans, fontSize: 250, color: '#D5DCE70C', fontWeight: 600, letterSpacing: -12 }}>
          2022
        </At>
        <TitleBlock f={f} eyebrow="2022.11.30 / 自然语言聊天" lines={['ChatGPT']} x={110} y={215} width={630} size={112} accent={C.green} />
        <Note f={f} start={65} x={115} y={700} size={31} width={550}>
          打开聊天框，
          <br />
          直接跟 AI 聊天。
        </Note>
        <Media id="chatgpt" f={f} x={800} y={270} width={960} height={620} />
      </>
    );
  if (id === 'A02') {
    const p = f % 48;
    return (
      <>
        <TitleBlock f={f} eyebrow="最初的产品直觉" lines={['我问。它答。']} size={100} />
        <Media
          id="chatgpt"
          f={100}
          x={100}
          y={430}
          width={410}
          height={280}
          label={false}
          style={{ opacity: 0.11, transform: 'perspective(1300px) rotateY(13deg)' }}
        />
        <At
          x={890}
          y={375}
          style={{
            width: 650,
            height: 380,
            border: `2px solid ${C.green}65`,
            borderRadius: 40,
            background: '#F8FCF9',
            boxShadow: '0 28px 80px -50px #34A85345',
          }}
        >
          <At x={30} y={25} style={{ fontSize: 18, color: '#83A68E', letterSpacing: 2 }}>
            CHAT WINDOW
          </At>
        </At>
        <Cursor x={660} y={590} size={100} />
        <Signal f={p} start={0} duration={20} a={[745, 560]} b={[1215, 560]} color={C.green} bend={-110} />
        <Orb x={1215} y={560} color={C.green} size={76} f={100} squash={Math.sin(p / 6) * 0.1} />
        <At x={mix(760, 1080, move(p, 0, 22))} y={440} style={{ fontFamily: fonts.sans, fontSize: 73, color: C.ink, opacity: 1 - fade(p, 22, 6) }}>
          ?
        </At>
        <At x={1320} y={410 + move(p, 21, 15, 30, 0)} style={{ fontFamily: fonts.sans, fontSize: 78, color: C.green, opacity: fade(p, 21, 6) }}>
          !
        </At>
        <Note f={f} start={45} x={960} y={825} size={26}>
          直接提问，直接回答。
        </Note>
      </>
    );
  }
  if (id === 'A03')
    return (
      <>
        <TitleBlock f={f} eyebrow="2022.06 / 代码补全" lines={['GitHub Copilot']} x={110} y={265} width={630} size={86} />
        <At
          x={120}
          y={670}
          style={{
            padding: '18px 30px',
            border: '1px solid #CBD2DE',
            borderBottom: '6px solid #CFD6E0',
            borderRadius: 15,
            background: '#FFF',
            fontFamily: fonts.mono,
            fontSize: 30,
            transform: `translateY(${f >= 95 && f <= 103 ? 4 : 0}px)`,
            opacity: fade(f, 50, 20),
          }}
        >
          Tab ↹
        </At>
        <Note f={f} start={65} x={120} y={785} size={27} width={570}>
          在编辑器里，
          <br />
          接着写代码。
        </Note>
        <Media id="copilot" f={f} x={800} y={295} width={960} height={600} focus={[0.09, 0.25, 0.6, 0.13]} focusAt={55} />
      </>
    );
  if (id === 'B01')
    return (
      <>
        <TitleBlock f={f} eyebrow="2023 / TOOL USE" lines={['AI 开始', '用工具。']} x={110} y={220} size={100} width={600} />
        <At
          x={1050}
          y={360}
          style={{
            width: 380,
            height: 380,
            border: '1px solid #4285F42A',
            borderRadius: 40,
            background: '#FCFDFF',
            transform: 'perspective(1400px) rotateY(-9deg)',
            boxShadow: '0 35px 70px -45px #223D6A30',
          }}
        />
        {[0, 1, 2].map((i) => {
          const a = ((-90 + i * 120 + f * 0.16) * Math.PI) / 180,
            x = 1240 + Math.cos(a) * 390,
            y = 550 + Math.sin(a) * 240;
          return (
            <div key={i}>
              <Signal f={f} start={10 + i * 12} duration={35} a={[1240, 550]} b={[x, y]} color={C.blue} bend={i % 2 ? 70 : -60} />
              <GlyphTile x={x - 75} y={y - 75} width={150} height={150} icon={['code', 'search', 'plug'][i]} f={f} start={12 + i * 12} rotate={-8} />
            </div>
          );
        })}
        <Orb x={1240} y={550} color={C.blue} size={75} f={f} start={5} />
        <At x={110} y={850} style={{ display: 'flex', gap: 20 }}>
          {['ChatGPT Plugins', 'Code Interpreter', 'Function Calling · 2023.06'].map((name, i) => (
            <div key={name} style={{ opacity: fade(f, 35 + i * 20, 18) }}>
              <Chip color={i === 2 ? C.red : C.blue} style={{ fontSize: 25 }}>
                {name}
              </Chip>
            </div>
          ))}
        </At>
      </>
    );
  if (id === 'B02') {
    const requestP = move(f, 18, 90),
      resultP = move(f, 145, 80);
    return (
      <>
        <TitleBlock f={f} eyebrow="FUNCTION CALLING / 工具调用" lines={['发出请求，执行工具，返回结果。']} size={85} accent={C.red} />
        <At x={173} y={375} style={{ fontSize: 17, letterSpacing: 3, color: '#94A0B2' }}>
          MODEL / REQUEST
        </At>
        <At x={1390} y={375} style={{ fontSize: 17, letterSpacing: 3, color: '#94A0B2' }}>
          PROGRAM / EXECUTION
        </At>
        <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
          <circle cx="320" cy="565" r="105" fill="#F8FAFF" stroke="#4285F425" />
          <circle cx="320" cy="565" r="145" fill="none" stroke="#4285F412" strokeDasharray="3 8" />
        </svg>
        <Orb x={320} y={565} color={C.blue} size={80} f={100} />
        <At
          x={1430}
          y={463}
          style={{
            width: 210,
            height: 210,
            background: C.red50,
            border: `1px solid ${C.red}40`,
            borderRadius: 30,
            boxShadow: '0 25px 55px -25px #8C302A20',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Icon name="gear" color={C.red} size={118} style={{ transform: `rotate(${f > 110 ? (f - 110) * 1.1 : 0}deg)` }} />
        </At>
        <Signal f={f} start={18} duration={90} a={[465, 475]} b={[1410, 475]} color={C.blue} bend={-60} label="调用请求" />
        <Signal f={f} start={145} duration={80} a={[1410, 740]} b={[465, 740]} color={C.red} bend={35} label="工具结果" />
        <At
          x={mix(475, 1070, requestP)}
          y={490}
          style={{
            width: 350,
            height: 180,
            borderRadius: 17,
            border: '1px solid #C8D6EF',
            padding: '22px 25px',
            background: '#FFF',
            boxShadow: '0 20px 40px -25px #102A5F35',
            opacity: fade(f, 18, 12),
            fontFamily: fonts.mono,
            fontSize: 18,
            lineHeight: 1.65,
            whiteSpace: 'pre',
            transform: `perspective(1000px) rotateY(${mix(-15, 0, requestP)}deg)`,
          }}
        >
          {'{\n  "name": "run_python",\n  "arguments": {…}\n}'}
        </At>
        <At x={mix(1220, 500, resultP)} y={756} style={{ fontFamily: fonts.mono, fontSize: 21, color: C.red, opacity: fade(f, 145, 12) }}>
          {'{ result: "✓" }'}
        </At>
        <Note f={f} start={18} x={173} y={865} size={34} color={C.blue} width={600}>
          模型发出请求
        </Note>
        <Note f={f} start={110} x={1280} y={865} size={34} color={C.red} width={600}>
          程序执行工具
        </Note>
      </>
    );
  }

  if (id === 'B04') {
    const aider = f >= 180,
      t = aider ? f - 180 : f;
    return (
      <>
        <TitleBlock
          f={t}
          eyebrow={aider ? '2023 / 终端里的编程助手' : '2023 / 理解项目、跨文件修改'}
          lines={[aider ? 'Aider' : 'Cursor']}
          x={110}
          y={180}
          width={850}
          size={112}
        />
        {aider ? (
          <>
            <Media id="aider" f={t} x={720} y={355} width={1060} height={540} />
            <GlyphTile f={t} start={12} x={125} y={625} width={325} height={190} icon="terminal" label="在终端里改代码" />
          </>
        ) : (
          <>
            <Media id="cursor" f={t} x={1130} y={250} width={650} height={650} />
            {['src/auth.ts', 'src/app.tsx', 'tests/auth.test.ts'].map((name, i) => (
              <At
                key={name}
                x={155 + i * 68}
                y={510 + i * 105}
                style={{
                  width: 615,
                  height: 100,
                  perspective: 1200,
                  opacity: fade(f, 45 + i * 40, 20),
                  transform: `rotateY(-8deg) translateY(${move(f, 45 + i * 40, 32, 35, 0)}px)`,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: '#FFF',
                    border: '1px solid #DCE3ED',
                    borderRadius: 17,
                    boxShadow: '0 22px 50px -30px #1A335A35',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                    padding: '0 28px',
                  }}
                >
                  <Icon name="file" size={38} color={C.blue} />
                  <span style={{ fontFamily: fonts.mono, fontSize: 23 }}>{name}</span>
                  <span style={{ marginLeft: 'auto', fontFamily: fonts.mono, fontSize: 22, color: C.green }}>+12</span>
                  <span style={{ fontFamily: fonts.mono, fontSize: 22, color: C.red }}>−4</span>
                </div>
              </At>
            ))}
            <Signal f={f} start={48} duration={70} a={[870, 650]} b={[1090, 500]} color={C.blue} bend={-80} />
          </>
        )}
      </>
    );
  }
  return null;
}
