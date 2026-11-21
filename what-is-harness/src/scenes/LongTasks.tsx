import { ArticleImage, ArticleNotes } from "../article";
import { C, Reveal, SeriesTitle, tween, useBeat } from "../design";

export function Evaluation() {
  const { at } = useBeat();
  const roles = at("Planner 拆需求", 5);
  const play = at("用 Playwright", 11);
  return (
    <>
      <Reveal when={0.15} until={play}>
        <ArticleImage name="evaluation" region={[390, 146, 919, 455]} x={0} y={18} w={1140} h={488} />
        <ArticleNotes x={1198} y={136} w={475} items={[
          { title: "Planner → Generator", detail: "拆需求，做实现", when: roles, color: C.blue },
          { title: "Evaluator", detail: "按标准验收", when: roles + 2.6 },
        ]} />
      </Reveal>
      <Reveal when={play}>
        <ArticleImage name="longRun" region={[944, 201, 442, 543]} x={0} y={8} w={887} h={538}
          focus={[
            { region: [970, 411, 386, 60], at: play + 0.45, until: at("再交回给", 19) - 3, color: C.green },
            { region: [970, 509, 386, 62], at: at("再交回给", 19) - 3, until: at("再交回给", 19), color: C.yellow },
            { region: [970, 608, 386, 63], at: at("再交回给", 19), color: C.blue },
          ]} />
        <ArticleNotes x={890} y={123} w={743} items={[
          { title: "用 Playwright 操作应用", detail: "打开实际运行的页面", when: play },
          { title: "记录问题", detail: "保留可以复查的验收结果", when: at("问题记下来", 16) },
          { title: "把反馈交回 Generator", when: at("再交回给", 19), color: C.blue },
        ]} />
      </Reveal>
    </>
  );
}

export function ArchitectureRule() {
  const { at } = useBeat();
  const quote = 3.5;
  return (
    <>
      <Reveal when={0.1}>
        <ArticleImage name="codex" x={0} y={14} w={1089} h={500}
          moveTo={{ at: quote, region: [426, 630, 906, 275] }} />
        <ArticleNotes x={1148} y={89} w={520} items={[
          { title: "人来掌舵，Agent 去执行", detail: "工程师设计工作环境", when: quote },
          { title: "自动检查架构约定", detail: "Lint · 结构测试", when: at("写进 Lint", 11) },
          { title: "检查结果反馈给 Codex", when: at("检查失败", 15), color: C.green },
        ]} />
      </Reveal>
    </>
  );
}

export function Managed() {
  const { at } = useBeat();
  const history = at("需要看之前", 13);
  const split = at("拆开以后", 23);
  return (
    <>
      <Reveal when={0.15} until={history}>
        <ArticleImage name="managed" region={[495, 406, 787, 250]} x={0} y={37} w={1680} h={398}
          focus={[
            { region: [799, 450, 164, 163], at: 0.7, until: at("Session 保留", 8), color: C.blue },
            { region: [518, 450, 165, 163], at: at("Session 保留", 8), until: history - 3, color: C.blue },
            { region: [1079, 450, 165, 163], at: history - 3, until: history, color: C.green },
          ]} />
        <ArticleNotes x={17} y={489} w={1646} horizontal items={[
          { title: "Session", detail: "保留事件日志", when: at("Session 保留", 5) },
          { title: "Harness", detail: "调模型、分派工具", when: 0.5 },
          { title: "Sandbox", detail: "跑代码、改文件", when: history - 3, color: C.green },
        ]} />
      </Reveal>
      <Reveal when={history} until={split}>
        <ArticleImage name="events" region={[406, 395, 899, 279]} x={0} y={32} w={1680} h={417}
          focus={[
            { region: [666, 552, 184, 77], at: history + 0.45, until: history + 2.7, color: C.blue },
            { region: [666, 488, 184, 64], at: history + 2.7, color: C.green },
          ]} />
        <ArticleNotes x={17} y={489} w={1646} horizontal items={[
          { title: "getEvents", detail: "Harness 向 Session 请求记录", when: at("通过 getEvents", 14) },
          { title: "Events", detail: "取回所需日志，交给当前上下文", when: history + 2.7, color: C.green },
        ]} />
      </Reveal>
      <Reveal when={split}>
        <ArticleImage name="sandbox" region={[417, 202, 895, 349]} x={0} y={18} w={1680} h={429} />
        <ArticleNotes x={17} y={489} w={1646} horizontal items={[
          { title: "Sandbox 可以单独重建", when: split, color: C.green },
          { title: "Harness 可以从 Session 恢复", when: split + 3 },
        ]} />
      </Reveal>
    </>
  );
}

export function Outro() {
  const { time, at } = useBeat();
  const close = at("好，这期就聊到这儿", 19.7);
  const fade = 1 - tween(time, 23.45, 0.55);
  return (
    <>
      <Reveal when={0.15} until={close}>
        <ArticleImage name="sandbox" region={[423, 209, 884, 342]} x={0} y={62} w={922} h={410} />
        <ArticleNotes x={978} y={144} w={685} items={[
          { title: "Claude Sonnet 4.5", detail: "留下进度，换一轮上下文接着做", when: at("Sonnet 4.5", 1), color: C.yellow },
          { title: "Claude Opus 4.5", detail: "提前收工的问题没有再出现，省掉重置", when: at("换到 Opus", 10) },
        ]} />
      </Reveal>
      <Reveal when={close}>
        <div style={{ position: "absolute", inset: 0, opacity: fade }}><SeriesTitle>谢谢大家</SeriesTitle></div>
      </Reveal>
    </>
  );
}
