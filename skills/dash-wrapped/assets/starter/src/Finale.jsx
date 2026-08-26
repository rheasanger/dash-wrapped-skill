import React from 'react';
import {COLORS,Confetti,DISPLAY,BODY,Ranking,Scene,Star,useEntrance} from './CardKit';

export function Finale({data,index=6,still=false,standalone=false}){
  const titleMotion=useEntrance(0,{still,y:82,rotate:3});
  const listMotion=useEntrance(3,{still,y:60,rotate:-2});
  const lines=(data.headline||'THE RECEIPTS\nREST THEIR CASE.').split('\n');
  return <Scene index={index} bg={COLORS.ink} light still={still} standalone={standalone}>
    <Confetti count={26}/>
    <Star x={765} y={35} size={125} color={COLORS.aqua} rotate={35}/>
    <h2 style={{position:'absolute',top:80,left:0,right:0,margin:0,color:COLORS.cream,fontFamily:DISPLAY,fontWeight:900,fontSize:108,lineHeight:.8,letterSpacing:-6,textTransform:'uppercase',...titleMotion}}>
      {lines.map((line,i)=><React.Fragment key={i}>{i>0&&<br/>}<span style={{color:i===lines.length-1?COLORS.red:COLORS.cream,textShadow:i===lines.length-1?'8px 8px 0 '+COLORS.pink:'none'}}>{line}</span></React.Fragment>)}
    </h2>
    <div style={{position:'absolute',top:530,left:0,right:0,display:'grid',gridTemplateColumns:'1fr 1fr',gap:34,...listMotion}}>
      <Ranking title="Top 5 meals" items={data.meals||[]} light still={true}/>
      <Ranking title="Top 5 restaurants" items={data.restaurants||[]} light still={true}/>
    </div>
    <div style={{position:'absolute',left:0,bottom:35,color:COLORS.aqua,fontFamily:BODY,fontWeight:900,fontSize:23,letterSpacing:2.4,textTransform:'uppercase',...useEntrance(6,{still,y:35,rotate:-2})}}>{data.footer||'CASE CLOSED. APP STILL OPEN.'}</div>
  </Scene>;
}
