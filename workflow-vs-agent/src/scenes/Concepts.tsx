import { Graph } from "../components/Graph";
import { Glyph, type GlyphName } from "../components/Glyph";
import { Card, Heading, Letterbox, Pen, Tag } from "../components/Stage";
import { agentGraph, makePattern, type Pattern } from "../data/patterns";
import { C } from "../data/theme";
import { type Shot } from "../data/timeline";
import { ease, mix } from "../lib/motion";

export function Opening({ shot, time }: { shot: Shot; time: number }) {
  if (shot.id === "S0-1")
    return (
      <>
        <div className="eyebrow" style={{ position: "absolute", top: 220, left: 0, right: 0, textAlign: "center", color: C.gray }}>
          AI 应用架构 · 概念与选型
        </div>
        <div className="hero-title" style={{ top: 340, fontSize: 128, transform: `scale(${mix(0.98, 1.015, ease(time, 0, 5))})` }}>
          <span style={{ color: C.blue }}>Workflow</span>
          <span className="vs" style={{ fontSize: 54 }}>
            和
          </span>
          <span style={{ color: C.red }}>Agent</span>
          <p style={{ fontSize: 52, letterSpacing: 1.5, marginTop: 36 }}>分别是什么？做项目时该怎么选？</p>
        </div>
        <div
          style={{
            position: "absolute",
            top: 710,
            left: 0,
            right: 0,
            textAlign: "center",
            color: C.gray,
            fontSize: 26,
            letterSpacing: 5,
            opacity: ease(time, 0.7, 0.6),
          }}
        >
          概念 · 区别 · 工程选型
        </div>
      </>
    );
  if (shot.id === "S0-3")
    return (
      <>
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          <path
            d="M-50 760 C300 760 480 720 960 660"
            fill="none"
            stroke={C.blue}
            strokeWidth={4}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - ease(time, 0, 1)}
          />
          <path
            d="M1970 760 C1650 760 1400 720 960 660"
            fill="none"
            stroke={C.red}
            strokeWidth={4}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - ease(time, 0, 1)}
          />
          {Array.from({ length: 28 }, (_, i) => {
            const a = i * 2.399;
            const radius = mix(0, 80 + i * 15, ease(time, 0.5, 1.2));
            return (
              <circle
                key={i}
                cx={960 + Math.cos(a) * radius}
                cy={660 + Math.sin(a) * radius * 0.5}
                r={3 + (i % 5)}
                fill={[C.blue, C.red, C.yellow, C.green][i % 4]}
                opacity={(1 - ease(time, 1.4, 1.2)) * 0.8}
              />
            );
          })}
        </svg>
        <div className="hero-title" style={{ opacity: ease(time, 0.6, 0.8), transform: `scale(${mix(0.94, 1.02, ease(time, 0.8, 6))})` }}>
          <span style={{ color: C.blue }}>Workflow</span>
          <span className="vs">vs</span>
          <span style={{ color: C.red }}>Agent</span>
          <p>先分清区别，再决定怎么用</p>
        </div>
        <div style={{ position: "absolute", top: 720, left: 0, right: 0, textAlign: "center", opacity: ease(time, 2, 0.8) }}>
          <Tag color={C.blue}>概念 · 边界 · 工程选型</Tag>
        </div>
      </>
    );
  return (
    <>
      <Heading eyebrow="AN EXAMPLE / A REFUND REQUEST" title="从一个退款请求，看执行差异" />
      <div
        style={{
          position: "absolute",
          top: 320,
          left: 610,
          width: 700,
          padding: "18px 30px",
          border: "1px solid #dfe3e8",
          borderRadius: 24,
          background: "white",
          fontSize: 32,
          textAlign: "center",
          boxShadow: "0 10px 35px #26344908",
        }}
      >
        “我想退掉上周买的耳机。”
      </div>
      {[0, 1].map((i) => {
        const color = i === 0 ? C.blue : C.red;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: i === 0 ? 140 : 1010,
              top: 430,
              width: 770,
              height: 398,
              border: `2px solid ${color}65`,
              borderRadius: 30,
              background: "#ffffffd9",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", left: 32, top: 25, fontSize: 24, letterSpacing: 2, color }}>
              {i === 0 ? "Workflow · 预先定义流程" : "Agent · 根据结果选行动"}
            </div>
            <div style={{ position: "absolute", left: 12, top: 70, width: 744, height: 310 }}>
              {i === 0 ? (
                <Graph
                  width={760}
                  height={360}
                  time={time}
                  nodes={[
                    { id: "a", x: 120, y: 180, label: "分类", color: C.yellow, width: 160 },
                    { id: "b", x: 380, y: 180, label: "退款流程", color: C.blue, width: 190 },
                    { id: "c", x: 640, y: 180, label: "模板回复", color: C.yellow, width: 190 },
                  ]}
                  edges={[
                    { from: "a", to: "b", at: 0.3, duration: 1.8 },
                    { from: "b", to: "c", at: 2.1, duration: 1.8 },
                  ]}
                />
              ) : (
                <Graph
                  width={760}
                  height={360}
                  time={time}
                  nodes={[
                    { id: "a", x: 165, y: 105, label: "查订单", color: C.yellow, width: 200 },
                    { id: "b", x: 585, y: 105, label: "读退款政策", color: C.red, width: 220 },
                    { id: "c", x: 585, y: 275, label: "已超 7 天", color: C.yellow, width: 220 },
                    { id: "d", x: 165, y: 275, label: "追问用户", color: C.red, width: 200 },
                  ]}
                  edges={[
                    { from: "a", to: "b", at: 0.2, duration: 1.4, dynamic: true, color: C.red },
                    {
                      from: "b",
                      to: "c",
                      at: 1.6,
                      duration: 1.4,
                      dynamic: true,
                      color: C.red,
                      points: [
                        [585, 149],
                        [655, 175],
                        [655, 205],
                        [585, 231],
                      ],
                    },
                    { from: "c", to: "d", at: 3, duration: 1.6, dynamic: true, color: C.red },
                  ]}
                />
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

export function Foundation({ shot, time }: { shot: Shot; time: number }) {
  if (shot.id === "S1-3")
    return (
      <>
        <Heading eyebrow="THE SAME BUILDING BLOCK" title="积木相同，连接方式不同" />
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
          <Tag color={C.blue}>设计时 · 开发者画线</Tag>
          <Tag color={C.red}>运行时 · 模型选路</Tag>
        </div>
      </>
    );
  const modules: { name: string; en: string; glyph: GlyphName; x: number; y: number }[] = [
    { name: "检索", en: "Retrieval", glyph: "search", x: 260, y: 230 },
    { name: "工具", en: "Tools", glyph: "tool", x: 1180, y: 90 },
    { name: "记忆", en: "Memory", glyph: "memory", x: 1180, y: 380 },
  ];
  return (
    <>
      <Heading eyebrow="THE AUGMENTED LLM" title="先认识，最小的那块积木" accent={C.yellow} />
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
          {modules.map((m, i) => (
            <path
              key={m.en}
              d={`M760 245 Q ${m.x} 245 ${m.x} ${m.y}`}
              fill="none"
              stroke={C.yellow}
              strokeWidth={3}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - ease(time, 0.8 + i * 1.2, 0.7)}
            />
          ))}
          <circle cx={760} cy={245} r={133} fill="white" stroke={C.yellow} strokeWidth={4} />
          <circle cx={760} cy={245} r={117} fill={`${C.yellow}12`} />
          <text x={760} y={257} fontSize={91} fontWeight={550} textAnchor="middle" fill={C.ink}>
            LLM
          </text>
          <text x={760} y={300} fontSize={22} textAnchor="middle" fill="#a1801a">
            the core
          </text>
        </svg>
        {modules.map((m, i) => (
          <Card
            key={m.en}
            time={time}
            delay={0.8 + i * 1.2}
            color={C.yellow}
            style={{
              position: "absolute",
              left: m.x - 150,
              top: m.y - 65,
              width: 300,
              height: 135,
              display: "flex",
              gap: 24,
              alignItems: "center",
              padding: 24,
            }}
          >
            <Glyph name={m.glyph} color="#c69a04" size={60} />
            <div>
              <h2 style={{ fontSize: 32, marginBottom: 6 }}>{m.en}</h2>
              <p style={{ fontSize: 24 }}>{m.name}</p>
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
          {["简单聊天机器人", "单轮 LLM 调用", "情感分类器"].map((label, i) => (
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
                不是 Agent
              </div>
            </Card>
          ))}
        </div>
      </>
    );
  if (shot.id === "S3-3")
    return (
      <>
        <Heading eyebrow="ANTHROPIC / THE AGENT LOOP" title="不是猜结果，而是拿到真实反馈" accent={C.red} />
        <div className="art" style={{ top: 335, opacity: mix(1, 0.22, ease(time, 3.5, 1)), filter: `blur(${ease(time, 3.5, 1) * 5}px)` }}>
          <Graph {...agentGraph(time, true)} time={time} />
        </div>
        <div style={{ position: "absolute", top: 445, left: 250, width: 1420, opacity: ease(time, 3.5, 1), fontSize: 59, lineHeight: 1.35, letterSpacing: -1 }}>
          “{"LLMs using tools based on environmental feedback in a loop.".slice(0, Math.floor(Math.max(0, time - 3.5) * 24))}”
        </div>
        <div style={{ position: "absolute", top: 770, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 20 }}>
          <Tag color={C.red}>ground truth</Tag>
          <Tag color={C.green}>checkpoint</Tag>
          <Tag color={C.green}>max iterations</Tag>
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
      <Heading eyebrow="FALSE SIGNALS / LOOK AGAIN" title="这些，都不是判断标准" accent={C.red} />
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
        <div style={{ fontSize: 65, fontWeight: 550, marginTop: 20 }}>谁在运行时决定下一步</div>
      </div>
    </>
  );
}
