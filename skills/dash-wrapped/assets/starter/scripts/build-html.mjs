import {readFile,readdir,writeFile,mkdir,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import story from '../story.json' with {type:'json'};

const root=fileURLToPath(new URL('../',import.meta.url));
const names=(await readdir(root+'media/stills/')).filter(x=>x.endsWith('.png')).sort();
const alt=[story.cover?.alt,...(story.cards||[]).map(card=>card.alt),story.finale?.alt];
if(names.length!==alt.length)throw new Error('Expected '+alt.length+' stills, found '+names.length);
const cards=await Promise.all(names.map(async(name,i)=>({
  poster:'data:image/png;base64,'+(await readFile(root+'media/stills/'+name)).toString('base64'),
  clip:'data:video/mp4;base64,'+(await readFile(root+'media/clips/'+name.replace('.png','.mp4'))).toString('base64'),
  alt:alt[i]||('Dash Wrapped card '+(i+1))
})));
const data={slug:story.slug||'dash',cards,videoBase64:(await readFile(root+'media/dash-wrapped.mp4')).toString('base64')};
const template=await readFile(root+'site-template.html','utf8');
const html=template.replace('__WRAPPED_DATA_JSON__',JSON.stringify(data).replaceAll('<','\\u003c'));
await mkdir(root+'exports/',{recursive:true});
await writeFile(root+'exports/dash-wrapped.html',html);
await rm(root+'data/',{recursive:true,force:true});
console.log('Built exports/dash-wrapped.html');
