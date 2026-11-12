# Remotion Voiceover

可独立维护的浏览器配音工具，供不同 Remotion 工程接入。录音器、配音时间轴和本地保存接口均位于此 repo，不依赖任何视频工程、素材、字体或固定镜头编号。它使用 Remotion Player，属于自定义接入工具；Remotion Studio 的界面不会新增录音按钮。

支持麦克风录音、3 秒倒计时、电平、逐句提词、按朗读节奏延长片段、编辑或增加字幕、整片或分段录制、画面同步试听、重录、WAV 下载、保存后恢复、分段覆盖整片录音和背景音乐降低音量。分镜与字幕均可省略，省略时仍可录制整片。

## 先运行示例

使用 Node.js 22 或更新版本，在本项目根目录执行：

```bash
npm ci
npm run dev
```

用 Chrome 或 Edge 打开终端打印的地址，通常是 `http://127.0.0.1:5173`。页面左侧是初始 8 秒、60 fps 的示例影片，开场 3 秒、结尾 5 秒；右侧是录音面板。播放器随窗口高度缩放，当前提词和录音操作一屏显示；窄屏时上下排列。无需另外创建视频工程或先打包安装本工具。

影片底部会按当前帧显示字幕，与录音面板的提词共用 `examples/project.ts` 中的 `captions`。修改其中的文本和起止帧，即可同步调整字幕与提词；跳转、播放和录音时都会跟随画面更新。

选择整片、开场或结尾，点击“开始录音”并允许麦克风。默认使用“按朗读节奏”：3 秒倒计时后朗读，分段录音用“读完，下一句”或空格切换提词，最后一句读完后停止。原计划 8 秒而读到 10 秒时，画面会等待，录音不会在 8 秒截断；保存时同步延长字幕和片段，后续分镜顺延。选择“按画面时长”可恢复到区间末尾自动停止。点击“跟画面试听”，满意后点击“保存并使用”，或直接下载 WAV。

示例的录音保存到本仓库的 `public/narration/`，刷新页面后仍可加载。此目录已加入 `.gitignore`，录音不会被提交到 Git。这个保存位置仅用于本仓库示例；接入其他视频工程后，录音保存在那个工程自己的 public 目录中。

示例文件：

- `examples/index.html`、`examples/main.tsx`：浏览器入口。
- `examples/example.css`：示例页布局和样式。
- `examples/integration.tsx`：`ExamplePreview` 接通 Player 和录音面板；`ExampleFilm` 是可以替换的影片组件。复制该示例时，为 `.example-preview` 添加布局样式，或一并参考 `example.css`。
- `examples/project.ts`：帧率、时长、分镜和提词。
- `examples/vite.config.ts`：开发服务、本地保存接口和 public 目录配置。接入已有工程时合并保存插件即可，其余 root、publicDir 和构建目录使用目标工程自身的配置。

`npm run build:example` 可以将示例页构建到 `build/example/`。这是静态页面构建；“保存并使用”需要 `npm run dev` 提供的本地接口，部署静态文件后仍可录音、试听和下载 WAV。

## 构建与安装

使用 Node.js 22 或更新版本。当前为本地私有 repo，没有发布到 npm，也没有配置远程 Git 仓库。

```bash
npm ci
npm run check
npm run pack:local
```

将 `build/` 中生成的 `remotion-voiceover-0.2.0.tgz` 放入目标视频工程的 `vendor/`，在视频工程执行：

```bash
npm install ./vendor/remotion-voiceover-0.2.0.tgz
```

使用 npm 打包后的依赖可避免本地源码链接引入两份 React 或 Remotion。工具更新后重新构建、打包并更新视频工程的依赖包。各 `remotion`、`@remotion/*` 包应使用相同版本；当前已验证 4.0.542，React 19。

## 视频工程需要提供什么

创建稳定的配置对象，例如放在 `src/voiceover.config.ts`：

