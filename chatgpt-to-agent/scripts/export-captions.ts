import {writeFileSync} from 'node:fs';
import {CAPTIONS,FPS} from '../src/data/story';

const timestamp=(frame:number,separator:string)=>{
  const ms=Math.round(frame/FPS*1000);
  const clock=[Math.floor(ms/3600000),Math.floor(ms/60000)%60,Math.floor(ms/1000)%60]
    .map(value=>value.toString().padStart(2,'0')).join(':');
  return `${clock}${separator}${(ms%1000).toString().padStart(3,'0')}`;
};
const srt=CAPTIONS.map((cue,i)=>`${i+1}\n${timestamp(cue.start,',')} --> ${timestamp(cue.end,',')}\n${cue.text}\n`).join('\n');
const vtt='WEBVTT\n\n'+CAPTIONS.map(cue=>`${timestamp(cue.start,'.')} --> ${timestamp(cue.end,'.')}\n${cue.text}\n`).join('\n');
writeFileSync('public/captions.srt',srt,'utf8');
writeFileSync('public/captions.vtt',vtt,'utf8');
console.log(`Saved public/captions.srt and public/captions.vtt (${CAPTIONS.length} cues).`);
