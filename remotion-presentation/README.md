# Remotion Presentation

演示工具可以按设定的帧区间播放 Remotion 动画，停下来讲解，再按下一步继续。「开始录制」会把实际操作画面和麦克风声音录进同一个视频，讲解和等待的时间都会保留。

讲到某处时，鼠标就是一支激光笔：红点带惯性拖尾，点击会泛起一圈涟漪；按 `D` 换成聚光灯，按 `B` 切黑屏。这些都在镜头画面之上绘制，录制时一并进入成片，不会改动影片本身。

录制流程、与目标工程的接口和文件职责见 [DESIGN.MD](./DESIGN.MD)。

## 直接录制任意演示

先在浏览器里打开目标项目，保留该标签页。在仓库根目录执行以下命令。录制页仅使用 Node 内置模块提供静态文件，直接运行即可。

```bash
node remotion-presentation/recorder/serve.mjs
```

打开 `http://127.0.0.1:4177/`。也可以在本工具包目录运行 `npm run record`。从目标工程的 Studio、预览页到其他浏览器演示，都通过系统的共享选择器选取画面。

1. 点 **开始录制**，选择已打开的演示标签页或窗口。默认录入麦克风，首次使用需允许访问。取消勾选麦克风可只录画面。
2. 回到目标页面操作和讲解。录制页的计时从获取所选画面和声音、开始编码时算起。演示里的暂停和回退都会按实时时长出现在成片中。
3. 点浏览器的 **停止共享**，或回录制页点 **停止录制**。录制页可回看本次结果，点 **下载视频** 保存到电脑。浏览器选择编码与容器，常见后缀为 `.webm` 或 `.mp4`。

声音来自所选麦克风。录制文件暂存在本次页面会话，关闭、刷新或重录前请先下载。请选择支持屏幕共享的桌面浏览器，在 localhost 或 HTTPS 下打开录制页。远端运行时，可以在录制电脑用 `ssh -N -L 4177:127.0.0.1:4177 user@server` 转发录制页端口，然后从本机浏览器打开网址并选择演示画面。[浏览器屏幕共享说明](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia)

录制器独立于 Film、Player 和分镜配置，只读取你授权的屏幕和麦克风。下面的适配器和停留点用于需要按键推进动画的工程。

## 当前接入

已接入两个工程：

- [`workflow-vs-agent/presentation`](../workflow-vs-agent/presentation/)（55 个停留点，端口 4176）
- [`what-is-agent/presentation`](../what-is-agent/presentation/)（13 个停留点，端口 4178）

在目标工程已有依赖可用时，从仓库根目录执行：

```bash
cd workflow-vs-agent
npm run presentation
```

打开终端给出的地址，默认是 `http://127.0.0.1:4176/`。也可以使用 `pnpm presentation`。这会启动独立演示入口，沿用目标工程的素材和依赖；无需先安装或构建本工具包。

`what-is-agent` 的入口同理，`cd what-is-agent && pnpm presentation`，默认 `http://127.0.0.1:4178/`。它的停留点数量少、单段更长，适合验证长镜头内的分段讲解；`workflow-vs-agent` 有 55 段，适合验证进度轨密度。

打开后直接显示第一项的停留画面，激光笔已经可用。按 R 可重播第一项动画，按下一步播放第二项。选择目录条目会直接定位到该项的停留画面。

## 操作与录制

| 操作                         | 快捷键                   |
| ---------------------------- | ------------------------ |
| 下一步，播放至下一停留点     | →、PageDown、空格、Enter |
| 上一步，直接显示上一停留画面 | ←、PageUp                |
| 从当前段开头重播             | R                        |
| 播放本段、暂停、继续         | P                        |
| 打开或关闭目录               | O                        |
| 开关键盘表                   | ?                        |
| 激光笔开关                   | L                        |
| 切换激光笔颜色（红 / 蓝 / 绿） | Shift + L              |
| 聚光灯                       | D                        |
| 黑屏                         | B                        |
| 显示或隐藏控件               | C                        |
| 进入或退出全屏               | F                        |
| 第一项 / 最后一项            | Home / End               |
| 关闭浮层并显示控件           | Escape                   |

播放期间重复的下一步操作会被忽略，避免翻页笔连按跳过内容。后退、目录跳转和重播会立即取消原播放；暂停后按 P 从暂停位置继续。最后一项的下一步无动作。

## 指向与讲解辅助

激光笔默认开启。鼠标进入画面区后，浏览器光标隐藏，出现一支带拖尾的红点；停下鼠标时拖尾在 0.4 秒内收干净，点击位置会扩散出一圈涟漪。`Shift + L` 在红、蓝、绿之间轮换，适合换到浅色或深色底片上。

