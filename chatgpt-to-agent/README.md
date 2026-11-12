# 从 ChatGPT 到 Agent

一个用 Remotion 制作的技术讲解视频项目，介绍 ChatGPT、工具调用、Workflow 和 Agent 的变化。视频时长 2 分 58 秒，支持预览、录制配音和导出 MP4。

## 运行

需要 Node.js 22 或更新版本。在项目目录执行：

```bash
npm ci
npm run preview
```

打开 http://127.0.0.1:4173，即可播放视频、跳转镜头、开关字幕和背景音乐。点击“录制配音”可以录音，试听后选择“保存并使用”。

## 开发

```bash
npm run dev
```

打开 http://localhost:3006，选择 `ChatGPT-to-Agent`。修改 `src/` 中的代码即可调整视频内容。

## 导出视频

### 找自己的浏览器

例如 edge 浏览器:

```pwsh
$edge = @(
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
    "$env:LOCALAPPDATA\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $edge) {
    throw "未找到 Edge，请检查安装路径"
}
```

找到之后:

```bash
npx remotion render src/index.ts ChatGPT-to-Agent out/chatgpt-to-agent.mp4 --browser-executable="$edge"
```

导出的 MP4 位于 `out/` 目录。
