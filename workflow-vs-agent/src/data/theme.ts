import storyboard from "./storyboard.json";

export const C = {
  blue: "#4285F4",
  red: "#EA4335",
  yellow: "#FBBC05",
  green: "#34A853",
  ink: "#202124",
  gray: "#9AA0A6",
  line: "#DADCE0",
  paper: "#F8F9FA",
  white: "#FFFFFF",
} as const;
export const FONT = 'Outfit, "Noto Sans SC", sans-serif';
export const MONO = '"JetBrains Mono", monospace';
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const DURATION = Math.round(storyboard.chapters.at(-1)!.end * FPS);
