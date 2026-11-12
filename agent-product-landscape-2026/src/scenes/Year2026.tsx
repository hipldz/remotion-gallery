import { C, fonts } from '../data/theme';
import { fade, f2, limit, mix, move } from '../lib/cinematics';
import { At, Chip, Cursor, Icon, Progress } from '../components/Primitives';
import { GlyphTile, Note, Orb, Signal, TitleBlock } from '../components/CinematicActors';
import { Media } from '../components/Media';
import { StoryBridge } from '../components/StoryBridge';
import { PopularityBadge } from '../components/PopularityBadge';

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
                {blocked ? '卡住了' : '等你确认'}
              </At>
            )}
          </At>
        );
      })}
      <Cursor x={906 + (f >= 302 ? 0 : Math.sin(t * 0.3) * limit((t - 120) / 150) * 30)} y={492} size={105} sweat={t >= 120} />
      <At x={864} y={650} style={{ fontFamily: fonts.sans, fontSize: 21, color: '#929EB0', letterSpacing: 3 }}>
        你来检查
      </At>
    </div>
  );
}

export function Year2026({ id, f }: { id: string; f: number }) {
  if (id === 'F01')
    return (
      <>
        <TitleBlock f={f} eyebrow="2026 / 日常工作台" lines={['事情多了，放一起更好管。']} size={91} accent={C.green} />
        <Note f={f} start={35} x={115} y={320} size={28}>
          哪些在做，哪些做完了，都能看一眼。
        </Note>
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
          {['放在一起', '做到哪了', '看看结果', '接着做'].map((text, i) => (
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
    const open = f >= 130,
      t = open ? f - 130 : f;
    return (
      <>
        <TitleBlock
          f={t}
          eyebrow={open ? '2026.01.30 / 发条消息，让它做事' : '2026.01.12 / 处理文档和文件'}
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
        {open && <PopularityBadge id="openclaw" f={t} x={115} y={855} start={25} label="OpenClaw 仓库" compact />}
      </>
    );
  }

  if (id === 'F03') {
    return (
      <>
        <TitleBlock f={f} eyebrow="2026 / 把编程任务放在一起" lines={['Codex App']} size={104} width={600} x={110} y={205} />
        <Media id="codex-web" f={f} x={720} y={340} width={1060} height={565} />
        <Note f={f} start={40} x={115} y={540} size={32} width={530}>
          把任务放在一起
          <br />
          看看做到哪了
          <br />
          检查改了哪些地方
        </Note>
        <PopularityBadge id="codex" f={f} x={115} y={790} label="Codex CLI 仓库" />
      </>
    );
  }
  if (id === 'F05') {
    return (
      <>
        <TitleBlock f={f} eyebrow="国内 / 日常办公，也能帮忙" lines={['WorkBuddy · 豆包工作']} y={110} size={96} accent={C.green} />
        <Media id="workbuddy" f={f} x={110} y={385} width={810} height={340} fit="contain" tilt={2} />
        <Media id="doubao" f={f} x={1000} y={385} width={810} height={340} delay={8} fit="contain" tilt={-2} />
        <At x={245} y={750} style={{ display: 'flex', gap: 110, opacity: fade(f, 55, 20) }}>
          {['本地文件', '文档整理', '日常任务'].map((text, i) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
              <Icon name={['folder', 'file', 'calendar'][i]} size={42} color={C.green} />
              <span style={{ fontSize: 32, color: '#61756B' }}>{text}</span>
            </div>
          ))}
        </At>
        <Note f={f} start={80} x={250} y={845} size={27}>
          文件、文档这些事，也有了专门的帮手。
        </Note>
      </>
    );
  }
  if (id === 'F07') {
    return (
      <>
        <TitleBlock f={f} eyebrow="2026.08 / 文件、代码，都能帮忙" lines={['DeepSeek', 'Harness']} size={105} width={620} x={110} y={170} accent={C.green} />
        <Media id="harness" f={f} x={750} y={300} width={1020} height={615} mode="match" />
        <Note f={f} start={35} x={115} y={550} size={31} width={545}>
          桌面、网页都能用
          <br />
          写代码、处理文件、查资料
          <br />
          需要更多功能，可以加插件
        </Note>
        <PopularityBadge id="harness" f={f} x={115} y={790} label="GitHub 仓库" />
      </>
    );
  }
  if (id === 'F04')
    return (
      <>
        <TitleBlock f={f} eyebrow="2026 / 事情一多，怎么顾得过来" lines={['事情一多，得看清做到哪了。']} x={180} size={86} />
        <TenAgents f={f} />
        {f >= 280 && (
          <At x={520} y={875} style={{ display: 'flex', gap: 38, opacity: fade(f, 280, 22), zIndex: 100 }}>
            <Chip color={C.red} style={{ fontSize: 35, background: '#FFF' }}>
              卡住了
            </Chip>
            <Chip color="#79879A" style={{ fontSize: 35, background: '#FFF' }}>
              等你确认
            </Chip>
          </At>
        )}
      </>
    );

  if (id === 'F06') {
    return (
      <StoryBridge
        f={f}
        eyebrow="长任务 / 做了一半，怎么接着做"
        title={['做了一半，还得能接着做。']}
        labels={['容易卡在这里', '得能接着做']}
        before={['做到一半停了', '前面的内容太长了']}
        after={['记住做到哪了', '下次打开还能接着做']}
        note="管工具、记进度、留住前面的内容，这些都靠 Harness。"
        accent={C.red}
      />
    );
  }
  return null;
}
