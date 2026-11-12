import { defineConfig, type Plugin } from 'vite';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import sirv from 'sirv';
import { createVoiceoverMiddleware } from 'remotion-voiceover/server';
import { readVoiceTimeline } from './scripts/voiceover-files';
import { createVoiceoverProject } from './src/voiceover.config';

async function listFiles(directory: string, prefix = ''): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => (entry.isDirectory() ? listFiles(path.join(directory, entry.name), `${prefix}${entry.name}/`) : [`${prefix}${entry.name}`])),
  );
  return nested.flat().filter((name) => !name.endsWith('.md'));
}

export function projectAssetsPlugin(publicDir = path.resolve('public')): Plugin {
  const narrationDir = path.join(publicDir, 'narration');
  let signature = '';
  let voiceover: ReturnType<typeof createVoiceoverMiddleware> | undefined;
  return {
    name: 'local-project-assets-and-voiceover',
    config: () => ({
      server: {
        watch: {
          ignored: [
            '**/build/**',
            '**/.cache/**',
            path.join(narrationDir, 'manifest.json').replaceAll('\\', '/'),
            path.join(narrationDir, 'voice-*.wav').replaceAll('\\', '/'),
            path.join(narrationDir, 'manifest-*.tmp').replaceAll('\\', '/'),
          ],
        },
      },
    }),
    configureServer(server) {
      server.middlewares.use('/api/voiceover', (req, res) => {
        try {
          // External VO can extend elastic shots. Resolve the same edit used by
          // Player/Studio instead of saving recordings against a stale range.
          const project = createVoiceoverProject(readVoiceTimeline(publicDir));
          const nextSignature = JSON.stringify(project);
          if (!voiceover || signature !== nextSignature) {
            voiceover = createVoiceoverMiddleware({ project, projectRoot: path.dirname(publicDir), publicDir });
            signature = nextSignature;
          }
          void voiceover(req, res);
        } catch (error) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
        }
      });
      // Ignoring generated files prevents a page reload from losing a take.
      // Serve them on demand so newly saved WAVs are available immediately.
      server.middlewares.use('/narration', sirv(narrationDir, { dev: true, extensions: [] }));
      server.middlewares.use('/__project/assets', async (_req, res) => {
        try {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify(await listFiles(publicDir)));
        } catch (error) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: String(error) }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [projectAssetsPlugin()],
  build: { outDir: 'build/preview' },
});
