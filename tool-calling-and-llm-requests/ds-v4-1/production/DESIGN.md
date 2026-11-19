# 分镜 · 3 分钟无配音版

原则：原文的叙事和口吻不动；一张画布、一台摄像机；同一批对象贯穿全片；没有配音，所以画面必须自己讲清楚。

- 全片 180s / 60fps / 1920×1080
- 画布上 6 个区域，镜头 21 个关键点（`src/film/camera.ts`）
- 屏幕文字 41 条（`src/film/captions.json`，SRT 见 `production/film.zh-CN.srt`）

## 镜头表

| 时间 | 区域 | 镜头 | 画面在演什么 |
|---|---|---|---|
| 0:00–0:09 | hook 左 | 从 1.02 缓推到 1.05 | WebUI lite 的命令流一条接一条往上顶：滚动条越来越短，同样的 `read_file` 反复出现。6.4s 起重复行一起泛红，出现"同样的 read_file 占了 4 条" |
| 0:09–0:13 | hook 右 | 俯冲到 x≈1670，z 1.0 | 切到 Codex 原生窗口，红色手绘框圈住 `Read files, ran commands` 那一行；标注"原生界面把它折叠成一行" |
| 0:13–0:17 | hook 右下 | 保持，z 1.0 | 折叠行向下展开成 9 条记录（3×3），外面套琥珀虚线框，标签"= 1 次 Request ?"；15.4s 虚线变实线并发光——猜得很笃定 |
| 0:17–0:22 | hook 右 | 后撤到 x≈2000，z 0.9 | GPT 对话气泡依次弹出："按一次 Request 分组的吧？" / "不能这么理解。" / "？？"。20.2s 标签被红线划掉，框泄气；底部出现"折叠是展示策略，不是执行边界" |
| 0:22–0:30 | question | 飞过去，z 1.0 → 1.03 | 全片唯一一张标题。`1 : 1` 的连线在 26.7s 被扯断；Request 扇出三根线连到三个 Tool Call；28.1s 盖下红章"不是一对一" |
| 0:30–0:39 | track 左 | 跟轨道右移 | Turn 括号生成；用户气泡 → Request #1 → Response #1 落下 → 三个 `read_file` 依次弹出。右上计数器：Response 跳 1 下，Tool Call 跳 3 下 |
| 0:39–0:52 | track 中 | 跟着结果右移 | 三个调用在应用泳道跑进度条，结果沿虚线弧回到 Request #2；Response #2 出两个 `grep`；Request #3 → Response #3 是 message，最终回答落在应用侧 |
| 0:52–1:04 | track 全 | 拉到 z 0.56 | 一次看到整条 Loop：1 Turn / 3 Response / 5 Tool Call；Agent Loop 标注出现 |
| 1:04–1:27 | track | 飞回 Response #1，z 1.0 → 1.02 | Response 卡片原地长成 JSON 面板（430×290 → 700×642）。三处高亮：`resp_123`（蓝）、`output`（琥珀虚线）、三个 `call_id`（绿）。74.8s 蓝色脊线把三个 call_id 挂到同一个 id 上；82.6s 底部三格 `[ ] / [■] / [■■■]` 演"零个、一个、多个" |
| 1:27–1:44 | hosted | 下移，z 1.0 | 左：Function Tools，四个计数器 88–91s 同步跳到 3/3/3/5。右：托管工具，磨砂玻璃后面的步骤看不清，四个数先乱跳，99.8s 全部变成"?"。100.6s 顶部压出红 ≠："顶层 API Request 的个数 ≠ 平台内部真实发生的执行次数" |
| 1:44–2:05 | trace | 进入后缓慢下摇 13s | 按 Cookbook 截图重绘的 Trace：`POST /v1/responses`（蓝）、`codex · read_file / grep`（绿）、agent / handoff（紫/琥珀）逐行描亮，右侧图例同步计数。116.2s 旁边补一张虚线卡：另一条记录里的 11 Generation / 10 Tool Span，注明"不是 root agent 自己调了 11 次" |
| 2:05–2:26 | track | 回到轨道，z 0.8 → 1.0 | 同一批对象原地重排：Response → Generation 节点，Tool Call 挂到各自 Generation 下，最终回答变成 message，顶部生出 Turn。130.4s 内部 ID 逐个盖章（`turn_01` / `gen_01…` / `exec_01…`）。139s Provider ID 挂上；镜头左下剖开一次 HTTP 响应：Headers 里是 `x-request-id`，Body 里是 `"id": "resp_123"`，两根线交叉连到 Generation 1 |
| 2:26–2:39 | pitfall | 飞过去，z 1.0 | 三个调用并发，b → c → a 完成；结果按完成顺序落到右侧三个槽位，故意和发起顺序错开。下面三块配对方式依次出现：按下标（三条红线，全错位）→ 按工具名（九根线缠成一团）→ 按 `call_id`（三根绿线对上） |
| 2:39–2:55 | hook 回环 | 长距离飞回，途经标题，dip 0.35 | WebUI 里的记录逐条挂上蓝色 `gen_0X` 标签，THINKING 淡出；162.8s 起收成三组折叠卡（3 / 2 / 0 个调用）。镜头拉远，WebUI 和 Codex 并排，各挂一块名牌："执行数据模型" / "UI 展示策略" |
| 2:55–3:00 | 屏幕层 | 不动 | 片尾：巨大的"不是。"、三条结论标签、`generation_id` 的做法、三条参考资料，178.9s 淡到黑场 |

## 删掉和压缩的内容（为了 3 分钟）

- 官方五步流程图：S3 的轨道就是它的动画版，不再单独放图。
- 四个坑只保留"Tool Result 必须关联回原始 Tool Call"，因为它最能演出来，又和 `call_id` 主线直接相关；另外三个（并发由 Runtime 决定、重试幂等、分开记录 attempt）用片尾的一句话带过。
- Agent Span / Handoff 只在 Trace 段落出现一次，不展开。

## 待确认的事实

- "1 个 Turn、11 个 Generation、10 个 Tool Span"沿用原文说法；建议再对一次 Tracing 文档原文。
- Trace 的行名、层级和耗时照 Cookbook 截图；时间轴色条长度是按耗时估的示意，不是原始数据。
