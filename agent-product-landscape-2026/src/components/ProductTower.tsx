import { C, fonts } from '../data/theme';
import { fade, mix, move, projectMap, settle, useCinema } from '../lib/cinematics';

export const floors = [
  { name: 'Runtime / Harness', products: 'Pi SDK · Cline SDK · DeepSeek Harness', color: C.red, routeY: 300 },
  { name: 'Workflow / Agent Builder', products: 'n8n · Dify · Coze', color: C.yellow, routeY: 100 },
  { name: '代码补全 / IDE 插件', products: 'Copilot · Codeium · 通义灵码早期形态', color: '#AECBFA', routeY: -300 },
  { name: 'AI 原生 IDE', products: 'Cursor · Windsurf · TRAE IDE · Qoder IDE · CodeBuddy IDE', color: '#8AB4F8', routeY: -300 },
  { name: '本地 CLI Coding Agent', products: 'Claude Code · Pi Agent · Gemini CLI · Cline · CodeBuddy Code', color: C.blue, routeY: -300 },
  { name: '云端 / 异步 Coding Agent', products: 'Devin · Jules · Copilot Coding Agent · Cursor BG', color: C.blueDeep, routeY: -300 },
  { name: 'Agent 工作台', products: 'Codex App · Qoder 1.0', color: '#174EA6', routeY: -300 },
  { name: '通用工作 Agent', products: 'Manus · Cowork · OpenClaw · WorkBuddy · DuMate · 豆包工作 · ChatGPT Work · QoderWork', color: C.green, routeY: -100 },
];

export function ProductTower({ f, focus = 0 }: { f: number; focus?: number }) {
  const { camera } = useCinema();
  return (
    <svg width="1920" height="1080" data-product-tower="eight-levels" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <defs>
        <filter id="floor-shadow">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>
      <ellipse cx="1100" cy="918" rx="650" ry="30" fill="#344969" opacity={0.07 * fade(f, 80, 60)} filter="url(#floor-shadow)" />
      {floors.map((floor, i) => {
        const p = move(f, 60 + i * 9, 73);
        const raw = settle(f, 91 + i * 9, true);
        const bounce = p > 0.8 ? (1 - raw) * 12 : 0;
        const y = 850 - i * 67;
        const origin = projectMap(camera.x, floor.routeY, camera);
        const xx = mix(-120, 320, p),
          ww = mix(2160, 1390, p);
        const yy = mix(origin.y, y, p) + Math.sin(p * Math.PI) * (i - 3.5) * 22 + bounce;
        const tall = mix(3, 43, p);
        const dx = 90 * p,
          dy = -32 * p;
        const chosen = i === 6 || i === 0;
        const opacity = chosen ? 1 : 1 - focus * 0.9;
        const fy = chosen ? mix(yy, i === 6 ? 345 : 785, focus) : yy;
        const h = chosen ? mix(tall, 100, focus) : tall;
        const top = `${xx},${fy} ${xx + dx},${fy + dy} ${xx + ww + dx},${fy + dy} ${xx + ww},${fy}`;
        const side = `${xx + ww},${fy} ${xx + ww + dx},${fy + dy} ${xx + ww + dx},${fy + dy + h} ${xx + ww},${fy + h}`;
        return (
          <g key={floor.name} opacity={opacity}>
            <polygon points={top} fill={floor.color} opacity={0.1} stroke={floor.color} strokeWidth={1} />
            <polygon points={side} fill={floor.color} opacity={0.27} stroke={floor.color} strokeWidth={0.8} />
            <rect x={xx} y={fy} width={ww} height={h} rx={mix(1, 8, p)} fill="#FFFFFF" stroke={floor.color} strokeWidth={1.2} />
            <rect x={xx} y={fy} width={8 * p} height={h} rx={3} fill={floor.color} />
            {i === 6 && <rect x={xx} y={fy} width={ww} height={h} rx={8} fill="none" stroke={C.green} strokeWidth={1} opacity={p * 0.6} />}
            <g opacity={fade(p, 0.6, 0.4)}>
              <text x={xx + 23} y={fy + h / 2 + 7} fill="#A7B0BF" fontSize="17" fontFamily={fonts.sans}>
                {String(i + 1).padStart(2, '0')}
              </text>
              {focus < 0.55 || !chosen ? (
                <>
                  <text x={xx + 68} y={fy + h / 2 + 9} fill={C.ink} fontSize="27" fontWeight="600" fontFamily={fonts.sans}>
                    {floor.name}
                  </text>
                  <text x={xx + 473} y={fy + h / 2 + 7} fill="#7B879A" fontSize={i === 7 ? 18 : 20} fontFamily={fonts.sans}>
                    {floor.products}
                  </text>
                </>
              ) : (
                <>
                  <text x={xx + 68} y={fy + 39} fill={i === 0 ? C.red : C.blueDeep} fontSize="32" fontWeight="600" fontFamily={fonts.sans}>
                    {i === 0 ? '底座：决定 Agent 实际怎么跑' : '工作台：帮人管理多个 Agent'}
                  </text>
                  <text x={xx + 68} y={fy + 75} fill="#8B97A9" fontSize="22" fontFamily={fonts.sans}>
                    {i === 0 ? 'Runtime / Harness · 工具、上下文、权限、状态、恢复' : 'Codex App · 分配任务、监督、Review、合并结果'}
                  </text>
                </>
              )}
            </g>
          </g>
        );
      })}
    </svg>
  );
}
