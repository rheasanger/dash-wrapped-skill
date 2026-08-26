import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

const C={red:'#EB1700',cream:'#FFF4E6',ink:'#11100F',aqua:'#8CF0DE',pink:'#FF91DC',yellow:'#F8FF73'};
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'};
const show=(frame,fps,delay,still)=>still?1:spring({frame:frame-delay,fps,config:{damping:14,stiffness:145,mass:.7}});
const anim=(v,y=70,rotate=0)=>({opacity:v,transform:'translateY('+((1-v)*y)+'px) rotate('+((1-v)*rotate)+'deg) scale('+(0.94+v*.06)+')'});

export function Cover({data,still=false,standalone=false,sceneFrames=150,transitionFrames=12}){
  const frame=useCurrentFrame(),{fps}=useVideoConfig();
  const titleIn=show(frame,fps,0,still),orbIn=show(frame,fps,4,still),gridIn=show(frame,fps,10,still),teaserIn=show(frame,fps,18,still);
  const orbMotion=anim(orbIn,45,-10),float=still?0:Math.sin(frame/14)*10;
  const exit=standalone||still?0:interpolate(frame,[sceneFrames-transitionFrames,sceneFrames],[0,-100],clamp);
  const owner=String(data.name||'NAME REQUIRED').toUpperCase()+"'S";
  const stats=(data.stats||[]).slice(0,4);
  while(stats.length<4)stats.push({value:'—',label:''});
  return <AbsoluteFill style={{background:C.cream,color:C.ink,overflow:'hidden',transform:'translateX('+exit+'%)'}}>
    <div style={{position:'absolute',inset:0,opacity:.12,backgroundImage:'linear-gradient(rgba(17,16,15,.45) 1px,transparent 1px),linear-gradient(90deg,rgba(17,16,15,.45) 1px,transparent 1px)',backgroundSize:'72px 72px'}}/>
    <div style={{position:'absolute',width:730,height:530,left:250,top:290,borderRadius:'50%',background:'radial-gradient(circle at 30% 20%,#fff 0 7%,#9ff8e7 18%,#ff91dc 43%,#eb1700 66%,#2a2422 80%,#fff 87%,#eb1700 100%)',boxShadow:'0 28px 0 '+C.ink,...orbMotion,transform:orbMotion.transform+' translateY('+float+'px) rotate('+(still?0:Math.sin(frame/22)*1.3)+'deg)'}}/>
    <div style={{position:'absolute',left:72,top:165,width:88,height:88,background:C.pink,clipPath:'polygon(50% 0,61% 33%,86% 14%,67% 39%,100% 50%,67% 61%,86% 86%,61% 67%,50% 100%,39% 67%,14% 86%,33% 61%,0 50%,33% 39%,14% 14%,39% 33%)',...anim(orbIn,35,18),rotate:(still?0:frame*1.2)+'deg'}}/>
    <div style={{position:'absolute',right:78,top:270,width:120,height:120,background:C.yellow,clipPath:'polygon(50% 0,61% 33%,86% 14%,67% 39%,100% 50%,67% 61%,86% 86%,61% 67%,50% 100%,39% 67%,14% 86%,33% 61%,0 50%,33% 39%,14% 14%,39% 33%)',...anim(orbIn,35,-20),rotate:(still?0:-frame*.9)+'deg'}}/>
    <div style={{position:'absolute',inset:'66px 72px 122px'}}>
      <div style={{position:'absolute',top:78,left:0,fontFamily:'Futura,Impact,Arial Narrow,sans-serif',fontWeight:900,fontSize:Math.max(40,58-Math.max(0,owner.length-12)*2),letterSpacing:Math.max(4,10-Math.max(0,owner.length-12)),...anim(titleIn,55,-4)}}>{owner}</div>
      <h1 style={{position:'absolute',top:365,left:-4,margin:0,textTransform:'uppercase',fontFamily:'Futura,Impact,Arial Narrow,sans-serif',fontWeight:900,fontSize:145,lineHeight:.76,letterSpacing:-9,color:C.red,textShadow:'10px 10px 0 '+C.ink,...anim(titleIn,85,3)}}>
        <span style={{display:'block'}}>DOORDASH</span>
        <span style={{display:'block',marginTop:28,fontSize:150,color:C.cream,WebkitTextStroke:'8px '+C.ink,textShadow:'9px 9px 0 '+C.red}}>WRAPPED</span>
      </h1>
      <div style={{position:'absolute',top:990,left:34,right:34,display:'grid',gridTemplateColumns:'1fr 1fr',background:C.cream,border:'4px solid '+C.ink,boxShadow:'11px 11px 0 '+C.pink,transform:'rotate(-1deg)',opacity:gridIn}}>
        {stats.map((stat,i)=><div key={i} style={{minHeight:180,padding:'25px 27px 21px',border:'2px solid '+C.ink,display:'flex',flexDirection:'column',justifyContent:'space-between',gap:14,...anim(show(frame,fps,10+i*3,still),42,i%2?2:-2)}}>
          <b style={{color:C.red,fontFamily:'Futura,Impact,Arial Narrow,sans-serif',fontWeight:900,fontSize:58,lineHeight:.88,letterSpacing:-2}}>{stat.value}</b>
          <span style={{fontFamily:'Avenir Next,Arial,sans-serif',fontWeight:900,fontSize:String(stat.label||'').length>22?17:20,lineHeight:1.08,letterSpacing:1.5}}>{String(stat.label||'').toUpperCase()}</span>
        </div>)}
      </div>
      <div style={{position:'absolute',top:1420,left:0,display:'inline-flex',width:'max-content',maxWidth:820,alignItems:'center',padding:'16px 18px 15px',background:C.pink,border:'4px solid '+C.ink,fontFamily:'Avenir Next,Arial,sans-serif',fontWeight:900,fontSize:25,lineHeight:1,letterSpacing:2.7,textTransform:'uppercase',...anim(teaserIn,45,-2)}}>{data.teaser||'THE RECEIPTS HAVE NOTES.'}</div>
    </div>
  </AbsoluteFill>;
}
