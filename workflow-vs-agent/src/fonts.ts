import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const fontsReady = Promise.all([
  loadFont({ family: "Noto Sans SC", url: staticFile("fonts/noto-sans-sc.woff2"), weight: "100 900" }),
  loadFont({ family: "Outfit", url: staticFile("fonts/outfit.woff2"), weight: "100 900" }),
  loadFont({ family: "JetBrains Mono", url: staticFile("fonts/jetbrains-mono.woff2"), weight: "100 800" }),
]);
