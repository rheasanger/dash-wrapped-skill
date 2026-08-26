import {execFile} from 'node:child_process';
import {mkdir,rm} from 'node:fs/promises';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import story from '../story.json' with {type:'json'};

const run=promisify(execFile),root=fileURLToPath(new URL('../',import.meta.url));
const count=(story.cards||[]).length+2,cols=Math.min(4,count),rows=Math.ceil(count/cols);
await run('ffmpeg',['-y','-v','error','-framerate','1','-i',root+'media/stills/%02d.png','-vf','scale=270:480,tile='+cols+'x'+rows+':padding=8:margin=8:color=11100f','-frames:v','1',root+'work-contact-sheet.png']);

const frameDir=root+'.qa-frames/';await mkdir(frameDir,{recursive:true});
const samples=[.3,.9,2.8],files=[];
for(let card=1;card<=count;card++)for(let sample=0;sample<samples.length;sample++){
  const id=String(card).padStart(2,'0'),path=frameDir+id+'-'+sample+'.png';files.push(path);
  await run('ffmpeg',['-y','-v','error','-ss',String(samples[sample]),'-i',root+'media/clips/'+id+'.mp4','-frames:v','1',path]);
}
const inputs=files.flatMap(path=>['-i',path]),chains=files.map((_,i)=>'['+i+':v]scale=180:320[s'+i+']').join(';');
const layout=files.map((_,i)=>(i%3*180)+'_'+(Math.floor(i/3)*320)).join('|');
const streams=files.map((_,i)=>'[s'+i+']').join('');
await run('ffmpeg',['-y','-v','error',...inputs,'-filter_complex',chains+';'+streams+'xstack=inputs='+files.length+':layout='+layout+':fill=11100f','-frames:v','1',root+'work-motion-sheet.png']);
await rm(frameDir,{recursive:true,force:true});
console.log(JSON.stringify({contactSheet:root+'work-contact-sheet.png',motionSheet:root+'work-motion-sheet.png'}));
