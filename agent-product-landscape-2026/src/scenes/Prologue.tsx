import { AbsoluteFill } from 'remotion';
import { routes } from '../data/theme';
import { fade, projectMap, useCinema } from '../lib/cinematics';
import { At } from '../components/Primitives';
import { TitleBlock } from '../components/CinematicActors';
const routeDescriptions = [
  '代码补全、编辑器、终端和云端编程任务',
  '查资料、操作浏览器、处理文件和办公任务',
  '把模型、工具和数据接成可复用的流程',
  '工具调用、任务状态、失败恢复',
];
export function Prologue({ id, f }: { id: string; f: number }) {
  const cinema = useCinema();
  if (id !== 'Z04') return null;
  return (
    <>
      <AbsoluteFill style={{ background: '#FCFCFD', opacity: 1 - fade(f, 12, 30) }} />
      <TitleBlock f={f} eyebrow="2022—2026 / 按用途分类" lines={['Agent 产品的四条路线']} y={100} size={92} />
      {routes.map((route, i) => {
        const p = projectMap(cinema.camera.x, route.y, cinema.camera);
        return (
          <At key={route.id} x={680} y={p.y - 65} style={{ opacity: fade(f, 24, 20), width: 1100, fontSize: 32, color: '#647084', lineHeight: 1.5 }}>
            {routeDescriptions[i]}
          </At>
        );
      })}
    </>
  );
}
