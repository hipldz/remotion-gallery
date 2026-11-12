import { fade } from '../lib/cinematics';
import { At } from '../components/Primitives';
import { TitleBlock } from '../components/CinematicActors';
import { ProductTower } from '../components/ProductTower';

export function Finale({ id, f }: { id: string; f: number }) {
  if (id === 'G01')
    return (
      <>
        <TitleBlock f={f} eyebrow="回头看产品的变化" lines={['从聊天，到交付任务。']} size={87} />
        <At x={82} y={395} style={{ opacity: fade(f, 95, 20), color: '#8895A7', fontSize: 23, lineHeight: 1.7 }}>
          <div>↑ 离用户更近</div>
          <div style={{ height: 310, width: 1, background: '#D2DCEB', margin: '25px 0 23px 30px' }} />
          <div>↓ 离执行更近</div>
        </At>
        <ProductTower f={f} />
      </>
    );
  if (id === 'G06')
    return (
      <>
        <At x={160} y={280} style={{ width: 1600, height: 470, background: 'radial-gradient(ellipse,#FCFCFDEB 25%,#FCFCFD00 72%)' }} />
        <TitleBlock f={f} lines={['谢谢大家']} x={200} y={470} width={1520} size={112} center />
      </>
    );
  return null;
}
