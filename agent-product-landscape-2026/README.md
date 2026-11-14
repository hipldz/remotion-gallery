# Remotion Gallery

使用 Remotion、React 和 TypeScript 制作的中文技术讲解视频工程合集，包含动画、字幕、预览页面和配音工具。

## 项目目录

| 目录                                                              | 内容                                            |
| ----------------------------------------------------------------- | ----------------------------------------------- |
| [chatgpt-to-agent](./chatgpt-to-agent/)                           | 从 ChatGPT 到 Agent                             |
| [workflow-vs-agent](./workflow-vs-agent/)                         | Workflow 与 Agent 的概念和区别                  |
| [agent-product-landscape-2026](./agent-product-landscape-2026/)   | AI Agent 产品发展回顾                           |
| [tool-calling-and-llm-requests](./tool-calling-and-llm-requests/) | Tool Calling 与模型请求的关系，包含两个实现版本 |
| [remotion-voiceover](./remotion-voiceover/)                       | 可复用的浏览器配音工具                          |

## 环境要求

- Node.js 22 或更新版本
- pnpm

## 安装与运行

### 1. 配置 pnpm 存储目录

为了统一管理各个子项目的依赖缓存，建议在仓库根目录配置 pnpm 的 Store 和 Cache 目录：

```powershell
pnpm config set --location=project storeDir ".pnpm/store"
pnpm config set --location=project cacheDir ".pnpm/cache"
```

配置完成后，进入任意子项目目录，检查 pnpm 是否正确继承了根目录配置：

```bash
pnpm store path
pnpm config get cacheDir
```

期望结果为：

```text
../.pnpm/store
../.pnpm/cache
```

如果结果不符合预期，可以在仓库根目录创建或更新 `pnpm-workspace.yaml`：

```powershell
@'
storeDir: ../.pnpm/store
cacheDir: ../.pnpm/cache
'@ | Set-Content -Encoding utf8 .\pnpm-workspace.yaml
```

### 2. 安装各子项目依赖

进入需要安装依赖的子项目目录。

如果项目中存在 `package-lock.json`，先执行一次 `pnpm import`，将 npm 的锁文件转换为 pnpm 锁文件：

```bash
pnpm import
```

然后安装依赖：

```bash
pnpm install
```

### 3. 注意 Workspace 行为

如果根目录配置了多个 Workspace 子项目，执行：

```bash
pnpm install
```

默认会安装整个 Workspace 中的依赖，而不只是当前子项目。

如果只想安装指定子项目，可以在仓库根目录使用 `--filter`：

```bash
pnpm install --filter "<package.json 中的 name>"
```

其中，`<package.json 中的 name>` 对应子项目 `package.json` 中的 `name` 字段。

### 4. 运行项目

例如，运行 `chatgpt-to-agent`：

```bash
pnpm install --filter "<chatgpt-to-agent 的 package name>"
pnpm --filter "<chatgpt-to-agent 的 package name>" dev
```

启动成功后，打开终端提示的地址即可进入 Remotion Studio。

各项目的预览、配音和视频导出方式见对应目录下的 README。

### 5. 目录结构

配置完成并安装依赖后，仓库目录大致如下：

```text
remotion-gallery/
│
├── .pnpm/
│   ├── store/
│   └── cache/
│
├── pnpm-workspace.yaml
│
├── chatgpt-to-agent/
│   ├── package.json
│   ├── pnpm-lock.yaml
│   └── node_modules/
│
├── workflow-vs-agent/
│   ├── package.json
│   └── node_modules/
│
├── agent-product-landscape-2026/
│   ├── package.json
│   └── node_modules/
│
├── tool-calling-and-llm-requests/
│   ├── package.json
│   └── node_modules/
│
└── remotion-voiceover/
    ├── package.json
    └── node_modules/
```

本地录音、环境变量、依赖目录及构建产物不提交到仓库。

部分音频素材需要自行准备，具体要求见各工程说明。

## 导出视频

### 1. 查找浏览器可执行文件

Remotion 导出视频时需要使用浏览器。以下以 Windows 为例，演示如何查找 Edge 或 Chrome 浏览器的可执行文件。

**Edge 浏览器：**

```powershell
$edge = @(
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "$env:LOCALAPPDATA\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $edge) {
    throw "未找到 Edge，请检查安装路径"
}
```

**Chrome 浏览器：**

```powershell
$chrome = @(
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $chrome) {
    throw "未找到 Chrome，请检查安装路径"
}
```

### 2. 执行视频导出

找到浏览器后，进入对应的 Remotion 项目目录。

例如，使用 Edge 导出 `chatgpt-to-agent` 项目：

```powershell
cd chatgpt-to-agent

pnpm exec remotion render src/index.ts ChatGPT-to-Agent out/chatgpt-to-agent.mp4 --browser-executable="$edge"
```

如果使用 Chrome，将 `$edge` 替换为 `$chrome` 即可。

导出的 MP4 视频位于项目的 `out/` 目录。

## 许可证

本仓库原创代码采用 [Apache License 2.0](./LICENSE)。

第三方依赖、字体、音乐、截图等素材遵循各自的许可证或权利声明，相关说明保留在各工程中。
