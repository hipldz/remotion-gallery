import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

void Promise.all([
  loadFont({ family: "Noto Sans SC", url: staticFile("noto-sans-sc.ttf"), weight: "100 900" }),
  loadFont({ family: "Outfit", url: staticFile("outfit.woff2"), weight: "100 900" }),
  loadFont({ family: "JetBrains Mono", url: staticFile("jetbrains-mono.woff2"), weight: "100 800" }),
]);
