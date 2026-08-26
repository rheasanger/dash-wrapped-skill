import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const COLORS={red:'#EB1700',cream:'#FFF4E6',ink:'#11100F',aqua:'#8CF0DE',pink:'#FF91DC',yellow:'#F8FF73'};
export const DISPLAY='Futura,Impact,Arial Narrow,sans-serif';
export const BODY='Avenir Next,Geist,Arial,sans-serif';
export const SAFE={top:66,right:72,bottom:220,left:72};
export const TIMING={scene:150,poster:30,transition:12};
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'};

export function useEntrance(order=0,{still=false,y=78,rotate=3,scale=.92}={}){
  const frame=useCurrentFrame(),{fps}=useVideoConfig();
  const v=still?1:spring({frame:frame-order*3,fps,config:{damping:13,stiffness:150,mass:.72}});
  return {opacity:v,transform:'translateY('+((1-v)*y)+'px) rotate('+((1-v)*rotate)+'deg) scale('+(scale+v*(1-scale))+')'};
}

export function useAlive({still=false,amount=7,speed=18,phase=0,rotate=.45}={}){
  const frame=useCurrentFrame();
  if(still)return {transform:'translateY(0) rotate(0deg)'};
  const wave=Math.sin((frame+phase)/speed*Math.PI);
  return {transform:'translateY('+(wave*amount)+'px) rotate('+(wave*rotate)+'deg)'};
}

export function useHeroEntrance({still=false,delay=3,direction=-1}={}){
  const frame=useCurrentFrame(),{fps}=useVideoConfig();
  const v=still?1:spring({frame:frame-delay,fps,config:{damping:9,stiffness:135,mass:.72}});
  const alive=still?0:Math.sin((frame+11)/18*Math.PI);
  return {opacity:Math.min(1,Math.max(0,v)),transform:'translateY('+((1-v)*145+alive*3)+'px) rotate('+((1-v)*direction*7+alive*.3)+'deg) scale('+(0.72+v*.28)+')'};
}

export function Grid({light=false,size=72,opacity=.12}){
  const frame=useCurrentFrame();
  const line=light?'rgba(255,244,230,.55)':'rgba(17,16,15,.55)';
  return <div style={{position:'absolute',inset:-size,opacity,transform:'translate('+(frame%size)+'px,'+((frame*.35)%size)+'px)',backgroundImage:'linear-gradient('+line+' 1px,transparent 1px),linear-gradient(90deg,'+line+' 1px,transparent 1px)',backgroundSize:size+'px '+size+'px',maskImage:'linear-gradient(to bottom,#000,transparent 82%)'}}/>;
}

export function Noise(){
  return <div style={{position:'absolute',inset:0,opacity:.13,mixBlendMode:'multiply',pointerEvents:'none',backgroundImage:'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 180 180\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.9\' numOctaves=\'2\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'.2\'/%3E%3C/svg%3E")'}}/>;
}

export function Scene({index=0,bg=COLORS.cream,light=false,standalone=false,still=false,children}){
  const frame=useCurrentFrame();
  const entry=standalone||still||index===0?0:interpolate(frame,[0,TIMING.transition],[100,0],clamp);
  const exit=standalone||still?0:interpolate(frame,[TIMING.scene-TIMING.transition,TIMING.scene],[0,-100],clamp);
  return <AbsoluteFill style={{background:bg,color:light?COLORS.cream:COLORS.ink,clipPath:'inset(0 0 0 '+entry+'%)',transform:'translateX('+exit+'%)',overflow:'hidden'}}>
    <Grid light={light}/><Noise/>
    <div style={{position:'absolute',top:SAFE.top,right:SAFE.right,bottom:SAFE.bottom,left:SAFE.left,overflow:'visible'}}>{children}</div>
  </AbsoluteFill>;
}

export function Star({x=0,y=0,size=86,color=COLORS.yellow,rotate=0,style={}}){
  return <div style={{position:'absolute',left:x,top:y,width:size,height:size,background:color,clipPath:'polygon(50% 0,61% 33%,86% 14%,67% 39%,100% 50%,67% 61%,86% 86%,61% 67%,50% 100%,39% 67%,14% 86%,33% 61%,0 50%,33% 39%,14% 14%,39% 33%)',transform:'rotate('+rotate+'deg)',...style}}/>;
}

export function Kicker({children,color=COLORS.red,style={},order=0,still=false}){
  const motion=useEntrance(order,{still,y:34,rotate:-2});
  return <div style={{display:'inline-flex',width:'max-content',maxWidth:'100%',paddingBottom:14,borderBottom:'6px solid '+color,color,fontFamily:BODY,fontWeight:900,fontSize:24,lineHeight:1,letterSpacing:3,textTransform:'uppercase',...motion,...style}}>{children}</div>;
}

