import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

let started = false;
export const ensureFonts = () => {
  if (started) return;
  started = true;
  for (const [family, file] of [
    ["Noto Sans SC", "noto-sans-sc.woff2"],
    ["Outfit", "outfit.woff2"],
    ["JetBrains Mono", "jetbrains-mono.woff2"],
  ]) {
    loadFont({ family, url: staticFile(`fonts/${file}`), weight: "100 900" });
  }
};

export const FONT = {
  sans: '"Outfit", "Noto Sans SC", sans-serif',
  chinese: '"Noto Sans SC", sans-serif',
  mono: '"JetBrains Mono", monospace',
};
