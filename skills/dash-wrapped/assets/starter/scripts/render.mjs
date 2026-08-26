import {bundle} from '@remotion/bundler';
import {ensureBrowser,renderMedia,renderStill,selectComposition} from '@remotion/renderer';
import {execFile} from 'node:child_process';
import {mkdir,rename,rm} from 'node:fs/promises';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import story from '../story.json' with {type:'json'};

const run=promisify(execFile),root=fileURLToPath(new URL('../',import.meta.url));
const entry=fileURLToPath(new URL('../src/index.jsx',import.meta.url));
const stillDir=root+'media/stills/',clipDir=root+'media/clips/';
const browserExecutable=process.env.REMOTION_BROWSER_EXECUTABLE||(await ensureBrowser({logLevel:'error'})).path;
const cardCount=(story.cards||[]).length+2;
await mkdir(stillDir,{recursive:true});await mkdir(clipDir,{recursive:true});await mkdir(root+'exports/',{recursive:true});
const serveUrl=await bundle({entryPoint:entry});
const stillComp=await selectComposition({serveUrl,id:'DashCard',inputProps:{cardIndex:0,still:true,standalone:true},browserExecutable});
const motionComp=await selectComposition({serveUrl,id:'DashCardMotion',inputProps:{cardIndex:0,standalone:true},browserExecutable});
const masterComp=await selectComposition({serveUrl,id:'DashWrapped',browserExecutable});
const withProps=(composition,props)=>({...composition,props:{...(composition.props||{}),...props}});
let cursor=0;
async function cardWorker(){
  while(true){
    const i=cursor++;if(i>=cardCount)return;
    const id=String(i+1).padStart(2,'0'),props={cardIndex:i,standalone:true};
    await renderStill({serveUrl,composition:withProps(stillComp,{...props,still:true}),inputProps:{...props,still:true},output:stillDir+id+'.png',imageFormat:'png',browserExecutable});
    const raw=clipDir+id+'.raw.mp4',output=clipDir+id+'.mp4';
    await renderMedia({serveUrl,composition:withProps(motionComp,props),inputProps:props,outputLocation:raw,codec:'h264',crf:17,pixelFormat:'yuv420p',browserExecutable});
    await run('ffmpeg',['-y','-v','error','-i',raw,'-map','0:v:0','-c:v','copy','-an','-map_metadata','-1','-movflags','+faststart',output]);
    await rm(raw,{force:true});
  }
}
async function master(){
  const raw=root+'media/master.raw.mp4',output=root+'media/dash-wrapped.mp4';
  await renderMedia({serveUrl,composition:masterComp,outputLocation:raw,codec:'h264',crf:15,pixelFormat:'yuv420p',browserExecutable});
  const audio=process.env.WRAPPED_AUDIO;
  if(audio)await run('ffmpeg',['-y','-v','error','-i',raw,'-stream_loop','-1','-i',audio,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-shortest','-map_metadata','-1','-movflags','+faststart',output]);
  else await rename(raw,output);
  if(audio)await rm(raw,{force:true});
}
await Promise.all([master(),cardWorker(),cardWorker()]);
console.log('Rendered '+cardCount+' cards and master video from one bundle.');
