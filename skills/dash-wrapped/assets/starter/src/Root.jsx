import React from 'react';
import {AbsoluteFill,Composition,Sequence} from 'remotion';
import story from '../story.json';
import {COLORS,TIMING} from './CardKit';
import {Cover} from './Cover';
import {Finale} from './Finale';
import {personalizedCards} from './PersonalizedCards';

if(personalizedCards.length!==(story.cards||[]).length)throw new Error('story.cards and personalizedCards must have the same length');

const allCards=[
  ({still=false,standalone=false})=><Cover data={story.cover} still={still} standalone={standalone}/>,
  ...personalizedCards,
  ({still=false,standalone=false})=><Finale data={story.finale} index={personalizedCards.length+1} still={still} standalone={standalone}/>,
];
const duration=TIMING.poster+TIMING.scene+(allCards.length-1)*(TIMING.scene-TIMING.transition);

function At({cardIndex,still=false,standalone=false}){
  const Card=allCards[Math.max(0,Math.min(allCards.length-1,cardIndex))];
  return <AbsoluteFill style={{background:still||standalone?COLORS.ink:'transparent'}}><Card still={still} standalone={standalone}/></AbsoluteFill>;
}
function Master(){
  return <AbsoluteFill style={{background:COLORS.ink}}>
    <Sequence from={0} durationInFrames={TIMING.poster}><At cardIndex={0} still standalone/></Sequence>
    {allCards.map((_,i)=><Sequence key={i} from={TIMING.poster+i*(TIMING.scene-TIMING.transition)} durationInFrames={TIMING.scene}><At cardIndex={i}/></Sequence>)}
  </AbsoluteFill>;
}
export function Root(){
  return <>
    <Composition id="DashWrapped" component={Master} width={1080} height={1920} fps={30} durationInFrames={duration}/>
    <Composition id="DashCard" component={At} width={1080} height={1920} fps={30} durationInFrames={1} defaultProps={{cardIndex:0,still:true,standalone:true}}/>
    <Composition id="DashCardMotion" component={At} width={1080} height={1920} fps={30} durationInFrames={TIMING.scene} defaultProps={{cardIndex:0,standalone:true}}/>
  </>;
}
