import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const presentationRoot = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(presentationRoot, "..");
const repositoryRoot = path.resolve(projectRoot, "..");
const requireFromProject = createRequire(
  path.join(projectRoot, "package.json"),
);
const sharedPackages = ["react", "react-dom", "remotion", "@remotion/player"];

export default defineConfig({
  root: presentationRoot,
  publicDir: path.join(projectRoot, "public"),
  // Shared source lives outside this project's root. Resolve peer dependencies
  // from this project's installation so React and Remotion have one instance.
  resolve: {
    alias: sharedPackages.map((name) => ({
      find: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`),
      replacement: path.dirname(
        requireFromProject.resolve(`${name}/package.json`),
      ),
    })),
    dedupe: sharedPackages,
  },
  optimizeDeps: { include: ["react/jsx-runtime", "react/jsx-dev-runtime"] },
  server: {
    host: "127.0.0.1",
    port: 4178,
    strictPort: true,
    fs: { allow: [repositoryRoot] },
    watch: { ignored: ["**/build/**", "**/.cache/**"] },
  },
  build: {
    outDir: path.join(projectRoot, "build/presentation"),
    emptyOutDir: true,
  },
});
