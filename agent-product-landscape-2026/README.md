# AgentMap2026 · V3

42 镜 / 9 章 / 4:24 / 1920×1080 / 30fps。主合成 `AgentMap2026`，每个章节也可单独预览与录音。

这一版沿着“回答与补全 → 参与操作 → 接受任务与交付 → 研究和办公 → 工作台与持续执行”展开。第一幕从“大家好”和正在聊的 WorkBuddy、Codex 引入，回望 2022 年 ChatGPT 网页版，邀请大家回顾热门代表产品。24 秒开场说完，接 6 秒求关注、帮助升到 LV2 的 GIF，再进入第二幕的三步提纲。每段说明任务、交付物和人的参与。Pi 放回编程段，DeepSeek Harness 按可扩展工作台介绍；Harness 的执行支撑身份在长任务需要保存进度、接续上下文时解释。片尾展示几条并行路线，并用任务、交付物和人的参与收束。

## 预览与真人配音

```powershell
npm run preview
```

浏览器打开 `http://127.0.0.1:4173`。左侧选择镜头，下方切换章节、字幕和音效，右侧是真人录音面板。`/?clean` 提供 1920×1080 的影片画布。

1. 选择一段或“整片”，跟着新的提词录制。共 35 段有旁白的镜头。
2. 倒计时后按高亮提词朗读，每段末尾留白。画面、字幕和提词来自同一时间线。
3. 跟画面试听后“保存并使用”，也可下载 WAV。录音保存在 `public/narration/`，刷新可恢复。

录制期间影片静音，避免配乐进入麦克风。逐镜重录可以覆盖整片录音中的对应镜头，旧 WAV 保留。

Remotion Studio：

```powershell
npm run dev
```

打开 `http://localhost:3000`，全片选 `AgentMap2026`，章节在 `Chapters` 文件夹中。

## 剧本与字幕

`Storyboard.md` 是分镜、旁白、最低时长、入点和末尾留白的来源。`src/data/shots.json` 供播放器、字幕与真人提词共同使用。

```powershell
npm run sync:storyboard
npm run captions
```

字幕导出为 `production/agent-map.srt`、`production/agent-map.vtt`，实际时间线为 `production/timing.json`，逐镜录音表为 `production/narration-cues.md`。字幕仍按标点和文本长度估算，尚未做语音强制对齐。

外部录音可放在 `public/vo/P01.wav` 等逐镜文件中，支持 WAV、MP3、M4A、AAC、OGG。弹性镜头按录音长度和末尾留白延长，后续镜头一起重排；固定镜头超长会提示。浏览器录音使用当前区间长度，放慢口播前请先调整镜头时长。

## 配乐与产品热度

Scott Buckley 的《A Kind Of Hope》位于 `public/audio/music.mp3`。背景音乐统一使用 `0.2` 系数，配音期间保持同一基础音量，片头 2 秒淡入、片尾 3 秒淡出。自制短音效位于 `public/sfx/`，播放器的音效开关只控制短音效。来源、CC BY 4.0 授权及发布署名见 `public/audio/README.md`。

GitHub 角标来自官方仓库当前关注数，日期为 2026-11-12。数据与仓库链接保存在 `production/github-popularity.json`。角标标明统计日期；Codex App 镜头明确标为 Codex CLI 仓库，避免混淆指标对象。当前关注不作为产品发布当年的热度。

## 素材和字体

真实截图与裁切信息见 `production/assets.json`，原始图源、校验值和图片来源见 `production/source-provenance.json`。未使用的原始素材继续保留。DeepSeek Harness 的界面图沿用既有第三方截图，其产品定位依据官方产品页。

求关注动画来自用户提供的 `../public/Chibi-Bilibili-Follow-Level-Up-Animation.gif`。原文件保留，`scripts/prepare-follow-gif.py` 将 9 帧转换成无损图集 `public/img/follow-lv2/frames.webp`，帧时长和原文件校验值记录在 `src/data/follow-gif.json`。预览和渲染均按视频帧选择画面，来回拖动时间线也能正确播放。重新生成需要 Python 的 Pillow。

```powershell
npm run assets:sync
python scripts/setup-fonts.py
```

添加新汉字后重建本地字体子集，需要 Python 的 `fonttools` 与 `brotli`。正常预览使用本地字体和图片。

## 检查

```powershell
npm run check
npm run build:preview
npm run test:voiceover
```

检查涵盖 4:24 时间线、章节连续性、字幕留白、恒定配乐及真人录音流程。录音测试使用模拟麦克风和隔离素材目录，不写入用户自己的录音。浏览器优先使用本机 Chrome 或 Edge，测试结果存放在 `build/review/`。

依赖采用 Remotion 4.0.542、React 19.2.0；本地配音工具包为 `vendor/remotion-voiceover-0.1.0.tgz`。镜头设计和本版调整见 `production/SHOT_CRAFT.md`。
