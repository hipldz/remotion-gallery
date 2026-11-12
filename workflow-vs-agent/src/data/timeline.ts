import data from "./storyboard.json";
import { FPS } from "./theme";

export type Shot = (typeof data.shots)[number];
export type Chapter = (typeof data.chapters)[number];
export const shots = data.shots;
export const chapters = data.chapters;
export const shotAt = (frame: number) => shots.find((s) => frame >= Math.round(s.start * FPS) && frame < Math.round(s.end * FPS)) ?? shots.at(-1)!;
export const timecode = (frame: number) => `${String(Math.floor(frame / FPS / 60)).padStart(2, "0")}:${String(Math.floor(frame / FPS) % 60).padStart(2, "0")}`;
export const actColor = (act: number) => (act < 3 ? "#4285F4" : act < 5 ? "#EA4335" : act < 8 ? "#34A853" : act === 10 ? "#4285F4" : "#EA4335");
