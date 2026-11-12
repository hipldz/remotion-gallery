// 一台虚拟摄像机：x/y 是画面中心对准的画布坐标，z 是缩放。
// 每个 Shot 表示"从 t 开始，用 d 秒移动到这里"。dip 会在长距离飞行时
// 先把镜头拉远、再推近，避免像切换页面。
import type {CSSProperties} from "react";
import {ZONE} from "./zones";
import {inOut, lerp, prog} from "./motion";

type Shot = {t: number; d: number; x: number; y: number; z: number; dip?: number};

const H = ZONE.hook;
const Q = ZONE.question;
const K = ZONE.track;
const HO = ZONE.hosted;
const TR = ZONE.trace;
const PF = ZONE.pitfall;

export const SHOTS: Shot[] = [
  // S1 我的 WebUI：先在左边，再右移到 Codex 原生，最后给对线留出右侧
  {t: 0, d: 0, x: H.x + 520, y: H.y + 520, z: 1.02},
  {t: 0.2, d: 8.8, x: H.x + 520, y: H.y + 512, z: 1.05},
  {t: 9.2, d: 1.7, x: H.x + 1670, y: H.y + 520, z: 1.0, dip: 0.1},
  {t: 16.4, d: 1.6, x: H.x + 2000, y: H.y + 520, z: 0.9},
  // S2 问题：全片唯一一张"标题"
  {t: 21.8, d: 2.0, x: Q.x + 650, y: Q.y + 520, z: 1.0, dip: 0.12},
  {t: 24.2, d: 5.2, x: Q.x + 650, y: Q.y + 520, z: 1.03},
  // S3 Agent Loop：镜头跟着轨道往右走
  {t: 29.3, d: 2.0, x: K.x + 700, y: K.y + 520, z: 1.0, dip: 0.1},
  {t: 40.6, d: 2.4, x: K.x + 1820, y: K.y + 520, z: 1.0},
  {t: 47.0, d: 2.4, x: K.x + 3000, y: K.y + 520, z: 1.0},
  {t: 52.6, d: 2.4, x: K.x + 1800, y: K.y + 520, z: 0.56}, // 拉远看全貌
  // S4 钻进 Response #1 看 JSON
  {t: 63.8, d: 2.3, x: K.x + 880, y: K.y + 500, z: 1.0},
  {t: 74.6, d: 8.4, x: K.x + 900, y: K.y + 505, z: 1.02},
  // S5 托管工具
  {t: 86.6, d: 1.9, x: HO.x + 960, y: HO.y + 520, z: 1.0, dip: 0.1},
  // S6 Trace：进入后缓慢下摇
  {t: 103.4, d: 1.9, x: TR.x + 960, y: TR.y + 520, z: 1.0, dip: 0.08},
  {t: 108.2, d: 12.6, x: TR.x + 960, y: TR.y + 860, z: 1.0},
  // S7 回到轨道：同一批对象重排成数据模型
  {t: 125.3, d: 2.2, x: K.x + 2450, y: K.y + 520, z: 0.8, dip: 0.12},
  {t: 138.8, d: 1.7, x: K.x + 2600, y: K.y + 690, z: 1.0},
  // S8 踩坑
  {t: 146.1, d: 2.0, x: PF.x + 1000, y: PF.y + 510, z: 0.95, dip: 0.12},
  // S9 长距离飞回开头的 WebUI
  {t: 159.3, d: 2.9, x: H.x + 520, y: H.y + 520, z: 1.02, dip: 0.35},
  {t: 172.0, d: 1.8, x: H.x + 1000, y: H.y + 520, z: 0.78},
  {t: 175.4, d: 1.4, x: H.x + 1020, y: H.y + 520, z: 0.76},
];

export type Cam = {x: number; y: number; z: number};

export const cameraAt = (t: number): Cam => {
  const first = SHOTS[0];
  let x = first.x;
  let y = first.y;
  let z = first.z;
  for (let i = 1; i < SHOTS.length; i++) {
    const k = SHOTS[i];
    if (t < k.t) break;
    const p = inOut(prog(t, k.t, k.d));
    const dip = 1 - (k.dip ?? 0) * Math.sin(Math.PI * p);
    x = lerp(x, k.x, p);
    y = lerp(y, k.y, p);
    z = Math.exp(lerp(Math.log(z), Math.log(k.z), p)) * dip;
  }
  // 很轻的手持漂移：静止画面也在呼吸
  return {
    x: x + 5 * Math.sin(t * 0.31),
    y: y + 3.5 * Math.sin(t * 0.23 + 1.3),
    z: z * (1 + 0.004 * Math.sin(t * 0.19)),
  };
};

export const worldStyle = (c: Cam): CSSProperties => ({
  position: "absolute",
  left: 0,
  top: 0,
  width: 9600,
  height: 3000,
  transformOrigin: "0 0",
  transform: `translate(960px, 540px) scale(${c.z}) translate(${-c.x}px, ${-c.y}px)`,
});
