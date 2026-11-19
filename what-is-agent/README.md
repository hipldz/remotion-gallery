# Agent 是什么？从两份官方定义说起

8 镜概念短片，1920 × 1080 / 30 fps / 3420 帧（1:54）。Remotion + React + TypeScript。

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
