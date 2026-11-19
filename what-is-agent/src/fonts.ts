import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/**
 * 字体均为本地文件，渲染时不依赖网络。
 * Noto Sans SC 使用完整字库，方便后续改词后不出现缺字。
 */
export const fontsReady = Promise.all([
  loadFont({
    family: "Noto Sans SC",
    url: staticFile("fonts/noto-sans-sc.ttf"),
    weight: "100 900",
  }),
  loadFont({
    family: "Outfit",
    url: staticFile("fonts/outfit.woff2"),
    weight: "100 900",
  }),
  loadFont({
    family: "JetBrains Mono",
    url: staticFile("fonts/jetbrains-mono.woff2"),
    weight: "100 800",
  }),
]);
