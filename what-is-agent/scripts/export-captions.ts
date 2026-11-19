import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CAPTIONS, SCENES } from "../src/timeline";
import { FPS } from "../src/theme";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "public/captions/what-is-agent.srt");
mkdirSync(dirname(out), { recursive: true });

const srtTime = (frame: number) => {
  const totalMs = Math.round((frame / FPS) * 1000);
  const hours = Math.floor(totalMs / 3_600_000);
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
  const seconds = Math.floor((totalMs % 60_000) / 1000);
  const millis = totalMs % 1000;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")},${String(millis).padStart(3, "0")}`;
};

const lines = CAPTIONS.map((cue, index) => {
  const scene = SCENES.find((item) => item.id === cue.scene);
  return `${index + 1}\n${srtTime(cue.from)} --> ${srtTime(cue.to)}\n[${cue.scene}${scene ? ` · ${scene.label}` : ""}] ${cue.text}\n`;
}).join("\n");

writeFileSync(out, lines, "utf8");
console.log(`Wrote ${CAPTIONS.length} cues to ${out}`);
