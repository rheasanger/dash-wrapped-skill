import React from 'react';
import {spring,useCurrentFrame,useVideoConfig} from 'remotion';
import {BODY,COLORS,DISPLAY,FoodDoodle,HeroNumber,Kicker,Scene,Star,useAlive,useEntrance} from './CardKit';

const fit=(value,large=120,medium=86,small=64)=>String(value||'').length>22?small:String(value||'').length>13?medium:large;
const lines=value=>String(value||'').split('\n');

function ProofPunch({data,still=false,light=false,style={}}){
  const proofMotion=useEntrance(6,{still,y:36,rotate:-1}),punchMotion=useEntrance(8,{still,y:38,rotate:2});
  return <div style={{position:'absolute',left:0,right:0,bottom:20,...style}}>
    {data.proof&&<div style={{marginBottom:22,color:light?COLORS.aqua:COLORS.red,fontFamily:BODY,fontWeight:900,fontSize:27,lineHeight:1.08,letterSpacing:1.7,textTransform:'uppercase',...proofMotion}}>{data.proof}</div>}
    <div style={{display:'inline-block',maxWidth:820,padding:'19px 22px 17px',background:COLORS.yellow,color:COLORS.ink,border:'5px solid '+COLORS.ink,boxShadow:'10px 10px 0 '+COLORS.pink,fontFamily:DISPLAY,fontWeight:900,fontSize:fit(data.punchline,45,39,33),lineHeight:.94,textTransform:'uppercase',...punchMotion}}>{data.punchline}</div>
  </div>;
}

function Sunburst({still=false,style={}}){
  const frame=useCurrentFrame(),spin=still?0:frame*.18;
  return <div style={{width:610,height:610,borderRadius:'50%',border:'7px solid '+COLORS.ink,boxShadow:'18px 20px 0 '+COLORS.red,background:'repeating-conic-gradient(from '+spin+'deg,'+COLORS.yellow+' 0 10deg,'+COLORS.cream+' 10deg 20deg)',...style}}/>;
}

function Receipt({label,items=[],color=COLORS.cream,still=false,order=2,style={}}){
  return <div style={{padding:'27px 30px 30px',background:color,color:COLORS.ink,border:'6px solid '+COLORS.ink,boxShadow:'11px 12px 0 '+COLORS.cream,transform:'rotate(-2deg)',...useEntrance(order,{still,y:80,rotate:5}),...style}}>
    <div style={{paddingBottom:15,borderBottom:'5px solid '+COLORS.ink,fontFamily:BODY,fontWeight:900,fontSize:22,letterSpacing:2,textTransform:'uppercase'}}>{label}</div>
    <div style={{marginTop:23,fontFamily:DISPLAY,fontWeight:900,fontSize:fit(items.join(' '),58,47,37),lineHeight:.9,textTransform:'uppercase'}}>{items.slice(0,5).map((item,i)=><React.Fragment key={i}>{i>0&&<br/>}{item}</React.Fragment>)}</div>
  </div>;
}

export function AbundanceFlood({data,index,still=false,standalone=false}){
  const frame=useCurrentFrame(),icons=data.icons?.length?data.icons:['🌮','🍣','🥗','🍳','🥪','🥑','🥣','🐟'];
  return <Scene index={index} bg={COLORS.yellow} still={still} standalone={standalone}>
    <Kicker still={still}>{data.kicker}</Kicker>
    <div style={{position:'absolute',top:105,left:-6,right:0,...useEntrance(1,{still,y:85,rotate:-3})}}>
      <HeroNumber still={still} size={fit(data.hero,290,245,205)} style={{position:'relative'}}>{data.hero}</HeroNumber>
      <div style={{marginTop:35,fontFamily:DISPLAY,fontWeight:900,fontSize:94,lineHeight:.8,textTransform:'uppercase'}}>{data.headline}</div>
    </div>
    <div style={{position:'absolute',top:500,left:-120,right:-120,height:780,overflow:'hidden',transform:'rotate(-5deg)'}}>{Array.from({length:64},(_,i)=>{
      const size=62+(i*37)%105,turn=(i%7-3)*12+(still?0:Math.sin(frame/10+i)*4),lift=still?0:Math.sin(frame/8+i*2)*13;
      const left=(i%8)*142-45+(i*31)%67,top=Math.floor(i/8)*92-35+(i*47)%61;
      return <span key={i} style={{position:'absolute',left,top,fontSize:size,filter:'drop-shadow(7px 8px 0 rgba(17,16,15,.25))',transform:'translateY('+lift+'px) rotate('+turn+'deg)'}}>{icons[i%icons.length]}</span>;
    })}</div>
    <ProofPunch data={data} still={still}/>
  </Scene>;
}

