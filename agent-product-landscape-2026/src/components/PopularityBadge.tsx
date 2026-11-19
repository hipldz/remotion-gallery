import snapshot from '../../production/github-popularity.json';
import { C, fonts } from '../data/theme';
import { fade } from '../lib/cinematics';
import { At } from './Primitives';

export function PopularityBadge({
  id,
  f,
  x,
  y,
  start = 45,
  label = 'GitHub 仓库',
  compact = false,
}: {
  id: string;
  f: number;
  x: number;
  y: number;
  start?: number;
  label?: string;
  compact?: boolean;
}) {
  const entry = snapshot.repositories.find((item) => item.id === id);
  if (!entry) return null;
  const count = (entry.stars / 1000).toFixed(1) + 'k';
  return (
    <At x={x} y={y} style={{ opacity: fade(f, start, 18), width: compact ? 430 : 600 }}>
      <div data-popularity={id} data-stars={entry.stars} style={{ fontFamily: fonts.sans, color: C.ink }}>
        <div style={{ fontSize: compact ? 23 : 27, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#D4A229' }}>★</span>
          <span>{count}</span>
          <span style={{ fontSize: compact ? 18 : 20, color: '#738097', fontWeight: 400 }}>{label}</span>
        </div>
        <div style={{ marginTop: 7, fontSize: 16, color: '#8B96A7' }}>当前关注 · 截至 {snapshot.date}</div>
      </div>
    </At>
  );
}
