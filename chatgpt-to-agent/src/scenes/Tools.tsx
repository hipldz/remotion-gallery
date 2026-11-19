import {useCurrentFrame} from 'remotion';
import {Trail} from '@remotion/motion-blur';
import {COLORS, readableColor} from '../data/story';
import {ChapterLabel, RevealText} from '../components/Typography';
import {World3D} from '../components/World3D';
import {FONT} from '../lib/fonts';
import {appear, ease, seeded} from '../lib/motion';

const jsonTokens: {text:string;color:string}[] = [
  {text:'{\n  ',color:'#202124'},
  {text:'"tool"',color:COLORS.blueLight}, {text:': ',color:'#202124'},
  {text:'"run_quast"',color:COLORS.yellow}, {text:',\n  ',color:'#202124'},
  {text:'"arguments"',color:COLORS.blueLight}, {text:': {\n    ',color:'#202124'},
  {text:'"assembly_path"',color:COLORS.blueLight}, {text:':\n      ',color:'#202124'},
  {text:'"samples/S01.fasta"',color:COLORS.yellow}, {text:'\n  }\n}',color:'#202124'},
];
const jsonLength=jsonTokens.reduce((sum,token)=>sum+token.text.length,0);

const RequestCapsule = () => {
  const f=useCurrentFrame();
  return <div style={{position:'absolute',left:945+ease(f,173,210)*410,top:511,width:76,height:26,borderRadius:30,
    opacity:appear(f,153,18),background:'linear-gradient(90deg,#FEF7E0,#FBBC04,#FBBC04)',
    transform:`scale(${ease(f,154,176,.6,1)})`,boxShadow:'0 4px 12px #20212412'}} />;
};

export const JsonRequest = () => {
  const f=useCurrentFrame();
  const count=Math.floor(ease(f,20,128,0,jsonLength));
  const fold=ease(f,142,172);
  let used=0;
  return <>
    <ChapterLabel index="02" label="TOOL USE / FUNCTION CALLING" color={COLORS.yellow} subtitle="2023 / STRUCTURED INTENT" />
    <div style={{position:'absolute',left:120,top:217,fontFamily:FONT.sans,fontSize:195,fontWeight:650,color:'#FBBC0409',letterSpacing:-10}}>2023</div>
    <div style={{position:'absolute',left:350,top:217,width:4,height:600,opacity:1-ease(f,40,110),
      background:'linear-gradient(transparent,#FBBC04,transparent)',boxShadow:'0 0 40px #FBBC0480',transform:'rotate(13deg)'}} />
    <div style={{position:'absolute',left:605,top:256,width:805,padding:'27px 40px 34px',fontFamily:FONT.mono,fontSize:29,lineHeight:1.75,
      border:'1px solid #FBBC0450',borderRadius:15,background:'linear-gradient(135deg,#FFFFFFaa,#F8F9FAed)',
      transform:`perspective(1600px) rotateY(-4deg) rotateX(${fold*88}deg) scale(${1-fold*.82})`,opacity:1-fold,
      boxShadow:'0 0 65px #FBBC0410, 0 25px 90px #20212414'}}>
      <div style={{fontSize:14,letterSpacing:3,color:'#8D6600',marginBottom:17}}>TOOL CALL / JSON</div>
      <pre style={{margin:0,font:'inherit',whiteSpace:'pre'}}>{jsonTokens.map((token,i)=>{
        const start=used; used+=token.text.length;
        return <span key={i} style={{color:readableColor(token.color)}}>{token.text.slice(0,Math.max(0,count-start))}</span>;
      })}<span style={{opacity:Math.floor(f/14)%2?0:1,color:COLORS.yellow}}>▌</span></pre>
    </div>
    <div style={{position:'absolute',left:151,top:568,opacity:appear(f,87,24)}}>
      <RevealText text="调用请求" start={88} size={50} color={COLORS.yellow} />
      <div style={{marginTop:16,fontFamily:FONT.mono,fontSize:18,color:'#5F6368',letterSpacing:3}}>INTENT → ACTION</div>
    </div>
    <Trail layers={6} lagInFrames={.55} trailOpacity={.14}><RequestCapsule /></Trail>
  </>;
};

