import { readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { resolveTiming, shots, voiceFileFor } from '../src/lib/timeline';

export function readVoiceTimeline(publicDir: string) {
  let files: string[];
  try {
    files = readdirSync(path.join(publicDir, 'vo')).map((name) => `vo/${name}`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    files = [];
  }
  const durations: Record<string, number> = {};
  for (const shot of shots) {
    const filename = voiceFileFor(shot.id, files);
    if (filename) durations[shot.id] = audioDuration(path.join(publicDir, filename));
  }
  return resolveTiming(durations, files);
}

function audioDuration(filename: string): number {
  if (filename.toLowerCase().endsWith('.wav')) {
    const buffer = readFileSync(filename);
    if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') throw new Error(`Unsupported WAV: ${filename}`);
    let byteRate = 0;
    let length = 0;
    for (let offset = 12; offset + 8 <= buffer.length; ) {
      const id = buffer.toString('ascii', offset, offset + 4);
      const size = buffer.readUInt32LE(offset + 4);
      if (id === 'fmt ' && size >= 16) byteRate = buffer.readUInt32LE(offset + 16);
      if (id === 'data') length += size;
      offset += 8 + size + (size % 2);
    }
    if (!byteRate || !length) throw new Error(`Invalid WAV metadata: ${filename}`);
    return length / byteRate;
  }
  const result = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', filename], {
    encoding: 'utf8',
  });
  const seconds = Number(result.stdout?.trim());
  if (result.status !== 0 || !Number.isFinite(seconds) || seconds <= 0) throw new Error(`读取 ${filename} 需要 PATH 中的 ffprobe。也可以使用 WAV 录音。`);
  return seconds;
}
