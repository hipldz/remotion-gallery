import { mkdirSync, writeFileSync } from 'node:fs';

const directory = new URL('../public/sfx/', import.meta.url);
mkdirSync(directory, { recursive: true });
const rate = 44100;
for (const name of ['pop', 'impact', 'swoosh']) {
  const seconds = name === 'swoosh' ? 0.4 : name === 'impact' ? 0.22 : 0.12;
  const count = Math.ceil(rate * seconds);
  const output = Buffer.alloc(44 + count * 2);
  output.write('RIFF', 0);
  output.writeUInt32LE(output.length - 8, 4);
  output.write('WAVEfmt ', 8);
  output.writeUInt32LE(16, 16);
  output.writeUInt16LE(1, 20);
  output.writeUInt16LE(1, 22);
  output.writeUInt32LE(rate, 24);
  output.writeUInt32LE(rate * 2, 28);
  output.writeUInt16LE(2, 32);
  output.writeUInt16LE(16, 34);
  output.write('data', 36);
  output.writeUInt32LE(count * 2, 40);
  let seed = 91271;
  for (let i = 0; i < count; i++) {
    const t = i / rate;
    const p = i / count;
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    const noise = seed / 2147483648;
    const envelope = Math.sin(Math.PI * p) ** 2;
    let sample = 0;
    if (name === 'pop') sample = Math.sin(2 * Math.PI * (650 * t - 1400 * t * t)) * Math.exp(-t * 38) * 0.7;
    if (name === 'impact') sample = (Math.sin(2 * Math.PI * 78 * t) * 0.65 + noise * 0.25) * Math.exp(-t * 21);
    if (name === 'swoosh') sample = noise * envelope * 0.3;
    const ramp = Math.min(1, i / 50) * Math.min(1, (count - i) / 80);
    output.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(sample * ramp * 26000))), 44 + i * 2);
  }
  writeFileSync(new URL(`${name}.wav`, directory), output);
}
console.log('Created three original, deterministic synthetic sound effects.');
