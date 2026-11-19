// 无依赖校验：字幕时间轴 + 阅读速度 + 高亮词 + 时长。用法：node scripts/validate.mjs
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const caps = JSON.parse(fs.readFileSync(path.join(root, 'src/film/captions.json'), 'utf8'));
const DURATION = 180;
const MAX_RATE = 6.6; // 阅读单位/秒（无配音，边看画面边读）
const COLORS = new Set(['violet', 'amber', 'blue', 'green', 'red', 'text']);

// 阅读单位：1 个汉字 = 1；1 个英文词 ≈ 0.6 + 0.07×字母数；数字 0.5
const units = (s) => {
  const cjk = (s.match(/[\u4e00-\u9fff]/g) || []).length;
  const words = s.match(/[A-Za-z_][A-Za-z0-9_./\-]*/g) || [];
  const nums = (s.match(/(?<![A-Za-z_])\d+/g) || []).length;
  return cjk + words.reduce((a, w) => a + 0.6 + 0.07 * w.length, 0) + nums * 0.5;
};

let fail = 0;
const err = (m) => { fail++; console.error('FAIL', m); };
let prevEnd = 0;
caps.forEach((c, i) => {
  const tag = `#${i + 1} [${c.start}–${c.end}] ${c.text}`;
  if (!(c.end > c.start)) err(`${tag}: end <= start`);
  if (c.start < prevEnd - 1e-9) err(`${tag}: 与上一条重叠`);
  if (c.end > DURATION) err(`${tag}: 超出 ${DURATION}s`);
  const dur = c.end - c.start;
  if (dur < 2.2) err(`${tag}: 时长 ${dur.toFixed(1)}s 太短`);
  const rate = units(c.text) / dur;
  if (rate > MAX_RATE) err(`${tag}: 阅读速度 ${rate.toFixed(1)}/s > ${MAX_RATE}`);
  for (const m of c.marks) {
    if (!c.text.includes(m.w)) err(`${tag}: 高亮词「${m.w}」不在文本里`);
    if (!COLORS.has(m.c)) err(`${tag}: 未知颜色 ${m.c}`);
  }
  prevEnd = c.end;
});

const total = caps.reduce((a, c) => a + units(c.text), 0);
const worst = caps.map((c) => ({c, r: units(c.text) / (c.end - c.start)})).sort((a, b) => b.r - a.r).slice(0, 3);
console.log(`字幕 ${caps.length} 条 · 阅读单位共 ${total.toFixed(0)} · 最快三条：`);
for (const {c, r} of worst) console.log(`  ${r.toFixed(2)}/s  ${c.text}`);

// 源码结构检查
const need = [
  'src/index.ts', 'src/Root.tsx', 'src/film/Film.tsx', 'src/film/camera.ts', 'src/film/timeline.ts',
  'src/film/zones/HookZone.tsx', 'src/film/zones/QuestionZone.tsx', 'src/film/zones/TrackZone.tsx',
  'src/film/zones/HostedZone.tsx', 'src/film/zones/TraceZone.tsx', 'src/film/zones/PitfallZone.tsx',
  'src/film/layers/Captions.tsx', 'src/film/layers/Hud.tsx', 'src/film/layers/Backdrop.tsx',
  'src/film/layers/TraceLegend.tsx', 'src/film/layers/EndCard.tsx', 'src/film/ui/primitives.tsx',
];
for (const f of need) if (!fs.existsSync(path.join(root, f))) err(`缺少文件 ${f}`);

// 不允许出现旧版的 PPT 母版元素
const srcDir = path.join(root, 'src');
const walk = (d) => fs.readdirSync(d, {withFileTypes: true}).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
for (const f of walk(srcDir)) {
  const s = fs.readFileSync(f, 'utf8');
  if (/FIELD NOTES|ff-scene-header|ff-progress/.test(s)) err(`${path.relative(root, f)}: 出现了旧版幻灯片母版元素`);
  if (/from ["']three["']|@react-three|@remotion\/three/.test(s)) err(`${path.relative(root, f)}: 不应再依赖 three.js`);
}

console.log(fail ? `\n${fail} 项失败` : '\nOK · 所有检查通过');
process.exit(fail ? 1 : 0);
