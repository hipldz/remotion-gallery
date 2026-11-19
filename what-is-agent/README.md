# Agent 是什么？从两份官方定义说起

8 镜概念短片，1920 × 1080 / 30 fps / 3810 帧（2:07）。Remotion + React + TypeScript。

> 主题：Agent 的关键，不是“用了大模型”，而是模型参与了执行过程中的决策。

画面按 [Storyboard.md](./Storyboard.md) 实现：Anthropic 的架构区分 → OpenAI 的任务定义 → 模型 / 工具 / 指令 → 本片归纳 → 决策、执行、反馈循环 → 约束与退出条件 → 完整定义收束。贯穿全片的问题只有一个：**下一步，是谁决定的？**

## 运行

```bash
cd what-is-agent
pnpm install
pnpm dev
```

也可以直接在仓库根目录使用：

```bash
pnpm --dir what-is-agent dev
```

Studio 默认打开 `http://localhost:3003`。合成名为 `WhatIsAgent`，可以在 Remotion Studio 的 Props 面板关闭字幕：

```json
{ "showSubtitles": false }
```

## 配音与背景音乐

`voiceover/` 接入仓库里的 [`remotion-voiceover`](../remotion-voiceover/) 录音工具，用麦克风逐镜录口播：

```bash
cd what-is-agent
pnpm voiceover
```

打开 `http://127.0.0.1:4179/`。左边是影片，右边是录音面板：选「录入范围」的分镜、按「开始录音」、3 秒倒计时后照提词念。默认按画面时长录，读不完会停在区间末尾；录音写到 [`public/narration/`](./public/narration/README.md)，刷新仍在。

渲染时 `Root.tsx` 的 `calculateMetadata` 会读同一份清单，用保存的时长和音轨；没有录音就按无配音输出。录音后镜头可能变长变短，`Film.tsx` 的 `ScaledScene` 会把每镜的帧序按比例映射回原动画，动作与口播仍对得上。

八段分镜和字幕都从 [`src/timeline.ts`](./src/timeline.ts) 生成，见 [`src/voiceover.config.ts`](./src/voiceover.config.ts)——改台词或调时间只改那一处，提词和字幕会一起变。

背景音乐是纯音乐 `public/audio/calming-ambient-technology.mp3`（约 178 秒，覆盖全片不用循环），由 [`src/Soundtrack.tsx`](./src/Soundtrack.tsx) 铺底：开头 3 秒淡入、结尾 5 秒淡出，没人声时 0.16、口播出现时自动压到 0.055。换曲子只要替换这个文件，或用 `pnpm dev` 的 Props 面板关掉 `audio`。

## 演示（讲播模式）

`presentation/` 把这个影片接入仓库里的演示壳，用于边讲边推进：

```bash
cd what-is-agent
pnpm presentation
```

打开 `http://127.0.0.1:4178/`。鼠标即激光笔（`L` 开关、`Shift+L` 换色），`D` 聚光灯、`B` 黑屏；底栏进度轨可点击跳段，本镜口播写在 `notes` 里随标题显示。

停留点按镜头和讲法切成 13 段（见 [`presentation/cues.ts`](./presentation/cues.ts)），每一段都停在本镜动作落位之后、转场之前——例如 S01 停在两张原文卡完全展开时，S02 停在 Workflow 判定与 Agent 判定两个理解节点上。演示时不显示字幕，口播留在讲者备注里。

## 渲染

用户自行导出时使用：

```bash
# 整片
pnpm render

# 单帧检查
pnpm exec remotion still src/index.ts WhatIsAgent out/frames/check.png --frame=120
```

`pnpm render` 输出 `out/what-is-agent.mp4`。工程未附配音，因此默认是带字幕的静默画面；需要时在最终工程中加入口播或音乐轨后再导出。

## 时间线

