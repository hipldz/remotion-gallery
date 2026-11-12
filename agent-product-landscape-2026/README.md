# AgentMap2026 · V2

依据工程内的 [Storyboard.md](./Storyboard.md)、产品截图和素材来源记录整理的 Remotion 工程。**39 镜 / 8 章 / 4:00.0 / 1920×1080 / 30fps**。主合成 `AgentMap2026`，另有 8 个独立章节合成。没有渲染视频。

V2 重写了摄影机、地图投影、截图设备框、运动图形、逐章场景与片尾楼层系统。素材表保留 22 张既有截图，并新增 Deep Research、ChatGPT Agent 与 Pi 的 3 张来源图片。结尾在产品回顾后直接致谢并淡出。

开头直接从 2026 年大家常聊的 Codex、WorkBuddy 引入，再提问是否还记得 2022 年 ChatGPT 网页版以来的 AI 产品，邀请观众回看发展路线。开场为 20.5 秒，随后说明四条产品路线、进入年份时间线。开头与正文统一使用浅色地图、Google 四色轨道和黑色大标题。倒带结束后地图淡出、片名入场。产品介绍以大字号产品名作为主标题，常规截图上方的产品名为 44px。研究产品与 Pi 使用 76px 侧边标题、31px 说明和独立图片。

全片沿用 `workflow-vs-agent` 的固定品牌栏：左上为四色标记、`PLDZ / AGENT ARCHITECTURE | HIPLDZ.COM`，右上为当前章节；左下为章节编号与 `AGENT PRODUCT ATLAS`，右下为当前图源或 `PLDZ · 原创图解`。品牌栏固定在画框上，字幕距底部 96px，片尾一起淡出。

## 预览

当前机器已安装依赖。

```powershell
npm run dev
```

Remotion Studio：`http://localhost:3000`。全片选 `AgentMap2026`，章节在 `Chapters` 文件夹中。

```powershell
npm run preview
```

逐镜审片与真人配音：`http://127.0.0.1:4173`。左侧切换镜头，下方切换章节、字幕和音效，右侧为录音面板（窄屏时位于播放器下方）。`/?clean` 是 1920×1080 无界面画布，方便检查构图。

新机器需要 Node.js 22，先运行 `npm ci`。Remotion 依赖统一锁定为 4.0.542，React 19.2.0。所有字体、截图和基础音效均在本地。

## 这次重构

- 一条全局摄影机使用单调 Hermite 插值，甩移保持连续速度，停住时自然归零。
- 四条轨道、产品图钉、截图进场锚点、片尾折叠共享投影，截图成为地图中的前景对象。
- 真实界面以透视抬升、景深变清、缓慢推近和局部标注展示；低分辨率素材保留放大限制。
- 对话框受力、破框纸片、Agent 抛物线跳跃、问号到靶心的贝塞尔形变均按帧计算。
- 十 Agent 使用分裂父节点、深度排序、加速轨道、任务状态和高潮定格；镜头逐帧运动，Agent 的指定动作使用一拍二。
- 地图轨道变形成八层产品形态图，Pi Agent 与 Pi SDK 一并接入回顾，随后直接致谢。
- D01 保留一次两帧冲击。胶片颗粒、景深、边缘反光和甩移动作线服务于镜头，不使用常驻产品界面装饰条。

逐镜设计说明见 [production/SHOT_CRAFT.md](./production/SHOT_CRAFT.md)。

## 素材映射

展示图片位于 `public/shots/`。三张重新收集的来源图保存在 `production/collected-*.png`；它们使用无损 PNG 压缩，尺寸、像素和颜色元数据均保持不变，来源校验值已同步更新。

这份 source 的图片编号与分镜第 7 节的旧编号不同。例如：早期 ChatGPT 是 `image 14.png`，QoderWork 是 `image 8.png`，Copilot 是 `image 23.png`。已按文章图注和画面内容重新核对，实际映射见 [assets.json](./production/assets.json)，原图 SHA-256、裁切坐标和图源链接见 [source-provenance.json](./production/source-provenance.json)。

重新同步截图：

```powershell
npm run assets:sync
```

此命令重新应用已核对的映射，再通过主机 Python / Pillow 裁切到 `public/shots/`。不修改原始资源。也可以用 `npm run assets:import -- "D:\你的原图目录"` 指定同一组原始文件。

`image 7.png` 实际是 WorkBuddy 首页，不能当 CodeBuddy 使用；对应镜头保留文字。3D 封面和两张旧配色路线图仅作理解参考。Codex 多 Agent 图保留“社区帖子示意截图 · 非官方界面”，DuMate 保留海报属性，近期截图保留近期版本参考标识。C04 的权限弹窗是单独绘制的概念交互，并标注“示意”。

缺少截图时会报出文件名，请重新导入，不会替换成虚构产品界面。

## 接入自己的录音

已接入同级 `remotion-voiceover` 工具的本地打包版本，依赖位于 `vendor/remotion-voiceover-0.1.0.tgz`，新机器执行 `npm ci` 即可安装。

在本项目运行 `npm run preview`，使用 Chrome 或 Edge 打开 `http://127.0.0.1:4173`：

1. 在录音面板选择当前镜头或“整片”。31 个有旁白的镜头可单独录制，章节卡等无旁白镜头不列入选项。
2. 点击“开始录音”，允许麦克风；3 秒倒计时后跟随画面与高亮提词朗读。每镜开头保留原有 9 帧（P01 为 10 帧）提词留白。
3. 到区间末尾自动停止，也可以提前停止。点击“跟画面试听”，满意后“保存并使用”，也可下载 WAV。
4. 点击“录下一段”继续。录音保存在本工程的 `public/narration/`，刷新预览页可恢复；刷新 Remotion Studio 后，全片和独立章节也会使用配音。

