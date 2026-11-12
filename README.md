# Remotion Gallery

用 Remotion、React 和 TypeScript 制作的中文技术讲解视频工程合集，包含动画、字幕、预览页面和配音工具。

| 目录 | 内容 |
| --- | --- |
| [chatgpt-to-agent](./chatgpt-to-agent/) | 从 ChatGPT 到 Agent |
| [workflow-vs-agent](./workflow-vs-agent/) | Workflow 与 Agent 的概念和区别 |
| [agent-product-landscape-2026](./agent-product-landscape-2026/) | AI Agent 产品发展回顾 |
| [tool-calling-and-llm-requests](./tool-calling-and-llm-requests/) | Tool Calling 与模型请求的关系，包含两个实现版本 |
| [remotion-voiceover](./remotion-voiceover/) | 可复用的浏览器配音工具 |

## 运行


pnpm config set --location=project storeDir ".pnpm/store"

pnpm config set --location=project cacheDir ".pnpm/cache"



进入子目录确认pnpm的继承关系

pnpm store path
pnpm config get cacheDir
期望的结果是../.pnpm/store和../.pnpm/cache

如果不是需要创建 pnpm-workspace.yaml: 

```pwsh
@'
storeDir: ../.pnpm/store
cacheDir: ../.pnpm/cache
'@ | Set-Content -Encoding utf8 .\pnpm-workspace.yaml
```

然后开始对各个子文件的项目进行pnpm的安装啥的

1. 如果子文件夹有: package-lock.json，先执行一次： pnpm import
2. 安装依赖: pnpm install


3. 注意 Workspace 行为
如果根目录配置了多个 workspace 子项目，pnpm install 默认会安装整个 Workspace 的依赖，而不只是当前子项目。
GitHub


如果你只想安装当前子项目，可以使用： pnpm install --filter "<package.json 中的 name>"

最终的效果

```txt
remotion-gallery/
│
├── .pnpm/
│   ├── store/
│   └── cache/
│
├── pnpm-workspace.yaml
│
├── agent-product-landscape-2026/
│   ├── package.json
│   └── node_modules/
│
├── chatgpt-to-agent/
│   └── package.json
│
└── workflow-vs-agent/
    └── package.json
```

需要 Node.js 22 或更新版本。各工程独立安装依赖，以 `chatgpt-to-agent` 为例：

```bash
cd chatgpt-to-agent
npm ci
npm run dev
```

打开终端提示的地址即可进入 Remotion Studio。预览、配音和视频导出方式见各目录的 README。

本地录音、环境变量、依赖目录及构建产物不提交到仓库。部分音频素材需要自行准备，具体见各工程说明。

## 许可证

本仓库原创代码采用 [Apache License 2.0](./LICENSE)。第三方依赖、字体、音乐、截图等素材遵循各自的许可证或权利声明，相关说明保留在各工程中。
