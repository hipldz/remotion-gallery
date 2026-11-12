import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

// 分镜正文是唯一的时长、旁白来源；不会改写 Storyboard.md。
const source = readFileSync(new URL('../Storyboard.md', import.meta.url), 'utf8');
const narrationSection = source.split('## 6.')[1].split('## 7.')[0];
const narrations = Object.fromEntries([...narrationSection.matchAll(/^([PZABCDFG]\d{2})[ \t]+(.+)$/gm)].map(([, id, text]) => [id, text.trim()]));
const chapters = { P: '冷开场', Z: '第 0 话', A: '第 1 话', B: '第 2 话', C: '第 3 话', D: '第 4 话', F: '第 5 话', G: '终话' };
const shots = [...source.matchAll(/^#### ([PZABCDFG]\d{2}) · ([^\r\n]+)\r?\n([\s\S]*?)(?=^#### |^### |^## |$(?![\s\S]))/gm)].map(([, id, title, body]) => {
  const timing = body.match(/· (\d+)f · (\d+)–(\d+)/);
  if (!timing) throw new Error(`Missing timing: ${id}`);
  return {
    id,
    title: title.trim(),
    chapter: chapters[id[0]],
    chapterKey: id[0],
    minFrames: Number(timing[1]),
    animationFrames: Number(body.match(/动画基准 (\d+)f/)?.[1] ?? timing[1]),
    originalFrom: Number(timing[2]),
    kind: body.includes('`CARD`') ? 'CARD' : body.slice(0, body.indexOf('\n')).includes('WORLD') ? 'WORLD' : 'INSERT',
    elastic: body.includes('⏱弹性'),
    narration: narrations[id] ?? '',
    voOffset: id === 'P01' ? 10 : 9,
  };
});
const totalFrames = shots.reduce((sum, s) => sum + s.minFrames, 0);
if (shots.length !== 39 || totalFrames !== 7200) throw new Error('Storyboard timing changed. Review the 39-shot baseline.');
mkdirSync(new URL('../src/data/', import.meta.url), { recursive: true });
writeFileSync(new URL('../src/data/shots.json', import.meta.url), `${JSON.stringify(shots, null, 2)}\n`);
console.log(`Synced ${shots.length} shots / ${totalFrames} frames / ${totalFrames / 30} seconds.`);
