import { Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import gif from '../data/follow-gif.json';
import { fade, move } from '../lib/cinematics';
import { At } from '../components/Primitives';
import { Note, TitleBlock } from '../components/CinematicActors';

export function FollowRequest({ f }: { f: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = Math.floor((Math.max(0, frame) * 1000) / fps) % gif.durationMs;
  const index = gif.frames.findIndex((entry) => time < entry.toMs);
  const width = 905;
  const scale = width / gif.width;
  const column = index % gif.columns;
  const row = Math.floor(index / gif.columns);
  const opacity = fade(f, 0, 16) * (1 - fade(f, 166, 14));
  return (
    <div data-follow-request style={{ opacity }}>
      <At x={135} y={135} style={{ fontSize: 29, color: '#8A7281', opacity: fade(f, 5, 15) }}>
        开讲前，麻烦大家帮个忙。
      </At>
      <At
        x={115}
        y={290}
        style={{
          width,
          height: gif.height * scale,
          overflow: 'hidden',
          transform: `translateY(${move(f, 0, 25, 24, 0)}px)`,
        }}
      >
        <Img
          data-follow-gif-frame={index}
          alt="求关注，帮助升到 LV2"
          src={staticFile(gif.atlas)}
          style={{
            position: 'absolute',
            width: gif.width * gif.columns * scale,
            height: gif.height * gif.rows * scale,
            maxWidth: 'none',
            left: -column * gif.width * scale,
            top: -row * gif.height * scale,
          }}
        />
      </At>
      <TitleBlock f={f} start={8} x={1100} y={330} width={720} size={67} accent="#FB568F" eyebrow="谢谢大家的支持" lines={['求个关注，', '帮我升到 LV2。']} />
      <Note f={f} start={42} x={1107} y={645} width={650} size={45} color="#F14D87">
        多谢多谢！
      </Note>
    </div>
  );
}
