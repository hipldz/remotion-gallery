import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync, renameSync, unlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { script, speechRate, activationHash } from '../production/cinematic-script.mjs';

const root = new URL('../', import.meta.url);
const latest = JSON.parse(readFileSync(new URL('production/editor-source.json', root), 'utf8'));
const original = JSON.parse(readFileSync(new URL('production/cinematic-base.json', root), 'utf8'));
const labels = {
  P: '开场',
  Z: '读图',
  A: '回答与补全',
  B: '接上工具',
  C: '工作环境',
  D: '交代任务与验收',
  E: '研究与办公',
  F: '工作台与长任务',
  G: '回顾与选择',
};
const FPS = 30;
const spokenFrames = (text) => {
  const chinese = (text.match(/[\u3400-\u9fff]/g) ?? []).length;
  const digits = (text.match(/[0-9]/g) ?? []).length;
  const english = (text.match(/[A-Za-z]+(?:[.'-][A-Za-z]+)*/g) ?? []).reduce((sum, word) => sum + Math.max(0.35, word.length * 0.085), 0);
  const pauses = (text.match(/[，,。.!！？?：:；;]/g) ?? []).length * 0.13;
  return Math.max(45, Math.ceil((chinese / speechRate + digits / 4 + english + pauses + 0.15) * FPS));
};
const used = new Set();
let cursor = 0;
const shots = script.map((entry, i) => {
  const design = original[i];
  assert.equal(entry.id, design.id, 'Keep the original cinematic shot order');
  const voOffset = entry.cues.length ? 15 : 0;
  const tailFrames = entry.cues.length ? 24 : 0;
  let frame = voOffset;
  const cues = entry.cues.map((input) => {
    const editorIndex = typeof input === 'number' ? input : undefined;
    if (editorIndex !== undefined) {
      assert.ok(latest.captions[editorIndex] && !used.has(editorIndex));
      used.add(editorIndex);
    }
    const text = editorIndex === undefined ? input : latest.captions[editorIndex].text;
    const cue = {
      text,
      startFrame: frame,
      endFrame: frame + spokenFrames(text),
      beatId: 'cinematic',
      focus: 0,
      ...(editorIndex === undefined ? {} : { editorIndex }),
    };
    frame = cue.endFrame + 5;
    return cue;
  });
  const minFrames = cues.length ? frame - 5 + tailFrames : entry.id === 'P07' ? 90 : 72;
  const shot = {
    ...design,
    chapter: labels[design.chapterKey],
    originalFrom: cursor,
    minFrames,
    elastic: !!cues.length,
    narration: cues.map((cue) => cue.text).join('／'),
    voOffset,
    tailFrames,
    cues,
    motion: entry.motion,
  };
  cursor += minFrames;
  return shot;
});
assert.equal(used.size, latest.captions.length, 'Retain every original vendor-edited sentence');
const duration = (frames) => `${Math.floor(frames / 1800)}:${String(Math.floor(frames / 30) % 60).padStart(2, '0')}`;
const captions = shots.flatMap((shot) =>
  shot.cues.map((cue) => ({ text: cue.text, startFrame: shot.originalFrom + cue.startFrame, endFrame: shot.originalFrom + cue.endFrame, sceneId: shot.id })),
);
console.log(
  `${shots.length} original cinematic shots / ${captions.length} captions / ${duration(cursor)} / ${cursor} frames. All ${used.size} vendor-edited originals retained.`,
);
if (process.argv.includes('--measure')) process.exit(0);
assert.ok(cursor >= 7 * 60 * FPS && cursor <= 8 * 60 * FPS, 'The initial edit must stay within the requested 7–8 minutes');
const chapterTable = Object.keys(labels)
  .map((key) => {
    const selection = shots.filter((shot) => shot.chapterKey === key);
    return `| ${labels[key]} | ${duration(selection[0].originalFrom)} | ${duration(selection.reduce((total, shot) => total + shot.minFrames, 0))} |`;
  })
  .join('\n');
const storyboard = `# AI 工具这几年，是怎么变的？ · 7–8 分钟动效版

${shots.length} 镜 / 9 章 / ${duration(cursor)} / ${cursor} 帧 / 1920×1080 / 30fps。

以 vendor 编辑器保存的最新版为文字基础，保留全部 ${latest.captions.length} 条原编辑句子；新增必要的解释与承接。保持原版时间线穿梭、截图翻转、光球跳跃、请求往返、任务环绕和章节色条。动效根据实际字幕切点进入下一段，进入之后保持阅读画面。每句正文与时间的当前值以 public/narration/manifest.json 为准，编辑器保存后不会被初始稿同步覆盖。

## 章节

| 章节 | 入点 | 时长 |
|---|---|---|
${chapterTable}

## 逐镜口播

${shots
  .map(
    (shot) => `### ${shot.id} · ${shot.title}

${shot.chapter} / ${duration(shot.originalFrom)} / ${(shot.minFrames / FPS).toFixed(1)} 秒 / ${shot.kind}

${shot.cues.length ? shot.cues.map((cue) => cue.text).join('\n\n') : '无旁白，沿用原版片名或章节动效。'}`,
  )
  .join('\n\n')}

## 时间和动效

基础口播按每秒约 ${speechRate} 个汉字估时，另计英文、数字与标点。开头留 0.5 秒，句间约 0.17 秒，末尾留 0.8 秒；实际朗读可以继续逐句打点。特效的进入速度单独安排，不把整段动画拉伸到口播长度。Cursor/Aider、Cowork/OpenClaw、工具请求/返回、修改/测试/交付等关键动作按所属句子的实际时间触发。字幕始终覆盖在画面和转场上，片尾等最后一句字幕结束后再淡出。

截图、裁切和原图校验值沿用 production/assets.json 与 source-provenance.json；补充概念依据见 production/SOURCES.md。
`;
const outputs = [
  ['src/data/shots.json', JSON.stringify(shots, null, 2) + '\n'],
  ['Storyboard.md', storyboard],
];
if (process.argv.includes('--check')) {
  for (const [file, expected] of outputs) assert.equal(readFileSync(new URL(file, root), 'utf8'), expected, `${file} needs npm run sync:storyboard`);
} else for (const [file, value] of outputs) writeFileSync(new URL(file, root), value);
if (process.argv.includes('--activate')) {
  const target = new URL('public/narration/manifest.json', root);
  const previous = readFileSync(target);
  assert.equal(
    createHash('sha256').update(previous).digest('hex'),
    activationHash,
    'The editor changed after capture; preserve the new edits before switching',
  );
  const manifest = JSON.parse(previous.toString('utf8'));
  assert.equal(manifest.tracks.length, 0, 'Preserve recorded audio before replacing its narration script');
  const timeline = {
    fps: FPS,
    durationInFrames: cursor,
    scenes: shots.map((shot) => ({ id: shot.id, title: shot.title, from: shot.originalFrom, durationInFrames: shot.minFrames, recordable: !!shot.narration })),
    captions,
  };
  const temporary = new URL('public/narration/manifest-cinematic.tmp', root);
  const content = JSON.stringify({ version: 1, timeline, tracks: manifest.tracks }, null, 2) + '\n';
  if (existsSync(temporary)) assert.equal(readFileSync(temporary, 'utf8'), content, 'Keep an unrelated temporary file intact');
  else writeFileSync(temporary, content, { flag: 'wx' });
  try {
    renameSync(temporary, target);
  } catch (error) {
    if (process.platform !== 'win32' || error.code !== 'EPERM') throw error;
    assert.equal(createHash('sha256').update(readFileSync(target)).digest('hex'), activationHash);
    writeFileSync(target, content);
    unlinkSync(temporary);
  }
}
