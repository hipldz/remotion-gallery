// 结构 / 字幕校验：不需要 Remotion、不需要浏览器。
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const captions = JSON.parse(fs.readFileSync(path.join(root, "src/film/captions.json"), "utf8"));

const problems = [];
const warnings = [];

const units = (s) => {
  // 中文 1 个单位；英文按整词折算；标点算半个停顿
  let n = 0;
  const tokens = s.match(/[A-Za-z0-9_.${}/-]+|[\u4e00-\u9fa5]|[^\s]/g) ?? [];
  for (const tk of tokens) {
    if (/[\u4e00-\u9fa5]/.test(tk)) n += 1;
    else if (/[A-Za-z0-9]/.test(tk)) n += Math.max(1, tk.length * 0.42);
    else n += 0.5;
  }
  return n;
};

let prevEnd = -1;
for (let i = 0; i < captions.length; i++) {
  const c = captions[i];
  const at = `#${i + 1} "${c.text}"`;
  if (!(c.start >= 0 && c.end <= 180)) problems.push(`${at}: 超出 0–180s`);
  if (c.end <= c.start) problems.push(`${at}: end <= start`);
  if (c.start < prevEnd + 0.05) problems.push(`${at}: 与上一条重叠（${prevEnd} → ${c.start}）`);
  const dur = c.end - c.start;
  if (dur < 1.0) warnings.push(`${at}: 只有 ${dur.toFixed(2)}s，读不完`);
  if (dur > 9) warnings.push(`${at}: ${dur.toFixed(2)}s，可能太拖`);
  const u = units(c.text);
  const rate = u / dur;
  if (rate > 7.2) problems.push(`${at}: 阅读速度 ${rate.toFixed(1)} 单位/秒，超过 7.2`);
  if (c.text.length > 34) warnings.push(`${at}: ${c.text.length} 字，一行可能放不下`);
  for (const m of c.marks) {
    if (!c.text.includes(m.w)) problems.push(`${at}: 高亮词 "${m.w}" 不在文本里`);
  }
  prevEnd = c.end;
}

// 结尾不能盖住片尾卡
if (prevEnd > 175.0) warnings.push(`最后一条字幕结束于 ${prevEnd}s，片尾卡 175.1s 开始`);

// 结构：9 段覆盖全片
const sections = [
  [0, 22.8],
  [22.4, 30.4],
  [30.0, 64.4],
  [64.4, 87.0],
  [87.0, 104.0],
  [103.8, 125.8],
  [125.6, 146.6],
  [146.4, 160.2],
  [159.6, 180],
];
for (let i = 1; i < sections.length; i++) {
  if (sections[i][0] > sections[i - 1][1]) problems.push(`段落 S${i + 1} 与 S${i} 之间有空洞`);
}

// 文件结构
for (const f of [
  "src/index.ts",
  "src/Root.tsx",
  "src/film/Film.tsx",
  "src/film/camera.ts",
  "src/film/zones/HookZone.tsx",
  "src/film/zones/QuestionZone.tsx",
  "src/film/zones/TrackZone.tsx",
  "src/film/zones/HostedZone.tsx",
  "src/film/zones/TraceZone.tsx",
  "src/film/zones/PitfallZone.tsx",
]) {
  if (!fs.existsSync(path.join(root, f))) problems.push(`缺少文件 ${f}`);
}

const totalUnits = captions.reduce((n, c) => n + units(c.text), 0);
const speaking = captions.reduce((n, c) => n + (c.end - c.start), 0);
console.log(`字幕 ${captions.length} 条 · 覆盖 ${speaking.toFixed(1)}s · 总阅读量 ${Math.round(totalUnits)} 单位`);
console.log(`平均阅读速度 ${(totalUnits / speaking).toFixed(2)} 单位/秒`);

if (warnings.length) {
  console.log("\n提示：");
  for (const w of warnings) console.log("  · " + w);
}
if (problems.length) {
  console.error("\n失败：");
  for (const p of problems) console.error("  ✗ " + p);
  process.exit(1);
}
console.log("\n✓ 字幕节奏与结构检查通过");
