# 历史风格依据与参考实现

本文件供需要核对偏好来源、作者原句或已有品牌细节时查阅。新主题创作使用技能入口与分镜方法即可，不必默认回读这些工程。以下依据文字与代码，不以观看完整成片后的评价代替证据；路径相对仓库根目录。

Markdown 分镜原文保留在 `agent-product-landscape-2026/Storyboard.md`；`workflow-vs-agent` 的等价镜头与口播在 `src/data/storyboard.json`，`chatgpt-to-agent` 在 `src/data/story.ts`。JSON 的 `camera` 字段是镜头说明的另一份依据。把偏好用于新创作的方法见 [从材料到分镜](storyboard-writing.md)。

## 三个样本各提供了什么

| 样本 | 值得复用的观察 | 主要依据 |
| --- | --- | --- |
| `chatgpt-to-agent` | 单一问题贯穿；用同一任务比较能力变化；光核、地层、玻璃墙、胶囊、流水线等空间隐喻 | `src/data/story.ts` 的 `SHOTS`；`src/Film.tsx` 的场景编排；`src/scenes/` |
| `workflow-vs-agent` | 问题驱动的比较；镜头指令写清跟随、转向、焦点交接和强弱变化；同一蓝图连续比较；结尾回到任务与成本 | `src/data/storyboard.json` 的 `camera` 与字幕；`src/scenes/Workflow.tsx`；`src/scenes/Engineering.tsx` |
| `agent-product-landscape-2026` | 标题写人的处境和动作；按能力缺口串回顾；逐镜定位信息与意群口播；当前剪辑保留作者原句 | `Storyboard.md` 全文；`production/SHOT_CRAFT.md`；`production/cinematic-script.mjs` |

三个样本的配色可明确描述为 Google 四色主色配白底与淡色派生，同时采用中文主信息、英文辅助、等宽代码以及系列页眉与出处。这是从项目代码与本次用户强调中确定的默认方向；单个镜头、某段配乐或某个参数不代表用户的永久要求。

## 口吻与解释方法

以下引文来自本地稿件，可作为语感参考：

- 回顾片的 `production/editor-source.json` 保存 86 条编辑器原句，`src/data/shots.json` 的 `cues[].editorIndex` 标出它们；另有 23 条补写说明。语气校准优先看原句，补写说明单独看待，不能把两者都称为用户亲自写的句子。
- `agent-product-landscape-2026/Storyboard.md` 的 A02、B02、F06：标题直接写“有了建议，活儿还得自己干”“选个工具，跑一下，再看结果”“做了一半，还得能接着做”。这些标题兼有论点和画面事件，不只是主题分类。
- 同文件的 B04、D06：用“边聊边改代码”“在终端里改文件”“你边做边看”“等它做好再检查”比较实际使用方式，关注人什么时候介入。
- 同文件的 B02、F06：原句先把动作链说完整，再引入机制名称。D02、D08、F04 中的一些验收、核对引用与检查阻塞的完整说明是后续补句，可作内容边界参考，不足以推出“用户每镜都喜欢补一句解释”的偏好。
- `workflow-vs-agent/src/data/storyboard.json`：开头是“大家好，今天想和大家一起聊一聊”，随后问“Agent 就一定更好吗，我们是不是都该换过去？”，再说明先读资料、聊怎么用。
- `chatgpt-to-agent/src/data/story.ts`：用“它能告诉你怎么做，动手的还是你”表达聊天助手的限制；用“模型先发出工具调用请求。程序检查权限，执行调用，再把结果交回给模型”解释机制。
- 同一文件从 N50、QUAST 的建议，走到读 FASTA、跑 QC、判断阈值，再到多个样本的异常排查。可复用的是例子连续，不是必须使用生物信息主题。
- `agent-product-landscape-2026/production/SHOT_CRAFT.md`：用“拿到建议，谁来动手”“调用和反馈连起来”“可运行的环境”承接工具、项目操作与验证交付。
- `agent-product-landscape-2026/Storyboard.md`：片尾按“你想做什么、它能做出什么、哪些地方还得你来检查”选择工具，最后简洁说“谢谢大家”；这些句子也在编辑器原句中。中间“先试一件结果可检查的小事”等补句不应固定成所有结尾的要求。

据此写新稿时：用完整的口语句解释动作和因果，保留主讲人的自然语气。按意群分段，整段口播仍应连贯；同一镜头可以容纳几步连续动作。产品回顾围绕能力与使用方式变化组织，概念比较可以使用贯穿案例，不把两种片型套成同一个固定结构。

## 视觉基线

延续现有系列时可复用以下 token；题材、画幅和用户要求有变化时调整。

| 用途 | 样本常用值或分工 | 回查位置 |
| --- | --- | --- |
| 主色 | 蓝 `#4285F4`、红 `#EA4335`、绿 `#34A853`，黄 `#FBBC04` 或 `#FBBC05` | 三个项目的 `src/data/story.ts` / `src/data/theme.ts` |
| 淡色派生 | 淡蓝 `#E8F0FE`、淡红 `#FCE8E6`、淡黄 `#FEF7E0`、淡绿 `#E6F4EA` | `chatgpt-to-agent/src/data/story.ts`；`agent-product-landscape-2026/src/data/theme.ts` |
| 纸色与正文 | 白、`#FCFCFD` 或 `#F8F9FA`，正文 `#202124`，灰线与浅色面辅助分组 | 同上；`workflow-vs-agent/src/film.css` |
| 中文 | Noto Sans SC | 三个项目的字体配置及 `public/fonts/` |
| 英文与数字标题 | Outfit | 同上 |
| 代码、参数、技术标签 | JetBrains Mono | 同上 |
| 信息框架 | 左上品牌与网站、右上章节、底部编号与来源；部分英雄镜头简化包装 | 两个项目的 `src/components/FilmBranding.tsx`；`workflow-vs-agent/src/Film.tsx` |
| 层次 | 细框、圆角、柔影、轻点阵、轻微颗粒与暗角 | `workflow-vs-agent/src/film.css`；`agent-product-landscape-2026/src/components/FilmRig.tsx` |