| 镜头 | 内容 | 帧区间 | 时长 |
| --- | --- | --- | --- |
| S01 | 直接看两份定义 | `[0, 240)` | 8 秒 |
| S02 | Anthropic：动态决定执行过程 | `[240, 840)` | 20 秒 |
| S03 | OpenAI：代表用户完成任务 | `[840, 1380)` | 18 秒 |
| S04 | 模型、工具、指令 | `[1380, 1830)` | 15 秒 |
| S05 | 提炼共同点，给出定义 | `[1830, 2370)` | 18 秒 |
| S06 | 决策、执行、反馈 | `[2370, 2820)` | 15 秒 |
| S07 | 在约束内运行，适时停止 | `[2820, 3240)` | 14 秒 |
| S08 | 保留完整定义 | `[3240, 3420)` | 6 秒 |

字幕按分镜口播估算，集中定义在 [`src/timeline.ts`](./src/timeline.ts) 的 `CAPTION_INPUT`。录音后可在总长不超过 120 秒的前提下校准时间：

```bash
pnpm captions
```

会重新生成 [`public/captions/what-is-agent.srt`](./public/captions/what-is-agent.srt)。

## 工程结构

```text
what-is-agent/
├─ public/
│  ├─ images/            # 三张附件原图，按 S01–S07 使用
│  ├─ fonts/             # Noto Sans SC / Outfit / JetBrains Mono + OFL 许可
│  └─ captions/          # 生成的 SRT
├─ scripts/
│  └─ export-captions.ts
└─ src/
   ├─ Film.tsx           # 8 个 Sequence + 背景 + 字幕
   ├─ Root.tsx           # WhatIsAgent 合成
   ├─ timeline.ts        # 分镜、颜色、字幕时间
   ├─ theme.ts           # 四色语义与字体
   ├─ components/
   │  ├─ Chrome.tsx      # 片头栏、场景标题、来源签、字幕
   │  ├─ LoopDiagram.tsx # S06–S07 共用的反馈循环图
   │  ├─ Screenshot.tsx  # 官方截图的裁切窗口
   │  ├─ Icons.tsx
   │  └─ Primitives.tsx
   ├─ scenes/
   │  ├─ S01Open.tsx
   │  ├─ S02Anthropic.tsx
   │  ├─ S03OpenAI.tsx
   │  ├─ S04Foundations.tsx
   │  ├─ S05Synthesis.tsx
   │  ├─ S06Loop.tsx
   │  ├─ S07Bounds.tsx
   │  └─ S08Close.tsx
   ├─ fonts.ts
   └─ film.css
```

## 画面约定

- 近白底 `#FAFBFD`，深灰正文 `#202124`。
- 蓝 `#4285F4` 只承担模型、决策；绿 `#34A853` 承担工具、执行结果；黄 `#FBBC04` 承担指令、约束；红 `#EA4335` 只承担暂停、交还控制。
- 官方截图保持原样，只在截图边缘加强调框和角标；中文解释放在截图外的独立区域。
- “原文”“意译”“本片归纳”在画面内明确区分。S05/S08 的完整定义标为“本片归纳”，不署名为任何一家公司的原句。
- S02–S05 延续来源纸张与系统框；S06–S07 共用一张循环图，S08 收束为完整定义与一条简化执行链。

## 素材与许可

- `public/images/anthropic.png`：Anthropic《Building effective agents》页面截图，来自分镜附件。
- `public/images/openai.png`：OpenAI《A practical guide to building agents》页面截图，来自分镜附件。
- `public/images/loop-reference.png`：原稿解释图，来自分镜附件，仅作 S06 两秒承接，不作为官方原文引用。
- 字体：Noto Sans SC、Outfit、JetBrains Mono，均按 SIL Open Font License 使用，许可文本见 `public/fonts/`。
- 引用页面：
  - <https://www.anthropic.com/research/building-effective-agents>
  - <https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/>

本工程不含第三方音乐或音效；正式发布前请按项目整体许可证与素材权利声明处理。
