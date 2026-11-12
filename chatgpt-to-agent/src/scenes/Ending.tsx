import {useCurrentFrame} from 'remotion';
import {COLORS, readableColor} from '../data/story';
import {ChapterLabel, AccentText, RevealText} from '../components/Typography';
import {LightCore} from '../components/LightCore';
import {FONT} from '../lib/fonts';
import {appear, ease, hold, seeded} from '../lib/motion';

export const ControlSplit = () => {
  const f=useCurrentFrame();
  const hand=1-ease(f,65,100);
  return <>
    <ChapterLabel index="THE SHIFT" label="WHO CHOOSES THE NEXT STEP?" color={COLORS.green} />
    <RevealText text="下一步，由谁决定" start={18} size={57} style={{position:'absolute',left:0,right:0,top:164,textAlign:'center'}} />
    <div style={{position:'absolute',left:959,top:302,bottom:219,width:1,
      background:'linear-gradient(transparent,#DADCE080,transparent)',opacity:appear(f,15,30)}} />
    <div style={{position:'absolute',left:180,top:331,opacity:appear(f,35),fontFamily:FONT.sans}}>
      <div style={{fontSize:16,letterSpacing:5,color:COLORS.red}}>WORKFLOW</div>
      <div style={{fontFamily:FONT.chinese,fontSize:73,fontWeight:600,color:'#EA4335',marginTop:18}}>设计时</div>
    </div>
    <div style={{position:'absolute',left:1104,top:331,opacity:appear(f,55),fontFamily:FONT.sans}}>
      <div style={{fontSize:16,letterSpacing:5,color:COLORS.green}}>AGENT</div>
      <div style={{fontFamily:FONT.chinese,fontSize:73,fontWeight:600,marginTop:18}}><AccentText>运行时</AccentText></div>
    </div>
    <div style={{position:'absolute',left:130,top:523,width:740,height:198,transform:`translateX(${ease(f,0,300,-10,10)}px)`}}>
      <svg width="740" height="198">
        <path d="M 60 84 L 688 84 M 60 98 L 688 98" fill="none" stroke={COLORS.red} opacity=".45" />
        {Array.from({length:20},(_,i)=><line key={i} x1={60+i*32} x2={60+i*32} y1="77" y2="105" stroke={COLORS.red} opacity=".24" />)}
        {[80,366,659].map((x,i)=><g key={x} opacity={appear(f,15+i*12,25)}>
          <rect x={x-47} y="58" width="94" height="64" rx="9" stroke={COLORS.red} fill="#FCE8E6" />
          <text x={x} y="98" fontSize="23" fontFamily={FONT.chinese} textAnchor="middle" fill="#B3261E">{['节点 A','规则','节点 B'][i]}</text>
        </g>)}
        {f>94&&<circle cx={80+((f-94)%120)/120*580} cy="91" r="5" fill="#EA4335" style={{filter:'drop-shadow(0 0 9px #EA4335)'}} />}
      </svg>
    </div>
    <svg width="450" height="180" viewBox="0 0 450 180" style={{position:'absolute',left:188+ease(f,12,65,0,300),top:421,opacity:hand*appear(f,10)}}>
      <path d="M 25 171 L 128 114 C 153 106 173 89 188 70 L 248 18 C 257 10 271 11 275 22 C 279 33 267 45 248 65 L 216 93 L 325 88 C 339 87 345 100 330 110 L 254 145 L 195 167"
        fill="#FCE8E6aa" stroke="#EA4335" strokeWidth="2" />
    </svg>
    <svg width="790" height="360" viewBox="0 0 790 360" style={{position:'absolute',left:1010,top:486,
      transform:`translateY(${ease(f,0,300,10,-12)}px)`}}>
      <defs><filter id="tree-glow"><feGaussianBlur stdDeviation="4"/></filter></defs>
      {[
        {d:'M 134 171 C 240 171 256 57 407 54',start:54,color:COLORS.blue},
        {d:'M 134 171 C 250 171 305 171 481 171',start:119,color:COLORS.yellow},
        {d:'M 481 171 C 540 186 355 293 250 245 C 180 218 188 171 134 171',start:152,color:COLORS.red},
        {d:'M 134 171 C 260 171 405 282 608 282',start:209,color:COLORS.green},
      ].map(({d,start,color})=><g key={d}>
        <path d={d} fill="none" stroke={color} strokeWidth="6" opacity=".2" filter="url(#tree-glow)" pathLength="1" strokeDasharray="1" strokeDashoffset={1-ease(f,start,start+56)} />
        <path d={d} fill="none" stroke={color} strokeWidth="1.6" opacity=".75" pathLength="1" strokeDasharray="1" strokeDashoffset={1-ease(f,start,start+56)} />
      </g>)}
      {[[134,171,'模型判断',35],[407,54,'工具 A',96],[481,171,'工具 B',161],[608,282,'完成',247]].map(([x,y,text,start],i)=><g key={text} opacity={appear(f,Number(start),22)}>
        <circle cx={Number(x)} cy={Number(y)} r={i===0?12:6} fill={[COLORS.blueLight,COLORS.blueLight,COLORS.yellow,COLORS.green][i]} />
        <text x={Number(x)} y={Number(y)-25} fill="#5F6368" fontSize="22" fontFamily={FONT.chinese} textAnchor="middle">{String(text)}</text>
      </g>)}
    </svg>
    <div style={{position:'absolute',left:180,top:774,fontFamily:FONT.chinese,fontSize:28,color:'#B3261E',opacity:appear(f,85)}}>规则在设计时写好</div>
    <div style={{position:'absolute',left:1104,top:774,fontFamily:FONT.chinese,fontSize:28,color:'#188038',opacity:appear(f,174)}}>下一步在运行时决定</div>
  </>;
};

