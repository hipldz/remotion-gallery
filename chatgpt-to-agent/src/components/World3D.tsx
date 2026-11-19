import {useLayoutEffect, useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {useCurrentFrame} from 'remotion';
import {BoxGeometry, CatmullRomCurve3, DoubleSide, EdgesGeometry, PerspectiveCamera, TubeGeometry, Vector3} from 'three';
import {COLORS, HEIGHT, WIDTH, readableColor} from '../data/story';
import {appear, arrive, clamp, ease, smooth} from '../lib/motion';
import {FONT} from '../lib/fonts';

type V3 = [number, number, number];
export type WorldMode = 'layers' | 'capsule' | 'workflow' | 'orbit';
type CameraView = {position: V3; target: V3; fov: number};

const cameraView = (mode: WorldMode, f: number, duration: number): CameraView => {
  const p = ease(f, 0, duration);
  if (mode === 'layers') {
    const a = .73 + p * .45;
    return {position: [Math.cos(a)*9, 6.8+p*.3, Math.sin(a)*9], target: [1.1, 1.3, 0], fov: 40};
  }
  if (mode === 'capsule') {
    const far = ease(f, 150, 245);
    const follow = -3.3 + ease(f, 15, 145)*6;
    return {position: [follow*(1-far)+5.8*far, 3.5+far*2.5, 8+far*3.8], target: [follow*(1-far), .1, 0], fov: 44};
  }
  if (mode === 'workflow') {
    const sweep = ease(f, 20, duration-50, -3.3, 2);
    const lift = ease(f, 200, 310);
    return {position: [sweep+2.1, 3.3+lift*3.8, 10.5], target: [sweep*.55, 0, -.2], fov: 43};
  }
  const a = .25 + p*.7;
  return {position: [Math.sin(a)*10, 8.8, Math.cos(a)*11.8], target: [0, .6, .2], fov: 43};
};

const project = (position: V3, view: CameraView) => {
  const camera = new PerspectiveCamera(view.fov, WIDTH/HEIGHT, .1, 100);
  camera.position.set(...view.position);
  camera.lookAt(new Vector3(...view.target));
  camera.updateMatrixWorld();
  const v = new Vector3(...position).project(camera);
  return {x: (v.x + 1) * WIDTH / 2, y: (1-v.y) * HEIGHT / 2};
};

const CameraRig = ({view}: {view: CameraView}) => {
  const {camera, invalidate} = useThree();
  useLayoutEffect(() => {
    camera.position.set(...view.position);
    camera.lookAt(new Vector3(...view.target));
    camera.updateMatrixWorld();
    invalidate();
  }, [camera, invalidate, view]);
  return null;
};

const GlassBlock = ({size = [2, .16, 1.4], color, opacity = .18, ...props}: {
  size?: V3; color: string; opacity?: number; position?: V3; rotation?: V3; scale?: number | V3;
}) => {
  const edge = useMemo(() => new EdgesGeometry(new BoxGeometry(...size)), [size[0], size[1], size[2]]);
  return <group {...props}>
    <mesh><boxGeometry args={size} /><meshBasicMaterial color={color} toneMapped={false} transparent
      opacity={Math.min(.8, .2+opacity*2)} side={DoubleSide} depthWrite={false} /></mesh>
    <lineSegments geometry={edge}><lineBasicMaterial color={color} toneMapped={false} transparent opacity={.9} /></lineSegments>
  </group>;
};

const Tube = ({points, color, radius = .022, opacity = .5, closed = false}: {
  points: V3[]; color: string; radius?: number; opacity?: number; closed?: boolean;
}) => {
  const key = JSON.stringify(points);
  const geometry = useMemo(() => new TubeGeometry(new CatmullRomCurve3(points.map((p) => new Vector3(...p)), closed, 'catmullrom', .5), 80, radius, 6, closed), [key, radius, closed]);
  return <mesh geometry={geometry}>
    <meshBasicMaterial color={color} toneMapped={false} transparent opacity={Math.min(.9, opacity+.18)} depthWrite={false} />
  </mesh>;
};

const GlowOrb = ({position, color, radius = .16, strength = 1}: {position: V3; color: string; radius?: number; strength?: number}) =>
  <group position={position}>
    <mesh><sphereGeometry args={[radius, 24, 16]} /><meshBasicMaterial color={color} toneMapped={false}
      transparent opacity={Math.min(1, .25+strength*.75)} /></mesh>
    <mesh scale={1.8}><sphereGeometry args={[radius, 20, 12]} /><meshBasicMaterial color={color} toneMapped={false}
      transparent opacity={.055*strength} depthWrite={false} /></mesh>
  </group>;

const Rings = ({position, color, f, size = .9}: {position: V3; color: string; f: number; size?: number}) =>
  <group position={position}>
    {[0, 1, 2].map((i) => <mesh key={i} rotation={[i*.65 + f/240, i*.8+f/300, i*.45]}>
      <torusGeometry args={[size+i*.1, .012, 6, 64]} />
      <meshBasicMaterial color={color} toneMapped={false} transparent opacity={.75-i*.12} />
    </mesh>)}
  </group>;

const WorldBase = ({color}: {color: string}) => <>
  <ambientLight intensity={1} color="#FFFFFF" />
  <directionalLight position={[-3, 8, 4]} intensity={1} color="#FFFFFF" />
  <fog attach="fog" args={[COLORS.bg, 17, 38]} />
  <mesh position={[0, -1.25, 0]} rotation={[-Math.PI/2, 0, 0]}>
    <planeGeometry args={[80, 80]} /><meshBasicMaterial color={COLORS.bg} toneMapped={false} />
  </mesh>
  <gridHelper args={[70, 70, color, COLORS.line]} position={[0, -1.24, 0]}
    material-transparent material-opacity={.18} material-toneMapped={false} />
</>;

const Layers = ({f}: {f: number}) => {
  const colors = [COLORS.blue, COLORS.yellow, COLORS.red, COLORS.green];
  return <group position={[-1.4, -.4, 0]}>
    {colors.map((color, i) => {
      const p = arrive(f, 14+i*44, 55);
      const y = i*.82 + (1-p)*3.4;
      return <group key={i} position={[0, y, 0]} scale={Math.max(.001, p)}>
        <GlassBlock color={color} size={[4.6, .18, 2.6]} opacity={.16} />
        <pointLight position={[0, .1, 0]} color={color} intensity={.9} distance={3} />
        <mesh rotation={[-Math.PI/2, 0, 0]} scale={1+ease(f, 14+i*44, 70+i*44)*1.4}>
          <ringGeometry args={[2, 2.016, 80]} /><meshBasicMaterial color={color} transparent opacity={.3*(1-ease(f, 40+i*44, 90+i*44))} side={DoubleSide} />
        </mesh>
      </group>;
    })}
    {[-1.8, 1.8].flatMap((x) => [-.8, .8].map((z) => <mesh key={`${x}-${z}`} position={[x, 1.2, z]} scale={[1, appear(f, 50, 130), 1]}>
      <cylinderGeometry args={[.014, .014, 2.8, 8]} /><meshBasicMaterial color={COLORS.line} transparent opacity={.3} />
    </mesh>))}
  </group>;
};

const capsulePosition = (f: number): V3 => {
  if (f < 90) return [-4+ease(f, 20, 85)*4, .35, 0];
  if (f < 155) return [ease(f, 102, 150)*4, .35, 0];
  const t = ease(f, 170, 255);
  return [4-8*t, .35+Math.sin(t*Math.PI)*.2, Math.sin(t*Math.PI)*2.6];
};

const Capsule = ({f}: {f: number}) => {
  const pos = capsulePosition(f);
  return <>
    <GlowOrb position={[-4, .35, 0]} color={COLORS.blue} radius={.54} />
    <Rings position={[-4, .35, 0]} color={COLORS.blue} f={f} size={.9} />
    <Tube color={COLORS.yellow} points={[[-4,.35,0], [-2,.35,0], [0,.35,0], [2,.35,0], [4,.35,0]]} opacity={.25} />
    <Tube color={COLORS.blue} points={[[4,.35,0], [3,.45,2], [0,.6,2.6], [-3,.45,2], [-4,.35,0]]} opacity={.33} />
    <group position={[0,.3,0]}>
      <GlassBlock color={COLORS.yellow} size={[.14, 2.4, 2.1]} opacity={.07} />
      <mesh position={[0,-.9+((f%65)/65)*2,0]}><boxGeometry args={[.18,.028,2]} /><meshBasicMaterial color={COLORS.yellow} transparent opacity={.7} /></mesh>
      {[-1, 1].map((z) => <mesh key={z} position={[0,0,z]}><boxGeometry args={[.2,2.7,.15]} /><meshBasicMaterial color={COLORS.yellow} toneMapped={false} /></mesh>)}
    </group>
    <group position={[4,.25,0]} rotation={[0,f/180,0]}>
      <GlassBlock color={COLORS.yellow} size={[1.8,1.8,1.8]} opacity={.11} />
      {[0,1,2].map((i) => <mesh key={i} rotation={[Math.PI/2,0,f/(60+i*10)]} position={[0,-.45+i*.45,0]}>
        <torusGeometry args={[.83,.047,8,36]} /><meshBasicMaterial color={COLORS.yellow} toneMapped={false} />
      </mesh>)}
    </group>
    <group position={pos} rotation={[0,0,Math.PI/2]}>
      <mesh><capsuleGeometry args={[.11,.36,5,16]} /><meshBasicMaterial color={f>170 ? COLORS.blue : COLORS.yellow} toneMapped={false} /></mesh>
      <pointLight color={f>170 ? COLORS.blue : COLORS.yellow} intensity={4} distance={4} />
    </group>
    {Array.from({length: 9}, (_, i) => <GlowOrb key={i} position={capsulePosition(Math.max(0,f-i*2))} radius={.035*(1-i/11)} color={f>170 ? COLORS.blue : COLORS.yellow} strength={.3*(1-i/10)} />)}
  </>;
};

const workflowXs = [-5, -2.5, 0, 2.5, 5];
const Workflow = ({f}: {f: number}) => {
  const progress = ease(f, 130, 305);
  const x = -5 + progress*10;
  const branch = progress > .72 && progress < .94;
  const pulse: V3 = [x, .32, branch ? -Math.sin((progress-.72)/.22*Math.PI)*2.0 : 0];
  return <>
    {workflowXs.map((x, i) => {
      const p = arrive(f, 10+i*18);
      const active = progress*4 >= i;
      return <group key={i} position={[x, (1-p)*3.5, 0]} scale={Math.max(.001,p)}>
        <GlassBlock color={COLORS.red} size={[1.35,.56,1.1]} opacity={active ? .25 : .12} />
        <mesh position={[0,.29,0]} rotation={[-Math.PI/2,0,0]}>
          <ringGeometry args={[.2,.23, i === 3 ? 4 : 32]} /><meshBasicMaterial color={active ? COLORS.redLight : COLORS.red} toneMapped={false} side={DoubleSide} />
        </mesh>
        <mesh position={[0,-1.2,0]}><cylinderGeometry args={[.016,.016,2.0,8]} /><meshBasicMaterial color={COLORS.red} transparent opacity={.17} /></mesh>
      </group>;
    })}
    {workflowXs.slice(0,-1).map((x,i) => <group key={i} scale={[Math.max(.001,ease(f,25+i*18,65+i*18)),1,1]} position={[x,0,0]}>
      <Tube color={COLORS.red} points={[[0,.32,0],[.8,.32,0],[2.5,.32,0]]} opacity={.5} />
    </group>)}
    <group scale={Math.max(.001,appear(f,95,45))}>
      <Tube color={COLORS.red} points={[[2.5,.32,0],[3.3,.32,-1.4],[4,.32,-2],[5,.32,0]]} opacity={.55} />
      <GlassBlock position={[4,.2,-2]} size={[.7,.3,.7]} color={COLORS.red} opacity={.16} />
    </group>
    {f > 110 && <GlowOrb position={pulse} color={COLORS.red} radius={.11} />}
    {Array.from({length: 7},(_,i) => {
      const p = clamp(progress - i*.01);
      return <GlowOrb key={i} position={[-5+p*10,.32, p>.72&&p<.94 ? -Math.sin((p-.72)/.22*Math.PI)*2 : 0]} color={COLORS.red} radius={.035} strength={.17} />;
    })}
    <group position={[5,.3,0]} scale={Math.max(.001,ease(f,310,365))}>
      {[0,1,2].map((i) => <GlassBlock key={i} color={COLORS.red} size={[.9,.03,1.15]} position={[i*.06,.5+i*.15,-i*.07]} opacity={.27} />)}
    </group>
  </>;
};

const orbitCurve = (index: number) => new CatmullRomCurve3([
  new Vector3(0,.65,0),
  new Vector3(index===1 ? -2.7 : 2.0, .85, index===1 ? -.8 : -.4),
  new Vector3(index===1 ? -3.2 : 3.1,.65,index===1 ? 1.8 : 1.4),
  new Vector3(.1,.65,3), new Vector3(-1,.75,1.9), new Vector3(0,.65,0),
], false, 'catmullrom', .45);

const Orbit = ({f}: {f: number}) => {
  const cycle = f < 106 ? 0 : f < 197 ? 1 : 2;
  const t = clamp((f - (cycle===0 ? 18 : cycle===1 ? 106 : 197)) / (cycle===2 ? 70 : 88));
  const point = cycle===2 && t>.62
    ? new Vector3(-ease(t,.62,1)*4.5,.65, -ease(t,.62,1)*1.2)
    : orbitCurve(cycle).getPointAt(cycle===2 ? Math.min(t/.62,1) : t);
  const colors = [COLORS.blue, COLORS.yellow, COLORS.red];
  return <>
    <GlowOrb position={[0,.65,0]} color={COLORS.green} radius={.48} />
    <Rings position={[0,.65,0]} color={COLORS.blue} f={f} size={.75} />
    <GlowOrb position={[0,3.1,-1.2]} color={COLORS.blue} radius={.14} />
    <Tube points={[[0,3.1,-1.2],[0,2,-.6],[0,.65,0]]} color={COLORS.blue} opacity={.23} />
    <GlassBlock position={[3.1,.65,1.4]} size={[.72,.72,.72]} color={COLORS.yellow} opacity={.28} />
    <GlassBlock position={[-3.2,.65,1.8]} size={[.72,.72,.72]} color={COLORS.yellow} opacity={cycle>=1 ? .28 : .05} />
    <Rings position={[.1,.65,3]} color={COLORS.red} f={f} size={.35} />
    <GlowOrb position={[-4.5,.65,-1.2]} color={COLORS.green} radius={.16} strength={f>245 ? 1 : .15} />
    {[0,1,2].map((i) => {
      const curve = orbitCurve(i);
      const segment = i===cycle ? t : i<cycle ? 1 : 0;
      const pts: V3[] = Array.from({length: 40}, (_,n) => curve.getPointAt(Math.max(.001,segment)*n/39).toArray() as V3);
      return <Tube key={i} points={pts} color={colors[i]} opacity={i===cycle ? .58 : .18} radius={.015} />;
    })}
    {f>237 && <Tube color={COLORS.green} points={[[0,.65,0],[-2.6,.65,-.5],[-4.5,.65,-1.2]]} opacity={ease(f,237,280)*.6} />}
    <GlowOrb position={point.toArray() as V3} color={cycle===2 && t>.62 ? COLORS.green : colors[cycle]} radius={.105} />
    <mesh position={[0,.1,.4]} rotation={[-Math.PI/2,0,0]}>
      <torusGeometry args={[5.25,.018,5,100]} /><meshBasicMaterial color={COLORS.green} transparent opacity={.16+.1*Math.sin(f/22)} />
    </mesh>
  </>;
};

const ProjectedLabel = ({position, view, text, detail, color, opacity = 1}: {position: V3; view: CameraView; text: string; detail?: string; color: string; opacity?: number}) => {
  const {x,y} = project(position, view);
  return <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', opacity,
    textAlign: 'center', fontFamily: FONT.sans, whiteSpace: 'nowrap', textShadow: '0 1px 0 #FFFFFF'}}>
    <div style={{fontSize: 24, fontWeight: 600, color: readableColor(color)}}>{text}</div>
    {detail && <div style={{fontSize: 17, marginTop: 8, color: COLORS.gray, fontFamily: FONT.chinese}}>{detail}</div>}
  </div>;
};

