import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {PNG} from 'pngjs';
import {CAPTIONS, SHOTS} from '../src/data/story';

// Browser screenshots only: this test never calls renderMedia, renderStill, or an encoder.
const main=async()=>{
const output=resolve(process.env.REVIEW_OUTPUT_DIR??'build/review');
mkdirSync(output,{recursive:true});
const executablePath=[
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find(existsSync);
const browser=await chromium.launch({headless:true,executablePath,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1600,height:1060},deviceScaleFactor:1});
const errors:string[]=[];
const missing:string[]=[];
const external:string[]=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
page.on('response',response=>{if(response.status()>=400)missing.push(`${response.status()} ${response.url()}`);});
page.on('request',request=>{if(/^https?:/.test(request.url())&&!/^http:\/\/(127\.0\.0\.1|localhost):4173/.test(request.url()))external.push(request.url());});
try{
  await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle',timeout:90000});
  await page.waitForFunction(()=>Boolean(window.__review),{timeout:30000});
  await page.evaluate(()=>document.fonts.ready);
  await page.getByRole('checkbox',{name:'氛围音乐'}).uncheck();
  const shots=[];
  for(const shot of SHOTS){
    const local=Math.round(shot.duration*(shot.id==='S19'?.83:.64));
    const target=shot.start+local;
    await page.evaluate(f=>window.__review!.seekTo(f),target);
    await page.waitForFunction(({id,localFrame})=>document.querySelector(`[data-shot="${id}"]`)?.getAttribute('data-shot-frame')===String(localFrame),
      {id:shot.id,localFrame:local},{timeout:30000});
    const is3D=['S05','S10','S12','S16'].includes(shot.id);
    if(is3D){
      await page.waitForFunction(()=>Boolean(document.querySelector('[data-testid="player-shell"] canvas')),{timeout:30000});
      await page.waitForTimeout(1200);
      const canvas=await page.locator('[data-testid="player-shell"] canvas').first().evaluate((element)=>{
        const node=element as HTMLCanvasElement;
        return {width:node.width,height:node.height};
      });
      assert.ok(canvas.width>=1920&&canvas.height>=1080,`${shot.id}: 3D canvas resolution`);
    }else await page.waitForTimeout(180);
    const cue=CAPTIONS.find(c=>target>=c.start&&target<c.end);
    assert.equal((await page.getByTestId('captions').textContent())?.trim()??'',cue?.text??'',`${shot.id}: subtitle mismatch`);
    const file=join(output,`${shot.id}.png`);
    await page.getByTestId('player-shell').screenshot({path:file,animations:'disabled'});
    shots.push({id:shot.id,frame:target,caption:cue?.text??'',canvas:is3D});
    console.log(`Preview OK: ${shot.id} at frame ${target}${is3D?' (WebGL)':''}`);
  }
  // Check both sides of every join: no blank or missing scene mounts.
  for(const shot of SHOTS.slice(1)){
    for(const f of [shot.start-6,shot.start+6]){
      await page.evaluate(frame=>window.__review!.seekTo(frame),f);
      await page.waitForFunction(frame=>window.__review!.getFrame()===frame,f);
      assert.ok(await page.locator('[data-shot]').count(),`No scene at transition frame ${f}`);
    }
  }
  // Verify recovery and the final report, beyond the representative preview frame.
  await page.evaluate(()=>window.__review!.seekTo(4080+196));
  await page.waitForFunction(()=>document.querySelector('[data-sample="S17"]')?.getAttribute('data-state')==='failed');
  await page.evaluate(()=>window.__review!.seekTo(4080+365));
  await page.waitForFunction(()=>document.querySelector('[data-sample="S17"]')?.getAttribute('data-state')==='passed');
  await page.waitForTimeout(200);
  assert.ok((await page.getByTestId('qc-report').textContent())?.includes('异常清单：2'));
  await page.getByTestId('player-shell').screenshot({path:join(output,'S17-report.png')});
  // A direct seek to a 3D frame must produce the same paused image after seeking away.
  await page.evaluate(()=>window.__review!.seekTo(3900));
  await page.waitForTimeout(2200);
  const first=await page.getByTestId('player-shell').screenshot();
  await page.evaluate(()=>window.__review!.seekTo(700));
  await page.waitForTimeout(180);
  await page.evaluate(()=>window.__review!.seekTo(3900));
  await page.waitForTimeout(2200);
  const second=await page.getByTestId('player-shell').screenshot();
  const firstPixels=PNG.sync.read(first),secondPixels=PNG.sync.read(second);
  let maxChannelDifference=0,totalDifference=0;
  assert.equal(firstPixels.data.length,secondPixels.data.length);
  for(let i=0;i<firstPixels.data.length;i++){
    const delta=Math.abs(firstPixels.data[i]-secondPixels.data[i]);
    maxChannelDifference=Math.max(maxChannelDifference,delta);
    totalDifference+=delta;
  }
  // A recreated SwiftShader context can round a tiny number of color channels by 1/255.
  // This permits that measured rounding only; a changed camera, orbit or caption fails.
  const meanChannelDifference=totalDifference/firstPixels.data.length;
  assert.ok(maxChannelDifference<=1&&meanChannelDifference<.005,
    `Deterministic seeking: max channel difference ${maxChannelDifference}, mean ${meanChannelDifference}`);
  // Controls and actual playback, without generating a video file.
  await page.getByRole('checkbox',{name:'字幕',exact:true}).uncheck();
  assert.equal(await page.getByTestId('captions').count(),0);
  await page.getByRole('checkbox',{name:'字幕',exact:true}).check();
  await page.getByTestId('shot-S04').click();
  await page.waitForFunction(()=>window.__review!.getFrame()===600&&document.querySelector('[data-shot="S04"]')?.getAttribute('data-shot-frame')==='60');
  const start=await page.evaluate(()=>window.__review!.getFrame());
  await page.getByRole('button',{name:'播放',exact:true}).click();
  await page.waitForFunction(initial=>window.__review!.getFrame()>initial,start,{timeout:10000});
  await page.waitForTimeout(250);
  await page.getByRole('button',{name:'暂停',exact:true}).click();
  assert.ok(await page.evaluate(()=>window.__review!.getFrame())>start,'Playback must advance');
  await page.evaluate(()=>window.__review!.seekTo(699));
  await page.waitForTimeout(220);
  await page.screenshot({path:join(output,'preview-ui.png'),fullPage:true});
  assert.deepEqual(missing,[],'No missing local files');
  assert.deepEqual(external,[],'The composition must preview without external asset requests');
  assert.deepEqual(errors,[],'No browser or WebGL errors');
  writeFileSync(join(output,'preview-check.json'),JSON.stringify({passed:true,shots,joins:38,recovery:true,deterministicSeek:{passed:true,maxChannelDifference,meanChannelDifference},controls:true,errors,missing,external},null,2));
  console.log('PASS: 20 shots, 38 transition checks, 4 WebGL scenes, deterministic seeking, S17 recovery, captions, playback; zero missing assets or browser errors. No video rendered.');
}finally{
  await browser.close();
}
};

main().catch(error=>{console.error(error);process.exitCode=1;});