export function ObsessionSunburst({data,index,still=false,standalone=false}){
  const alive=useAlive({still,amount:9,speed:17,rotate:1.2});
  return <Scene index={index} bg={COLORS.cream} still={still} standalone={standalone}>
    <Kicker still={still}>{data.kicker}</Kicker>
    <Sunburst still={still} style={{position:'absolute',top:95,right:-55,...useEntrance(1,{still,y:55,rotate:8})}}/>
    <HeroNumber still={still} size={350} style={{position:'absolute',top:175,left:-18,zIndex:2}}>{data.hero}</HeroNumber>
    <FoodDoodle kind={data.doodle||'taco'} size={320} color={COLORS.aqua} still={still} style={{position:'absolute',top:500,right:-5,zIndex:3,...alive}}/>
    <h2 style={{position:'absolute',top:720,left:0,right:110,margin:0,fontFamily:DISPLAY,fontWeight:900,fontSize:fit(data.headline,118,93,72),lineHeight:.82,letterSpacing:-5,textTransform:'uppercase',...useEntrance(4,{still,y:70,rotate:2})}}>{lines(data.headline).map((line,i)=><React.Fragment key={i}>{i>0&&<br/>}{line}</React.Fragment>)}</h2>
    {data.label&&<div style={{position:'absolute',top:1010,left:0,padding:'14px 17px 12px',background:COLORS.pink,border:'4px solid '+COLORS.ink,fontFamily:BODY,fontWeight:900,fontSize:22,letterSpacing:2,textTransform:'uppercase',...useEntrance(5,{still,y:35,rotate:-2})}}>{data.label}</div>}
    <ProofPunch data={data} still={still} style={{bottom:365,textAlign:'right'}}/>
  </Scene>;
}

export function WaitingOrbit({data,index,still=false,standalone=false}){
  const frame=useCurrentFrame(),orbit=still?0:frame*.35;
  return <Scene index={index} bg={COLORS.aqua} still={still} standalone={standalone}>
    <Kicker still={still}>{data.kicker}</Kicker>
    <HeroNumber still={still} size={365} style={{position:'absolute',top:125,left:-14}}>{data.hero}</HeroNumber>
    <div style={{position:'absolute',top:360,right:0,fontFamily:DISPLAY,fontWeight:900,fontSize:105,lineHeight:.8,textTransform:'uppercase',...useEntrance(2,{still,y:55,rotate:3})}}>{data.headline}</div>
    <div style={{position:'absolute',top:560,left:75,width:720,height:720,...useEntrance(3,{still,y:60,rotate:-2})}}>
      {[0,1,2].map(i=><div key={i} style={{position:'absolute',inset:25+i*82,border:(14-i*2)+'px solid '+[COLORS.red,COLORS.pink,COLORS.ink][i],borderRadius:'50%',transform:'rotate('+(orbit*(i%2?1:-1))+'deg)'}}><i style={{position:'absolute',left:(i%2?12:'auto'),right:(i%2?'auto':18),top:30+i*25,width:38+i*9,height:38+i*9,borderRadius:'50%',background:[COLORS.yellow,COLORS.cream,COLORS.aqua][i],border:'5px solid '+COLORS.ink}}/></div>)}
      <FoodDoodle kind="clock" size={390} color={COLORS.cream} accent={COLORS.red} still={still} style={{position:'absolute',left:165,top:165}}/>
      <span style={{position:'absolute',left:12,top:130,fontSize:78,transform:'rotate(-12deg)'}}>🚗</span>
      <Star x={570} y={485} size={120} color={COLORS.pink} rotate={25}/>
    </div>
    {data.breakdown?.length&&<div style={{position:'absolute',top:1240,left:0,right:0,display:'flex',justifyContent:'center',gap:20,padding:'22px 20px 20px',background:COLORS.cream,border:'5px solid '+COLORS.ink,boxShadow:'10px 10px 0 '+COLORS.pink,fontFamily:BODY,fontWeight:900,fontSize:28,textTransform:'uppercase',...useEntrance(5,{still,y:35,rotate:-1})}}>{data.breakdown.map((item,i)=><React.Fragment key={i}>{i>0&&<i style={{width:9,height:9,alignSelf:'center',background:COLORS.red,transform:'rotate(45deg)'}}/>}<b>{item}</b></React.Fragment>)}</div>}
    <ProofPunch data={data} still={still} style={{bottom:-5}}/>
  </Scene>;
}

