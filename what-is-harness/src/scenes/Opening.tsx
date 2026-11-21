import { ArticleImage, ArticleNotes } from "../article";
import { C, Label, Reveal, SeriesTitle, TopicTabs, tween, useBeat } from "../design";

export function Benchmark() {
  const { time, at } = useBeat();
  const chartStart = 2;
  const model = at("同一个模型", 7);
  const baseline = at("52.8%", 13);
  const improved = baseline + 1.8;
  const delta = Math.max(improved + 1.2, at("13.7 个百分点", 18));
  return (
    <>
      <Reveal when={0} until={chartStart}>
        <SeriesTitle subtitle="从 LangChain 的跑分实验说起"><span style={{ color: C.blue }}>Agent Harness</span> 是什么？</SeriesTitle>
      </Reveal>
      <Reveal when={chartStart}>
        <div className="mono" style={{ color: C.muted, letterSpacing: 2, fontSize: 20 }}>
          LANGCHAIN / TERMINAL BENCH 2.0
        </div>
        <Reveal when={model}><Label x={0} y={55} color={C.blueInk}>同用 GPT-5.2-Codex</Label></Reveal>
        <Reveal when={delta}>
          <div style={{ position: "absolute", right: 12, top: -15, fontSize: 36, color: C.greenInk, fontWeight: 600,
            borderBottom: `3px solid ${C.green}70`, padding: "0 5px 8px", lineHeight: 1 }}>
            <strong style={{ fontSize: 86 }}>+13.7</strong> 个百分点
          </div>
        </Reveal>
        <div className="paper-surface" style={{ position: "absolute", top: 135, width: "100%", height: 440,
          borderRadius: 22 }}>
          {[0, 25, 50, 75, 100].map((value) => (
            <div key={value} style={{ position: "absolute", left: 390 + value * 11.5, top: 38,
              width: 2, background: C.line, height: 320 }}>
              <span style={{ position: "absolute", top: 333, left: 1, transform: "translateX(-50%)",
                color: C.muted, fontSize: 28 }}>{value}%</span>
            </div>
          ))}
          {[
            { name: "原版 Harness", score: 52.8, when: baseline, fill: "#C9DBF9", color: C.ink },
            { name: "改进版 Harness", score: 66.5, when: improved, fill: C.blue, color: C.blueInk },
          ].map(({ name, score, when, fill, color }, index) => {
            const length = score * 11.5 * tween(time, when, 1.24);
            const y = 86 + index * 145;
            return (
              <div key={name}>
                <Label x={48} y={y + 8} size={38} color={color}>{name}</Label>
                <div style={{ position: "absolute", left: 390, top: y, width: length, height: 67,
                  background: fill, borderRadius: "0 8px 8px 0",
                  boxShadow: index === 1 ? `0 10px 24px ${C.blue}21` : undefined }} />
                <Reveal when={when + 0.45}><Label x={410 + length} y={y + 0} size={51} color={color}>{score}%</Label></Reveal>
              </div>
            );
          })}
        </div>
      </Reveal>
    </>
  );
}

export function Definition() {
  const { at } = useBeat();
  const zoom = at("看 LangChain", 9);
  return (
    <>
      <Reveal when={0.1}>
        <ArticleImage name="definition" x={0} y={18} w={1150} h={552}
          moveTo={{ at: zoom, region: [413, 474, 986, 327] }} />
      </Reveal>
      <ArticleNotes x={1210} y={145} w={464} items={[
        { title: "退出前验证", detail: "按任务要求再验一遍", when: 0.7, color: C.yellow },
        { title: "模型之外的部分", detail: "程序、配置和运行规则", when: zoom + 1.2 },
      ]} />
    </>
  );
}

export function Context() {
  const { at } = useBeat();
  const directory = at("它指向", 10);
  return (
    <>
      <TopicTabs active="上下文" />
      <Reveal when={0.2}>
        <ArticleImage name="context" region={[298, 120, 1108, 383]} y={92} h={353}
          moveTo={{ at: at("OpenAI 这张图", 2.5), region: [413, 309, 926, 189] }} />
      </Reveal>
      <ArticleNotes x={15} y={489} w={1645} horizontal items={[
        { title: "AGENTS.md", detail: "约一百行", when: at("百来行", 5) },
        { title: "仓库的目录", detail: "指向架构文档和执行计划", when: directory },
        { title: "按需读取", detail: "读到的内容进入上下文", when: at("要用哪部分", 15) },
      ]} />
    </>
  );
}

export function ToolCall() {
  const { at } = useBeat();
  const execution = at("在执行环境", 10);
  return (
    <>
      <TopicTabs active="工具" />
      <Reveal when={0.2}>
        <ArticleImage name="loop" region={[77, 331, 1289, 224]} y={92} h={330}
          moveTo={{ at: execution, region: [704, 371, 653, 129] }}
          focus={[
            { region: [99, 400, 288, 69], at: at("给出工具名", 5), until: execution, color: C.blue },
            { region: [736, 390, 286, 91], at: execution + 0.6, until: execution + 4, color: C.green },
            { region: [1054, 390, 284, 91], at: execution + 4.1, color: C.green },
          ]} />
      </Reveal>
      <ArticleNotes x={16} y={482} w={1647} horizontal items={[
        { title: "模型", detail: "给出工具名与参数", when: at("给出工具名", 5), color: C.blue },
        { title: "Harness", detail: "调度工具，回传结果", when: execution, color: C.green },
        { title: "MCP", detail: "外部工具和数据的接入协议", when: at("MCP 管", 15), color: C.green },
      ]} />
    </>
  );
}
