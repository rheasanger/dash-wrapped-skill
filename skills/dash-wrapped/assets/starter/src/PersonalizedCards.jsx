import React from 'react';
import story from '../story.json';
import {POSTER_TEMPLATES} from './PosterTemplates';

// The complete poster templates are the default creative path. The agent should
// usually personalize story.json only. Replace an entry below with a bespoke
// component when the evidence has a visual premise the templates cannot express.
export const personalizedCards=(story.cards||[]).map((data,index)=>{
  const Card=POSTER_TEMPLATES[data.template]||POSTER_TEMPLATES.obsession;
  return ({still=false,standalone=false})=><Card data={data} index={index+1} still={still} standalone={standalone}/>;
});
