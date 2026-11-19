import type { CSSProperties, ReactNode } from 'react';
import { C, fonts, type Route } from '../data/theme';
import { clamp, entrance, pop, tween } from '../lib/motion';

export const At = ({ x = 0, y = 0, children, style }: { x?: number; y?: number; children?: ReactNode; style?: CSSProperties }) => (
  <div style={{ position: 'absolute', left: x, top: y, ...style }}>{children}</div>
);
export const Reveal = ({ f, delay = 0, children, style }: { f: number; delay?: number; children: ReactNode; style?: CSSProperties }) => (
  <div style={{ ...entrance(f, delay), ...style }}>{children}</div>
);
export const Chip = ({ children, color = C.blue, filled = false, style }: { children: ReactNode; color?: string; filled?: boolean; style?: CSSProperties }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      whiteSpace: 'nowrap',
      padding: '11px 24px',
      borderRadius: 99,
      background: filled ? color : `${color}15`,
      color: filled ? '#fff' : color === C.yellow ? '#8D6600' : color,
      fontSize: 28,
      fontWeight: 600,
      lineHeight: 1.35,
      ...style,
    }}
  >
    {children}
  </span>
);
export function Heading({
  f,
  eyebrow,
  title,
  sub,
  color = C.blue,
  dark = false,
  width = 1650,
}: {
  f: number;
  eyebrow?: string;
  title: ReactNode;
  sub?: ReactNode;
  color?: string;
  dark?: boolean;
  width?: number;
}) {
  return (
    <At x={96} y={138} style={{ width, ...entrance(f, 3) }}>
      {eyebrow && (
        <div
          style={{
            fontSize: 22,
            fontFamily: fonts.sans,
            letterSpacing: 3,
            color: dark ? '#9AA0A6' : C.gray,
            marginBottom: 18,
            display: 'flex',
            gap: 16,
            alignItems: 'center',
          }}
        >
          <span style={{ width: 27, height: 5, borderRadius: 3, background: color }} />
          {eyebrow}
        </div>
      )}
      <div style={{ color: dark ? '#F8F9FA' : C.ink, fontSize: 74, fontWeight: 900, letterSpacing: -2, lineHeight: 1.18 }}>{title}</div>
      {sub && <div style={{ fontSize: 30, color: dark ? '#9AA0A6' : C.gray, marginTop: 22, lineHeight: 1.65 }}>{sub}</div>}
    </At>
  );
}
export const Agent = ({
  x = 0,
  y = 0,
  color = C.blue,
  size = 56,
  sx = 1,
  sy = 1,
  glow = false,
  opacity = 1,
}: {
  x?: number;
  y?: number;
  color?: string;
  size?: number;
  sx?: number;
  sy?: number;
  glow?: boolean;
  opacity?: number;
}) => (
  <div
    style={{
      position: 'absolute',
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      transform: `scale(${sx}, ${sy})`,
      opacity,
      boxShadow: glow ? `0 0 55px ${color}65` : 'none',
    }}
  />
);
export const Cursor = ({ x = 0, y = 0, size = 90, rotate = 0, sweat = false }: { x?: number; y?: number; size?: number; rotate?: number; sweat?: boolean }) => (
  <At x={x} y={y} style={{ transform: `rotate(${rotate}deg)`, width: size, height: size * 1.25, zIndex: 60 }}>
    <svg viewBox="0 0 80 100" width={size} height={size * 1.25}>
      <path d="M14 7L65 55L42 59L56 86L43 92L29 65L13 82Z" fill={C.ink} stroke="white" strokeWidth="7" strokeLinejoin="round" />
      {sweat && <path d="M66 7C66 7 54 24 55 31A11 11 0 0 0 77 31C78 24 66 7 66 7Z" fill={C.blue} />}
    </svg>
  </At>
);

