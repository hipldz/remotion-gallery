# 7–8 分钟动效科普的内容与来源

文字起点是用户通过 `vendor/remotion-voiceover-0.2.1.tgz` 中的编辑器保存的字幕。输入快照为 `editor-source.json`，全部 86 条原句保留，补入 23 句解释与承接，共 109 句、初始 7:36。画面沿用原版动效。当前播放和导出继续以 `public/narration/manifest.json` 为准。

产品年份及截图沿用既有 `assets.json`、`source-provenance.json` 和 `src/data/pins.ts`。图源标签明确区分历史界面、近期界面和第三方截图。图解里的代码、表格、运行结果和任务状态是讲解示意，不是这些产品的实际性能测试。

2026-11-13 实际访问并用于补充的资料：

- [Anthropic：Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)。说明预先编排的 Workflow 与由模型动态决定步骤的 Agent；支持工具、结果反馈和两类方法可以组合的解释。
- [Anthropic：Effective harnesses for long-running agents](https://www.anthropic.com/research/effective-harnesses-for-long-running-agents)。说明跨会话的工作环境、增量进度和可读取产物；支持保存进度与接续工作的讲解。保存上下文本身不能保证任务正确完成。
- [DeepSeek Harness 官方产品页](https://www.deepseek.com/en/harness/)。实际页面将其介绍为桌面／网页入口、工作区与可组合插件的产品，区分具体产品和 Harness 架构概念。
- [Pi 作者的发布文章](https://mariozechner.at/posts/2025-11-30-pi-coding-agent/)。说明较小的基本工具组和扩展思路。

Copilot 的技术预览与正式开放节点沿用用户最新版稿件及原项目的年份资料；GitHub 对应页面本次连接超时，未列为本次成功读取的资料。

OpenAI Docs 的 `developers.openai.com` 与 `platform.openai.com` 页面本次返回 HTTP 403，未用无法读取的页面建立新结论。ChatGPT、Deep Research、ChatGPT Agent 和 Codex App 的产品定位沿用用户最新版稿件与既有资料；本次新增的是任务说明、结果检查和工作衔接，未添加未经核对的价格、账号可用性或性能判断。

GitHub 关注数仍是原项目 2026-11-12 的仓库快照，不表示历史发布时的关注度。
