import storyboard from "../storyboard.md";

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

const width = (text: string) => Array.from(text).reduce(
  (sum, character) => sum + (/^[\x00-\x7f]$/.test(character) ? 0.48 : 1),
  0,
);

function captionLines(narration: string) {
  const sentences = narration.match(/[^。？！]+[。？！]?/g) ?? [];
  return sentences.flatMap((sentence) => {
    if (width(sentence) <= 36) return [sentence.trim()];
    const lines: string[] = [];
    let line = "";
    for (const phrase of sentence.match(/[^，、；]+[，、；]?/g) ?? []) {
      if (line && width(line + phrase) > 36) {
        lines.push(line.trim());
        line = "";
      }
      line += phrase;
    }
    if (line.trim()) lines.push(line.trim());
    return lines;
  }).filter(Boolean);
}

const headings = /^### (S\d{2}) · (.+)\r?\n\r?\n(\d+):(\d+)–(\d+):(\d+) · (\d+) 秒\s+\*\*口播\*\*\s+([\s\S]*?)\s+\*\*画面与调度\*\*/gm;

export const shots = Array.from(storyboard.matchAll(headings), (match) => {
  const [, id, title, startMinute, startSecond, endMinute, endSecond, seconds, spoken] = match;
  const from = (Number(startMinute) * 60 + Number(startSecond)) * FPS;
  const to = (Number(endMinute) * 60 + Number(endSecond)) * FPS;
  const duration = to - from;
  if (duration <= 0 || duration !== Number(seconds) * FPS) {
    throw new Error(`请检查 ${id} 的分镜时间码`);
  }
  const captions = captionLines(spoken.replace(/`/g, "").replace(/\s+/g, " ").trim());
  const weights = captions.map((line) => Math.max(3.5, width(line)) + 1.3);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const lastFrame = duration - 14;
  let weightSoFar = 0;
  const cues = captions.map((text, index) => {
    const start = 10 + Math.round(weightSoFar / total * (lastFrame - 10));
    weightSoFar += weights[index];
    const end = 10 + Math.round(weightSoFar / total * (lastFrame - 10));
    return { text, start, end };
  });
  return { id, title, from, duration, cues };
});

if (shots.length !== 12 || shots.some((shot, index) =>
  shot.from !== (index === 0 ? 0 : shots[index - 1].from + shots[index - 1].duration),
)) {
  throw new Error("Storyboard 必须包含 12 个连续镜头");
}

const last = shots[shots.length - 1];
export const TOTAL_FRAMES = last.from + last.duration;
export type Shot = (typeof shots)[number];
