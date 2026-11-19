# 《ToolCalling 和 Request 是一对一的吗？》科普短片 · Remotion 源工程

**3:00 · 1920×1080 · 60fps · 中文配音 · 简体中文屏幕文字**

影片从我自己的 WebUI lite 开始，经过猜想、和 GPT 对线、给出结论、拿官方文档背书，最后回到自己的 WebUI，用 `generation_id` 解决开头的问题。当前工程保留成片源码、字幕时间轴和生成脚本。

工程已配置 `ToolCallFilm` 旁白音轨。首次运行 `npm run voiceover` 生成配音；成功后自动启用音轨，Studio 预览和导出命令都会带上旁白。生成的音轨位于 `public/audio/voiceover.zh-CN.wav`，独立 MP3 位于 `output/toolcall-vs-request-voiceover.mp3`。40 段旁白逐条对齐原字幕时间，全片仍为 180 秒。

当前工程未包含生成的音频，音轨默认关闭，可以先预览和渲染无配音版本。SRT、配音中间记录和缓存、截帧及成片均按需生成；这些生成文件已加入忽略规则。

修改字幕后运行 `npm run voiceover` 重新生成。脚本从 `~/Downloads/demo.py` 读取 Azure Speech 配置，也可用 `--config` 指定配置文件。服务地址示例统一使用 `https://example.invalid`，密钥环境变量示例使用 `AZURE_SPEECH_KEY`；实际配置保存在仓库外，密钥通过环境变量提供。需要 Python 的 `azure-cognitiveservices-speech` 包和 PATH 中的 FFmpeg。配音输入、文稿和实际时长记录保存在 `production/voiceover/`，Azure 分段缓存位于 `segments-azure/`，时长记录不保存服务地址和密钥。全部生成成功后替换项目音轨。

配置文件在其他位置时运行 `python scripts/make-voiceover.py --config "配置文件路径"`。

Windows PowerShell 若阻止 `npm.ps1`，使用 `npm.cmd run voiceover` 和 `npm.cmd run render`。生成配音需要网络能够访问 `demo.py` 中的 Azure Speech 服务。

## 跑起来

```bash
npm install
npm run check        # 字幕节奏 / 结构检查（不需要依赖，可以先跑）
npm run typecheck    # TypeScript 严格类型检查
npm run dev          # 打开 Remotion Studio，选择 ToolCallFilm
```

导出：

```bash
npm run render:draft   # 960×540 草稿，速度快，先看节奏
npm run render         # 1080p 成片 → output/toolcall-vs-request.mp4
npm run stills         # 按 25 个关键时间点截帧 → output/stills/
node scripts/stills.mjs 37.5 74   # 截指定秒数
npm run srt            # 屏幕文字导出成 production/film.zh-CN.srt
```

纯 HTML/CSS/SVG，不依赖 WebGL 和 three.js，任何能跑 Remotion 的机器都能渲染。字体只用系统字体，不联网下载：Windows 上是微软雅黑和 Consolas，macOS 上是苹方，Linux 上需要安装 `fonts-noto-cjk`。

## 为什么不再像 PPT

| 旧版 | 新版 |
|---|---|
| 9 章，每章套同一个母版（品牌条、章节号、进度条） | 一张大画布、一台摄像机，没有章节页 |
| 章与章之间淡入淡出，每章从头搭场景 | 镜头在画布上平移、推拉、钻进对象内部；离开的区域变暗但保留 |
| 每章各用一套视觉系统 | 全片一套视觉规范，颜色只表达含义 |
| 同一张卡片不会出现在下一章 | 例子里的 3 个 Response 和 5 个 Tool Call 贯穿全片：先展开成 JSON，再重排成数据模型 |
| 底部字幕念结论 | 屏幕文字逐字浮现，关键词按含义着色；能用画面演出来的就不写字 |

**颜色规范**：紫 = Turn · 琥珀 = HTTP Request / x-request-id · 蓝 = Response / Generation · 绿 = Tool Call / call_id · 红 = 我注意到这里 / 错误。

## 结构

镜头路线：**我的 WebUI → 问题 → Agent Loop 轨道 → 钻进 Response 看 JSON → 托管工具 → 官方 Trace → 回到轨道，重排成数据模型 → 踩坑 → 飞回我的 WebUI**。