const ConversationGlyph = ({color}:{color:string}) => <svg width="235" height="225" viewBox="0 0 235 225" style={{filter:`drop-shadow(0 0 24px ${color}40)`}}>
  <path d="M 32 34 L 183 34 Q 207 34 207 60 L 207 141 Q 207 167 183 167 L 93 167 L 52 193 L 56 167 L 32 167 Q 10 167 10 141 L 10 60 Q 10 34 32 34 Z"
    fill={`${color}0e`} stroke={color} strokeWidth="1.7" />
  {[71,99,126].map((y,i)=><path key={y} d={`M 46 ${y} L ${170-i*21} ${y}`} stroke={color} strokeWidth="3" opacity=".65" />)}
</svg>;
const WorkflowGlyph = () => <svg width="235" height="225" viewBox="0 0 235 225" style={{filter:'drop-shadow(0 0 24px #EA433538)'}}>
  <ellipse cx="115" cy="108" rx="94" ry="58" fill="#EA433508" stroke={COLORS.red} strokeWidth="1.7" />
  {[[28,108],[113,51],[205,108],[113,165]].map(([x,y],i)=><rect key={i} x={x-13} y={y-13} width="26" height="26" rx="5" stroke={COLORS.red} fill="#FCE8E6" />)}
</svg>;

