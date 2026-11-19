import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const checkOnly = process.argv.includes("--check");
const sourceExists = existsSync(new URL("storyboard.md", root));
if (!sourceExists && !checkOnly)
  throw new Error(
    "缺少 storyboard.md 原稿。请先恢复原稿，再同步分镜；现有 src/data/storyboard.json 保持不变。",
  );
const text = sourceExists
  ? readFileSync(new URL("storyboard.md", root), "utf8")
  : "";
const stored = checkOnly
  ? JSON.parse(readFileSync(new URL("src/data/storyboard.json", root), "utf8"))
  : undefined;
const seconds = (tc) =>
  tc.split(":").reduce((total, part) => total * 60 + Number(part), 0);
const chapters = sourceExists
  ? [
      ...text.matchAll(
        /^### 第 (\d+) 幕 · (.+?)（([\d:.]+)\s*–\s*([\d:.]+)）/gm,
      ),
    ].map((m) => ({
      index: Number(m[1]),
      title: m[2],
      start: seconds(m[3]),
      end: seconds(m[4]),
    }))
  : stored.chapters;
const headings = [
  ...text.matchAll(
    /^\*\*(S(\d+)-\d+)｜([\d:.]+)–([\d:.]+)｜(\d+)s｜(.+?)\*\*/gm,
  ),
];
const shots = sourceExists
  ? headings.map((m, i) => {
      const body = text.slice(
        m.index + m[0].length,
        headings[i + 1]?.index ?? text.indexOf("## 四、声音"),
      );
      const subtitles = [
        ...body.matchAll(/`\[([\d:.]+)–([\d:.]+)\]\s*(.+?)`/g),
      ].map((sub) => ({
        start: seconds(sub[1]),
        end: seconds(sub[2]),
        text: sub[3],
      }));
      const camera = body.match(/- \*\*运镜\*\*：(.+)/)?.[1] ?? "章节卡";
      return {
        id: m[1],
        act: Number(m[2]),
        start: seconds(m[3]),
        end: seconds(m[4]),
        title: m[6],
        camera,
        subtitles,
      };
    })
  : stored.shots;
if (!shots.length || !chapters.length)
  throw new Error("未找到分镜。请检查 storyboard.md 的镜头标题格式。");
for (const [i, chapter] of chapters.entries()) {
  if (chapter.index !== i || chapter.start !== (chapters[i - 1]?.end ?? 0) || chapter.end <= chapter.start)
    throw new Error(`第 ${i} 幕时间轴不连续`);
}
for (const [i, shot] of shots.entries()) {
  if (shot.start !== (shots[i - 1]?.end ?? 0) || shot.end <= shot.start)
    throw new Error(`${shot.id} 时间轴不连续`);
  const chapter = chapters[shot.act];
  if (!chapter || shot.start < chapter.start || shot.end > chapter.end)
    throw new Error(`${shot.id} 超出章节范围`);
  for (const cue of shot.subtitles) {
    if (
      cue.start < shot.start ||
      cue.end > shot.end ||
      cue.end - cue.start < 2.4 - 0.001
    )
      throw new Error(`${shot.id} 字幕时间不符合要求`);
  }
}
if (shots.at(-1).end !== chapters.at(-1).end) throw new Error("片尾与最后一幕的时长不一致");
if (checkOnly) {
  if (
    sourceExists &&
    JSON.stringify(stored) !== JSON.stringify({ chapters, shots })
  )
    throw new Error("分镜已更新，请运行 npm run sync:storyboard");
  console.log(
    `${sourceExists ? "分镜同步有效" : "未附 storyboard.md，已校验现有 storyboard.json"}：${chapters.length} 幕、${shots.length} 镜、${shots.at(-1).end} 秒；时间连续、字幕均不少于 2.4 秒。`,
  );
  process.exit(0);
}
mkdirSync(new URL("src/data/", root), { recursive: true });
mkdirSync(new URL("public/captions/", root), { recursive: true });
writeFileSync(
  new URL("src/data/storyboard.json", root),
  `${JSON.stringify({ chapters, shots }, null, 2)}\n`,
);
const srtTime = (s) => {
  const ms = Math.round(s * 1000);
  return `${String(Math.floor(ms / 3600000)).padStart(2, "0")}:${String(Math.floor(ms / 60000) % 60).padStart(2, "0")}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`;
};
writeFileSync(
  new URL("public/captions/workflow-vs-agent.srt", root),
  shots
    .flatMap((s) => s.subtitles)
    .map(
      (c, i) =>
        `${i + 1}\n${srtTime(c.start)} --> ${srtTime(c.end)}\n${c.text.replaceAll("**", "")}\n`,
    )
    .join("\n"),
);
console.log(
  `${fileURLToPath(root)}: ${chapters.length} 幕 / ${shots.length} 镜 / ${shots.at(-1).end}s / ${shots.reduce((n, s) => n + s.subtitles.length, 0)} 条字幕`,
);
console.log(
  "按当前详细分镜时间轴同步。",
);
