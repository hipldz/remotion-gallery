// 把 captions.json 导出成 SRT（没有配音，也可以当"屏幕文字稿"用）。
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const captions = JSON.parse(fs.readFileSync(path.join(root, "src/film/captions.json"), "utf8"));

const ts = (s) => {
  const ms = Math.round(s * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  const rest = ms % 1000;
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(h)}:${p(m)}:${p(sec)},${p(rest, 3)}`;
};

const body = captions
  .map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n`)
  .join("\n");

fs.mkdirSync(path.join(root, "production"), {recursive: true});
const out = path.join(root, "production/film.zh-CN.srt");
fs.writeFileSync(out, body, "utf8");
console.log(`✓ ${out}`);
