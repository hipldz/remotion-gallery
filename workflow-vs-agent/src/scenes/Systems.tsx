import { Graph } from "../components/Graph";
import { Glyph, type GlyphName } from "../components/Glyph";
import { Card, Heading, Tag } from "../components/Stage";
import { C, MONO } from "../data/theme";
import type { Shot } from "../data/timeline";
import { clamp, ease, enter, mix } from "../lib/motion";

function Research({ time }: { time: number }) {
  const stats = ease(time, 7.2, 0.75);
  return (
    <>
      <Heading eyebrow="ANTHROPIC RESEARCH / MULTI-AGENT" title="一个 Lead，多路研究，带着引用回来" accent={C.red} />
      <div className="art" style={{ top: 340, opacity: mix(1, 0.08, stats), transform: `translateY(${-stats * 20}px)` }}>
        <Graph
          time={time}
          nodes={[
            { id: "user", x: 80, y: 235, label: "Query", shape: "pill", color: C.ink, width: 130 },
            { id: "lead", x: 430, y: 235, label: "LeadResearcher", sub: "计划 / 判断是否继续", color: C.red, width: 285 },
            ...[0, 1, 2].map((i) => ({ id: `sub${i}`, x: 875, y: 65 + i * 170, label: `Subagent ${i + 1}`, sub: "parallel search", color: C.red, width: 250 })),
            { id: "cite", x: 1380, y: 235, label: "CitationAgent", sub: "[1] [2] [3]", color: C.green, width: 265 },
            { id: "memory", x: 430, y: 455, label: "Memory", color: C.gray, width: 200 },
          ]}
          edges={[
            { from: "user", to: "lead", at: 0.2, color: C.red, dynamic: true },
            {
              from: "lead",
              to: "memory",
              at: 0.7,
              optional: true,
              color: C.gray,
              points: [
                [430, 279],
                [430, 320],
                [430, 380],
                [430, 411],
              ],
            },
            ...[0, 1, 2].map((i) => ({ from: "lead", to: `sub${i}`, at: 1.2 + i * 0.3, duration: 0.9, dynamic: true, color: C.red })),
            ...[0, 1, 2].map((i) => ({
              from: `sub${i}`,
              to: "lead",
              at: 3.2 + i * 0.25,
              duration: 1,
              color: C.red,
              dynamic: true,
              label: i === 1 ? "结果汇回 Lead" : undefined,
            })),
            {
              from: "lead",
              to: "cite",
              at: 5.3,
              duration: 1.3,
              color: C.green,
              dynamic: true,
              label: "研究完成 → 标引用",
              points: [
                [430, 191],
                [700, 120],
                [1250, 120],
                [1380, 191],
              ],
            },
          ]}
        />
      </div>
      <div style={{ position: "absolute", left: 175, top: 345, display: "flex", gap: 30, opacity: stats, transform: `translateY(${(1 - stats) * 40}px)` }}>
        {[
          { value: "+90.2%", label: "内部 research eval", sub: "Opus 4 lead + Sonnet 4 subagents", color: C.red, height: 180 },
          { value: "≈ 4×", label: "单 Agent Token", sub: "对比普通 Chat 交互", color: C.blue, height: 75 },
          { value: "≈ 15×", label: "多 Agent Token", sub: "对比普通 Chat 交互", color: C.red, height: 245 },
        ].map((s, i) => (
          <Card key={s.value} style={{ width: 500, height: 470, padding: 30, position: "relative", overflow: "hidden" }}>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: s.height * ease(time, 7.6 + i * 0.2, 1.5),
                background: `${s.color}0b`,
                borderTop: `2px solid ${s.color}55`,
              }}
            />
            <div className="stat-number" style={{ color: s.color, position: "relative" }}>
              {s.value}
            </div>
            <h2 style={{ fontSize: 30, marginTop: 28 }}>{s.label}</h2>
            <p style={{ fontSize: 21 }}>{s.sub}</p>
            {i === 0 && (
              <p style={{ fontSize: 21, marginTop: 15 }}>
                对比单个 Opus 4<br />
                特定内部评测，不代表普遍提升
              </p>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}

function ResearchInsight({ time }: { time: number }) {
  const amount = ease(time, 0.1, 1.6) * 80;
  return (
    <>
      <Heading eyebrow="WHY MULTI-AGENT WORKS / BROWSECOMP" title="更强的效果，背后有真实的账单" accent={C.red} />
      <div
        style={{
          position: "absolute",
          top: 375,
          left: 200,
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: `conic-gradient(${C.red} ${amount}%, #e9edf2 ${amount}% 100%)`,
          transform: "rotate(-90deg)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 37,
            borderRadius: "50%",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "rotate(90deg)",
          }}
        >
          <span style={{ fontSize: 98, color: C.red, letterSpacing: -4 }}>{Math.round(amount)}%</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 180, top: 760, width: 410, textAlign: "center", color: C.gray, fontSize: 22 }}>Token 用量解释的表现差异</div>
      <div style={{ position: "absolute", left: 700, top: 380, width: 1010 }}>
        <div className="quote-mark">“</div>
        <div style={{ fontSize: 43, lineHeight: 1.4 }}>Multi-agent systems work mainly because they help spend enough tokens to solve the problem.</div>
        <div style={{ marginTop: 35, opacity: ease(time, 2.3, 0.7) }}>
          <Tag color={C.gray}>不适合强依赖共享上下文的任务，例如多数 coding</Tag>
        </div>
      </div>
    </>
  );
}

function ChatGPTSystem({ time }: { time: number }) {
  const modules: { label: string; sub: string; glyph: GlyphName }[] = [
    { label: "Deep research", sub: "多步研究", glyph: "search" },
    { label: "Visual browser", sub: "来自 Operator", glyph: "globe" },
    { label: "Terminal", sub: "代码 / 数据分析", glyph: "terminal" },
    { label: "Connectors", sub: "连接外部应用", glyph: "link" },
  ];
  return (
    <>
      <Heading eyebrow="OPENAI / CHATGPT AGENT" title="能力汇合之后，确认也成为执行的一部分" accent={C.red} />
      <div style={{ position: "absolute", left: 165, top: 355, display: "flex", gap: 24 }}>
        {modules.map((m, i) => (
          <Card key={m.label} time={time} delay={i * 0.4} color={C.red} style={{ width: 380, height: 208 }}>
            <Glyph name={m.glyph} color={C.red} size={57} />
            <h2 style={{ fontSize: 30, margin: "16px 0 8px" }}>{m.label}</h2>
            <p style={{ fontSize: 22 }}>{m.sub}</p>
          </Card>
        ))}
      </div>
      <Card
        time={time}
        delay={3.1}
        color={C.green}
        style={{ position: "absolute", left: 165, top: 600, width: 1020, height: 205, display: "flex", gap: 25, alignItems: "center" }}
      >
        <Glyph name="shield" color={C.green} size={72} />
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 30 }}>购买 / 发送邮件 → 暂停并确认</h2>
          <p style={{ fontSize: 21 }}>金融交易确认率 100% · System Card 评测</p>
          <p style={{ fontSize: 21, marginTop: 6 }}>Watch mode · 敏感网站离开即暂停</p>
        </div>
        <span style={{ borderRadius: 15, background: C.green, color: "white", fontSize: 25, padding: "18px 24px" }}>继续 / 修改</span>
      </Card>
      <Card time={time} delay={6.5} style={{ position: "absolute", left: 1220, top: 600, width: 540, height: 205, padding: 25 }}>
        <div style={{ color: C.gray, fontSize: 19, marginBottom: 14 }}>Prompt injection · 特定测试条件</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 17 }}>
          <span style={{ fontSize: 36, color: C.gray }}>1.5–18.5%</span>
          <span style={{ color: C.green, fontSize: 34 }}>→ ≤2.63%</span>
        </div>
        <div style={{ height: 10, background: "#e8ecef", marginTop: 22, borderRadius: 8 }}>
          <div style={{ width: `${mix(100, 14.2, ease(time, 6.7, 2))}%`, height: "100%", borderRadius: 8, background: C.green }} />
        </div>
        <p style={{ fontSize: 17, marginTop: 10 }}>缓解后的最高值 · Deep research System Card</p>
      </Card>
    </>
  );
}

