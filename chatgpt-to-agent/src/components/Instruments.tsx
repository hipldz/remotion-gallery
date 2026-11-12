import type {CSSProperties} from 'react';
import {useCurrentFrame} from 'remotion';
import {COLORS, readableColor} from '../data/story';
import {FONT} from '../lib/fonts';
import {appear, ease} from '../lib/motion';

export const DnaHelix = ({color = COLORS.blue, style = {}}: {color?: string; style?: CSSProperties}) => {
  const f=useCurrentFrame();
  const rungs=Array.from({length:54},(_,i) => {
    const a=i*.26+f/95;
    return {y:60+i*15,x:Math.sin(a)*135,depth:Math.cos(a)};
  });
  const path=(sign:number) => rungs.map((r,i) => `${i?'L':'M'} ${230+r.x*sign} ${r.y}`).join(' ');
  return <svg width="460" height="930" viewBox="0 0 460 930" style={{position:'absolute',...style}}>
    <defs><linearGradient id="dna-g" x1="0" x2="1"><stop stopColor={color} stopOpacity=".1"/><stop offset=".5" stopColor={color} stopOpacity=".65"/><stop offset="1" stopColor={color} stopOpacity=".1"/></linearGradient></defs>
    {rungs.map((r,i) => <g key={i} opacity={.15+(r.depth+1)*.15}>
      <line x1={230-r.x} x2={230+r.x} y1={r.y} y2={r.y} stroke="url(#dna-g)" strokeWidth={1.5+(r.depth+1)*.5} />
      <circle cx={230+r.x} cy={r.y} r={2.2+(r.depth+1)} fill={color} />
      <circle cx={230-r.x} cy={r.y} r={2.2+(1-r.depth)} fill="#adc5e9" />
    </g>)}
    <path d={path(1)} fill="none" stroke={color} strokeWidth="2" opacity=".28" />
    <path d={path(-1)} fill="none" stroke="#aec2e0" strokeWidth="2" opacity=".2" />
  </svg>;
};

export const Terminal = ({lines, title='runtime / shell', color=COLORS.blue, start=0, step=22, style={}}: {
  lines:{text:string;color?:string}[]; title?:string; color?:string; start?:number; step?:number; style?:CSSProperties;
}) => {
  const f=useCurrentFrame();
  return <div style={{position:'absolute',width:770,padding:'24px 30px 29px',border:`1px solid ${COLORS.line}`,borderLeft:`3px solid ${color}`,borderRadius:15,
    background:'#FFFFFF',boxShadow:'0 14px 45px #20212412',fontFamily:FONT.mono,...style}}>
    <div style={{color:COLORS.gray,fontSize:14,letterSpacing:2,paddingBottom:18,borderBottom:`1px solid ${COLORS.line}`,marginBottom:21}}>{title}</div>
    {lines.map((line,i) => {
      const local=f-start-i*step;
      const length=Math.floor(ease(local,0,Math.max(8,line.text.length*.6),0,line.text.length));
      return <div key={i} style={{fontSize:20,lineHeight:1.95,color:readableColor(line.color??COLORS.ink),minHeight:39,whiteSpace:'pre',opacity:appear(local,0,8)}}>
        {line.text.slice(0,length)}{local>0&&local<line.text.length*.6+20?<span style={{color,opacity:Math.floor(f/14)%2?0:1}}>▌</span>:null}
      </div>;
    })}
  </div>;
};

export const GenomeFile = ({label='S01.fasta', color=COLORS.gray, style={}}: {label?:string;color?:string;style?:CSSProperties}) =>
  <div style={{position:'absolute',width:135,textAlign:'center',fontFamily:FONT.mono,...style}}>
    <svg width="90" height="114" viewBox="0 0 90 114" style={{filter:`drop-shadow(0 0 13px ${color}25)`}}>
      <path d="M 15 6 L 57 6 L 78 27 L 78 105 L 15 105 Z" fill={`${color}0e`} stroke={color} strokeWidth="1.3"/>
      <path d="M 56 7 L 56 28 L 77 28" fill="none" stroke={color} strokeWidth="1.3"/>
      {[44,55,66,77,88].map((y,i)=><line key={y} x1="26" y1={y} x2={61-i%2*10} y2={y} stroke={color} opacity=".55" />)}
      <text x="43" y="39" textAnchor="middle" fill={color} fontSize="11" fontFamily="monospace">FASTA</text>
    </svg>
    <div style={{color:readableColor(color),fontSize:16,marginTop:7}}>{label}</div>
  </div>;
