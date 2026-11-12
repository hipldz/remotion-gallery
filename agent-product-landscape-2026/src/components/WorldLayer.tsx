import { AbsoluteFill } from 'remotion';
import { C, colors, fonts, routes } from '../data/theme';
import { pins, TODAY } from '../data/pins';
import { assetPositions, fade, focalAssets, limit, projectMap, useCinema } from '../lib/cinematics';

export function WorldLayer({ dim = 1, blur = 0 }: { dim?: number; blur?: number }) {
  const { camera: cam, frame, f, shot, dark, velocity } = useCinema();
  const focusPositions = (focalAssets[shot.id] ?? []).map((id) => assetPositions[id]);
  const scope = 1400 / cam.z;
  const left = cam.x - scope,
    right = cam.x + scope;
  const nightColor = dark && shot.chapterKey === 'P' ? '#3A3D46' : undefined;
  const mapIsBeingRevealed = shot.id === 'Z04' ? fade(f, 16, 100) : 1;
  const occupied: Record<string, number[]> = {};
  const visiblePins = pins.filter((pin) => pin.x >= left && pin.x <= right);
  return (
    <AbsoluteFill style={{ background: dark ? '#11151D' : '#FCFCFD' }}>
      <AbsoluteFill style={{ opacity: dim, filter: blur ? `blur(${blur}px)` : undefined }}>
        <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <radialGradient id="map-light">
              <stop offset="0" stopColor={dark ? '#30405B' : '#E6EBF5'} stopOpacity={dark ? 0.35 : 0.65} />
              <stop offset="1" stopColor={dark ? '#11151D' : '#FFF'} stopOpacity="0" />
            </radialGradient>
            <filter id="rail-bloom">
              <feGaussianBlur stdDeviation="7" />
            </filter>
            <filter id="rail-speed">
              <feGaussianBlur stdDeviation={`${Math.min(Math.abs(velocity) / 20, 5)} 0.3`} />
            </filter>
          </defs>
          <ellipse cx="980" cy="560" rx="1000" ry="450" fill="url(#map-light)" />
          {Array.from({ length: 15 }, (_, i) => {
            const x = Math.floor(left / 400) * 400 + i * ((scope * 2) / 14);
            const a = projectMap(x, -620, cam),
              b = projectMap(x, 620, cam);
            return (
              <path
                key={`grid-x-${i}`}
                d={`M${a.x} ${a.y}L${b.x} ${b.y}`}
                stroke={dark ? '#707F98' : '#CFD6E2'}
                opacity={dark ? 0.11 : 0.28}
                strokeWidth={0.8}
              />
            );
          })}
          {[-500, -400, -200, 0, 200, 400, 500].map((y) => {
            const a = projectMap(left, y, cam),
              b = projectMap(right, y, cam);
            return <path key={y} d={`M${a.x} ${a.y}L${b.x} ${b.y}`} stroke={dark ? '#5C6C88' : '#CED7E6'} opacity={dark ? 0.1 : 0.23} strokeWidth={0.6} />;
          })}
          {[2021, 2022, 2023, 2024, 2025, 2026, 2027].map((year) => {
            const x = (year - 2022) * 3200;
            const a = projectMap(x, -490, cam),
              b = projectMap(x, 490, cam);
            return (
              <g key={year} opacity={0.9 * mapIsBeingRevealed}>
                <path d={`M${a.x} ${a.y}L${b.x} ${b.y}`} stroke={dark ? '#5D6A80' : '#BFC9D9'} strokeWidth={1} />
                <text
                  x={b.x + 15}
                  y={b.y + 61}
                  fill="none"
                  stroke={dark ? '#64718A' : '#A8B5C8'}
                  strokeWidth={1.2}
                  fontSize={cam.z < 0.4 ? 78 : 150}
                  fontFamily={fonts.sans}
                  fontWeight="600"
                  letterSpacing="-6"
                >
                  {year}
                </text>
              </g>
            );
          })}
          {routes.map((route, i) => {
            const start = Math.max(left, route.start),
              end = Math.min(right, TODAY);
            const a = projectMap(start, route.y, cam),
              b = projectMap(end, route.y, cam),
              future = projectMap(TODAY, route.y, cam),
              far = projectMap(right + 500, route.y, cam);
            const color = nightColor ?? C[route.id];
            const d = `M${a.x} ${a.y}L${b.x} ${b.y}`;
            const reveal = shot.id === 'Z04' ? fade(f, 15, 45) : 1;
            const pulseX = start + ((frame * (12 + i * 3)) % Math.max(1, end - start));
            const pp = projectMap(pulseX, route.y, cam, 0);
            return (
              <g key={route.id} opacity={reveal} filter={Math.abs(velocity) > 50 ? 'url(#rail-speed)' : undefined}>
                <path d={d} stroke={color} strokeWidth={dark ? 14 : 9} opacity={dark ? 0.25 : 0.08} fill="none" filter="url(#rail-bloom)" />
                <path d={d} stroke={dark ? '#3D4657' : '#DAE1EB'} strokeWidth={8} fill="none" />
                <path d={d} stroke={color} strokeWidth={3.5} fill="none" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - reveal} />
                <path d={`M${a.x} ${a.y + 5}L${b.x} ${b.y + 5}`} stroke={dark ? '#03060B' : '#9EADC4'} strokeWidth={2} opacity={0.12} />
                {!nightColor && (
                  <>
                    <circle cx={pp.x} cy={pp.y} r={10} fill={color} opacity={0.12} />
                    <circle cx={pp.x} cy={pp.y} r={3.5} fill={dark ? '#fff' : color} />
                  </>
                )}
                <path d={`M${future.x} ${future.y}L${far.x} ${far.y}`} stroke={color} opacity={0.18} strokeWidth={3} strokeDasharray="14 16" />
                {cam.z < 0.3 && (
                  <g transform={`translate(82 ${projectMap(cam.x, route.y, cam).y - 22})`}>
                    <rect
                      x="-10"
                      y={shot.id === 'Z04' ? -48 : -26}
                      width={shot.id === 'Z04' ? 550 : 330}
                      height={shot.id === 'Z04' ? 66 : 38}
                      rx="10"
                      fill={dark ? '#11151DD9' : '#FCFCFDE9'}
                    />
                    <text fill={C[route.id]} fontSize={shot.id === 'Z04' ? 48 : 23} fontWeight="600" fontFamily={fonts.sans}>
                      {shot.id === 'Z04' ? ['开发者工具', '通用工作 Agent', 'Workflow 平台', '底层运行系统'][i] : route.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
          {visiblePins.map((pin, i) => {
            const route = routes.find((r) => r.id === pin.route)!;
            const p = projectMap(pin.x, route.y, cam);
            const active = focusPositions.some((a) => a && Math.abs(a[0] - pin.x) < 90 && a[1] === route.y);
            const color = nightColor ?? C[pin.route];
            const key = pin.route;
            const row = occupied[key] ?? (occupied[key] = [-9999, -9999, -9999]);
            let r = row.findIndex((last) => p.x - last > 215);
            const show = (cam.z > 0.42 || active) && r >= 0;
            if (r < 0) r = 0;
            else row[r] = p.x;
            const up = pin.route === 'blue' || pin.route === 'yellow';
            const ly = p.y + (up ? -1 : 1) * (58 + r * 48);
            const name = pin.label;
            return (
              <g key={`${pin.label}-${i}`} opacity={active ? 1 : dark ? 0.6 : 0.8}>
                {active && <circle cx={p.x} cy={p.y} r={20 + Math.sin(frame / 14) * 3} fill={color} opacity={0.08} />}
                <ellipse cx={p.x + 4} cy={p.y + 7} rx="9" ry="3" fill="#09172F" opacity={0.1} />
                <circle cx={p.x} cy={p.y} r={active ? 9 : cam.z < 0.4 ? 4.5 : 6} fill={color} stroke={dark ? '#11151D' : '#FFF'} strokeWidth={2.5} />
                {show && (
                  <>
                    <path d={`M${p.x} ${p.y}V${ly}`} stroke={color} opacity={0.4} strokeWidth="1" />
                    <rect
                      x={p.x - 12}
                      y={ly - 24}
                      width={limit(name.length * 15 + 32, 125, 380)}
                      height="38"
                      rx="12"
                      fill={dark ? '#1B2332' : '#FFFFFF'}
                      stroke={dark ? '#334158' : '#DEE4EC'}
                      strokeWidth="1"
                    />
                    <text x={p.x + 3} y={ly + 1} fill={dark ? '#AAB7CB' : C.gray} fontFamily={fonts.sans} fontSize="20" fontWeight={active ? 600 : 400}>
                      {name}
                    </text>
                  </>
                )}
              </g>
            );
          })}
          {(() => {
            const a = projectMap(TODAY, -500, cam),
              b = projectMap(TODAY, 480, cam);
            return (
              <g opacity={dark ? 0.85 : 0.7}>
                <path d={`M${a.x} ${a.y}L${b.x} ${b.y}`} stroke={dark ? '#A9B9D3' : '#66768D'} strokeWidth="1.5" />
                {b.x >= 65 && b.x <= 1855 && b.y + 64 <= 950 && (
                  <>
                    <rect x={b.x - 55} y={b.y + 20} width="110" height="44" rx="22" fill={dark ? '#E7EBF2' : '#202A3A'} />
                    <text x={b.x} y={b.y + 49} fill={dark ? '#293449' : '#fff'} textAnchor="middle" fontFamily={fonts.sans} fontSize="21">
                      今天
                    </text>
                  </>
                )}
              </g>
            );
          })()}
        </svg>
        {dark &&
          Array.from({ length: 32 }, (_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: (i * 173.29 + frame * (0.03 + (i % 3) * 0.02)) % 1920,
                top: 80 + ((i * 217.3 - frame * 0.05 + 2000) % 890),
                width: 1 + (i % 3),
                height: 1 + (i % 3),
                borderRadius: '50%',
                background: colors[i % 4],
                filter: i % 5 === 0 ? 'blur(2px)' : undefined,
                opacity: 0.08 + (Math.sin(frame / 70 + i) + 1) * 0.05,
              }}
            />
          ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
