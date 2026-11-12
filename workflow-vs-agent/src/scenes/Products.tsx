import { Img, staticFile } from "remotion";
import { Graph } from "../components/Graph";
import { Card, Heading, Tag } from "../components/Stage";
import { C, MONO } from "../data/theme";
import type { Shot } from "../data/timeline";
import { ease, mix, range } from "../lib/motion";

function Browser({ file, title, time, dify = false }: { file: string; title: string; time: number; dify?: boolean }) {
  return (
    <div
      className="browser-frame"
      style={{
        left: dify ? 160 : 220,
        top: 335,
        width: dify ? 750 : 1480,
        height: 495,
        transform: `scale(${mix(1, 1.035, ease(time, 0, 3))})`,
        opacity: 1 - ease(time, dify ? 3 : 2.3, 0.7),
        zIndex: 3,
      }}
    >
      <div className="browser-bar">
        <i />
        <i />
        <i />
        <span>{title}</span>
      </div>
      <div style={{ position: "relative", overflow: "hidden", height: 447 }}>
        <Img src={staticFile(file)} style={{ display: "block", width: "100%" }} />
        <div
          style={{
            position: "absolute",
            border: `4px solid ${C.green}`,
            borderRadius: dify ? 35 : 10,
            left: dify ? 221 : 450,
            top: dify ? 142 : 205,
            width: dify ? 140 : 270,
            height: dify ? 40 : 66,
            opacity: ease(time, 0.6, 0.4),
            boxShadow: `0 0 0 8px ${C.green}14`,
          }}
        />
      </div>
    </div>
  );
}

