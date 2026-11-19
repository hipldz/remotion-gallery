import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { ASSETS, CAPTIONS, CHAPTERS, DURATION, FPS, SHOTS, TRANSITION } from "../src/data/story";

assert.equal(SHOTS.length, 20);
assert.equal(SHOTS[0].start, 0);
assert.equal(SHOTS.at(-1)!.start + SHOTS.at(-1)!.duration, DURATION);
assert.equal(DURATION / FPS, 178);
let seriesDuration = 0;
for (const [i, shot] of SHOTS.entries()) {
  if (i > 0) assert.equal(shot.start, SHOTS[i - 1].start + SHOTS[i - 1].duration, `${shot.id}: timeline gap`);
  seriesDuration += shot.duration + (i ? TRANSITION / 2 : 0) + (i === SHOTS.length - 1 ? 0 : TRANSITION / 2);
  assert.ok(shot.duration > TRANSITION);
}
seriesDuration -= (SHOTS.length - 1) * TRANSITION;
assert.equal(seriesDuration, DURATION, "Transition handles must preserve exactly 5340 frames");
for (const [i, cue] of CAPTIONS.entries()) {
  assert.ok(cue.start < cue.end);
  if (i > 0) assert.ok(cue.start >= CAPTIONS[i - 1].end, "Caption overlap");
  assert.ok(cue.end <= DURATION);
  const shot = SHOTS.find((s) => s.id === cue.shot)!;
  assert.ok(cue.start >= shot.start && cue.end <= shot.start + shot.duration);
  assert.ok(cue.text.length < 55, "Captions must fit a single safe-area line");
}
assert.equal(CHAPTERS.length, 7);
for (const asset of Object.values(ASSETS)) assert.ok(existsSync(join("public", asset.file)), `Missing ${asset.file}`);
for (const font of ["noto-sans-sc", "outfit", "jetbrains-mono"]) {
  assert.ok(existsSync(`public/fonts/${font}.woff2`), `Missing font: ${font}`);
  assert.ok(existsSync(`public/fonts/${font}-OFL.txt`), `Missing font license: ${font}`);
}
const music = "public/audio/calming-ambient-technology.mp3";
assert.ok(existsSync(music), `Missing background music: ${music}`);
const probe = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", music], {
  encoding: "utf8",
});
if (probe.error) throw new Error("无法运行 ffprobe，请安装 FFmpeg 并加入 PATH。", { cause: probe.error });
assert.equal(probe.status, 0, probe.stderr);
const audioDuration = Number(probe.stdout.trim());
assert.ok(
  Number.isFinite(audioDuration) && Math.abs(audioDuration - DURATION / FPS) < 0.1,
  `Background music must cover ${DURATION / FPS}s; got ${audioDuration}s`,
);
console.log(`OK: 20 shots, 7 chapters, 5340 frames, ${CAPTIONS.length} caption cues; all assets local; background music ${audioDuration}s.`);
