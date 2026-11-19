import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { DURATION, FPS } from "../src/data/story";

const source = "assets/audio/penguinmusic-calming-ambient-technology-221906.mp3";
const destination = "public/audio/calming-ambient-technology.mp3";
if (!existsSync(source)) throw new Error(`找不到原始音乐：${source}`);
mkdirSync("public/audio", { recursive: true });

const result = spawnSync(
  "ffmpeg",
  [
    "-hide_banner",
    "-loglevel",
    "error",
    "-nostdin",
    "-y",
    "-i",
    source,
    "-filter_complex",
    `[0:a]asplit=2[first][second];[first]atrim=end=104,asetpts=PTS-STARTPTS[a];[second]atrim=start=8,asetpts=PTS-STARTPTS[b];[a][b]acrossfade=d=8:c1=tri:c2=tri,atrim=duration=${DURATION / FPS},asetpts=PTS-STARTPTS[music]`,
    "-map",
    "[music]",
    "-c:a",
    "libmp3lame",
    "-b:a",
    "256k",
    "-ar",
    "44100",
    "-ac",
    "2",
    "-metadata",
    `title=Calming Ambient Technology (${DURATION / FPS}-second film edit)`,
    "-metadata",
    "artist=penguinmusic",
    destination,
  ],
  { stdio: "inherit" },
);

if (result.error) throw new Error("无法运行 FFmpeg，请先安装并加入 PATH。", { cause: result.error });
if (result.status !== 0) process.exit(result.status ?? 1);
console.log(`Saved ${destination} (${DURATION / FPS}s). Volume and fades are controlled by src/Film.tsx.`);
