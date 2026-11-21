import { ArticleImage, ArticleNotes } from "../article";
import { C, Reveal, TopicTabs, useBeat } from "../design";

export function Permissions() {
  const { at } = useBeat();
  const policy = at("Harness 判定", 7);
  return (
    <>
      <TopicTabs active="权限" />
      <Reveal when={0.2}>
        <ArticleImage name="loop" region={[393, 369, 643, 135]} x={0} y={102} w={1040} h={385}
          moveTo={{ at: policy, region: [409, 381, 306, 107] }}
          focus={[{ region: [422, 393, 278, 85], at: policy + 0.45, color: C.yellow }]} />
      </Reveal>
      <ArticleNotes x={1090} y={125} w={558} items={[
        { title: "提示词", detail: "把规则告诉模型", when: at("提示词", 2), color: C.blue },
        { title: "权限与审批", detail: "拒绝、等待审批或放行", when: policy, color: C.yellow },
        { title: "沙箱", detail: "限制工具能访问的文件、网络与资源", when: at("沙箱再限制", 14), color: C.green },
      ]} />
    </>
  );
}

export function AgentLoop() {
  const { at } = useBeat();
  const assemble = at("先拼出", 5);
  const run = at("拿到工具", 9);
  const feedback = at("结果一份记进日志", 12);
  const end = at("模型给出最终答复", 19);
  return (
    <>
      <Reveal when={0.1}>
        <ArticleImage name="loop" region={[56, 200, 1330, 457]} y={0} h={465}
          moveTo={{ at: run, region: [76, 334, 1284, 226] }}
          focus={[
            { region: [518, 240, 404, 91], at: assemble, until: assemble + 2, color: C.blue },
            { region: [955, 240, 404, 91], at: assemble + 2, until: run, color: C.blue },
            { region: [417, 388, 604, 92], at: run, until: feedback, color: C.green },
            { region: [434, 491, 574, 45], at: feedback, until: end, color: C.green },
          ]} />
      </Reveal>
      <ArticleNotes x={16} y={492} w={1648} horizontal items={[
        { title: "工具结果", detail: "写进日志，也交回模型", when: feedback, color: C.green },
        { title: "返回最终答复", detail: "结束本次任务", when: end },
        { title: "达到步数上限", detail: "结束循环", when: end + 2.5, color: C.red },
      ]} />
    </>
  );
}

export function Layers() {
  const { at } = useBeat();
  const broad = at("按 LangChain", 15);
  return (
    <>
      <Reveal when={0.1}>
        <ArticleImage name="loop" region={[66, 238, 1307, 322]} x={0} y={64} w={1030} h={382}
          focus={[{ region: [80, 336, 1278, 222], at: 0.65, until: broad }]} />
      </Reveal>
      <ArticleNotes x={1094} y={27} w={572} items={[
        { title: "运行时", detail: "执行循环、状态与终止条件", when: 0.5 },
        { title: "框架 / SDK", detail: "提供搭建 Agent 的接口", when: at("框架或者", 6), color: C.green },
        { title: "产品", detail: "用户打开的应用", when: at("我们打开", 11), color: C.yellow },
        { title: "广义 Harness", detail: "运行时、工具、上下文和权限", when: broad },
      ]} />
    </>
  );
}

export function Handoff() {
  const { at } = useBeat();
  const setup = at("第一次会话", 8);
  const read = at("之后每轮", 14);
  return (
    <>
      <Reveal when={0.15} until={setup}>
        <ArticleImage name="longRunSource" region={[396, 149, 921, 444]} x={10} y={18} w={1659} h={552} />
      </Reveal>
      <Reveal when={setup}>
        <ArticleImage name="longRun" region={[52, 197, 891, 548]} x={0} y={8} w={1080} h={549}
          focus={[
            { region: [63, 207, 427, 528], at: setup + 0.5, until: read, color: C.blue },
            { region: [505, 207, 429, 528], at: read, color: C.green },
          ]} />
        <ArticleNotes x={1125} y={138} w={525} items={[
          { title: "第一次会话", detail: "搭环境，留功能清单和初始提交", when: setup, color: C.blue },
          { title: "后续会话", detail: "从进度文件和 Git 历史接着做", when: read },
        ]} />
      </Reveal>
    </>
  );
}