录制期间影片静音、跳转与播放控制暂停使用，避免配乐被录入或画面错位。整片录音可用逐镜重录覆盖，短重录的剩余镜头区间留白。重录或移除会保留旧 WAV，录音与清单默认不提交 Git。

浏览器录制采用当前剪辑长度，到区间末尾停止，不自动拉长镜头。若需放慢讲述，请先调整镜头时长，或通过下面的外部录音流程延长弹性镜头，再开始录制。提词与影片字幕共用 `captionsFor()`；仍按标点和字数估算，尚未做语音强制对齐。

### 导入外部录音

31 个有旁白的镜头使用独立文件，放在 `public/vo/`：

```text
public/vo/P01.wav
public/vo/Z04.wav
public/vo/F04.wav
```

支持 WAV / MP3 / M4A / AAC / OGG。同一镜头只放一个文件。默认在镜头开头后 9 帧播放，P01 为 10 帧；在 `src/data/shots.json` 中调整 `voOffset` 可匹配自己录入的静音。

没有浏览器录音的镜头继续播放外部文件；浏览器逐镜录音覆盖该镜头，整片录音覆盖全部外部文件。移除浏览器录音后即可恢复外部录音。

`calculateMetadata` 自动读取音频长度。弹性镜头按 `max(minFrames, voOffset + ceil(seconds × 30) + 12)` 延长，后续镜头、摄影机和字幕一起重排。固定镜头超长会提示具体镜头号，不会裁掉尾音或压缩动画。

录音表见 [narration-cues.md](./production/narration-cues.md)。字幕目前按标点、字数和实际音频长度估算，尚未强制对齐语音。

```powershell
npm run captions
```

输出 SRT、VTT、`production/timing.json` 和录音表。WAV 直接读取元数据；其他格式的 CLI 字幕导出和配音保存接口需要 PATH 中的 `ffprobe`。Studio 与普通画面预览不需要 ffprobe；浏览器录音生成 WAV，也不需要 ffprobe。

## 音频

已接入 Scott Buckley 的《A Kind Of Hope》，项目播放文件为 `public/audio/music.mp3`。现为 96 kbps / 44.1 kHz 立体声，保留完整 5:42.6；相比工程里原有的 128 kbps 版本（5.48 MB），现为 4.11 MB，节省 1.37 MB（约 25%）。沿用原有的 4.06 dB 音量调整。

播放音量由 `src/lib/music.ts` 控制：普通段落最高 10%，讲解段 6%，平滑压低与恢复；片头 2 秒淡入，片尾 3 秒淡出。尚未放入旁白文件时，也按分镜的口播区间压低音乐。配乐贯穿全片，短配乐循环时音量曲线继续按全片时间计算。

自制合成音效位于 `public/sfx/`，可在预览页关闭；该开关只控制短音效，播放器的总音量控制所有声音。音乐来源、CC BY 4.0 授权和发布时应添加的简介署名见 [public/audio/README.md](./public/audio/README.md)。

## 代码入口

| 文件                                 | 用途                                     |
| ------------------------------------ | ---------------------------------------- |
| `src/Root.tsx`                       | 全片、独立章节与动态元数据               |
| `src/AgentMap2026.tsx`               | 摄影机、世界、场景、字幕、声音的组装     |
| `src/lib/cinematics.ts`              | 投影、运动函数、镜头上下文、截图世界坐标 |
| `src/lib/camera.ts`                  | 全局摄影机轨迹与连续速度插值             |
| `src/components/WorldLayer.tsx`      | 纵深地图、轨道、年份门、图钉、未来虚线   |
| `src/components/Media.tsx`           | 真实截图、透视设备框、标注、实际图源     |
| `src/components/CinematicActors.tsx` | 字幕式标题揭示、轨道信号、抛物线与碎片   |
| `src/components/FilmRig.tsx`         | 镜头空间、光学处理与定向剪辑             |
| `src/components/FilmBranding.tsx`    | 固定品牌栏、网站、章节编号与右下图源     |
| `src/lib/music.ts`                   | 背景音乐音量、旁白避让与首尾淡入淡出     |
| `src/components/ProductTower.tsx`    | 从轨道投影到八层产品形态的连续变形       |
| `src/scenes/`                        | 全部 39 镜的独立编排                     |
| `src/data/shots.json`                | 逐镜旁白、时长与弹性配置                 |

分镜旁白 / 时长变更后可用 `npm run sync:storyboard` 重建数据；该命令会覆盖手动修改的 `voOffset`。添加新汉字后可运行 `python scripts/setup-fonts.py` 重建字体子集，需 `fonttools`、`brotli`；正常预览不需要这些 Python 包或外部字体请求。字体原始 OFL 许可证已保留。

## 检查

```powershell
npm run typecheck
npm run check
npm run build:preview
npm run test:voiceover
npm run format
```

格式化命令位于 `package.json`，遵循根目录的 `.prettierrc.json` 和 `.prettierignore`。

配音测试使用模拟麦克风和临时素材目录，检查录音、取消、试听、下载、保存恢复、重录与章节音频偏移，不访问真实麦克风或修改自己的录音。浏览器优先使用本机 Chrome / Edge；也可通过 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 指定路径。测试截图与结果在 `build/review/`。
