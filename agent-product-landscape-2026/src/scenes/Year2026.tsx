import { C, fonts } from '../data/theme';
import { fade, f2, limit, mix, move } from '../lib/cinematics';
import { At, Chip, Cursor, Icon, Progress } from '../components/Primitives';
import { GlyphTile, Note, Orb, Signal, TitleBlock } from '../components/CinematicActors';
import { Media } from '../components/Media';

const tasks = ['改登录页', '补齐测试', '调研竞品', '写项目文档', '查运行日志', '修复 API', '做周报', '整理邮件', '跑回归测试', 'Review 改动'];
const taskColors = [C.blue, C.green, C.yellow, C.red, '#1967D2', '#1E8E3E', '#F9AB00', '#D93025', '#8AB4F8', '#81C995'];

function TenAgents({ f }: { f: number }) {
  const t = f2(Math.min(f, 300));
  const stage = t < 30 ? 0 : t < 60 ? 1 : t < 90 ? 2 : 3,
    counts = [1, 2, 4, 10],
    starts = [0, 30, 60, 90];
  const count = counts[stage],
    previous = counts[Math.max(0, stage - 1)],
    transition = move(t, starts[stage], 18);
  const phase = t * 0.003 + Math.pow(Math.max(0, t - 90), 2) * 0.00006;
  const objects = Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + phase;
    const parent = Math.min(previous - 1, Math.floor((i * previous) / count)),
      old = (parent / previous) * Math.PI * 2 + phase;
    const x = mix(960 + Math.cos(old) * 620, 960 + Math.cos(a) * 620, transition);
    const y = mix(540 + Math.sin(old) * 200, 540 + Math.sin(a) * 200, transition);
    const depth = 0.82 + Math.sin(a) * 0.13;
    return { i, x, y, a, depth };
  }).sort((a, b) => a.depth - b.depth);
  return (
    <div data-agent-orbit="ten-agents" data-motion-frame={t} style={{ position: 'absolute', inset: 0 }}>
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
        <ellipse cx="960" cy="540" rx="620" ry="200" fill="none" stroke="#DCE4EF" strokeWidth="1" />
        <ellipse cx="960" cy="540" rx="650" ry="213" fill="none" stroke="#E6ECF4" strokeWidth="1" strokeDasharray="2 14" />
      </svg>
      {objects.map(({ i, x, y, a, depth }) => {
        const blocked = i === 2 || i === 7,
          waiting = i === 3 || i === 8;
        const v = 0.003 + Math.max(0, t - 90) * 0.00012;
        const progress = blocked ? 0.56 : waiting ? 0.28 : 0.2 + ((t * 0.003 + i * 0.078) % 0.78);
        return (
          <At
            key={i}
            x={x}
            y={y}
            style={{
              width: 0,
              height: 0,
              zIndex: Math.round(depth * 10),
              opacity: i < previous ? 1 : fade(t, starts[stage], 8),
              transform: `scale(${depth})`,
              filter: depth < 0.75 ? 'blur(0.3px)' : undefined,
            }}
          >
            {t > 130 &&
              [1, 2, 3].map((n) => (
                <div
                  key={n}
                  style={{
                    position: 'absolute',
                    left: -Math.sin(a) * v * 620 * n * 0.65 - 18,
                    top: Math.cos(a) * v * 200 * n * 0.65 - 15,
                    width: 43 + n * 8,
                    height: 28,
                    borderRadius: 40,
                    background: taskColors[i],
                    opacity: 0.12 / n,
                    transform: `rotate(${(a * 180) / Math.PI + 90}deg)`,
                  }}
                />
              ))}
            <div
              style={{
                position: 'absolute',
                left: -44,
                top: 15,
                width: 239,
                height: 108,
                padding: '20px 16px 14px 59px',
                background: '#FFF',
                border: `1px solid ${taskColors[i]}50`,
                borderRadius: 17,
                boxShadow: '0 17px 45px -25px #213C6C3A',
                transform: `rotate(${Math.sin(a) * -3}deg)`,
              }}
            >
              <div style={{ fontSize: 23, fontWeight: 500, whiteSpace: 'nowrap' }}>{tasks[i]}</div>
              <div style={{ marginTop: 15 }}>
                <Progress value={progress} color={taskColors[i]} />
              </div>
              <div style={{ fontFamily: fonts.mono, fontSize: 11, color: '#9CA7B7', marginTop: 8 }}>
                TASK {String(i + 1).padStart(2, '0')} / {Math.floor(progress * 100)}%
              </div>
            </div>
            <Orb x={0} y={12} size={50} color={taskColors[i]} f={100} shadow={false} />
            {t > 140 && (blocked || waiting) && (
              <At x={-15} y={-32} style={{ fontSize: 22, color: blocked ? C.red : '#8D99AB', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {blocked ? '! BLOCKED' : '… WAITING'}
              </At>
            )}
          </At>
        );
      })}
      <Cursor x={906 + (f >= 302 ? 0 : Math.sin(t * 0.3) * limit((t - 120) / 150) * 30)} y={492} size={105} sweat={t >= 120} />
      <At x={864} y={650} style={{ fontFamily: fonts.sans, fontSize: 21, color: '#929EB0', letterSpacing: 3 }}>
        YOU / HUMAN
      </At>
    </div>
  );
}

export function Year2026({ id, f }: { id: string; f: number }) {
  if (id === 'F01')
    return (
      <>
        <TitleBlock f={f} eyebrow="2026 / 办公桌面" lines={['文件、邮件、办公任务。']} size={91} accent={C.green} />
        <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
          <ellipse cx="1010" cy="778" rx="640" ry="65" fill="#CEBD8C" opacity="0.07" />
          <path d="M450 640H1430L1575 735H590Z" fill="#F0E6C7" stroke="#D9CAA0" strokeWidth="1" />
          <path d="M590 735H1575V749H590Z" fill="#D7C79B" />
          <path d="M1430 640L1575 735V749L1430 654Z" fill="#E0D1A5" />
          <path d="M640 749V855M1425 749V855" stroke="#D9CAA0" strokeWidth="16" strokeLinecap="round" />
        </svg>
        {['file', 'calendar', 'mail', 'folder', 'chat'].map((icon, i) => {
          const coords = [
            [300, 420],
            [630, 350],
            [1060, 345],
            [1440, 410],
            [1580, 625],
          ];
          return (
            <div key={icon}>
              <Signal
                f={f}
                start={20 + i * 18}
                duration={42}
                a={[coords[i][0] + 50, coords[i][1] + 50]}
                b={[1110, 570]}
                color={C.green}
                bend={i % 2 ? -45 : 45}
              />
              <GlyphTile
                x={coords[i][0]}
                y={coords[i][1]}
                width={115}
                height={115}
                icon={icon}
                color={C.green}
                f={f}
                start={20 + i * 18}
                rotate={(i - 2) * 3}
              />
            </div>
          );
        })}
        <Cursor x={755} y={525} size={100} />
        <Orb x={1110} y={575} color={C.green} size={74} f={f} start={12} />
        <At x={465} y={875} style={{ display: 'flex', gap: 25 }}>
          {['处理文件', '整理资料', '跟进任务', '操作桌面'].map((text, i) => (
            <div key={text} style={{ opacity: fade(f, 35 + i * 30, 18), transform: `translateY(${move(f, 35 + i * 30, 25, 20, 0)}px)` }}>
              <Chip color={C.green} style={{ fontSize: 30 }}>
                {text}
              </Chip>
            </div>
          ))}
        </At>
      </>
    );
  if (id === 'F02') {
    const open = f >= 170,
      t = open ? f - 170 : f;
    return (
      <>
        <TitleBlock
          f={t}
          eyebrow={open ? '2026.01.30 / 从消息里接活' : '2026.01.12 / 办公任务'}
          lines={[open ? 'OpenClaw' : 'Claude Cowork']}
          size={open ? 112 : 96}
          x={110}
          y={open ? 130 : 200}
          width={open ? 1600 : 620}
          accent={C.green}
        />
        {open ? (
          <>
            <Media id="openclaw" f={t} x={825} y={340} width={950} height={530} />
            <At
              x={300}
              y={445}
              style={{
                width: 295,
                height: 230,
                border: '1px solid #A8C8B2',
                borderRadius: 28,
                background: '#F5FAF6',
                padding: 30,
                boxShadow: '0 35px 65px -35px #1B513535',
                transform: 'perspective(1300px) rotateY(10deg)',
              }}
            >
              <Icon name="server" color={C.green} size={68} />
              <Orb x={220} y={130} color={C.green} f={100} size={48} />
              <At x={30} y={175} style={{ fontFamily: fonts.sans, fontSize: 18, letterSpacing: 3, color: '#86A590' }}>
                SELF-HOSTED
              </At>
            </At>
            {['Telegram', 'WhatsApp', 'Discord'].map((text, i) => (
              <At
                key={text}
                x={120 + i * 205}
                y={755 + Math.sin(i) * 25}
                style={{ opacity: fade(t, 15 + i * 15, 15), transform: `translateY(${move(t, 15 + i * 15, 25, 40, 0)}px)` }}
              >
                <Chip color={C.green} style={{ fontSize: 21, padding: '12px 20px' }}>
                  {text}
                </Chip>
              </At>
            ))}
            {[0, 1, 2].map((i) => (
              <Signal key={i} f={t} start={20 + i * 18} duration={45} a={[210 + i * 205, 755]} b={[450, 675]} color={C.green} bend={-35} />
            ))}
          </>
        ) : (
          <>
            <Media id="cowork" f={t} x={725} y={290} width={1050} height={600} />
            <Note f={t} start={65} x={115} y={630} width={550} size={34}>
              文件整理，
              <br />
              文档处理。
            </Note>
          </>
        )}
        {open && (
          <Note f={t} start={60} x={115} y={900} size={21}>
            Clawdbot 2025.11 → Clawd / Moltbot → OpenClaw 2026.01.30　　·　　ChatGPT Work 2026.07.09
          </Note>
        )}
      </>
    );
  }
  if (id === 'F03')
    return (
      <>
        <TitleBlock f={f} eyebrow="2026 / 编程任务工作台" lines={['Codex App']} size={108} width={600} x={110} y={210} />
        <Media id="codex-web" f={f} x={720} y={340} width={1060} height={565} />
        <Note f={f} start={45} x={115} y={565} size={34} width={530}>
          交代任务
          <br />
          查看进度
          <br />
          检查结果
        </Note>
      </>
    );

  if (id === 'F04')
    return (
      <>
        <TitleBlock f={f} eyebrow="2026 / 任务管理" lines={['查看多个任务的进度']} x={180} size={96} />
        <TenAgents f={f} />
        {f >= 280 && (
          <At x={520} y={875} style={{ display: 'flex', gap: 38, opacity: fade(f, 280, 22), zIndex: 100 }}>
            <Chip color={C.red} style={{ fontSize: 35, background: '#FFF' }}>
              卡住了
            </Chip>
            <Chip color="#79879A" style={{ fontSize: 35, background: '#FFF' }}>
              等待确认
            </Chip>
          </At>
        )}
      </>
    );

  if (id === 'F05')
    return (
      <>
        <TitleBlock f={f} eyebrow="国内 / 办公桌面 Agent" lines={['WorkBuddy · DuMate · QoderWork · 豆包工作']} y={100} size={76} accent={C.green} />
        <Media id="workbuddy" f={f} x={115} y={352} width={780} height={227} fit="cover" tilt={2} />
        <Media id="dumate" f={f} x={1100} y={347} width={520} height={246} delay={8} tilt={-2} />
        <Media id="qoderwork" f={f} x={115} y={674} width={780} height={226} delay={16} fit="cover" focus={[0.62, 0.05, 0.32, 0.3]} focusAt={100} tilt={2} />
        <Media id="doubao" f={f} x={995} y={674} width={780} height={226} delay={24} fit="cover" tilt={-2} />
      </>
    );
  if (id === 'F07') {
    const harness = f >= 170,
      t = harness ? f - 170 : f;
    return (
      <>
        <TitleBlock
          f={t}
          eyebrow={harness ? '2026.08.13 / 执行底座' : '2026.05.13 / Agent Runtime SDK'}
          lines={harness ? ['DeepSeek', 'Harness'] : ['Cline SDK']}
          size={108}
          width={harness ? 630 : 1650}
          x={110}
          y={harness ? 200 : 120}
          accent={C.red}
        />
        {harness ? (
          <>
            <Media id="harness" f={t} x={750} y={290} width={1020} height={615} />
            <At x={115} y={630} style={{ opacity: fade(t, 65, 20) }}>
              <Chip color={C.red} style={{ fontSize: 27 }}>
                开源 · Harness
              </Chip>
            </At>
            <Note f={t} start={80} x={115} y={755} size={29} width={530}>
              工具调用，
              <br />
              任务运行。
            </Note>
          </>
        ) : (
          <>
            <At
              x={150}
              y={395}
              style={{
                width: 530,
                height: 350,
                border: '1px solid #CDD5E1',
                borderRadius: 25,
                background: '#FFF',
                opacity: 1 - fade(t, 85, 55) * 0.8,
                transform: `perspective(1600px) rotateY(${move(t, 80, 65, 0, -12)}deg) translateY(${move(t, 85, 70, 0, 80)}px)`,
              }}
            >
              <At x={25} y={20}>
                <Icon name="code" color="#9CA9BC" size={45} />
              </At>
              {[0, 1, 2, 3].map((i) => (
                <At key={i} x={35} y={105 + i * 40} style={{ height: 8, width: 350 - i * 48, borderRadius: 5, background: '#E5EAF2' }} />
              ))}
              <At x={25} y={300} style={{ fontSize: 21, color: '#9AA4B3' }}>
                IDE / 产品外壳
              </At>
            </At>
            <At
              x={move(t, 25, 65, 330, 850)}
              y={435}
              style={{ width: 270, height: 260, transform: `perspective(1400px) rotateY(${move(t, 25, 65, 0, -8)}deg) rotateX(3deg)`, zIndex: 20 }}
            >
              <div style={{ position: 'absolute', inset: '10px -7px -12px 8px', borderRadius: 30, background: '#E6A49E' }} />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 30,
                  border: `2px solid ${C.red}`,
                  background: '#FFF5F3',
                  padding: 35,
                  textAlign: 'center',
                  boxShadow: '0 30px 70px -30px #EA433545',
                }}
              >
                <Icon name="loop" color={C.red} size={100} style={{ transform: `rotate(${t * 1.2}deg)` }} />
                <div style={{ fontSize: 29, fontWeight: 600, color: C.red, marginTop: 25 }}>Runtime SDK</div>
              </div>
            </At>
            {['terminal', 'server', 'browser'].map((icon, i) => (
              <div key={icon}>
                <Signal f={t} start={92 + i * 8} duration={35} a={[1120, 565]} b={[1460, 420 + i * 170]} color={C.red} bend={0} />
                <GlyphTile x={1470} y={355 + i * 170} width={160} height={135} icon={icon} color={C.red} f={t} start={98 + i * 8} rotate={-6} />
              </div>
            ))}
            <Note f={t} start={100} x={650} y={850} size={30} color={C.red}>
              “upgraded agent runtime” — Cline
            </Note>
          </>
        )}
      </>
    );
  }
  return null;
}
