# Workflow vs Agent · Remotion 工程

根据分镜制作的动画工程：1920 × 1080、30 fps、410 秒（12,300 帧）。已实现完整时间轴、动态 SVG 图解、运镜、产品截图、中文字幕、背景音乐、提示音与真人配音入口。已有录音与清单位于 `public/narration/`，影片与录音面板共用同一份剪辑数据。

```powershell
npm install
npm run dev
```

Remotion Studio：<http://localhost:3002>。主合成为 `WorkflowVsAgent`，`Chapters` 下有 11 个独立章节合成。Studio 里可拖动时间轴、逐帧查看；`showSubtitles` 与 `audio` 是合成参数。

也可以启动带镜头目录的审片页：

```powershell
npm run preview
```

访问 <http://127.0.0.1:4175>，点击章节或镜头跳转，空格播放 / 暂停；可开关字幕、配乐与音效、下载当前剪辑的 SRT。播放器随窗口高度缩放，提词、录音和保存操作一屏显示。右侧为录音面板，手机窄屏时在播放器下方。`?clean&frame=3600` 可只显示画面并定位到指定帧。页面使用同一个 Remotion `Film` 组件。

## 真人配音

使用同级 `remotion-voiceover` 0.2.0 的本地打包版本；包位于 `vendor/remotion-voiceover-0.2.0.tgz`，执行 `npm ci` 即可安装。

1. 运行 `npm run preview`，用 Chrome / Edge 打开 <http://127.0.0.1:4175>。
2. 录音面板选择整片或当前镜头。46 镜中，39 个有字幕的镜头可以单独录制；7 个无旁白的章节卡不列入选项。
3. 默认选择“按朗读节奏”，点击“开始录音”并允许麦克风，3 秒倒计时后朗读。提词逐句显示，使用原有字幕或已编辑稿件，自动去掉 Markdown 加粗标记。
4. 一句没读完时保留当前画面和提词；读完点击“读完，下一句”或按空格，最后一句读完后停止。8 秒的字幕可以读到 10 秒，完整 WAV 会保留，字幕和镜头随实际朗读延长。
5. 先“跟画面试听”，满意后“保存并使用”或下载 WAV，再“录下一段”。未保存时只改变试听；放弃会恢复已保存的时间。“按画面时长”保留原来的到点自动停止方式。
6. “编辑稿件与时长”可改正文、每句起点和持续秒数，或增加、删除字幕；也可以先按正常语速估算时间，再实际录音。

录音保存在本工程自己的 `public/narration/`，刷新页面即可恢复；刷新 Remotion Studio 后，全片和 11 个独立章节合成也会加载。重录与移除只更新清单，保留旧 WAV 原件。录音和清单默认不提交 Git。

录制期间影片静音，跳转和播放控制暂停使用；播放配音时背景音乐由 12% 平滑降低至 4.5%，并保留音乐的首尾淡入淡出与续接。“配乐与音效”开关只控制音乐和短音效，人声继续播放。

逐镜重录覆盖对应镜头的整段人声，短录音的剩余区间留白；移除后恢复已有整片录音。延长一段会顺延后续镜头、字幕和已有录音，原动画按新时长映射，旁白保持正常语速。整片录音可延长结尾；需要逐句精确对齐时选择分段录音。

字幕和剪辑时间保存在 `public/narration/manifest.json` 的 `timeline` 字段中。预览、SRT 下载和 `src/voiceover.metadata.ts` 共用这份数据，全片与章节合成通过 `calculateMetadata` 更新时长，因此导出也会使用新剪辑。初始分镜仍保留在 `storyboard.json`；在录音面板编辑不会改写原稿。保存后刷新 Studio 可重新计算时间轴。

## 内容与实现