export function Products({ shot, time }: { shot: Shot; time: number }) {
  if (shot.id === "S8-4") {
    const zoom = range(time, [0, 1.3, 3.6, 5.3, 7.8], [1, 1, 2.65, 2.65, 1]);
    return (
      <>
        <Heading eyebrow="B / WORKFLOW AS A TOOL" title="反过来，流程也能成为工具" accent={C.red} />
        <div
          style={{
            position: "absolute",
            left: 300,
            top: 350,
            width: 1320,
            height: 455,
            transform: `scale(${zoom})`,
            transformOrigin: "54% 45%",
            border: `2px solid ${C.red}65`,
            borderRadius: 35,
            background: "#fff",
            overflow: "hidden",
            boxShadow: `0 20px 60px ${C.red}08`,
          }}
        >
          <div style={{ padding: "26px 35px", color: C.red, fontSize: 30 }}>
            Agent <span style={{ fontSize: 22, marginLeft: 25, color: C.gray }}>search · files · workflow</span>
          </div>
          <div
            style={{
              position: "absolute",
              left: 150,
              top: 115,
              width: 1020,
              height: 255,
              border: `1.5px solid ${C.blue}55`,
              borderRadius: 24,
              padding: 22,
              background: `${C.blue}04`,
            }}
          >
            <div style={{ fontSize: 23, color: C.blue }}>Workflow tool</div>
            <div style={{ height: 165 }}>
              <Graph
                width={1000}
                height={165}
                time={time}
                nodes={[
                  { id: "in", x: 90, y: 85, label: "输入", color: C.blue, width: 120 },
                  { id: "wf", x: 340, y: 85, label: "固定步骤", color: C.blue, width: 190 },
                  { id: "agent", x: 650, y: 85, label: "Agent", color: C.red, width: 195 },
                  { id: "out", x: 920, y: 85, label: "输出", color: C.blue, width: 120 },
                ]}
                edges={[
                  { from: "in", to: "wf", at: 0.4 },
                  { from: "wf", to: "agent", at: 1.3 },
                  { from: "agent", to: "out", at: 2.5 },
                ]}
              />
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", top: 828, left: 0, right: 0, textAlign: "center", opacity: 1 - ease(time, 1.5, 0.4) + ease(time, 6.6, 0.7) }}>
          <Tag color={C.blue}>Coze · Workflow 作为 Agent 工具</Tag>
          <span style={{ margin: 12 }} />
          <Tag color={C.blue}>n8n · Call n8n Workflow</Tag>
        </div>
      </>
    );
  }
  if (shot.id === "S8-3")
    return (
      <>
        <Heading eyebrow="A / N8N CLUSTER NODE" title="一个根节点，接上模型与工具" accent={C.red} />
        <Browser file="img/n8n.png" title="docs.n8n.io / AI Agent node" time={time} />
        <div className="art" style={{ top: 340, opacity: ease(time, 2.3, 0.7) }}>
          <Graph
            time={Math.max(0, time - 2.2)}
            nodes={[
              { id: "agent", x: 800, y: 95, label: "AI Agent", sub: "Tools Agent", color: C.red, width: 270, height: 108 },
              { id: "model", x: 220, y: 350, label: "Chat Model", color: C.yellow, width: 250 },
              { id: "memory", x: 610, y: 350, label: "Memory", color: C.ink, width: 230 },
              { id: "tool", x: 1000, y: 350, label: "Tool ≥ 1", color: C.red, width: 240 },
              { id: "parser", x: 1390, y: 350, label: "Output Parser", color: C.gray, width: 260 },
            ]}
            edges={["model", "memory", "tool", "parser"].map((to, i) => ({
              from: "agent",
              to,
              at: 0.3 + i * 0.45,
              color: to === "tool" ? C.red : C.gray,
              optional: to === "parser",
              points: [
                [800, 149],
                [800, 215],
                [220 + i * 390, 240],
                [220 + i * 390, 306],
              ],
            }))}
          />
        </div>
        <div style={{ position: "absolute", left: 170, top: 795, display: "flex", gap: 16, opacity: ease(time, 4.8, 0.7) }}>
          <Tag color={C.green}>Human review · 敏感工具前审核</Tag>
          <Tag color={C.gray}>Max Iterations: 10</Tag>
          <Tag color={C.gray}>v1.82.0 起统一为 Tools Agent</Tag>
        </div>
      </>
    );
  const match = ease(time, 3, 0.7);
  const react = ease(time, 4.6, 0.5);
  return (
    <>
      <Heading eyebrow="A / DIFY AGENT NODE" title="固定流程里，也能放进一个 Agent" accent={C.red} />
      <Browser file="img/dify.png" title="Dify / Workflow Studio" time={time} dify />
      <div style={{ position: "absolute", left: 160, top: 365, width: 750, height: 445, opacity: match }}>
        <Graph
          width={750}
          height={445}
          time={Math.max(0, time - 3)}
          nodes={[
            { id: "input", x: 120, y: 100, label: "输入", color: C.blue, width: 165 },
            { id: "agent", x: 400, y: 100, label: "Agent", color: C.red, width: 225 },
            { id: "reply", x: 605, y: 295, label: "Send reply", color: C.blue, width: 225 },
            { id: "escalate", x: 195, y: 295, label: "Escalate", color: C.green, width: 225 },
          ]}
          edges={[
            { from: "input", to: "agent", at: 0.2 },
            { from: "agent", to: "reply", at: 1.6, dynamic: true, color: C.red, label: "Output Routes" },
            { from: "agent", to: "escalate", at: 999, dynamic: true, color: C.red },
          ]}
        />
      </div>
      <Card time={time} delay={0.8} color={C.red} style={{ position: "absolute", left: 970, top: 335, width: 785, height: 475, padding: "27px 35px" }}>
        <div style={{ color: C.gray, fontSize: 18, letterSpacing: 2, marginBottom: 25 }}>AGENTIC STRATEGY</div>
        <div style={{ display: "flex", background: "#f0f2f5", borderRadius: 14, padding: 5 }}>
          <div style={{ flex: 1, textAlign: "center", fontSize: 26, padding: 16, borderRadius: 11, background: react < 0.5 ? "white" : undefined }}>
            Function Calling
          </div>
          <div
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 26,
              padding: 16,
              borderRadius: 11,
              color: react > 0.5 ? C.red : C.gray,
              background: react > 0.5 ? "white" : undefined,
            }}
          >
            ReAct
          </div>
        </div>
        <div style={{ fontSize: 28, margin: "25px 0", textAlign: "center", color: C.red, opacity: react }}>Thought → Action → Observation ↻</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 24 }}>
          <span>Max Iterations</span>
          <b style={{ fontFamily: MONO, fontSize: 31, color: C.red }}>{Math.round(mix(4, 12, ease(time, 6, 1)))}</b>
        </div>
        <div style={{ height: 7, margin: "20px 0 23px", borderRadius: 8, background: "#eceff2" }}>
          <div style={{ width: `${mix(25, 75, ease(time, 6, 1))}%`, height: 7, background: C.red, borderRadius: 8, position: "relative" }}>
            <i style={{ position: "absolute", right: 0, top: -7, width: 21, height: 21, borderRadius: "50%", background: C.red }} />
          </div>
        </div>
        <div style={{ fontSize: 22, color: C.gray }}>简单任务 3–5 次 / 复杂调研 10–15 次</div>
        <div style={{ fontSize: 18, color: C.gray, marginTop: 14 }}>文档建议值 · 依任务设置执行边界</div>
      </Card>
      <div className="white-note" style={{ position: "absolute", top: 835, left: 970, width: 785, opacity: ease(time, 7.5, 0.6) }}>
        只判断数值阈值？使用 IF/ELSE
      </div>
    </>
  );
}