function ShiftHarness({ time }: { time: number }) {
  const completed = Math.floor(ease(time, 4, 5.5) * 18);
  return (
    <>
      <Heading eyebrow="LONG-RUNNING AGENTS / THE HANDOFF" title="上下文会重置，工作不能从头来" accent={C.red} />
      <div style={{ position: "absolute", left: 170, top: 350, display: "flex", gap: 28 }}>
        <Card time={time} style={{ width: 505, height: 445 }}>
          <Tag color={C.red}>Context Window 01</Tag>
          <h2 style={{ fontSize: 34, marginTop: 25 }}>Initializer agent</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13, marginTop: 30 }}>
            {["init.sh", "claude-progress.txt", "git commit", "feature_list.json"].map((file, i) => (
              <div
                key={file}
                style={{
                  opacity: clamp(enter(time, 0.5 + i * 0.45)),
                  border: "1px solid #e2e6eb",
                  padding: "18px 12px",
                  borderRadius: 13,
                  fontSize: file.length > 16 ? 14 : 18,
                  fontFamily: MONO,
                  overflowWrap: "anywhere",
                }}
              >
                <Glyph name="file" size={34} color={C.blue} />
                <div style={{ marginTop: 9 }}>{file}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card time={time} delay={2.5} style={{ width: 505, height: 445 }}>
          <Tag color={C.red}>Context Window 02 → N</Tag>
          <h2 style={{ fontSize: 34, marginTop: 25 }}>Coding agent</h2>
          {["读 git log 与 progress", "只挑一个 feature", "测试 → commit", "更新 progress，交接"].map((step, i) => (
            <div key={step} style={{ fontSize: 25, display: "flex", gap: 17, marginTop: 23, opacity: clamp(enter(time, 3 + i * 0.35)) }}>
              <span style={{ color: C.red }}>0{i + 1}</span>
              {step}
            </div>
          ))}
        </Card>
        <Card time={time} delay={3.8} style={{ width: 505, height: 445 }}>
          <Tag color={C.green}>Feature list</Tag>
          <h2 style={{ fontSize: 34, marginTop: 25 }}>逐项测试，逐项完成</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(20, 17px)", gap: 4, marginTop: 30 }}>
            {Array.from({ length: 200 }, (_, i) => (
              <i
                key={i}
                style={{
                  width: 17,
                  height: 17,
                  borderRadius: 3,
                  background: i < completed ? C.green : `${C.red}70`,
                  transform: `rotateY(${i === completed ? 160 * (1 - ((time * 3) % 1)) : 0}deg)`,
                }}
              />
            ))}
          </div>
          <div style={{ marginTop: 23, fontFamily: MONO, color: C.gray, fontSize: 20 }}>
            <span style={{ color: C.green }}>{completed}</span> passes: true / 200+ features
          </div>
        </Card>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 835, textAlign: "center", color: C.gray, fontSize: 23 }}>
        会话交接的凭据：文件 + Git + 测试结果
      </div>
    </>
  );
}

