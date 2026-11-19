import {AbsoluteFill} from 'remotion';
import type {TransitionPresentation, TransitionPresentationComponentProps} from '@remotion/transitions';

type OpticalProps = {kind:'focus'|'light'|'dissolve'; color:string};
const Optical = ({children,presentationDirection,presentationProgress,passedProps}:TransitionPresentationComponentProps<OpticalProps>) => {
  const incoming=presentationDirection==='entering';
  const p=presentationProgress;
  const amount=incoming?1-p:p;
  const pulse=Math.sin(p*Math.PI);
  return <AbsoluteFill style={{opacity:incoming?p:1-p,
    filter:passedProps.kind==='focus'?`blur(${amount*13}px)`:undefined,
    transform:passedProps.kind==='light'?`scale(${1+amount*.055})`:undefined}}>
    {children}
    {passedProps.kind==='light'&&<AbsoluteFill style={{background:`radial-gradient(ellipse,${passedProps.color}1c,transparent 70%)`,
      opacity:pulse*.35, mixBlendMode:'normal'}} />}
  </AbsoluteFill>;
};

export const optical = (kind:OpticalProps['kind'],color:string):TransitionPresentation<OpticalProps> => ({component:Optical,props:{kind,color}});
