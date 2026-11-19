import { Graph } from "../components/Graph";
import { Glyph, type GlyphName } from "../components/Glyph";
import { Card, Heading, Letterbox, Pen, Tag } from "../components/Stage";
import { agentGraph, makePattern, type Pattern } from "../data/patterns";
import { C, MONO } from "../data/theme";
import { type Shot } from "../data/timeline";
import { ease, mix } from "../lib/motion";
import { FollowRequest } from "./FollowRequest";

export function Opening({ shot, time }: { shot: Shot; time: number }) {
  if (shot.id === "S0-5")
    return <FollowRequest time={time} duration={shot.end - shot.start} />;
  if (shot.id === "S0-1")
    return (
      <>
        <div className="eyebrow" style={{ position: "absolute", top: 220, left: 0, right: 0, textAlign: "center", color: C.gray }}>
          大家好，今天一起聊聊
        </div>
        <div className="hero-title" style={{ top: 340, fontSize: 128, transform: `scale(${mix(0.98, 1.015, ease(time, 0, shot.end - shot.start))})` }}>
          <span style={{ color: C.blue }}>Workflow</span>
          <span className="vs" style={{ fontSize: 54 }}>和</span>
          <span style={{ color: C.red }}>Agent</span>
          <p style={{ fontSize: 52, letterSpacing: 1.5, marginTop: 36 }}>到底是什么，又该怎么选？</p>
        </div>
        <div style={{ position: "absolute", top: 710, left: 0, right: 0, textAlign: "center", color: C.gray, fontSize: 26, letterSpacing: 3, opacity: ease(time, 0.7, 0.6) }}>
          从一个最近的消息聊起
        </div>
      </>
    );
  if (shot.id === "S0-2")
    return (
      <>
        <Heading eyebrow="从最近的一件事聊起" title="Coze 企业版，开始逐步下线" />
        <Card time={time} delay={0.1} style={{ position: "absolute", left: 160, right: 160, top: 350, height: 190, display: "flex", alignItems: "center", gap: 42, padding: "30px 42px" }}>
          <div style={{ fontFamily: MONO, fontSize: 62, color: "#a47800", borderRight: "1px solid #e5e8ec", paddingRight: 42 }}>
            10·29
          </div>
          <div>
            <h2 style={{ fontSize: 44, marginBottom: 12 }}>字节跳动 · Coze 企业版</h2>
            <p style={{ fontSize: 28 }}>10 月 29 日起，逐步下线</p>
          </div>
        </Card>
        <div style={{ position: "absolute", left: 140, right: 140, top: 630, textAlign: "center", fontSize: 83, fontWeight: 550, opacity: ease(time, 6.8, 0.6) }}>
          <span style={{ color: C.blue }}>Workflow</span> 要被淘汰了吗？
        </div>
      </>
    );
  if (shot.id === "S0-3")
    return (
      <>
        <div className="eyebrow" style={{ position: "absolute", top: 220, left: 0, right: 0, textAlign: "center", color: C.gray }}>
          那我们先把问题问清楚
        </div>
        <div className="hero-title" style={{ top: 325, fontSize: 125 }}>
          <span style={{ color: C.blue }}>Workflow</span>
          <span className="vs">/</span>
          <span style={{ color: C.red }}>Agent</span>
          <p style={{ fontSize: 54, marginTop: 30 }}>到底分别是什么？</p>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 660, textAlign: "center", fontSize: 65, fontWeight: 550, opacity: ease(time, 3.6, 0.6) }}>
          <span style={{ color: C.red }}>Agent</span> 就一定更好吗？
          <div style={{ fontSize: 30, color: C.gray, fontWeight: 400, marginTop: 22 }}>我们是不是都该换过去？</div>
        </div>
      </>
    );
  return (
    <>
      <Heading eyebrow="带着问题，读两份早期资料" title="先读读，它们怎么说" />
      <div style={{ position: "absolute", left: 160, right: 160, top: 350, display: "flex", gap: 28 }}>
        {[
          {
            name: "Anthropic",
            kind: "BLOG",
            title: "Building effective agents",
            color: C.blue,
            notes: [
              ["Workflow", "预设代码路径，编排模型和工具"],
              ["Agent", "模型管理过程，选择工具"],
            ],
          },
          {
            name: "OpenAI",
            kind: "GUIDE",
            title: "A practical guide to building agents",
            color: C.red,
            notes: [
              ["Workflow", "完成目标，需要执行的一组步骤"],
              ["Agent", "用模型管理执行，替你完成任务"],
            ],
          },
        ].map((item, i) => (
          <Card key={item.name} time={time} delay={0.1 + i * 0.18} color={item.color} style={{ flex: 1, height: 450, padding: "30px 34px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 52, fontWeight: 550, color: item.color }}>{item.name}</span>
              <span style={{ fontFamily: MONO, fontSize: 19, letterSpacing: 2, color: C.gray }}>{item.kind}</span>
            </div>
            <p style={{ fontSize: 31, lineHeight: 1.35, color: C.ink, marginTop: 14, minHeight: 72 }}>{item.title}</p>
            <div style={{ borderTop: "1px solid #e5e8ec", marginTop: 18, paddingTop: 24 }}>
              {item.notes.map(([term, meaning], j) => (
                <div key={term} style={{ display: "flex", alignItems: "baseline", gap: 18, fontSize: 25, lineHeight: 1.45, marginTop: j === 0 ? 0 : 18 }}>
                  <span style={{ width: 120, flexShrink: 0, fontWeight: 550, color: term === "Workflow" ? C.blue : C.red }}>{term}</span>
                  <span style={{ color: "#6c737c" }}>{meaning}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

export function Foundation({ shot, time }: { shot: Shot; time: number }) {
  if (shot.id === "S1-3")
    return (
      <>
        <Heading eyebrow="同一套积木，两种组织方式" title="下一步，由谁来安排？" />
        <div style={{ position: "absolute", left: 180, top: 300, transform: `translateX(${mix(-40, 40, ease(time, 0, 8))}px)` }}>
          <Pen time={time} />
        </div>
        <div style={{ position: "absolute", right: 200, top: 350, color: C.red, fontSize: 75, transform: `rotate(${Math.sin(time) * 6}deg)` }}>✧</div>
        <div className="art" style={{ top: 490, height: 260 }}>
          <Graph
            width={1600}
            height={260}
            time={time}
            nodes={[0, 1, 2, 3].map((i) => ({
              id: `llm${i}`,
              x: 240 + i * 370,
              y: 130,
              label: "LLM",
              sub: "+ tools + memory",
              color: C.yellow,
              width: 230,
              height: 110,
            }))}
            edges={[0, 1, 2].map((i) => ({ from: `llm${i}`, to: `llm${i + 1}`, at: 1 + i * 0.8 }))}
          />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 785, display: "flex", justifyContent: "center", gap: 30 }}>
          <Tag color={C.blue}>Workflow · 我们先安排</Tag>
          <Tag color={C.red}>Agent · 模型边做边判断</Tag>
        </div>
      </>
    );
  const modules: { name: string; en: string; glyph: GlyphName; x: number; y: number; at: number }[] = [
    { name: "检索 · 查资料", en: "Retrieval", glyph: "search", x: 260, y: 230, at: 8 },
    { name: "工具 · 执行动作", en: "Tools", glyph: "tool", x: 1180, y: 90, at: 9.5 },
    { name: "记忆 · 保留信息", en: "Memory", glyph: "memory", x: 1180, y: 380, at: 12 },
  ];
  return (
    <>
      <Heading eyebrow="先打个比方" title="如果把模型应用，看成搭积木" accent={C.yellow} />
      <div className="art" style={{ top: 335 }}>
        <svg width={1600} height={510} style={{ position: "absolute", overflow: "visible" }}>
          <circle
            cx={760}
            cy={245}
            r={205}
            fill={`${C.yellow}07`}
            stroke={`${C.yellow}35`}
            strokeDasharray="3 15"
            strokeWidth={3}
            transform={`rotate(${time * 5} 760 245)`}
          />
          {modules.map((m) => (
            <path
              key={m.en}
              d={`M760 245 Q ${m.x} 245 ${m.x} ${m.y}`}
              fill="none"
              stroke={C.yellow}
              strokeWidth={3}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - ease(time, m.at, 0.7)}
            />
          ))}
          <circle cx={760} cy={245} r={133} fill="white" stroke={C.yellow} strokeWidth={4} />
          <circle cx={760} cy={245} r={117} fill={`${C.yellow}12`} />
          <text x={760} y={257} fontSize={91} fontWeight={550} textAnchor="middle" fill={C.ink}>
            LLM
          </text>
          <text x={760} y={300} fontSize={22} textAnchor="middle" fill="#a1801a">
            核心积木
          </text>
        </svg>
        {modules.map((m) => (
          <Card
            key={m.en}
            time={time}
            delay={m.at}
            color={C.yellow}
            style={{
              position: "absolute",
              left: m.x - 150,
              top: m.y - 65,
              width: 345,
              height: 135,
              display: "flex",
              gap: 24,
              alignItems: "center",
              padding: 22,
            }}
          >
            <Glyph name={m.glyph} color="#c69a04" size={60} />
            <div>
              <h2 style={{ fontSize: 32, marginBottom: 6 }}>{m.en}</h2>
              <p style={{ fontSize: 23, whiteSpace: "nowrap" }}>{m.name}</p>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

export function AgentConcept({ shot, time }: { shot: Shot; time: number }) {
  if (shot.id === "S3-4")
    return (
      <>
        <div style={{ position: "absolute", left: 280, top: 290, opacity: 0.12, filter: "blur(3px)", transform: `scale(${1 + time * 0.015})` }}>
          <div style={{ width: 1300, height: 430 }}>
            <Graph {...agentGraph(time + 2)} time={time + 2} />
          </div>
        </div>
        <div style={{ position: "absolute", left: 520, top: 400, transform: `scale(${mix(1.4, 1.6, ease(time, 0, 8))})` }}>
          <Pen time={time} handing />
        </div>
        <div
          style={{ position: "absolute", left: 280, top: 235, right: 200, color: time > 3.5 ? C.red : C.blue, fontSize: 31, letterSpacing: 5, opacity: 0.55 }}
        >
          LLMs dynamically direct their own processes and tool usage
        </div>
        <div style={{ position: "absolute", top: 710, left: 0, right: 0, textAlign: "center", fontSize: 55, fontWeight: 550, opacity: ease(time, 3.7, 1) }}>
          把<span style={{ color: C.red }}>运行时决策权</span>，交给模型
        </div>
        <Letterbox time={time} duration={8} />
      </>
    );
  if (shot.id === "S3-5")
    return (
      <>
        <Heading eyebrow="OPENAI / A PRACTICAL GUIDE" title="独立完成任务，意味着什么？" accent={C.red} />
        <div style={{ position: "absolute", left: 180, top: 350, width: 1460 }}>
          <div className="quote-mark">“</div>
          <div className="quote" style={{ maxWidth: 1400 }}>
            Agents are systems that independently
            <br />
            accomplish tasks on your behalf.
          </div>
        </div>
        <div style={{ position: "absolute", top: 650, left: 180, right: 180, display: "flex", gap: 28 }}>
          {["单次聊天回复", "单轮 LLM 调用", "情感分类"].map((label, i) => (
            <Card key={label} time={time} delay={3.2 + i * 1.5} style={{ width: 490, height: 175, textAlign: "center" }}>
              <div style={{ fontSize: 32 }}>{label}</div>
              <div
                style={{
                  fontSize: 24,
                  color: C.gray,
                  border: `2px solid ${C.line}`,
                  borderRadius: 5,
                  display: "inline-block",
                  padding: "5px 20px",
                  marginTop: 24,
                  transform: `rotate(-${4 + i}deg)`,
                  opacity: ease(time, 3.9 + i * 1.5, 0.2),
                }}
              >
                没有接管执行
              </div>
            </Card>
          ))}
        </div>
      </>
    );
  if (shot.id === "S3-3")
    return (
      <>
        <Heading eyebrow="ANTHROPIC / THE AGENT LOOP" title="每一步，都得看工具的真实结果" accent={C.red} />
        <div className="art" style={{ top: 335, opacity: mix(1, 0.22, ease(time, 3.5, 1)), filter: `blur(${ease(time, 3.5, 1) * 5}px)` }}>
          <Graph {...agentGraph(time, true)} time={time} />
        </div>
        <div style={{ position: "absolute", top: 445, left: 250, width: 1420, opacity: ease(time, 3.5, 1), fontSize: 59, lineHeight: 1.35, letterSpacing: -1 }}>
          “{"LLMs using tools based on environmental feedback in a loop.".slice(0, Math.floor(Math.max(0, time - 3.5) * 24))}”
        </div>
        <div style={{ position: "absolute", top: 770, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 20 }}>
          <Tag color={C.red}>工具实际返回的结果</Tag>
          <Tag color={C.green}>检查点</Tag>
          <Tag color={C.green}>最多迭代几次</Tag>
        </div>
      </>
    );
  const morph = ease(time, 0.4, 2.2);
  return (
    <>
      <Heading eyebrow="AGENT / CHOOSE WHILE RUNNING" title="线不再提前画完" accent={C.red} />
      <div className="art" style={{ top: 330, opacity: 1 - morph, transform: `translateY(${-morph * 65}px) rotateX(${morph * 25}deg)` }}>
        <Graph {...makePattern("chain", time)} time={time} />
      </div>
      <div className="art" style={{ top: 330, opacity: morph, transform: `translateY(${(1 - morph) * 110}px) scale(${mix(0.85, 1, morph)})` }}>
        <Graph {...agentGraph(Math.max(0, time - 1.5))} time={Math.max(0, time - 1.5)} />
      </div>
      <div style={{ position: "absolute", top: 320, left: 800, display: "flex", gap: 15, opacity: ease(time, 2, 0.5) }}>
        {(["search", "terminal", "file"] as const).map((name, i) => (
          <div
            key={name}
            style={{
              border: `1.5px dashed ${C.line}`,
              borderRadius: 18,
              padding: 13,
              background: "white",
              opacity: Math.floor(Math.max(0, time - 1.5) / 2.8) === i ? 1 : 0.3,
            }}
          >
            <Glyph name={name} color={C.red} size={38} />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 835, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: ease(time, 1, 0.6) }}>
        <Tag color={C.red}>退款请求：查订单 → 看政策 → 决定要不要追问</Tag>
      </div>
    </>
  );
}

export function Misconceptions({ time }: { time: number }) {
  const items: { label: string; key: Pattern }[] = [
    { label: "用了 LLM 就是 Agent？", key: "chain" },
    { label: "有循环就是 Agent？", key: "eval" },
    { label: "子任务动态生成就是 Agent？", key: "orch" },
    { label: "节点越多越像 Agent？", key: "parallel" },
  ];
  const finale = ease(time, 13.2, 1);
  const active = Math.min(3, Math.max(0, Math.floor((time - 3) / 2)));
  return (
    <>
      <Heading eyebrow="FALSE SIGNALS / LOOK AGAIN" title="这些，都不能单独当作判断依据" accent={C.red} />
      <div
        style={{
          position: "absolute",
          left: 160,
          top: 355,
          display: "grid",
          gridTemplateColumns: "710px 710px",
          gap: 32,
          opacity: 1 - finale,
          transform: `scale(${1 - finale * 0.15})`,
        }}
      >
        {items.map((item, i) => (
          <Card key={item.key} time={time} delay={i * 2 + 2.7} style={{ height: 225, position: "relative", padding: "28px 32px" }}>
            <h2 style={{ fontSize: 31, color: C.gray }}>{item.label}</h2>
            <div style={{ width: 620, height: 110, opacity: active === i ? 1 : 0.5 }}>
              <Graph {...makePattern(item.key, 7)} time={7} />
            </div>
            <svg width={700} height={225} style={{ position: "absolute", top: 0, left: 0 }}>
              <path
                d="M 30 193 L 670 35"
                stroke={C.red}
                strokeWidth={5}
                strokeLinecap="round"
                fill="none"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - ease(time, 3.3 + i * 2, 0.3)}
              />
            </svg>
          </Card>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: finale,
          transform: `scale(${mix(0.7, 1, finale)})`,
        }}
      >
        <span style={{ fontSize: 210, color: C.red, lineHeight: 1.1 }}>?</span>
        <div style={{ fontSize: 65, fontWeight: 550, marginTop: 20 }}>模型能决定多大范围的事</div>
      </div>
    </>
  );
}
