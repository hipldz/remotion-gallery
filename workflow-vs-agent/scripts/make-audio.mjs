import { mkdirSync, writeFileSync } from "node:fs";

// Original procedural score: no external music files or voice recordings.
const rate = 22050;
const output = new URL("../public/audio/", import.meta.url);
mkdirSync(output, { recursive: true });
const tau = Math.PI * 2;
const sine = (f, t) => Math.sin(tau * f * t);
const noise = (t) => Math.sin(t * 123457.17) * Math.sin(t * 79871.31);
function wav(name, duration, sample) {
  const count = Math.round(rate * duration);
  const buffer = Buffer.alloc(44 + count * 2);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + count * 2, 4);
  buffer.write("WAVEfmt ", 8);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(rate, 24);
  buffer.writeUInt32LE(rate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(count * 2, 40);
  for (let i = 0; i < count; i++) buffer.writeInt16LE(Math.round(Math.max(-0.98, Math.min(0.98, sample(i / rate))) * 32767), 44 + i * 2);
  writeFileSync(new URL(`${name}.wav`, output), buffer);
}
const tone = (f, t, decay = 4) => (t < 0 ? 0 : (sine(f, t) + 0.25 * sine(f * 2, t) + 0.08 * sine(f * 3, t)) * Math.exp(-t * decay) * Math.min(1, t * 200));
function score(name, notes, rhythm, strength = 1) {
  wav(name, 9.6, (t) => {
    const beat = Math.floor(t / 0.6);
    const phase = t % 0.6;
    const f = notes[beat % notes.length];
    const piano = tone(f, phase, 5) * 0.13;
    const pad = (notes.reduce((sum, n) => sum + sine(n / 2, t), 0) / notes.length) * 0.07 * Math.sin((Math.PI * t) / 9.6) ** 2;
    const kick = rhythm ? sine(58 + 70 * Math.exp(-phase * 40), phase) * Math.exp(-phase * 25) * 0.12 : 0;
    const hat = rhythm ? noise(t) * Math.exp(-(t % 0.3) * 100) * 0.028 : 0;
    return (piano + pad + kick + hat) * strength * Math.min(1, (9.6 - t) / 0.12);
  });
}
score("piano", [261.626, 329.628, 391.995, 523.251], false);
score("pulse-major", [261.626, 329.628, 391.995, 493.883], true);
score("pulse-minor", [220, 261.626, 329.628, 440], true);
score("finale", [261.626, 329.628, 391.995, 523.251, 659.255, 783.991, 659.255, 523.251], true, 1.2);
wav("drone", 8, (t) => (sine(110, t) + sine(220, t) * 0.22) * Math.sin((Math.PI * t) / 8) ** 2 * 0.12);
wav("click", 0.15, (t) => tone(1400, t, 60) * 0.28);
wav("pop", 0.26, (t) => sine(650 + 850 * Math.exp(-t * 20), t) * Math.exp(-t * 22) * 0.25);
wav("stamp", 0.6, (t) => (sine(63, t) * Math.exp(-t * 11) + noise(t) * Math.exp(-t * 70) * 0.4) * 0.45);
wav("swipe", 0.4, (t) => noise(t) * Math.sin((Math.PI * t) / 0.4) ** 2 * 0.15);
wav("guard", 0.85, (t) => (tone(775, t, 12) + tone(1140, t, 10) + tone(1695, t, 17)) * 0.18);
wav("swell", 1.4, (t) => (sine(110, t) + sine(165, t) * 0.3) * Math.sin((Math.PI * t) / 1.4) ** 2 * 0.15);
console.log("已生成 100 BPM 合成配乐与 6 种提示音，无配音。");
