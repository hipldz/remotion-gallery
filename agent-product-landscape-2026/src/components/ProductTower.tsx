import { C, fonts } from '../data/theme';
import { fade, mix, move, projectMap, useCinema } from '../lib/cinematics';

const routes = [
  { title: '写代码', detail: '改代码、跑测试', color: C.blue, routeY: -300, products: ['Copilot · Cursor · Aider', 'Devin · Claude Code · Pi', 'Codex App'] },
  {
    title: '日常工作',
    detail: '查资料、写报告、整理文件',
    color: C.green,
    routeY: -100,
    products: ['Manus · Deep Research', 'Cowork · OpenClaw', 'WorkBuddy · 豆包工作', 'DeepSeek Harness'],
  },
  { title: '重复的事', detail: '先把步骤排好', color: C.yellow, routeY: 100, products: ['n8n · Dify · Coze', '也能搭配 Agent 一起用'] },
];

export function ProductTower({ f }: { f: number }) {
  const { camera } = useCinema();
  const p = move(f, 35, 80);
  return (
    <svg
      width="1920"
      height="1080"
      data-product-map="parallel-routes"
      role="img"
      aria-label="写代码、做日常工作、跑流程，以及让任务接着做的工具"
      style={{ position: 'absolute', inset: 0, fontFamily: fonts.sans }}
    >
      {routes.map((route, i) => {
        const x = 140 + i * 575;
        const origin = projectMap(camera.x, route.routeY, camera);
        const y = mix(origin.y, 390, p);
        const height = mix(6, 280, p);
        return (
          <g key={route.title} opacity={fade(f, 35 + i * 10, 18)}>
            <rect x={x} y={y} width={525} height={height} rx={mix(3, 22, p)} fill="#FFFFFFF5" stroke="#D6E0ED" strokeWidth="1.5" />
            <path d={'M' + (x + 24) + ' ' + (y + 2) + 'H' + (x + 501)} stroke={route.color} strokeWidth="4" />
            <g opacity={fade(f, 95 + i * 10, 20)}>
              <text x={x + 30} y={y + 55} fontSize="36" fontWeight="600" fill={route.color}>
                {route.title}
              </text>
              <text x={x + 30} y={y + 92} fontSize="23" fill="#7A879A">
                {route.detail}
              </text>
              {route.products.map((name, j) => (
                <text key={name} x={x + 30} y={y + 145 + j * 32} fontSize="24" fill={C.ink}>
                  {name}
                </text>
              ))}
            </g>
          </g>
        );
      })}
      <g opacity={fade(f, 125, 25)}>
        {[402, 977, 1552].map((x) => (
          <path key={x} d={'M' + x + ' 678V735'} stroke="#C9D4E3" strokeWidth="1.5" />
        ))}
        <rect x="350" y="735" width="1255" height="115" rx="20" fill="#FFF8F7" stroke="#EAD4D0" />
        <path d="M382 737H1573" stroke={C.red} strokeWidth="3" />
        <text x="387" y="782" fontSize="30" fontWeight="600" fill={C.red}>
          帮任务接着做 · Harness
        </text>
        <text x="387" y="823" fontSize="25" fill="#7B818C">
          用工具、记进度、留住前面的内容，让任务能接着做
        </text>
      </g>
    </svg>
  );
}
