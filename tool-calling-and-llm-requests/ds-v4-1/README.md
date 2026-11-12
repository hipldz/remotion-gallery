# 《Tool Calling 和 Request 是一对一的吗？》· 3 分钟无配音科普片

Remotion + TypeScript + 纯 HTML/CSS/SVG。**没有配音、没有音乐、没有音效**：叙事靠画面和屏幕文字。

- 1920×1080 · 60fps · 180 秒（10,800 帧）
- 一张连续画布、一台虚拟摄像机，九段镜头，没有章节页
- 例子贯穿全片：一次 Turn、3 次 Response、5 个 Tool Call

## 跑起来

```bash
npm install
npm run validate     # 字幕节奏 / 结构检查，不需要浏览器
npm run typecheck    # 严格类型检查
npm run dev          # Remotion Studio，选 ToolCallFilm
```

出片：

```bash
npm run stills       # 38 张关键帧 → output/stills/，先看画面
npm run render:draft # 960×540 草稿，先看节奏
npm run render       # 1080p 成片 → output/toolcall-film.mp4
npm run srt          # 屏幕文字导出 → production/film.zh-CN.srt
```

`render` 走 `scripts/render.mjs`：它把 TEMP/TMP 指到工程内的 `.tmp/` 再调用 Remotion。有些 Windows
机器上 ffmpeg 写系统 Temp 会报 `Permission denied`，这个包装器就是为了避开它。想直接用
Remotion CLI 也可以：`npx remotion render src/index.ts ToolCallFilm out.mp4`。

字体只用系统字体（Windows：Segoe UI / 微软雅黑 / Consolas；macOS：苹方），不联网下载。

## 状态

这个工程不是"只写了代码"：

- `npm run typecheck` 通过（strict，无 `any`）。
- `npm run validate` 通过：41 条屏幕文字不重叠，平均 5.2 阅读单位/秒。
- `npm run stills` 出过 38 张 1080p 关键帧，逐张看过并改过构图：命令流滚动方向、Codex 展开、
  JSON 标题重复、区域重叠、虚线的 ghost 线、片尾可读性。
- 用 `scripts/render.mjs` 渲染过 12 秒预览（`output/preview.mp4`，960×540），确认视频管线可跑。
- 完整 3 分钟成片还没在这台机器上渲过；`npm run render` 是给正式出片用的。

## 结构

```text
src/
  index.ts                 # registerRoot
  Root.tsx                 # 唯一合成 ToolCallFilm
  film/
    Film.tsx               # 背景 → 画布（6 个区域）→ 屏幕层
    camera.ts              # 全部镜头（21 个关键点，改节奏先看这里）
    zones.ts               # 6 个区域的位置 + 各自的焦点时间窗
    captions.json          # 41 条屏幕文字（时间、文本、关键词颜色）
    data.ts                # 那个例子的唯一数据源
    theme.ts / motion.ts   # 视觉规范 / 缓动与纯函数
    ui.tsx                 # 卡片、标签、图标、滚动数字、描边路径
    zones/                 # Hook / Question / Track / Hosted / Trace / Pitfall
    layers/                # Backdrop / Captions / Hud / EndCard
scripts/
  validate.mjs             # 字幕不重叠、阅读速度、结构
  stills.mjs               # 批量截帧（支持 --times=32.4,77.6）
  make-srt.mjs             # 导出 SRT
  render.mjs               # 渲染包装器（项目内临时目录）
MD-SOURCE/                 # 原文（视频的依据）
production/
  DESIGN.md                # 逐镜头设计
  film.zh-CN.srt           # 生成的屏幕文字稿
```

## 为什么不像 PPT

| 常见做法 | 这里的做法 |
|---|---|
| 每章一个母版、标题栏、进度条 | 没有章节页；换段就是镜头平移 / 推拉 |
| 章与章淡入淡出、每章重搭场景 | 一张 9,600×3,000 的画布，离开的区域压暗但保留 |
| 每章一套视觉系统 | 一套规范：紫 Turn、琥珀 Request、蓝 Response、绿 Tool Call、红注意 |
| 每章换新例子 | 同一批对象：S3 演 Loop → S4 展成 JSON → S7 重排成数据模型 → S8 跑并发 |
| 底部字幕念结论 | 屏幕文字逐字浮现；能演出来的就不写字（计数器、进度、连线、路径） |

## 视觉规则

- **颜色只表达含义**：紫 = Turn / 任务；琥珀 = HTTP / Request / `x-request-id`；蓝 = Response / Generation；绿 = Tool Call / `call_id`；红 = 注意 / 错误 / ≠。
- **动效按含义区分**：模型产出从卡里弹出（回弹）；应用执行沿跑道滑动；结果沿弧线回传；镜头长距离飞行先拉远再推近（`dip`）。
- **所有动画是 `t` 的纯函数**：没有 `useState`、没有 `setTimeout`，Studio 里任意跳帧都一致。

## 事实说明

- 例子里的 ID（`resp_123`、`call_001`、`req_7Kq1…`）都是示意值；字段名与关系依据 OpenAI Responses API / Function Calling 文档。
- 原文 JSON 示例只有两个 `function_call`，正文说"读取三个文件"；片子里统一成三个（a.ts / b.ts / c.ts）。
- Trace 画面按 Cookbook 截图重绘，行名和关系照截图；**"11 个 Generation / 10 个 Tool Span" 来自 Tracing 文档里的另一条记录**，不是同一张截图，所以单独放在一张卡里，没有叠在截图上。
- Codex 原生界面具体怎么折叠，原文刻意没下结论；片子里只把两边并排，不画对应线。

## 怎么改

- 改文字：只改 `src/film/captions.json`，然后 `npm run validate`。
- 改节奏：镜头在 `src/film/camera.ts`；每个区域内部的动画时间在各 zone 文件顶部。
- 改例子：`src/film/data.ts` 是唯一数据源，轨道、JSON、数据模型、并发四段会一起变。
- 改帧率：`src/film/const.ts` 的 `FPS`。所有时间按秒写，改帧率不影响节奏。

逐镜头设计见 [production/DESIGN.md](production/DESIGN.md)。