- **聚光灯（D）**：画面其余部分压暗，鼠标周围留出一个亮圈。适合把注意力锁在一张截图或一段代码上。
- **黑屏（B）**：把画面整体切黑而不断开当前停留点，用来讲一段不在画面上的内容；按任意推进键会恢复画面。
- **计时（顶部 HUD）**：从第一次推进开始计时，显示这次演讲已经讲了多久。
- **进度轨（底栏最上沿）**：每一段一格，已讲过的变暗蓝，当前段发光；点击任意一格直接跳到那一段，章节起点会有更大间隔。
- **本镜备注**：`notes` 会直接显示在底栏标题下方，不必打开目录才能看到；同时仍在目录底部保留一份完整文本。
- **下一镜预告**：底栏右下角显示下一段标题，方便接话。

指向层画在 `.rmp-screen` 之上，随画面一起被 `getDisplayMedia` 捕获，所以录制结果里能看到激光点和聚光灯。它也遵循 C / F 的精简模式：全屏时控件和光标一起隐藏，只留画面和红点。

工具栏可直接点 **开始录制**，在共享选择器中选择当前演示标签页并允许麦克风。看到录制计时后，即可边讲边操作。按 F 全屏并隐藏控件，或用 C 切换控件。录制按钮所在页面按 Shift+R 可以结束录制，浏览器的「停止共享」也会生成结果。结束后工具栏显示「下载视频」。R 仍用于重播当前动画，P 只控制动画播放。

使用 `?clean` 可在打开页面时就隐藏控件。画面保持原宽高比，不同窗口比例下会有黑边。场景中的链接不响应鼠标点击，避免演示时离开页面。

## 接入另一个影片

在目标工程中创建独立浏览器入口，使用该工程自己的 React、Remotion 和 public 素材。当前包以 TypeScript 源码导出，适用于 Vite 等支持 TS/TSX 的前端构建工具。仓库内接入可像现有示例一样相对导入：

```tsx
import {
  Presentation,
  definePresentation,
} from "../../remotion-presentation/src/index.js";
import { MyFilm } from "../src/MyFilm";

const definition = definePresentation({
  title: "我的演示",
  fps: 30,
  durationInFrames: 300,
  compositionWidth: 1920,
  compositionHeight: 1080,
  cues: [
    { id: "overview", title: "总览", fromFrame: 0, holdFrame: 45 },
    { id: "detail", title: "展开细节", fromFrame: 60, holdFrame: 120 },
  ],
});

// inputProps 使用目标组件自己的参数；关闭字幕和声音的名称由目标决定。
const inputProps = { showCaptions: false, soundtrack: false };

export function App() {
  return (
    <Presentation
      component={MyFilm}
      inputProps={inputProps}
      definition={definition}
    />
  );
}
```

`definition` 和 `inputProps` 应定义在组件外或保持稳定。替换整个影片或定义时，用新的 React `key` 重新挂载 Presentation。入口负责等待字体和必要的目标元数据就绪；示例适配器见 [`adapter.ts`](../workflow-vs-agent/presentation/adapter.ts) 和 [`main.tsx`](../workflow-vs-agent/presentation/main.tsx)。

`cues` 按数组顺序播放，允许重排和重叠区间。帧号为原影片的绝对整数帧，必须满足：

```text
0 <= fromFrame < holdFrame < durationInFrames
```

`holdFrame` 是包含在播放区间内的最后一帧。`id` 必须唯一，`title` 用于目录，`chapter`、`notes` 可选。配置会在挂载前验证。每个停留点应避开入场透明帧、退场和未完成的运镜；原视频时间轴变化后，目标工程负责校准停留点。

目标适配器还需要提供最终的 fps、时长和尺寸；工具不会执行 Composition 的 `calculateMetadata`。所有 `remotion` 与 `@remotion/*` 包应使用一致版本，React、Remotion 和 Player 作为 peer dependencies 沿用目标工程的安装。跨目录源码接入需要正确配置依赖解析和去重，参考示例的独立 Vite 配置。

## 文件边界

- `src/controller.ts`、`src/types.ts`：纯配置校验与导航状态；`/core` 导出不依赖 React。
- `src/Presentation.tsx`：单个 Player、键盘控制、全屏、目录、进度轨与顶栏 HUD。
- `src/LaserPointer.tsx`：镜头画面上的激光笔、拖尾、点击涟漪与聚光灯；只用 canvas 和 CSS 变量，鼠标移动不触发 React 渲染。
- `src/presentation.css`：以 `rmp-` 前缀限定样式，随 React 入口自动引入。
- 目标工程的 `presentation/`：组件适配、停留点、素材目录和入口配置。

- `recorder/recorder.js` 提供浏览器录制控件，工具栏和独立录制页共用它。屏幕与麦克风采集、编码和下载均在录制电脑的浏览器里完成。