export function HeroNumber({children,still=false,delay=3,direction=-1,size=330,color=COLORS.red,shadow=COLORS.ink,style={}}){
  const motion=useHeroEntrance({still,delay,direction});
  return <div style={{fontFamily:DISPLAY,fontWeight:900,fontSize:size,lineHeight:.74,letterSpacing:-Math.round(size*.075),color,textShadow:'12px 13px 0 '+shadow,transformOrigin:'left bottom',...style,...motion}}>{children}</div>;
}

export function FoodDoodle({kind='fish',size=260,color=COLORS.aqua,accent=COLORS.red,still=false,style={}}){
  const frame=useCurrentFrame(),wave=still?0:Math.sin(frame/7),motion='translateY('+(wave*8)+'px) rotate('+(wave*2)+'deg)';
  const common={fill:color,stroke:COLORS.ink,strokeWidth:8,strokeLinejoin:'round'};
  return <svg viewBox="0 0 220 180" aria-hidden="true" style={{width:size,height:size*.82,overflow:'visible',filter:'drop-shadow(10px 12px 0 '+COLORS.pink+')',transform:motion,...style}}>
    {kind==='fish'?<>
      <path d="M42 92 8 54v76z" {...common}/><path d="M37 92c24-48 104-67 166-10-49 75-138 61-166 10z" {...common}/>
      <path d="M91 49c15-25 45-28 57-4-20 2-36 8-57 4z" {...common}/><circle cx="167" cy="76" r="9" fill={COLORS.cream} stroke={COLORS.ink} strokeWidth="6"/><circle cx="169" cy="77" r="3" fill={COLORS.ink}/>
      <path d="M83 75q18 18 0 36M117 63q20 24 2 53" fill="none" stroke={accent} strokeWidth="9"/>
    </>:kind==='taco'?<>
      <path d="M24 126a86 86 0 0 1 172 0z" {...common}/><path d="M36 105q15-36 31 0 18-49 37 0 17-47 36 0 17-36 38 0" fill="none" stroke={accent} strokeWidth="13" strokeLinecap="round"/><circle cx="79" cy="96" r="7" fill={COLORS.pink}/><circle cx="145" cy="91" r="7" fill={COLORS.yellow}/>
    </>:kind==='egg'?<>
      <path d="M35 96c0-48 34-69 70-55 36-27 83 5 73 44 28 31-4 76-45 63-35 31-92 6-83-33-9-4-15-11-15-19z" {...common}/><circle cx="112" cy="96" r="35" fill={accent} stroke={COLORS.ink} strokeWidth="8"/>
    </>:kind==='clock'?<>
      <circle cx="110" cy="90" r="72" {...common}/><path d="M110 90V43M110 90l42 24" fill="none" stroke={accent} strokeWidth="13" strokeLinecap="round"/><circle cx="110" cy="90" r="9" fill={COLORS.ink}/>
    </>:<>
      <ellipse cx="110" cy="105" rx="82" ry="48" {...common}/><path d="M48 94h124M65 68h90" fill="none" stroke={accent} strokeWidth="12" strokeLinecap="round"/>
    </>}
  </svg>;
}

export function EmojiField({items=['🍽️'],count=40,still=false,style={}}){
  const frame=useCurrentFrame();
  return <div style={{position:'relative',height:560,overflow:'hidden',...style}}>{Array.from({length:count},(_,i)=>{
    const size=58+(i*29)%92,turn=(i%7-3)*9+(still?0:Math.sin(frame/11+i)*4);
    return <span key={i} style={{position:'absolute',left:(i*137)%930-45,top:(i*83)%520-25,fontSize:size,filter:'drop-shadow(6px 7px 0 '+COLORS.pink+')',transform:'rotate('+turn+'deg)'}}>{items[i%items.length]}</span>;
  })}</div>;
}

export function DecisionPanel({items=[],still=false,style={}}){
  const frame=useCurrentFrame(),{fps}=useVideoConfig();
  return <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,padding:22,background:COLORS.aqua,border:'8px solid '+COLORS.cream,boxShadow:'16px 18px 0 '+COLORS.red,transform:'rotate(-1deg)',...style}}>{items.map((item,i)=>{
    const v=still?1:spring({frame:frame-i*3,fps,config:{damping:13,stiffness:150,mass:.72}});
    return <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:16,background:i%3===0?COLORS.pink:COLORS.cream,border:'5px solid '+COLORS.ink,fontFamily:BODY,fontWeight:900,fontSize:24,textTransform:'uppercase',opacity:v,transform:'translateY('+((1-v)*45)+'px)'}}><i style={{width:36,height:36,flex:'0 0 auto',borderRadius:'50%',background:COLORS.red,border:'5px solid '+COLORS.ink}}/>{item}</div>;
  })}</div>;
}

