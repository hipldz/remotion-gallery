# 背景音乐

本片使用 Scott Buckley 的 **A Kind Of Hope**。

- 项目播放文件：`music.mp3`，96 kbps / 44.1 kHz / 立体声，保留完整 5:42.6。
- 相比工程原有的 128 kbps 版本（5.48 MB），现为 4.11 MB，节省 1.37 MB（约 25%）。
- 当前工程未保留单独的 320 kbps 原始音源；本次从原有的 128 kbps 播放文件转码，沿用此前的 4.06 dB 音量调整。播放时再以 6%–10% 的音量混入。
- 来源：[Scott Buckley 官方曲目页](https://www.scottbuckley.com.au/library/a-kind-of-hope/)。
- 授权：[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。

发布视频时，把以下音乐署名放入视频简介：

```text
'A Kind Of Hope' by Scott Buckley - released under CC-BY 4.0.
www.scottbuckley.com.au
Music compressed and volume adjusted for this video.
```

音量曲线在 `src/lib/music.ts`：普通段落最高 10%，讲解段 6%，提前 12 帧平滑压低、结束后 24 帧恢复；片头 2 秒淡入，片尾 3 秒淡出。尚未接入录音时，按分镜口播区间预留音量空间。音效开关只控制短音效，播放器的总音量控制全部声音。