function FullHarness({ time }: { time: number }) {
  return (
    <>
      <Heading eyebrow="PLANNER / GENERATOR / EVALUATOR" title="让「完成」有可验证的标准" accent={C.red} />
      <div style={{ position: "absolute", left: 230, top: 350, width: 1460, height: 220 }}>
        <Graph
          width={1460}
          height={220}
          time={time}
          nodes={[
            { id: "plan", x: 150, y: 100, label: "Planner", color: C.red, width: 240 },
            { id: "gen", x: 680, y: 100, label: "Generator", color: C.red, width: 260 },
            { id: "eval", x: 1260, y: 100, label: "Evaluator", sub: "Playwright 测试", color: C.green, width: 260 },
          ]}
          edges={[
            { from: "plan", to: "gen", at: 0.3, color: C.red, dynamic: true },
            { from: "gen", to: "eval", at: 1.3, color: C.red, dynamic: true, label: "sprint contract" },
            {
              from: "eval",
              to: "gen",
              at: 2.6,
              color: C.green,
              label: "feedback",
              points: [
                [1130, 125],
                [1050, 218],
                [850, 218],
                [810, 125],
              ],
            },
          ]}
        />
      </div>
      <div style={{ position: "absolute", top: 615, left: 250, display: "flex", gap: 36 }}>
        {[
          { label: "SOLO", time: "20 min", cost: "$9", good: false },
          { label: "FULL HARNESS", time: "6 h", cost: "$200", good: true },
        ].map((bill, i) => (
          <Card
            key={bill.label}
            time={time}
            delay={2.9 + i * 0.7}
            color={bill.good ? C.green : C.line}
            style={{ width: 690, height: 205, display: "flex", gap: 30, alignItems: "center" }}
          >
            <div style={{ flex: 1 }}>
              <div className="eyebrow" style={{ color: bill.good ? C.green : C.gray, fontSize: 19 }}>
                {bill.label}
              </div>
              <div style={{ marginTop: 19, fontSize: 53, letterSpacing: -1 }}>
                {bill.time}
                <span style={{ color: C.gray, margin: "0 15px" }}>·</span>
                {bill.cost}
              </div>
              <div style={{ fontSize: 20, color: C.gray, marginTop: 13 }}>原文游戏开发案例</div>
            </div>
            <div style={{ width: 160, height: 110, borderRadius: 12, background: "#f3f5f8", padding: 16 }}>
              {[0, 1, 2].map((row) => (
                <div key={row} style={{ display: "flex", gap: 5, marginBottom: 5 }}>
                  {[0, 1, 2, 3].map((col) => (
                    <i
                      key={col}
                      style={{
                        width: 27,
                        height: 14,
                        borderRadius: 3,
                        background: bill.good ? `${C.green}${row === 0 ? "b0" : "50"}` : C.line,
                        transform: !bill.good && (col + row) % 2 ? `translate(${Math.sin(time * 18) * 5}px,3px)` : undefined,
                      }}
                    />
                  ))}
                </div>
              ))}
              <div style={{ textAlign: "center", fontSize: 18, color: bill.good ? C.green : C.gray, marginTop: 6 }}>
                {bill.good ? "✓ 真的能玩" : "✕ 未通过"}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function Managed({ time }: { time: number }) {
  const broken = ease(time, 3.3, 0.35) * (1 - ease(time, 5, 0.8));
  return (
    <>
      <Heading eyebrow="MANAGED AGENTS / BRAIN, HANDS, SESSION" title="大脑、双手与日志，分别保存" accent={C.red} />
      <div className="art" style={{ top: 335 }}>
        <div style={{ height: 350 }}>
          <Graph
            width={1600}
            height={350}
            time={time}
            nodes={[
              { id: "brain", x: 300, y: 165, label: "Claude + harness", sub: "brain / 决策与调度", color: C.red, width: 370, height: 155 },
              {
                id: "hands",
                x: 1280,
                y: 165,
                label: broken > 0.3 ? "Environment lost" : "sandbox / tools",
                sub: broken > 0.3 ? "provision()" : "hands / 执行环境",
                color: broken > 0.3 ? C.gray : C.blue,
                width: 370,
                height: 155,
                muted: broken > 0.3,
              },
            ]}
            edges={[{ from: "brain", to: "hands", at: 0.8, duration: 1.8, color: C.gray, label: "execute(name, input) → string" }]}
          />
        </div>
        <div style={{ position: "absolute", left: 1095, top: 75, width: 370, height: 155, pointerEvents: "none" }}>
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: (i % 4) * 92 + Math.cos(i * 2.4) * broken * 90,
                top: Math.floor(i / 4) * 51 + Math.sin(i * 2.4) * broken * 80,
                width: 90,
                height: 49,
                border: `1px solid ${C.gray}50`,
                borderRadius: 6,
                opacity: broken * 0.8,
                transform: `rotate(${broken * (i - 6) * 6}deg)`,
                background: "#f0f2f4",
              }}
            />
          ))}
        </div>
        <div style={{ position: "absolute", top: 310, left: 100, right: 100 }}>
          <div style={{ color: C.gray, fontSize: 21, fontFamily: MONO, marginBottom: 20 }}>Session · append-only log</div>
          <div
            style={{
              display: "flex",
              borderTop: "1px solid #dce1e6",
              borderBottom: "1px solid #dce1e6",
              background: "white",
              padding: "25px 10px",
              overflow: "hidden",
              gap: 12,
            }}
          >
            {["start", "tool_call", "result", "checkpoint", "env_lost", "provision", "wake", "resume"].map((event, i) => (
              <div
                key={event}
                style={{
                  padding: "17px 12px",
                  borderRadius: 9,
                  background: i > 3 ? `${C.green}0c` : "#f4f6f8",
                  color: i > 3 ? C.green : "#89919a",
                  fontFamily: MONO,
                  fontSize: 19,
                  opacity: clamp(enter(time, i * 0.65)),
                }}
              >
                {event}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 840, textAlign: "center", opacity: ease(time, 5.5, 0.5) }}>
        <Tag color={C.green}>wake(sessionId) · 从最后一条事件继续</Tag>
      </div>
    </>
  );
}

export function Systems({ shot, time }: { shot: Shot; time: number }) {
  switch (shot.id) {
    case "S9-2":
      return <Research time={time} />;
    case "S9-3":
      return <ResearchInsight time={time} />;
    case "S9-4":
      return <ChatGPTSystem time={time} />;
    case "S9-5":
      return <ShiftHarness time={time} />;
    case "S9-6":
      return <FullHarness time={time} />;
    case "S9-7":
      return <Managed time={time} />;
    default:
      throw new Error(`未实现系统镜头 ${shot.id}`);
  }
}