export function StreakStrip({days=[],icon='✓',caption='',still=false,style={}}){
  const frame=useCurrentFrame(),{fps}=useVideoConfig();
  return <div style={{display:'flex',alignItems:'center',gap:10,...style}}>{days.map((day,i)=>{
    const v=still?1:spring({frame:frame-i*3,fps,config:{damping:13,stiffness:150,mass:.72}}),rotate=(1-v)*(i%2?3:-3);
    return <div key={i} style={{width:210,height:360,padding:18,background:i%2?COLORS.aqua:COLORS.pink,border:'7px solid '+COLORS.ink,boxShadow:'10px 12px 0 '+COLORS.red,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-between',fontFamily:BODY,fontWeight:900,textTransform:'uppercase',opacity:v,transform:'translateY('+((1-v)*110)+'px) rotate('+rotate+'deg)'}}><b style={{fontFamily:DISPLAY,fontSize:80}}>{day}</b><span style={{fontSize:108}}>{icon}</span><span style={{fontSize:22,textAlign:'center'}}>{caption}</span></div>;
  })}</div>;
}

export function PairingPlus({left,right,still=false,style={}}){
  const motion=useAlive({still,amount:6,speed:16});
  const side={flex:1,minWidth:0,padding:24,background:COLORS.cream,border:'7px solid '+COLORS.ink,boxShadow:'10px 12px 0 '+COLORS.pink,display:'grid',placeItems:'center',fontFamily:DISPLAY,fontWeight:900,fontSize:84,textAlign:'center'};
  return <div style={{display:'flex',alignItems:'center',gap:18,...style}}><div style={side}>{left}</div><b style={{fontFamily:DISPLAY,fontSize:120,color:COLORS.red,...motion}}>+</b><div style={side}>{right}</div></div>;
}

export function OrbitRing({center,items=[],still=false,style={}}){
  const frame=useCurrentFrame(),count=Math.max(items.length,1);
  return <div style={{position:'relative',width:620,height:620,border:'18px solid '+COLORS.ink,borderRadius:'50%',boxShadow:'18px 20px 0 '+COLORS.pink,...style}}><div style={{position:'absolute',inset:120,display:'grid',placeItems:'center',borderRadius:'50%',background:COLORS.yellow,border:'8px solid '+COLORS.ink,fontFamily:DISPLAY,fontWeight:900,fontSize:110,textAlign:'center'}}>{center}</div>{items.map((item,i)=>{const angle=i/count*Math.PI*2+(still?0:frame/300),x=270+Math.cos(angle)*265,y=270+Math.sin(angle)*265;return <span key={i} style={{position:'absolute',left:x,top:y,fontSize:70,transform:'translate(-50%,-50%)'}}>{item}</span>})}</div>;
}

export function Ranking({title,items,light=false,style={},order=2,still=false}){
  const motion=useEntrance(order,{still,y:52,rotate:1});
  const ink=light?COLORS.cream:COLORS.ink;
  return <div style={{...motion,...style}}>
    <h3 style={{margin:'0 0 15px',paddingBottom:14,borderBottom:'6px solid '+COLORS.red,color:COLORS.aqua,fontFamily:BODY,fontWeight:900,fontSize:23,letterSpacing:2,textTransform:'uppercase'}}>{title}</h3>
    {items.slice(0,5).map((item,i)=><div key={i} style={{minHeight:122,display:'grid',gridTemplateColumns:'42px 1fr 64px',alignItems:'center',gap:12,borderBottom:'3px solid '+ink,color:ink,fontFamily:BODY}}>
      <b style={{color:COLORS.aqua,fontSize:18}}>0{i+1}</b><span style={{fontWeight:850,fontSize:String(item.name||'').length>22?22:28,lineHeight:1.02}}>{item.name}</span><strong style={{color:COLORS.yellow,fontFamily:DISPLAY,fontSize:32,textAlign:'right'}}>{item.value}</strong>
    </div>)}
  </div>;
}

export function Confetti({count=22}){
  const frame=useCurrentFrame();
  return <div style={{position:'absolute',inset:'-70px -72px -100px',overflow:'hidden',pointerEvents:'none'}}>{Array.from({length:count},(_,i)=><i key={i} style={{position:'absolute',left:(i*37)%100+'%',top:((frame*(8+i%5)+i*127)%1850)-170,width:18,height:54,background:[COLORS.red,COLORS.aqua,COLORS.pink,COLORS.yellow,COLORS.cream][i%5],border:'3px solid '+COLORS.ink,transform:'rotate('+(frame*(2+i%4)+i*29)+'deg)'}}/>)}</div>;
}