`chatgpt-to-agent/src/data/story.ts` 的 `readableColor` 专门把品牌色换成较深的文字色，例如黄色改用 `#8D6600`。这是“图形用亮色，小字另配可读色”的直接依据。

淡色感也来自应用方式：`workflow-vs-agent/src/components/Stage.tsx` 用 `${color}0b` 做标签底、`${color}0e` 做大面积光晕；`agent-product-landscape-2026/src/components/Primitives.tsx` 的普通 Chip 使用 `${color}15` 做底。它们说明重点线条和节点仍可用清晰原色，背景与面积较大的色面保持轻淡。将全画面统一降对比或把四色铺成大块实色，都不能复现这一层次。

“Google 配色”在这里指这组四色及其浅色用法；字体、品牌页眉和组件仍按 PLDZ 项目已有设计处理，不据此声称完整遵循某套 Google 界面规范。

颜色语义以本片为单位：

- `chatgpt-to-agent` 的章节用蓝表示 Chatbot、黄表示工具、红表示 Workflow、绿表示 Agent。
- `workflow-vs-agent` 用蓝色预设路径、灰色候选虚线、红色实际动态路径，以及黄色编排、绿色检查等编码。
- `agent-product-landscape-2026` 的四条路线分别是蓝色编程、绿色日常工作、黄色流程、红色执行支撑。

因此保留四色气质时，应重新检查图例与全片的一致性。

## 动作词汇与使用条件

| 表现方式 | 解释作用 | 参考位置 |
| --- | --- | --- |
| 能力地层、玻璃墙、工具胶囊 | 累积关系、操作边界、请求传递 | `chatgpt-to-agent/src/scenes/Intro.tsx`、`Chatbot.tsx`、`Tools.tsx` |
| 笔的交接、候选线与实际路径 | 谁安排下一步，以及运行中的选择 | `workflow-vs-agent/src/components/Stage.tsx` 的 `Pen`；`src/components/Graph.tsx` |
| 同一蓝图上的连续运镜 | 比较多个结构，同时维持空间记忆 | `workflow-vs-agent/src/scenes/Workflow.tsx` |
| 时间线穿梭、截图翻转展开 | 全景定位后靠近一个具体产品 | `agent-product-landscape-2026/production/SHOT_CRAFT.md`；`src/components/Media.tsx` |
| 任务分裂、环绕、阻塞与确认 | 从一个任务到多个任务，再到状态管理 | 同项目 `production/SHOT_CRAFT.md`；`src/components/CinematicActors.tsx` |
| 轻视差、短促匹配剪辑、局部遮幅 | 引导焦点、连接镜头、突出关键段落 | `workflow-vs-agent/src/components/Stage.tsx`；`agent-product-landscape-2026/src/components/FilmRig.tsx` |

`workflow-vs-agent/src/data/storyboard.json` 的描述还包括：S2-3 在岔路 `WHIP`，S2-4 三格漫画分镜分裂再合拢，S2-6 正反打逐渐加速后定格，S3-4 焦点交给笔并局部慢动作，S4-1 荷兰角与冲击帧，S5-2 跟随输入后急停，S7-3 变红时 `VERTIGO`，S8-4 在嵌套结构中无限缩放再拉回。

因此“清爽、稳定”不足以概括镜头审美。更完整的观察是：排版明亮清楚，图形可以有实体感与空间深度，运动有推进、转折、冲击和停顿。`SHOT_CRAFT.md` 对快速到位后保持的要求主要针对进入镜头与切产品；读图停留和持续空间运动共同构成节奏。

## 内容与证据的边界

- `chatgpt-to-agent/src/components/FilmBranding.tsx` 为匿名帖注明身份未经核实，说明来源身份应随画面说明。
- `workflow-vs-agent/README.md` 说明示例指标、内部评测的适用条件和改绘来源，并保留作者提供的事件范围。
- `agent-product-landscape-2026/production/SOURCES.md` 区分历史与近期界面、模拟运行与实测、既有资料与本次成功读取的资料。
- 同项目的 `production/assets.json`、`production/source-provenance.json` 与 `src/components/Media.tsx` 关联素材、裁切、来源和当前展示。

写新片时重新核实会变化的事实。旧项目中的公告、产品状态、关注数和年份节点只属于原来的叙事语境。

## 不要固化的局部选择

- 三个项目都以 1920×1080、30 fps 为基础，可作本系列起点；片长、章节数、镜头数不是模板指标。
- LV2 关注卡、基因组 QC、某些产品、四轨分类与片尾口号都需要结合本次内容决定。
- 渐显模糊、光球、玻璃质感、电影遮幅不是每镜必用元素。
- 配乐有氛围音乐与钢琴等具体选择，材料不足以确定唯一曲风、音色或固定响度。
- 字符估时、音量系数、转场帧数属于工程配置，详见 [制作与校验](production.md)。