| 时间 | 段落 | 画面 |
|---|---|---|
| 0:00 | 我的 WebUI | 工具调用一条接一条往上顶，又长又重复 → Codex 原生折叠成一行，画上原文截图里的红框 → 猜想是"一次 Request" → 和 GPT 对线 → 猜想被划掉 |
| 0:22 | 问题 | 全片唯一的标题。`1 : 1` 的连线被扯断，变成一个 Request 对应多个 Tool Call |
| 0:30 | 先给结论 | 原文"分析项目"的例子：轨道上依次出现 3 次 Response、5 个 Tool Call，右上角计数器实时计数 |
| 1:04 | 背书 | 镜头钻进 Response #1，卡片展开成 JSON，"就看这三个变量得了" |
| 1:27 | 别混为一谈 | 左边 Function Tools 四个数都数得清；右边托管工具藏在磨砂玻璃后面，数字只剩问号 |
| 1:44 | 官方 Trace | 按原文配图重绘 Trace，Generation 行和 Tool 行依次点亮并计数；11/10 那组数字单独列出 |
| 2:05 | 自己建模 | 轨道上的同一批对象原地重排成 Turn → Generation → ToolCall，盖上内部 ID，挂上 Provider ID；再剖开一次 HTTP 响应，看 x-request-id 和 response.id 分别在哪一层 |
| 2:26 | 踩坑 | 三条跑道并发执行，按 b → c → a 完成。按下标 ✗，按工具名 ✗，按 call_id ✓ |
| 2:39 | 回到我的 WebUI | 长距离飞回开头，工具记录按 `generation_id` 收成三组，和 Codex 并排：执行数据模型 vs 展示策略 |
| 2:55 | 片尾 | 结论、原文最后一句、参考资料 |

逐镜头设计见 `production/DESIGN.md`。

## 代码地图

```text
src/
  Root.tsx                     # 唯一的合成 ToolCallFilm（10800 帧）
  film/
    Film.tsx                   # 背景 → 画布（6 个区域）→ 屏幕层
    camera.ts                  # 镜头路线（所有 Shot 都在这里，改节奏先看这）
    timeline.ts                # 区域在画布上的位置 + 每个区域的焦点时间窗
    captions.json              # 全部屏幕文字（时间、文本、关键词颜色）
    theme.ts / ease.ts         # 视觉规范 / 缓动与插值
    ui/primitives.tsx          # 卡片、标签、描边动画、滚动数字、图标
    zones/
      HookZone.tsx             # 我的 WebUI + Codex 原生（开头和结尾都在这）
      QuestionZone.tsx         # 标题问题
      TrackZone.tsx            # Agent Loop → JSON → 数据模型 → HTTP 剖面
      trackData.ts             # 轨道几何与时间表
      HostedZone.tsx           # 托管工具的统计口径
      TraceZone.tsx            # 官方 Trace（重绘）
      PitfallZone.tsx          # call_id 关联
    layers/                    # 屏幕层：背景、字幕、HUD、Trace 图例、片尾
scripts/
  validate.mjs                 # 字幕不重叠 / 阅读速度 / 高亮词 / 结构
  make-voiceover.py             # 从字幕生成 Azure Speech 旁白并启用音轨
  make-srt.mjs  stills.mjs
```

## 怎么改

- **改文字**：只改 `src/film/captions.json`，然后跑 `npm run check`，它会检查阅读速度（每秒不超过 6.6 个阅读单位）和时间重叠。
- **改节奏**：镜头在 `camera.ts`，各区域的动画时间在每个 zone 文件顶部的 `T` 对象里。所有动画都是时间 t（秒）的纯函数，在 Studio 里可以任意拖动预览。
- **改帧率**：`theme.ts` 里的 `FPS`。所有时间都按秒写，改帧率不影响节奏。

## 事实说明

- 例子中的 ID（`resp_123`、`call_001`、`req_7Kq1…`）都是示意值，字段名和关系按 OpenAI 官方文档。
- 原文的 JSON 示例只有两项，视频补成了三项（a.ts / b.ts / c.ts），和正文"读取三个文件"保持一致。
- Trace 画面按原文配图（Cookbook 归档示例）重绘。"1 个 Turn、11 个 Generation、10 个 Tool Span"引自 Tracing 文档里的另一条记录，和截图不是同一个 Trace，所以单独放在图例卡片里，没有叠在截图上。
- Codex 原生界面具体怎么折叠，原文刻意没下结论，视频里也只把两边并排放，不画对应线。