export const World3D = ({mode, duration}: {mode: WorldMode; duration: number}) => {
  const f = useCurrentFrame();
  const view = cameraView(mode,f,duration);
  const color = mode==='workflow' ? COLORS.red : mode==='capsule' ? COLORS.yellow : COLORS.green;
  return <>
    <ThreeCanvas width={WIDTH} height={HEIGHT} flat frameloop="demand" camera={{position: view.position, fov: view.fov, near: .1, far: 100}}
      gl={{alpha: true, antialias: true, powerPreference: 'high-performance'}} style={{position: 'absolute', inset: 0}}>
      <CameraRig view={view} /><WorldBase color={color} />
      {mode==='layers' ? <Layers f={f} /> : mode==='capsule' ? <Capsule f={f} /> : mode==='workflow' ? <Workflow f={f} /> : <Orbit f={f} />}
    </ThreeCanvas>
    {mode==='layers' && <div style={{position:'absolute', right: 155, top: 218, width: 510}}>
      {[
        ['2025–26', 'Agent', '观察与自主选步',COLORS.green],
        ['2023–24', 'Workflow', '多节点自动化',COLORS.red],
        ['2023', 'Tool Use', '模型请求工具',COLORS.yellow],
        ['2023', 'Chatbot', '对话与生成',COLORS.blue],
      ].map(([year,title,detail,c],i) => <div key={title} style={{marginBottom: 28, opacity: appear(f, 12+(3-i)*44,32),
        transform:`translateX(${(1-appear(f,12+(3-i)*44,32))*22}px)`, borderLeft:`2px solid ${c}80`, paddingLeft: 26}}>
        <div style={{fontFamily:FONT.mono,fontSize:15,color:readableColor(c),letterSpacing:2}}>{year}</div>
        <div style={{fontFamily:FONT.sans,fontSize:37,fontWeight:600,color:COLORS.ink,marginTop:4}}>{title}</div>
        <div style={{fontFamily:FONT.chinese,fontSize:21,color:COLORS.gray,marginTop:5}}>{detail}</div>
      </div>)}
    </div>}
    {mode==='capsule' && <>
      <ProjectedLabel position={[-4,1.75,0]} view={view} text="Model" detail="提出调用意图" color={COLORS.blue} />
      <ProjectedLabel position={[0,2,0]} view={view} text="Runtime" detail={f>75?'✓ 参数校验  /  ✓ 权限':'执行环境'} color={COLORS.yellow} />
      <ProjectedLabel position={[4,1.8,0]} view={view} text="QUAST" detail={f>165?'N50 = 182,340':'执行工具'} color={COLORS.yellow} />
    </>}
    {mode==='workflow' && workflowXs.map((x,i) => <ProjectedLabel key={i} position={[x,1,0]} view={view}
      text={['读取 FASTA','运行 QC','解析指标','规则判断','生成报告'][i]} detail={i===3 && f>130 ? 'if N50 < 阈值' : ['Node','Tool','Parse','Condition','Output'][i]}
      color={COLORS.red} opacity={appear(f,15+i*18,30)} />)}
    {mode==='orbit' && <>
      <ProjectedLabel position={[0,1.85,0]} view={view} text="Model" detail="决定下一步" color={COLORS.blue} />
      <ProjectedLabel position={[0,3.65,-1.2]} view={view} text="Goal" detail="目标与约束" color={COLORS.blue} />
      <ProjectedLabel position={[3.1,1.55,1.4]} view={view} text="Tool A" detail="执行真实操作" color={COLORS.yellow} />
      <ProjectedLabel position={[-3.2,1.55,1.8]} view={view} text="Tool B" detail="按观察更换工具" color={COLORS.yellow} opacity={appear(f,106,22)} />
      <ProjectedLabel position={[.1,1.45,3]} view={view} text="Observation" detail="读取结果与错误" color={COLORS.red} />
      <ProjectedLabel position={[-4.5,1.4,-1.2]} view={view} text="Finish" detail="交付结果" color={COLORS.green} opacity={appear(f,237,25)} />
    </>}
  </>;
};
