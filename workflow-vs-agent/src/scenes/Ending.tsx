import { Card, Heading, Tag } from "../components/Stage";
import { C } from "../data/theme";
import type { Shot } from "../data/timeline";
import { ease } from "../lib/motion";

export function Ending({ shot, time }: { shot: Shot; time: number }) {
  const cueIndex = shot.subtitles.findIndex((cue) => time + shot.start >= cue.start && time + shot.start < cue.end);
  if (shot.id === "S10-1")
    return (
      <>
        <Heading eyebrow="回到我们自己的选择" title="最后，坐下来总结一下" />
        <Card time={time} delay={0.15} style={{ position: "absolute", left: 160, right: 160, top: 350, height: 440, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 42 }}>
          <div style={{ display: "flex", gap: 20 }}>
            <Tag color={C.blue}>读过原文</Tag>
            <Tag color={C.red}>看过例子</Tag>
          </div>
          <div style={{ fontSize: 63, fontWeight: 550, marginTop: 36 }}>回到我们自己要做的事情</div>
          <p style={{ fontSize: 30, marginTop: 22 }}>面对这两个东西，到底怎么选？</p>
          <div style={{ display: "flex", alignItems: "center", gap: 30, marginTop: 32, opacity: cueIndex >= 2 ? 1 : 0.3 }}>
            <span style={{ fontSize: 28, color: "#6c737c" }}>Coze 企业版的调整</span>
            <span style={{ fontSize: 45, color: C.red }}>≠</span>
            <span style={{ fontSize: 28, color: C.blue }}>Workflow 已经过时</span>
          </div>
        </Card>
      </>
    );
  if (shot.id === "S10-2") {
    const choices = [
      { title: "Workflow", condition: "步骤清楚 · 要求稳定", detail: "先把能重复执行的流程做扎实", color: C.blue },
      { title: "Agent", condition: "路径难提前定好", detail: "需要模型边做边判断", color: C.red },
      { title: "Hybrid", condition: "大部分固定 · 少数灵活", detail: "稳定主干，局部交给 Agent", color: C.green },
    ];
    return (
      <>
        <Heading eyebrow="我的选择：先看任务，再看代价" title="让模型管多少事，得看任务" accent={C.green} />
        <div style={{ position: "absolute", left: 160, right: 160, top: 350, display: "flex", gap: 26 }}>
          {choices.map((choice, i) => {
            const active = cueIndex === i + 1;
            return (
              <Card key={choice.title} time={time} delay={0.1 + i * 0.13} color={active ? choice.color : undefined} style={{ flex: 1, height: 285, padding: 32, background: active ? `${choice.color}06` : "#fffffff5", boxShadow: active ? `0 12px 40px ${choice.color}12` : "0 16px 40px #26344907" }}>
                <h2 style={{ fontSize: 54, color: choice.color, marginBottom: 24 }}>{choice.title}</h2>
                <div style={{ fontSize: 28, color: C.ink }}>{choice.condition}</div>
                <p style={{ fontSize: 25, marginTop: 24 }}>{choice.detail}</p>
              </Card>
            );
          })}
        </div>
        <Card time={time} delay={0.45} color={cueIndex >= 4 ? C.green : undefined} style={{ position: "absolute", left: 160, right: 160, top: 680, height: 175, padding: "26px 34px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 36 }}>
          <div>
            <h2 style={{ fontSize: 34, marginBottom: 18 }}>{cueIndex >= 5 ? "适合任务，才是更好的方案" : "多花的代价，换来了什么？"}</h2>
            <p style={{ fontSize: 25 }}>效果 · 耗时 · 成本 · 执行边界，都要一起看</p>
          </div>
          <Tag color={C.green} style={{ fontSize: 26, whiteSpace: "nowrap" }}>Agent ≠ 默认更好</Tag>
        </Card>
      </>
    );
  }
  const opacity = Math.min(ease(time, 0, 0.25), 1 - ease(time, shot.end - shot.start - 0.35, 0.35));
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity }}>
      <div style={{ fontSize: 42, color: "#6c737c", letterSpacing: 4 }}>这期就聊到这儿</div>
      <div style={{ fontSize: 112, fontWeight: 550, letterSpacing: 6, marginTop: 24 }}>谢谢大家</div>
      <div style={{ display: "flex", gap: 16, marginTop: 48 }}>
        {[C.blue, C.red, C.yellow, C.green].map((color) => (
          <i key={color} style={{ width: 16, height: 16, borderRadius: "50%", background: color }} />
        ))}
      </div>
    </div>
  );
}
