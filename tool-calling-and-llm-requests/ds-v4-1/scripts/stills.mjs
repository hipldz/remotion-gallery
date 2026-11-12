// 批量截帧：一次打包，渲染多个关键时间点，供人工检查画面。
// 用法：node scripts/stills.mjs            默认 1x 全尺寸
//       node scripts/stills.mjs --scale=0.5
import path from "node:path";
import fs from "node:fs";
import {bundle} from "@remotion/bundler";
import {renderStill, selectComposition} from "@remotion/renderer";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "output/stills");
fs.mkdirSync(outDir, {recursive: true});

const scaleArg = process.argv.find((a) => a.startsWith("--scale="));
const scale = scaleArg ? Number(scaleArg.split("=")[1]) : 1;

const timesArg = process.argv.find((a) => a.startsWith("--times="));
const times = timesArg
  ? timesArg
      .split("=")[1]
      .split(",")
      .map((s) => Number(s.trim()))
  : null;

const TIMES = times ?? [
  0.6, 4.2, 7.2, 10.6, 14.4, 18.8, 21.2, 25.4, 28.6, 32.4, 36.8, 41.2, 45.8,
  50.2, 55.4, 59.4, 66.2, 70.4, 77.6, 84.2, 89.4, 93.6, 100.6, 102.4, 106.6,
  111.4, 119.6, 127.4, 132.6, 141.2, 144.6, 148.4, 151.6, 157.4, 161.4, 166.4,
  173.4, 176.6,
];

const serveUrl = await bundle({entryPoint: path.join(root, "src/index.ts")});
const composition = await selectComposition({serveUrl, id: "ToolCallFilm"});
const fps = composition.fps;

let i = 0;
for (const sec of TIMES) {
  const frame = Math.round(sec * fps);
  const file = path.join(outDir, `${String(i).padStart(2, "0")}-${sec.toFixed(1)}s.png`);
  await renderStill({
    composition,
    serveUrl,
    output: file,
    frame,
    scale,
    imageFormat: "png",
  });
  console.log(`✓ ${path.basename(file)}`);
  i++;
}
console.log(`\n共 ${TIMES.length} 帧 → ${outDir}`);