export const ThreeSentences = () => {
  const f=useCurrentFrame();
  const stages=[{title:'Chatbot',text:'你问我答',start:5,end:103,color:COLORS.blueLight},
    {title:'Workflow',text:'流程搭好，自动跑',start:97,end:201,color:COLORS.redLight},
    {title:'Agent',text:'说清目标，它自己选下一步',start:195,end:324,color:COLORS.green}];
  return <>
    <ChapterLabel index="IN ONE SENTENCE" label="THREE WAYS TO WORK" color={COLORS.green} />
    {stages.map((stage,i)=>{
      const opacity=hold(f,stage.start,stage.end,17);
      const push=ease(f,stage.start,stage.end, .95,1.045);
      return <div key={stage.title} style={{position:'absolute',left:0,right:0,top:320,opacity,
        transform:`perspective(1800px) translateZ(${ease(f,stage.start,stage.end,-70,70)}px) scale(${push})`}}>
        <div style={{position:'absolute',left:250,top:94}}>{i===0?<ConversationGlyph color={COLORS.blue} />:i===1?<WorkflowGlyph />:<LightCore size={250} id="summary-core" />}</div>
        <div style={{position:'absolute',left:566,top:37,fontFamily:FONT.sans,fontSize:110,fontWeight:600,letterSpacing:-5,color:readableColor(stage.color)}}>
          {i===2?<AccentText>{stage.title}</AccentText>:stage.title}
        </div>
        <RevealText text={stage.text} start={stage.start+20} size={i===2?60:71} color="#202124"
          style={{position:'absolute',left:574,top:201,fontWeight:500,letterSpacing:-1}} />
        <div style={{position:'absolute',left:574,top:344,width:ease(f,stage.start+35,stage.start+77,0,600),height:1,
          background:`linear-gradient(90deg,${stage.color},transparent)`,boxShadow:`0 0 14px ${stage.color}65`}} />
      </div>;
    })}
    {f>218&&<>
      <div style={{position:'absolute',left:210+ease(f,220,285)*130,top:410,opacity:.13*(1-ease(f,220,290)),
        transform:`scale(${1-ease(f,220,290)*.9})`,filter:'blur(4px)'}}><ConversationGlyph color={COLORS.blue} /></div>
      <div style={{position:'absolute',left:390-ease(f,220,285)*30,top:522,opacity:.12*(1-ease(f,220,290)),
        transform:`scale(${1-ease(f,220,290)*.9})`,filter:'blur(5px)'}}><WorkflowGlyph /></div>
    </>}
  </>;
};

const universe=Array.from({length:45},(_,i)=>({x:110+seeded(i,32)*1700,y:130+seeded(i,37)*730}));
export const Closing = (_props:{channelName:string}) => {
  const f=useCurrentFrame();
  const pull=ease(f,0,210,1.13,.97);
  return <>
    <svg width="1920" height="1080" style={{position:'absolute',inset:0,transform:`scale(${pull})`,opacity:.55}}>
      {universe.map((p,i)=>{
        const q=universe[(i+7)%universe.length];
        return <g key={i}><path d={`M ${p.x} ${p.y} L ${q.x} ${q.y}`} fill="none" stroke={[COLORS.blue,COLORS.green,COLORS.red][i%3]}
          opacity={appear(f,20+i*2,70)*.12} strokeWidth=".7"/><circle cx={p.x} cy={p.y} r={i%7===0?2.3:1.1} fill="#DADCE0" opacity=".6"/></g>;
      })}
    </svg>
    <div style={{position:'absolute',left:960-46,top:220-46,transform:`scale(${ease(f,0,160,1,.55)})`,opacity:.65}}><LightCore size={92} id="closing-core" /></div>
    <div style={{position:'absolute',left:0,right:0,top:336,textAlign:'center',fontFamily:FONT.sans,
      opacity:appear(f,20,36),transform:`translateY(${ease(f,20,95,12,0)}px)`}}>
      <div data-testid="closing-message" style={{fontSize:92,fontWeight:600,letterSpacing:-3,lineHeight:1.4,color:COLORS.ink,whiteSpace:'nowrap'}}>
        了解 <span style={{color:COLORS.blue}}>Agent</span>，才能用好 <span style={{color:COLORS.green}}>Agent</span>
      </div>
      <div style={{fontFamily:FONT.chinese,fontSize:32,color:COLORS.gray,letterSpacing:4,marginTop:45,opacity:appear(f,112,20)}}>本期分享结束</div>
    </div>
    <div style={{position:'absolute',left:0,right:0,top:771,textAlign:'center',fontFamily:FONT.chinese,
      fontSize:32,color:COLORS.ink,letterSpacing:4,opacity:appear(f,132,20)}}>谢谢大家</div>
  </>;
};
