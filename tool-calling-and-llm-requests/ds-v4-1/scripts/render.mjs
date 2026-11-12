// 渲染包装器：把临时目录放进工程内。
// 某些 Windows 机器上 ffmpeg 无法写入系统 Temp（Permission denied），
// 这个脚本把 TEMP/TMP 指到 ./.tmp，再调用 Remotion CLI。
import {spawn} from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const tmp = path.join(root, ".tmp");
fs.mkdirSync(tmp, {recursive: true});

const cli = path.join(root, "node_modules/@remotion/cli/remotion-cli.js");
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("用法: node scripts/render.mjs <输出文件> [...remotion 参数]");
  process.exit(1);
}

const child = spawn(
  process.execPath,
  [cli, "render", "src/index.ts", "ToolCallFilm", ...args],
  {
    cwd: root,
    stdio: "inherit",
    env: {...process.env, TEMP: tmp, TMP: tmp, TMPDIR: tmp},
  },
);

child.on("exit", (code) => process.exit(code ?? 1));