- 当前详细分镜为 **46 镜**。0:00–0:36 先打招呼，以「Coze 企业版从 10 月 29 日起逐步下线」引出 Workflow 是否过时、Agent 是否更好的疑问，再读 Anthropic《Building effective agents》和 OpenAI《A practical guide to building agents》。0:36–0:44 插入关注小卡，请观众帮助升到 LV2。0:44–1:14 用搭积木的比方解释模型、检索、工具和记忆；1:14–1:24 交代 Anthropic 归纳的五种常见 Workflow 模式，再进入 Prompt chaining。6:04–6:46 回扣开场并聊实际取舍，6:46–6:50 简洁致谢，全片 6:50。
- `src/data/storyboard.json` 和 `public/captions/workflow-vs-agent.srt` 使用当前剪辑，共 107 条字幕，配音提词共享同一份分镜数据。口播用完整句子解释例子、执行中的选择和边界，区分两份资料的用词；总结落到自己的任务、时间、成本与可控范围。Coze 企业版事件范围由主讲人提供，用作开场背景。原稿在场时，修改分镜后运行 `npm run sync:storyboard`；改变场景内容仍需修改相应的 TSX。
- 关注小卡使用 `../public/Chibi-Bilibili-Follow-Level-Up-Animation.gif`。9 帧、1.62 秒的原动画在 8 秒卡片内循环；`public/img/follow-lv2/` 为逐帧图片，按 Remotion 帧号选择，拖动与导出时保持一致。原 GIF 保持原样；需要重新生成时运行 `npm run assets:follow`（Python / Pillow）。
- Workflow 的蓝色路径在执行前可见；Agent 的候选路径为灰色虚线，执行时才生成红线。Orchestrator 的动态子任务使用黄色连线，检查与人工确认使用绿色。
- Workflow 五种模式在同一个 70 秒 `Sequence` 中沿蓝图连续移动；其余镜头按原分镜分段。所有画面动画均由帧号计算，不依赖实际播放速度、定时器或 CSS 自动播放。
- 镜头包含推拉、横移、环绕、俯仰、景深、笔的交接、图层视差及英雄镜头的 2.39:1 遮幅。直线转回环和截图转图解采用形状布局过渡 / 叠化；未引入 GSAP 或付费插件。
- 背景音乐使用本地 `public/audio/sb_reverie.mp3`（Scott Buckley《Reverie》），普通音量为原文件的 12%，有配音时降低至 4.5%，开头 3 秒淡入、结尾 5 秒淡出。原曲约 3:44，在 3:39.67 开始用 4 秒交叉淡化续接，覆盖全片；章节切换不会重播音乐。原来的电子节拍和 drone 不再播放，节点提示音降为 15%。
- 修改背景音量：调整 `src/components/Soundtrack.tsx` 顶部的 `MUSIC_VOLUME`。审片页勾选「配乐与音效」后点击播放即可试听。提示音仍由 `npm run assets:audio` 离线生成，该命令不会覆盖导入的 MP3。音乐署名见 `public/audio/CREDITS.md`。

## 文件

| 路径                       | 内容                                                  |
| -------------------------- | ----------------------------------------------------- |
| `src/Film.tsx`             | 全片、镜头编排、字幕与声音                            |
| `src/Root.tsx`             | 主合成及 11 个章节合成                                |
| `src/scenes/`              | 开场、五种模式、边界、QC、产品、真实系统和结尾        |
| `src/components/Graph.tsx` | SVG 节点、路径、候选线、执行光点                      |
| `src/data/patterns.ts`     | 五种 Workflow 模式与 Agent 循环                       |
| `src/preview.tsx`          | 可拖动、可逐镜定位的审片页                            |
| `public/img/`              | 原附件中的 Dify、n8n 与全景回顾图片                   |
| `public/fonts/`            | 本地 Noto Sans SC、Outfit、JetBrains Mono 及 OFL 授权 |

原附件与原文章保持原样。截图分别来自 `Images_attachments/image 1.png`、`image 5.png`，结尾总览来自 `image 3.png`。其他流程图用 React/SVG 重绘，可逐元素修改。片内保留各原始资料来源角标；事实与数字沿用分镜附录 B 的核实范围，内部评测数据在画面中保留适用条件。Coze 只展示概念关系，不虚构具体产品界面。

## 检查与格式化

```powershell
npm run check
npm run build
npm run test:voiceover
npm run test:timing
npm run format
```

`check` 检查 TypeScript、分镜时间连续性、章节边界、字幕时长与配音配置。当前目录未附原始 `storyboard.md`，此时校验已有 `src/data/storyboard.json`；恢复原稿后还会检查同步，`sync:storyboard` 需要原稿才能执行。`build` 只构建审片网页，不导出视频。格式化使用 `npx prettier . --write`，忽略原始分镜、原文章与二进制素材。

`test:voiceover` 使用模拟麦克风和独立临时目录，检查录音、试听、下载、保存恢复、重录、移除、章节音频偏移与音乐降低音量，不会访问真实麦克风或修改自己的录音。优先使用本机 Chrome / Edge，也可通过 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 指定浏览器；截图与结果保存在 `build/review/`。`check:all` 可运行完整检查。

`test:timing` 验证 8 秒字幕实际录到超过 10 秒、画面等待、完整 WAV 保存、后续顺延、metadata 回写、新增字幕与 SRT 下载，并检查 1280×720、1366×768、1440×900、1920×1080 与 390×844 窗口下的布局。录音仍写入独立临时目录。

动画按 Remotion 的[帧号驱动方式](https://www.remotion.dev/docs/idea)实现，章节使用 [Sequence](https://www.remotion.dev/docs/sequence)，审片页面嵌入 [Remotion Player](https://www.remotion.dev/docs/player)。
