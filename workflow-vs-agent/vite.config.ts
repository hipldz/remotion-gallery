import { defineConfig } from "vite";
import { resolve } from "node:path";
import { voiceoverPlugin } from "remotion-voiceover/server";
import { voiceoverProject } from "./src/voiceover.config";

export default defineConfig({
  optimizeDeps: {include: ['react/jsx-runtime', 'react/jsx-dev-runtime']},
  plugins: [
    voiceoverPlugin({ project: voiceoverProject, projectRoot: resolve(".") }),
  ],
  server: {
    host: "127.0.0.1",
    port: 4175,
    strictPort: true,
    watch: { ignored: ["**/build/**", "**/.cache/**"] },
  },
});
