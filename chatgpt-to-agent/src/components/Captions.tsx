import {useCurrentFrame} from 'remotion';
import {CAPTIONS, COLORS} from '../data/story';
import {FONT} from '../lib/fonts';

export const Captions = ({enabled}: {enabled: boolean}) => {
  const frame = useCurrentFrame();
  const cue = CAPTIONS.find((c) => frame >= c.start && frame < c.end);
  if (!enabled) return null;
  return <div data-testid="captions" data-caption-shot={cue?.shot ?? ''} style={{position: 'absolute', bottom: 64,
    left: 150, right: 150, height: 84, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: FONT.chinese, fontSize: 33, lineHeight: 1.5, fontWeight: 500, letterSpacing: .5,
    color: COLORS.ink, textAlign: 'center', zIndex: 20}}>
    {cue && <div style={{padding: '10px 28px', borderRadius: 9, border: '1px solid #DADCE080',
      background: '#FFFFFFED', boxShadow: '0 2px 10px #20212408'}}>{cue.text}</div>}
  </div>;
};