export function DecisionMachine({data,index,still=false,standalone=false}){
  const frame=useCurrentFrame(),{fps}=useVideoConfig(),items=data.items?.length?data.items:['OPTION 01','OPTION 02','OPTION 03','OPTION 04'];
  return <Scene index={index} bg={COLORS.cream} still={still} standalone={standalone}>
    <Kicker still={still}>{data.kicker}</Kicker>
    <HeroNumber still={still} size={280} style={{position:'absolute',top:120,left:-8}}>{data.hero}</HeroNumber>
    <div style={{position:'absolute',top:292,right:0,width:430,fontFamily:DISPLAY,fontWeight:900,fontSize:fit(data.headline,66,58,50),lineHeight:.8,textAlign:'right',textTransform:'uppercase',...useEntrance(2,{still,y:50,rotate:3})}}>{data.headline}</div>
    <div style={{position:'absolute',top:540,left:-28,right:-28,height:740,padding:30,background:COLORS.ink,border:'9px solid '+COLORS.red,boxShadow:'17px 19px 0 '+COLORS.aqua,transform:'rotate(-2deg)',display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:17}}>{items.slice(0,12).map((item,i)=>{
      const v=still?1:spring({frame:frame-i*2.5,fps,config:{damping:12,stiffness:165,mass:.65}}),color=[COLORS.yellow,COLORS.aqua,COLORS.pink][i%3];
      return <div key={i} style={{padding:14,background:color,border:'5px solid '+COLORS.cream,display:'flex',flexDirection:'column',justifyContent:'space-between',fontFamily:BODY,fontWeight:900,fontSize:fit(item,20,17,14),lineHeight:1,textTransform:'uppercase',opacity:v,transform:'translateY('+((1-v)*65)+'px) rotate('+(i%2?1:-1)+'deg)'}}><span>{item}</span><i style={{width:38,height:38,borderRadius:'50%',background:i%2?COLORS.red:COLORS.ink,border:'5px solid '+COLORS.cream,alignSelf:i%2?'flex-end':'flex-start'}}/></div>;
    })}</div>
    <ProofPunch data={data} still={still}/>
  </Scene>;
}

export function WeirdPairing({data,index,still=false,standalone=false}){
  return <Scene index={index} bg={COLORS.ink} light still={still} standalone={standalone}>
    <Kicker color={COLORS.aqua} still={still}>{data.kicker}</Kicker>
    <h2 style={{position:'absolute',top:130,left:0,right:0,margin:0,color:COLORS.cream,fontFamily:DISPLAY,fontWeight:900,fontSize:118,lineHeight:.78,letterSpacing:-6,textTransform:'uppercase',...useEntrance(1,{still,y:85,rotate:3})}}>{data.headline||'WEIRDEST\nMIX.'}</h2>
    <Receipt label={data.leftLabel} items={data.leftItems||[]} color={COLORS.yellow} still={still} order={2} style={{position:'absolute',top:485,left:0,width:690,minHeight:330}}/>
    <div style={{position:'absolute',top:750,right:0,zIndex:4,color:COLORS.pink,fontFamily:DISPLAY,fontWeight:900,fontSize:145,...useAlive({still,amount:8,speed:15,rotate:2})}}>+</div>
    <Receipt label={data.rightLabel} items={data.rightItems||[]} color={COLORS.aqua} still={still} order={4} style={{position:'absolute',top:845,right:0,width:700,minHeight:390,transform:'rotate(2deg)'}}/>
    <ProofPunch data={data} still={still} light/>
  </Scene>;
}

export function RitualRun({data,index,still=false,standalone=false}){
  const frame=useCurrentFrame(),days=data.days?.length?data.days:['01','02','03','04'];
  return <Scene index={index} bg={COLORS.red} light still={still} standalone={standalone}>
    <Kicker color={COLORS.yellow} still={still}>{data.kicker}</Kicker>
    <HeroNumber still={still} size={335} color={COLORS.yellow} style={{position:'absolute',top:105,left:-12}}>{data.hero}</HeroNumber>
    <h2 style={{position:'absolute',top:335,left:390,right:0,margin:0,color:COLORS.cream,fontFamily:DISPLAY,fontWeight:900,fontSize:85,lineHeight:.8,textTransform:'uppercase',...useEntrance(2,{still,y:60,rotate:3})}}>{data.headline}</h2>
    <div style={{position:'absolute',top:620,left:-30,right:-30,height:500,display:'flex',alignItems:'flex-start',gap:4}}>{days.slice(0,6).map((day,i)=><div key={i} style={{width:days.length>4?155:220,height:380,marginTop:i%2?38:0,padding:'17px 12px',background:COLORS.cream,color:COLORS.ink,border:'6px solid '+COLORS.ink,boxShadow:'8px 10px 0 '+COLORS.pink,transform:'rotate('+(-8+i*3)+'deg) translateY('+(still?0:Math.sin(frame/9+i)*9)+'px)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-between'}}><b style={{fontFamily:DISPLAY,fontSize:67,color:COLORS.red}}>{day}</b><FoodDoodle kind={data.doodle||'bowl'} size={125} still={still}/><span style={{fontFamily:BODY,fontWeight:900,fontSize:16,textAlign:'center',textTransform:'uppercase'}}>{data.cardLabel||'SAME AGAIN'}</span></div>)}</div>
    {data.label&&<div style={{position:'absolute',top:1120,left:0,right:70,padding:'23px 27px 21px',background:COLORS.yellow,color:COLORS.ink,border:'5px solid '+COLORS.ink,boxShadow:'10px 11px 0 '+COLORS.pink,fontFamily:DISPLAY,fontWeight:900,fontSize:fit(data.label,55,44,35),lineHeight:.88,textTransform:'uppercase',...useEntrance(5,{still,y:40,rotate:-2})}}>{data.label}</div>}
    <ProofPunch data={data} still={still} light/>
  </Scene>;
}

