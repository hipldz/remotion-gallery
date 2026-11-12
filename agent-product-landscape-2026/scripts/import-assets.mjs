import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const source = process.argv[2];
const result = spawnSync('python', [fileURLToPath(new URL('./prepare-assets.py', import.meta.url)), ...(source ? [source] : [])], {
  stdio: 'inherit',
  env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
});
process.exit(result.status ?? 1);