export const CapsuleJourney = ({duration}:{duration:number}) => {
  const f=useCurrentFrame();
  return <>
    <World3D mode="capsule" duration={duration} />
    <ChapterLabel index="02" label="THE EXECUTION LOOP" color={COLORS.yellow} />
    <div style={{position:'absolute',left:116,bottom:235,opacity:appear(f,205,30)}}>
      <RevealText text="模型发出请求" start={203} size={47} color={COLORS.blueLight} />
      <RevealText text="程序执行工具" start={228} size={47} color={COLORS.yellow} style={{marginTop:10}} />
    </div>
    <div style={{position:'absolute',right:116,bottom:197,fontFamily:FONT.mono,fontSize:14,color:'#5F6368'}}>N50 / 演示数据</div>
  </>;
};

const mazeNodes=Array.from({length:40},(_,i)=>({x:170+seeded(i,11)*1580,y:190+seeded(i,12)*610}));
export const TaskMaze = () => {
  const f=useCurrentFrame();
  const pull=ease(f,0,210,2.9,1);
  return <>
    <ChapterLabel index="02" label="BEYOND ONE TOOL CALL" color={COLORS.yellow} />
    <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position:'absolute',inset:0,
      transform:`scale(${pull})`,transformOrigin:'960px 540px',opacity:appear(f,4,50)}}>
      <defs><filter id="maze-glow"><feGaussianBlur stdDeviation="3"/></filter></defs>
      {mazeNodes.map((node,i)=>{
        const target=mazeNodes[(i*7+9)%mazeNodes.length];
        const p=appear(f,15+i*2.5,60);
        const d=`M ${node.x} ${node.y} C ${node.x+160} ${node.y-140} ${target.x-120} ${target.y+100} ${target.x} ${target.y}`;
        const failure=i%13===0;
        return <g key={i}>
          <path d={d} fill="none" stroke={failure?COLORS.red:COLORS.yellow} strokeWidth="1" opacity={failure?.4:.16}
            pathLength="1" strokeDasharray="1" strokeDashoffset={1-p} />
          {i%4===0&&<path d={d} fill="none" stroke={COLORS.yellow} strokeWidth="2" opacity=".6" pathLength="1" strokeDasharray=".035 .965" strokeDashoffset={-((f*.003+i*.11)%1)} />}
          <circle cx={node.x} cy={node.y} r={failure?5:3} fill={failure?COLORS.red:'#FBBC04'} opacity={p*(failure?.5+.5*Math.sin(f/12):.55)} />
          {failure&&<circle cx={node.x} cy={node.y} r="22" fill={COLORS.red} opacity={.07+.04*Math.sin(f/12)} filter="url(#maze-glow)" />}
        </g>;
      })}
      <circle cx="960" cy="540" r="7" fill="#FBBC04" style={{filter:'drop-shadow(0 0 8px #FBBC04)'}} />
      <circle cx="960" cy="540" r="19" fill="none" stroke={COLORS.yellow} strokeWidth="1" opacity=".4" />
    </svg>
    <div style={{position:'absolute',left:280,right:280,top:426,height:200,background:'radial-gradient(ellipse,#FFFFFFe8,transparent 70%)',filter:'blur(24px)',opacity:appear(f,110,30)}} />
    <RevealText text="把几次调用串起来" start={125} size={79}
      style={{position:'absolute',left:0,right:0,top:456,textAlign:'center'}} />
    <div style={{position:'absolute',left:0,right:0,top:617,textAlign:'center',fontFamily:FONT.mono,fontSize:18,color:'#8D6600',
      letterSpacing:4,opacity:appear(f,176,30)}}>DEPENDENCIES / RETRIES / TERMINATION</div>
  </>;
};
