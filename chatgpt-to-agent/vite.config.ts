import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {voiceoverPlugin} from 'remotion-voiceover/server';
import {voiceoverProject} from './src/voiceover.config';
import {resolve} from 'node:path';

export default defineConfig({
  plugins: [react(), voiceoverPlugin({project: voiceoverProject, projectRoot: resolve('.')})],
  root: 'preview',
  publicDir: '../public',
  build: {outDir: '../build/preview', emptyOutDir: true},
  server: {host: '127.0.0.1', port: 4173, strictPort: true},
});
