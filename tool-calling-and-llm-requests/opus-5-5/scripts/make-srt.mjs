// 由 src/film/captions.json 生成 production/film.zh-CN.srt（屏幕文字的外挂字幕版）
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const caps = JSON.parse(fs.readFileSync(path.join(root, 'src/film/captions.json'), 'utf8'));
const ts = (s) => {
  const ms = Math.round(s * 1000);
  const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
  const sec = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
  const milli = String(ms % 1000).padStart(3, '0');
  return `${h}:${m}:${sec},${milli}`;
};
const out = caps.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}${c.source ? `\n— ${c.source}` : ''}\n`).join('\n');
fs.mkdirSync(path.join(root, 'production'), {recursive: true});
fs.writeFileSync(path.join(root, 'production/film.zh-CN.srt'), out);
console.log(`wrote production/film.zh-CN.srt (${caps.length} cues)`);