```ts
import {defineVoiceoverProject} from 'remotion-voiceover/core';

export const voiceProject = defineVoiceoverProject({
  fps: 60,
  durationInFrames: 360,
  scenes: [
    {id: 'opening', title: '开场', from: 0, durationInFrames: 180},
    {id: 'ending', title: '结尾', from: 180, durationInFrames: 180},
  ],
  captions: [
    {startFrame: 0, endFrame: 170, text: '这里是你的台词。', sceneId: 'opening'},
  ],
});
```

只录整片时，配置可以只有 `fps` 和 `durationInFrames`。尺寸、影片组件及其输入参数直接交给原来的 Remotion Player。动态 `calculateMetadata` 的工程应先取得实际帧率和总帧数，再创建配音配置。

分镜编号可以是任意非空字符串，`full` 保留给整片录音。分镜使用绝对帧，允许留白区间，不能重叠；视觉转场可以重叠，配音区间需选择明确的切点。设置 `recordable: false` 可隐藏无需单独配音的分镜。没有 `sceneId` 的字幕会按时间自动归入对应区间。

配置应在组件外定义或通过 `useMemo` 保持稳定。切换到另一部影片时，重新创建配置，并用不同的 React `key` 挂载预览及录音状态。

## 接入预览页

```tsx
import {VoiceRecorder, useVoiceover} from 'remotion-voiceover/react';
import 'remotion-voiceover/styles.css';

const voice = useVoiceover(voiceProject);

// Player 的 durationInFrames 使用 voice.project.durationInFrames。
// inputProps 传入 voiceProject: voice.project 和 voiceTracks: voice.tracks。
// 通过 Player 的 frameupdate 维护 frame；录音期间禁用其他跳转/播放控制。
<VoiceRecorder
  project={voice.project}
  player={playerRef}
  frame={frame}
  manifest={voice.manifest}
  storage={voice.storage}
  onManifest={voice.setManifest}
  onBusy={voice.setBusy}
  onDraft={voice.setDraft}
  onProject={voice.setProjectDraft}
  onSeek={seekToFrame}
/>;
```

`currentSceneId` 可选，用于跟随当前分镜。`onProject` 接到 `voice.setProjectDraft` 后，默认启用“按朗读节奏”；旧接入没有这个回调时仍按原时长录制。分段录音支持逐句打点；整片自由录音可延长结尾，需要精确逐句对齐时选择分段。录音画面由麦克风录音时钟推进，不受复杂画面播放速度影响。播放器录音期间静音，停止或取消后恢复原状态。

完整的另一影片接入示例见 [examples/integration.tsx](examples/integration.tsx)，示例使用 60 fps、任意分镜编号和 1280×720 尺寸，包含 Player 事件连接。示例文件中的相对 `../src/...` 导入便于此 repo 离线类型检查；复制到视频工程时改为 `remotion-voiceover/core`、`/react` 和 `/server`。

## 接入影片音轨

在影片组件内加入：

```tsx
import {Voiceover, useVoiceTracks} from 'remotion-voiceover/react';
import {voiceoverVolume, type VoiceTrack} from 'remotion-voiceover/core';

const tracks = useVoiceTracks(voiceProject, props.voiceTracks);
// 作为影片的一个音频图层：
<Voiceover project={voiceProject} tracks={tracks}/>;
// 可选的背景音乐音量：
<Audio src={musicSrc} volume={frame => voiceoverVolume(frame, tracks, voiceProject)}/>;
```

预览页传入音轨，包括未保存的试听录音。Studio 中不传 `voiceTracks`，音轨钩子会通过 `staticFile()` 读取 `public/narration/manifest.json`；没有清单时按无配音处理。保存后刷新 Studio 即可加载新录音。`Voiceover` 的 `resolveSrc` 可定制 CDN 等素材路径，默认支持本地相对路径、绝对 URL 和 blob URL。

分段重录会替换该分镜的整段人声；若新录音较短，剩余区间留白。延长一个分镜时，已有后续录音跟随顺延，整片录音保留正确的 WAV 源偏移，插入的时间不会让后面的声音错位。整片音轨恢复时使用正确的源音频偏移，且连续区间只使用一个音频组件。