export const Icon = ({ name, size = 64, color = C.ink, style }: { name: string; size?: number; color?: string; style?: CSSProperties }) => {
  const paths: Record<string, ReactNode> = {
    code: (
      <>
        <path d="M23 20L11 32L23 44M41 20L53 32L41 44M37 13L27 51" />
      </>
    ),
    terminal: (
      <>
        <rect x="7" y="11" width="50" height="42" rx="7" />
        <path d="M17 23L26 31L17 39M34 40H46" />
      </>
    ),
    browser: (
      <>
        <rect x="7" y="9" width="50" height="46" rx="7" />
        <path d="M7 22H57M15 16H16M23 16H24" />
      </>
    ),
    file: (
      <>
        <path d="M15 6H36L49 20V57H15ZM35 6V21H49M23 32H41M23 41H41M23 49H35" />
      </>
    ),
    folder: <path d="M6 18Q6 12 12 12H26L32 19H53Q58 19 58 25V49Q58 54 53 54H11Q6 54 6 49Z" />,
    search: (
      <>
        <circle cx="27" cy="27" r="17" />
        <path d="M40 40L55 55M20 27H34M27 20V34" />
      </>
    ),
    plug: (
      <>
        <path d="M22 7V21M42 7V21M17 21H47V30Q47 43 32 43Q17 43 17 30ZM32 43V57" />
      </>
    ),
    cloud: <path d="M18 49H47A13 13 0 0 0 48 23A18 18 0 0 0 14 24A13 13 0 0 0 18 49Z" />,
    calendar: (
      <>
        <rect x="9" y="13" width="46" height="43" rx="6" />
        <path d="M20 7V20M44 7V20M9 28H55M20 38H26M38 38H44M20 46H26" />
      </>
    ),
    mail: (
      <>
        <rect x="7" y="14" width="50" height="36" rx="5" />
        <path d="M8 17L32 35L56 17" />
      </>
    ),
    chat: <path d="M9 11H55V45H29L15 55V45H9Z" />,
    check: <path d="M11 32L25 46L54 17" />,
    gear: (
      <>
        <path
          d="M26 5H38L40 13L48 17L56 15L62 26L56 32L57 40L62 46L55 56L47 53L39 57L37 63H25L23 56L15 52L7 54L1 44L7 37L7 29L2 23L9 13L17 16L24 12Z"
          transform="translate(3 1) scale(.9)"
        />
        <circle cx="32" cy="32" r="10" />
      </>
    ),
    target: (
      <>
        <circle cx="32" cy="32" r="24" />
        <circle cx="32" cy="32" r="14" />
        <circle cx="32" cy="32" r="3" />
      </>
    ),
    branch: (
      <>
        <circle cx="17" cy="11" r="5" />
        <circle cx="47" cy="13" r="5" />
        <circle cx="17" cy="53" r="5" />
        <path d="M17 16V48M47 18V25Q47 35 37 35H17" />
      </>
    ),
    loop: (
      <>
        <path d="M51 23A21 21 0 0 0 13 20M13 20V7M13 20H26M13 41A21 21 0 0 0 51 44M51 44V57M51 44H38" />
      </>
    ),
    server: (
      <>
        <rect x="8" y="9" width="48" height="19" rx="4" />
        <rect x="8" y="36" width="48" height="19" rx="4" />
        <path d="M17 18H18M17 46H18M28 18H47M28 46H47" />
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={style}>
      {paths[name] ?? paths.file}
    </svg>
  );
};
export const Arrow = ({
  x,
  y,
  width = 160,
  color = C.line,
  label,
  reverse = false,
}: {
  x: number;
  y: number;
  width?: number;
  color?: string;
  label?: string;
  reverse?: boolean;
}) => (
  <At x={x} y={y}>
    {label && <div style={{ fontSize: 22, textAlign: 'center', color: C.gray, marginBottom: 9 }}>{label}</div>}
    <svg width={width} height={24} viewBox={`0 0 ${width} 24`} style={{ transform: reverse ? 'scaleX(-1)' : undefined }}>
      <path d={`M0 12H${width - 5}M${width - 18} 2L${width - 5} 12L${width - 18} 22`} stroke={color} strokeWidth={3} fill="none" />
    </svg>
  </At>
);
export const IconCard = ({
  x,
  y,
  icon,
  title,
  color = C.blue,
  width = 270,
  f = 100,
  delay = 0,
  children,
}: {
  x: number;
  y: number;
  icon: string;
  title: string;
  color?: string;
  width?: number;
  f?: number;
  delay?: number;
  children?: ReactNode;
}) => (
  <At x={x} y={y} style={{ width, minHeight: 190, padding: 30, border: `2px solid ${color}30`, borderRadius: 28, background: 'white', ...entrance(f, delay) }}>
    <Icon name={icon} color={color} size={64} />
    <div style={{ fontSize: 32, fontWeight: 700, marginTop: 22 }}>{title}</div>
    {children}
  </At>
);

export function Sparkle({ x, y, f, start = 0 }: { x: number; y: number; f: number; start?: number }) {
  const p = clamp((f - start) / 12);
  return (
    <At x={x} y={y} style={{ opacity: p > 0 && p < 1 ? 1 : 0, transform: `scale(${Math.sin(p * Math.PI)})` }}>
      <svg width="82" height="82" viewBox="0 0 100 100">
        <path d="M50 0Q54 46 100 50Q54 54 50 100Q46 54 0 50Q46 46 50 0" fill={C.yellow} />
      </svg>
    </At>
  );
}
export const PopChip = ({ f, delay = 0, children, route = 'blue' }: { f: number; delay?: number; children: ReactNode; route?: Route }) => (
  <div style={{ display: 'inline-block', transform: `scale(${Math.max(0, pop(f, delay))})`, opacity: f >= delay ? 1 : 0 }}>
    <Chip color={C[route]}>{children}</Chip>
  </div>
);
export const Progress = ({ value, color = C.blue, width = '100%' }: { value: number; color?: string; width?: string | number }) => (
  <div style={{ height: 6, borderRadius: 5, background: `${color}20`, width, overflow: 'hidden' }}>
    <div style={{ height: '100%', borderRadius: 5, width: `${clamp(value) * 100}%`, background: color }} />
  </div>
);
export const Stamped = ({ f, start, children, color = C.blue }: { f: number; start: number; children: ReactNode; color?: string }) => (
  <div style={{ transform: `scale(${tween(f, start, start + 12, 1.4, 1)}) rotate(-3deg)`, opacity: f >= start ? 1 : 0 }}>
    <Chip color={color} style={{ fontSize: 42, fontWeight: 900, padding: '18px 32px', border: `3px solid ${color}` }}>
      {children}
    </Chip>
  </div>
);