export function OddHour({data,index,still=false,standalone=false}){
  const items=data.items||[];
  return <Scene index={index} bg={COLORS.pink} still={still} standalone={standalone}>
    <Kicker still={still}>{data.kicker}</Kicker>
    <HeroNumber still={still} size={275} color={COLORS.ink} shadow={COLORS.cream} style={{position:'absolute',top:130,left:-10,right:0}}>{data.hero}</HeroNumber>
    <div style={{position:'absolute',top:385,left:20,fontFamily:DISPLAY,fontWeight:900,fontSize:88,textTransform:'uppercase',...useEntrance(2,{still,y:50,rotate:2})}}>{data.headline||'AM'}</div>
    <div style={{position:'absolute',top:555,left:50,width:710,height:710,borderRadius:'50%',background:COLORS.cream,border:'12px solid '+COLORS.ink,boxShadow:'18px 20px 0 '+COLORS.red,...useEntrance(3,{still,y:65,rotate:5})}}>
      <FoodDoodle kind="clock" size={440} color={COLORS.yellow} still={still} style={{position:'absolute',left:135,top:130}}/>
      {items.slice(0,6).map((item,i)=>{const a=i/Math.max(1,items.length)*Math.PI*2,x=305+Math.cos(a)*315,y=305+Math.sin(a)*315;return <span key={i} style={{position:'absolute',left:x,top:y,maxWidth:210,padding:'13px 15px',background:i%2?COLORS.aqua:COLORS.yellow,border:'4px solid '+COLORS.ink,fontFamily:BODY,fontWeight:900,fontSize:20,lineHeight:1,textTransform:'uppercase',transform:'translate(-50%,-50%) rotate('+((i%2?1:-1)*8)+'deg)'}}>{item}</span>})}
    </div>
    <ProofPunch data={data} still={still}/>
  </Scene>;
}

export function QuantityPile({data,index,still=false,standalone=false}){
  const items=data.items?.length?data.items:['ONE VERY LARGE ORDER'];
  return <Scene index={index} bg={COLORS.aqua} still={still} standalone={standalone}>
    <Kicker still={still}>{data.kicker}</Kicker>
    <HeroNumber still={still} size={330} style={{position:'absolute',top:105,left:-10}}>{data.hero}</HeroNumber>
    <h2 style={{position:'absolute',top:370,left:350,right:0,margin:0,fontFamily:DISPLAY,fontWeight:900,fontSize:82,lineHeight:.8,textTransform:'uppercase',...useEntrance(2,{still,y:60,rotate:3})}}>{data.headline}</h2>
    <div style={{position:'absolute',top:565,left:-25,right:-25,height:710}}>{Array.from({length:20},(_,i)=>{
      const item=items[i%items.length];return <div key={i} style={{position:'absolute',left:(i*167)%720,top:510-(i%6)*82,width:300,padding:'19px 21px 17px',background:[COLORS.cream,COLORS.yellow,COLORS.pink][i%3],border:'5px solid '+COLORS.ink,boxShadow:'8px 9px 0 '+COLORS.red,fontFamily:BODY,fontWeight:900,fontSize:22,lineHeight:1,textTransform:'uppercase',transform:'rotate('+((i%7-3)*4)+'deg)'}}>{item}</div>;
    })}</div>
    <ProofPunch data={data} still={still}/>
  </Scene>;
}

export const POSTER_TEMPLATES={
  abundance:AbundanceFlood,
  obsession:ObsessionSunburst,
  waiting:WaitingOrbit,
  modifiers:DecisionMachine,
  pairing:WeirdPairing,
  ritual:RitualRun,
  'odd-hour':OddHour,
  quantity:QuantityPile,
};

// Building blocks for one-off scenes that still look native to the deck.
export {ProofPunch,Receipt,Sunburst};