## 字幕编辑与 Remotion 时长回写

点击“编辑稿件与时长”可修改正文、起点和持续秒数，也可以增加或删除一句。片段时间不足时会自动扩大；“按正常语速估算”给出包含停顿的参考时间，实际录音仍按人的节奏。SRT 可通过 `voiceCaptionsToSrt(voice.project)` 导出。

时间轴保存在同一份 `public/narration/manifest.json` 的可选 `timeline` 字段中；旧版 version 1 清单保持兼容。未保存的录音只调整预览，放弃后恢复已保存的时间。保存与刷新会保留已编辑的字幕；如果另一窗口修改了时间轴，保存会提示刷新并保留可下载的录音。

影片需要用调整后的 `voiceProject.scenes` 编排 Sequence，用 `voiceProject.captions` 显示字幕。若原动画有固定的动作时间，可以用 `mapVoiceFrame(frame, editedProject, originalProject)` 映射画面时间，并把人声和音乐放在映射外；人声保持正常语速。已有完整接入见同级 workflow-vs-agent 工程。

在 Remotion 的 Composition 中读取同一份时间轴，避免只改预览而导出仍使用旧时长：

```tsx
import {loadVoiceoverState} from 'remotion-voiceover/react';

<Composition
  // 其他属性沿用影片配置；Film 接收 voiceProject 与 voiceTracks。
  calculateMetadata={async ({props, abortSignal}) => {
    const saved = await loadVoiceoverState(voiceProject, {signal: abortSignal});
    return {
      durationInFrames: saved.project.durationInFrames,
      props: {...props, voiceProject: saved.project, voiceTracks: saved.manifest.tracks},
    };
  }}
/>;
```

章节合成也应使用更新后的分镜起点和长度。保存后刷新 Studio 即可重新计算；渲染使用同一套 metadata。

## 本地保存

在目标工程已有的 Vite 配置中加入：

```ts
import {voiceoverPlugin} from 'remotion-voiceover/server';
plugins: [react(), voiceoverPlugin({project: voiceProject, projectRoot: process.cwd()})]
```

默认保存到视频工程自己的 `public/narration/`，不会写入工具 repo。默认接口为 `/api/voiceover`，GET 读取清单，POST 保存单声道 PCM16 WAV，PATCH 保存字幕和时间，DELETE 仅从影片移除录音；重录和移除都会保留旧 WAV 原件。原有版本 1 清单和录音可以继续使用，无需迁移。

`project.manifestSrc` 可调整 public 内的清单路径；`publicDir` 可调整 public 目录；`endpoint` 可调整接口路径。多部影片可使用不同清单与接口，前后端配置需一致。默认单次录音上限 64 MiB，可以通过插件的 `maxBytes` 调整。

其他 Node 开发服务可将 `createVoiceoverMiddleware(options)` 挂载到已有路由，无需使用 Vite。其他存储方式可以实现 `VoiceoverStorage` 的 `load/save/remove`；`save` 的可选第三个参数接收调整后的时间轴，`saveTimeline` 保存单独的字幕编辑，并传给 `useVoiceover`；录音组件也接受自定义 `assetUrl` 生成下载地址。

浏览器采集麦克风需要 localhost 或 HTTPS，以及用户主动允许麦克风。静态网页仍可录制和下载 WAV；保存到工程需要本地保存接口。没有云端配音或自动上传。

## 模块与验证

- `src/core/`：配置、清单、配音覆盖与时间对齐，不依赖 React。
- `src/react/`：录音面板、音频处理、播放器接入和 Remotion 音轨。
- `src/server/`：Node 保存中间件及 Vite 插件，不导入视频组件。
- `examples/`：可直接运行的录音示例页、另一影片的接入示例与仅整片录制配置。
- `tests/`：不同帧率、分镜留白、局部重录、WAV、存储及组件初始输出的离线测试。

`npm run check` 只做类型检查、模块构建和离线测试，不监听端口，不调用真实麦克风，也不启动 Remotion/Vite 项目或渲染视频。
