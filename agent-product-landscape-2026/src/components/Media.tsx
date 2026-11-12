import { createContext, type CSSProperties, type ReactNode } from 'react';
import { Img, staticFile } from 'remotion';
import manifest from '../../production/assets.json';
import { C, fonts, type Route } from '../data/theme';
import { assetPositions, drift, fade, limit, mix, move, projectMap, useCinema } from '../lib/cinematics';
import { At } from './Primitives';

export const AssetContext = createContext<string[]>([]);
export const assets = manifest;
export type Asset = (typeof assets)[number];

export function Media({
  id,
  f,
  x = 670,
  y = 260,
  width = 1120,
  height = 640,
  rotation = 0,
  delay = 0,
  anchor,
  style,
  children,
  label = true,
  tilt = 0,
  focus,
  focusAt = 65,
  fit = 'contain',
  pan,
  mode = 'lift',
}: {
  id: string;
  f: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  delay?: number;
  anchor?: { x: number; y: number };
  style?: CSSProperties;
  children?: ReactNode;
  label?: boolean;
  tilt?: number;
  focus?: [number, number, number, number];
  focusAt?: number;
  fit?: 'contain' | 'cover';
  pan?: 'x' | 'y';
  mode?: 'lift' | 'match';
}) {
  const cinema = useCinema();
  const asset = assets.find((a) => a.id === id);
  if (!asset) throw new Error(`Unknown source screenshot: ${id}`);
  const raw = f - delay;
  if (raw < 0) return null;
  const t = mode === 'match' ? raw + 32 : raw;
  const color = C[asset.route as Route];
  const dark = cinema.dark;
  const bare = ['bare', 'panel', 'news'].includes(asset.frame);
  const bar = bare ? 0 : 36;
  const croppedWidth = asset.crop ? asset.crop[2] - asset.crop[0] : asset.width;
  const croppedHeight = asset.crop ? asset.crop[3] - asset.crop[1] : asset.height;
  const w = Math.min(width, asset.maxWidth / 1.08, (croppedWidth * 1.25) / 1.08);
  const h = Math.min(height, (w * croppedHeight) / croppedWidth + bar);
  const pose = assetPositions[id];
  const projected = pose ? projectMap(pose[0], pose[1], cinema.camera, 30) : { x: 960, y: 540 };
  const source = anchor ?? { x: limit(projected.x, 80, 1840), y: limit(projected.y, 120, 920) };
  const unfold = move(t, 8, 24);
  const lift = move(t, 8, 29);
  const dolly = move(t, 40, 360, 1, 1.035);
  const rx = mix(18, 0, lift);
  const ry = mix(tilt === 0 ? -9 : tilt * 3, tilt, lift);
  const px = (source.x - x - w / 2) * (1 - unfold),
    py = (source.y - y - h / 2) * (1 - unfold);
  const scale = mix(0.022, 1, unfold) * dolly;
  const travel = Math.abs(px) + Math.abs(py);
  const note =
    id === 'chatgpt'
      ? '历史界面参考'
      : id === 'cursor' || id === 'cline' || id === 'claude-code'
        ? '近期版本界面参考'
        : id === 'codex-agents'
          ? '社区帖子示意截图 · 非官方界面'
          : id === 'dumate'
            ? '发布海报'
            : '';
  const imagePan = pan ?? asset.pan;
  return (
    <At
      x={x}
      y={y + drift(t, 1.5)}
      style={{
        width: w,
        height: h,
        perspective: 1800,
        opacity: mode === 'match' ? fade(raw, 0, 18) : fade(t, 0, 5),
        transform: `translate(${px}px,${py}px) scale(${scale}) rotate(${rotation}deg)`,
        transformOrigin: 'center',
        zIndex: 10,
        ...style,
      }}
    >
      {label && (
        <At
          x={2}
          y={-78}
          style={{ width: w, display: 'flex', columnGap: 13, rowGap: 4, flexWrap: 'wrap', alignItems: 'baseline', opacity: fade(t, 28, 14), lineHeight: 1.15 }}
        >
          <span style={{ width: 9, height: 9, borderRadius: 20, background: color }} />
          <span data-product-name={id} style={{ fontSize: 44, fontWeight: 700, color: dark ? '#F3F5F8' : C.ink }}>
            {asset.label}
          </span>
          <span style={{ fontSize: 18, color: dark ? '#8C98AC' : '#8B9099' }}>{asset.date}</span>
        </At>
      )}
      <div
        style={{
          width: w,
          height: h,
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${mix(-150, 0, lift)}px)`,
          filter: `blur(${travel > 40 ? Math.min(travel / 150, 2.5) : 0}px)`,
        }}
      >
        <div style={{ position: 'absolute', inset: '12px -3px -9px 4px', borderRadius: 20, background: asset.dark ? '#151923' : '#C8CED7', opacity: 0.9 }} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 20,
            overflow: 'hidden',
            background: t < 8 ? color : asset.dark ? '#161920' : '#fff',
            border: `1px solid ${asset.dark ? '#49505B' : '#E0E3E9'}`,
            boxShadow: `0 ${mix(16, 35, lift)}px 65px -22px #0E1E3F45,0 3px 12px #0D162B14`,
          }}
        >
          {t >= 8 && (
            <>
              {!bare && (
                <div
                  style={{
                    height: bar,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '0 14px',
                    background: asset.dark ? '#242831' : '#F0F2F6',
                    borderBottom: `1px solid ${asset.dark ? '#383E49' : '#E0E3EA'}`,
                  }}
                >
                  {[0, 1, 2].map((n) => (
                    <i key={n} style={{ width: 6, height: 6, borderRadius: '50%', background: asset.dark ? '#707A8B' : '#B2BAC7' }} />
                  ))}
                  <div style={{ fontFamily: fonts.mono, fontSize: 11, color: asset.dark ? '#8F9AAE' : '#8C94A2', margin: '0 auto' }}>
                    {asset.sourceUrl ? new URL(asset.sourceUrl).hostname : asset.label}
                  </div>
                  <span style={{ width: 6 }} />
                </div>
              )}
              <div style={{ position: 'relative', width: w, height: h - bar, overflow: 'hidden', filter: `blur(${move(t, 30, 10, 6, 0)}px)` }}>
                <Img
                  data-source-asset={id}
                  src={staticFile(`shots/${asset.file}`)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: imagePan ? 'cover' : fit,
                    objectPosition:
                      imagePan === 'x' ? `${move(t, 40, 230, 5, 95)}% center` : imagePan === 'y' ? `center ${move(t, 40, 170, 0, 100)}%` : 'center',
                  }}
                />
                {asset.fadeBottom && <div style={{ position: 'absolute', inset: '88% 0 0', background: 'linear-gradient(transparent,#fff)' }} />}
                {focus && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${focus[0] * 100}%`,
                      top: `${focus[1] * 100}%`,
                      width: `${focus[2] * 100}%`,
                      height: `${focus[3] * 100}%`,
                      borderRadius: 7,
                      border: `2px solid ${color}`,
                      background: `${color}0D`,
                      boxShadow: `0 0 0 2000px #000${asset.dark ? '18' : '05'}`,
                      opacity: fade(t, focusAt, 20),
                      clipPath: `inset(0 ${(1 - move(t, focusAt, 25)) * 100}% 0 0)`,
                    }}
                  />
                )}
                {children}
              </div>
              {note && (
                <At
                  x={12}
                  y={h - 29}
                  style={{
                    fontSize: 13,
                    color: asset.dark ? '#BFC8D8' : '#717A88',
                    background: asset.dark ? '#131720D9' : '#FFFFFFE8',
                    padding: '4px 7px',
                    borderRadius: 5,
                  }}
                >
                  {note}
                </At>
              )}
            </>
          )}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 20,
              background: `linear-gradient(${110 + ry}deg,#FFFFFF0B,transparent 35%,transparent 70%,#FFFFFF03)`,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(110deg,transparent 25%,#FFFFFF38 48%,transparent 66%)',
              transform: `translateX(${move(t, 22, 60, -140, 170)}%)`,
              pointerEvents: 'none',
              opacity: 1 - fade(t, 75, 15),
            }}
          />
        </div>
      </div>
    </At>
  );
}

export function SourceLine({ shotId }: { shotId: string }) {
  const { f } = useCinema();
  const phase: Record<string, string[]> = {
    A02: ['chatgpt'],
    B04: [f < 180 ? 'cursor' : 'aider'],
    C02: f < 140 ? [] : ['devin'],
    D03: ['claude-code'],
    D07: ['manus'],
    F02: [f < 130 ? 'cowork' : 'openclaw'],
    F07: ['harness'],
    F06: [],
  };
  const selected = phase[shotId];
  const related = assets.filter((a) => (selected ? selected.includes(a.id) : a.shots.includes(shotId)));
  const source = related.map((a) => a.source).join('　／　');
  const diagramSource = shotId === 'F06' ? '图解依据：Anthropic · 长任务执行系统' : 'PLDZ · 原创图解';
  return <div className="film-source">{source || diagramSource}</div>;
}
