// 按关键时间点截帧，方便不渲染整片就检查画面。用法：npm run stills  或  node scripts/stills.mjs 34.5 72
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';

const FPS = 60;
const DEFAULT = [
  [3, 'S1-webui-long'], [11.6, 'S1-codex-redbox'], [15.8, 'S1-guess'], [19.0, 'S1-gpt'],
  [27.8, 'S2-question'], [37.5, 'S3-one-response-three-calls'], [42, 'S3-results'], [56, 'S3-overview'],
  [60.5, 'S3-loop'], [74, 'S4-json-three-vars'], [77, 'S4-same-response-id'], [85, 'S4-zero-one-many'],
  [96.5, 'S5-hosted'], [101.5, 'S5-neq'], [110, 'S6-trace-gen'], [119.5, 'S6-trace-stat'],
  [133, 'S7-tree'], [137.5, 'S7-provider-ids'], [142.5, 'S7-cross-section'], [150, 'S8-race'],
  [153.6, 'S8-by-name'], [157.5, 'S8-by-call-id'], [170, 'S9-grouped'], [174, 'S9-roles'], [178, 'S9-endcard'],
];
const args = process.argv.slice(2).map(Number).filter((n) => !Number.isNaN(n));
const list = args.length ? args.map((s) => [s, `t${String(s).replace('.', '_')}`]) : DEFAULT;
fs.mkdirSync('output/stills', {recursive: true});
for (const [sec, name] of list) {
  const frame = Math.round(sec * FPS);
  const file = `output/stills/${String(frame).padStart(5, '0')}-${name}.png`;
  console.log(`→ ${file}`);
  const r = spawnSync('npx', ['remotion', 'still', 'src/index.ts', 'ToolCallFilm', file, `--frame=${frame}`], {stdio: 'inherit', shell: true});
  if (r.status !== 0) process.exit(r.status ?? 1);
}
