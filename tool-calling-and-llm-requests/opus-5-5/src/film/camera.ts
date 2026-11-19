// 一台虚拟摄像机：x/y 是画面中心对准的画布坐标，z 是缩放。
// 每个 Shot 表示“从 t 开始，用 d 秒移动到这里”。dip 让长距离飞行时先拉远再推近。
import {ZONE} from "./timeline";
import {inOut, lerp, prog} from "./ease";

type Shot = {t: number; d: number; x: number; y: number; z: number; dip?: number};

const H = ZONE.hook;
const Q = ZONE.question;
const K = ZONE.track;
const HO = ZONE.hosted;
const TR = ZONE.trace;
const PF = ZONE.pitfall;

const SHOTS: Shot[] = [
  // S1 我的 WebUI
  {t: 0, d: 0, x: H.x + 520, y: H.y + 500, z: 1.0},
  {t: 0.2, d: 8.8, x: H.x + 520, y: H.y + 495, z: 1.05},
  {t: 9.2, d: 1.6, x: H.x + 1400, y: H.y + 500, z: 1.04}, // → Codex 原生
  {t: 16.4, d: 1.4, x: H.x + 1690, y: H.y + 500, z: 0.98}, // 留出对线气泡
  // S2 问题
  {t: 21.6, d: 1.9, x: Q.x + 960, y: Q.y + 520, z: 1.0, dip: 0.12},
  {t: 23.6, d: 5.4, x: Q.x + 960, y: Q.y + 520, z: 1.05},
  // S3 Agent Loop：镜头一路跟着轨道往右
  {t: 29.2, d: 1.9, x: K.x + 720, y: K.y + 520, z: 1.0, dip: 0.1},
  {t: 41.0, d: 2.2, x: K.x + 1780, y: K.y + 520, z: 1.0},
  {t: 46.8, d: 2.2, x: K.x + 2840, y: K.y + 520, z: 1.0},
  {t: 52.4, d: 2.2, x: K.x + 1900, y: K.y + 520, z: 0.5}, // 拉远看全貌
  // S4 钻进 Response #1
  {t: 63.6, d: 2.4, x: K.x + 800, y: K.y + 470, z: 1.0},
  {t: 74.6, d: 8.0, x: K.x + 800, y: K.y + 470, z: 1.03},
  // S5 托管工具
  {t: 86.4, d: 1.8, x: HO.x + 960, y: HO.y + 500, z: 1.0, dip: 0.1},
  // S6 Trace：进入后缓慢下摇
  {t: 103.2, d: 1.8, x: TR.x + 960, y: TR.y + 540, z: 1.0, dip: 0.08},
  {t: 108.0, d: 13.0, x: TR.x + 960, y: TR.y + 960, z: 1.0},
  // S7 回到轨道：同一批对象重排成数据模型
  {t: 125.0, d: 2.2, x: K.x + 1820, y: K.y + 470, z: 1.0, dip: 0.15},
  {t: 138.4, d: 1.6, x: K.x + 1110, y: K.y + 470, z: 1.0}, // HTTP 响应剖面
  // S8 踩坑
  {t: 146.0, d: 2.0, x: PF.x + 960, y: PF.y + 500, z: 1.0, dip: 0.12},
  // S9 长距离飞回开头的 WebUI
  {t: 159.2, d: 2.8, x: H.x + 520, y: H.y + 500, z: 1.04, dip: 0.35},
  {t: 172.0, d: 1.6, x: H.x + 960, y: H.y + 500, z: 0.97},
];

export type Cam = {x: number; y: number; z: number};

export const cameraAt = (t: number): Cam => {
  let x = SHOTS[0].x;
  let y = SHOTS[0].y;
  let z = SHOTS[0].z;
  for (let i = 1; i < SHOTS.length; i++) {
    const k = SHOTS[i];
    if (t < k.t) break;
    const p = inOut(prog(t, k.t, k.d));
    const dip = 1 - (k.dip ?? 0) * Math.sin(Math.PI * p);
    x = lerp(x, k.x, p);
    y = lerp(y, k.y, p);
    z = Math.exp(lerp(Math.log(z), Math.log(k.z), p)) * dip;
  }
  // 很轻的手持漂移，让静止画面也在“呼吸”
  return {
    x: x + 5 * Math.sin(t * 0.31),
    y: y + 3.5 * Math.sin(t * 0.23 + 1.3),
    z: z * (1 + 0.004 * Math.sin(t * 0.19)),
  };
};

export const worldTransform = (c: Cam): string =>
  `translate(960px, 540px) scale(${c.z}) translate(${-c.x}px, ${-c.y}px)`;
