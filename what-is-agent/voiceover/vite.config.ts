import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { voiceoverPlugin } from "remotion-voiceover/server";
import { voiceoverProject } from "../src/voiceover.config";

const voiceoverRoot = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(voiceoverRoot, "..");
const repositoryRoot = path.resolve(projectRoot, "..");
const requireFromProject = createRequire(
  path.join(projectRoot, "package.json"),
);
const sharedPackages = ["react", "react-dom", "remotion", "@remotion/player"];

export default defineConfig({
  root: voiceoverRoot,
  publicDir: path.join(projectRoot, "public"),
  // 共享源码在工程根之外，peer 依赖统一解析到本工程，避免两份 React / Remotion。
  resolve: {
    alias: sharedPackages.map((name) => ({
      find: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`),
      replacement: path.dirname(
        requireFromProject.resolve(`${name}/package.json`),
      ),
    })),
    dedupe: sharedPackages,
  },
  plugins: [
    // 录音写入本工程的 public/narration/，与 Studio 读取同一份清单。
    voiceoverPlugin({ project: voiceoverProject, projectRoot }),
  ],
  optimizeDeps: { include: ["react/jsx-runtime", "react/jsx-dev-runtime"] },
  server: {
    host: "127.0.0.1",
    port: 4179,
    strictPort: true,
    fs: { allow: [repositoryRoot] },
    watch: { ignored: ["**/build/**", "**/.cache/**"] },
  },
  build: {
    outDir: path.join(projectRoot, "build/voiceover"),
    emptyOutDir: true,
  },
});
