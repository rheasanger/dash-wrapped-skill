import {readFile,writeFile} from 'node:fs/promises';

const source=JSON.parse(await readFile(new URL('../data/orders.json',import.meta.url),'utf8'));
const orders=source.orders||[];
const timeZone=source.source?.timeZone||Intl.DateTimeFormat().resolvedOptions().timeZone;
const safe=(value,max=120)=>String(value||'').normalize('NFKC').replace(/[\u0000-\u001f\u007f<>{}\[\]`]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);
const clean=value=>safe(value).normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const quantity=value=>Math.max(1,Math.min(100,Number.isFinite(Number(value))?Math.trunc(Number(value)):1));
const sum=values=>values.reduce((total,value)=>total+value,0);
const round=(value,digits=1)=>Number(value.toFixed(digits));
const middle=values=>{const sorted=[...values].sort((a,b)=>a-b);return sorted.length?sorted[Math.floor(sorted.length/2)]:0};
const percentile=(values,p)=>{const sorted=[...values].sort((a,b)=>a-b);return sorted.length?sorted[Math.round((sorted.length-1)*p)]:0};
const parts=iso=>Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(iso)).map(part=>[part.type,part.value]));
const day=iso=>{const value=parts(iso);return `${value.year}-${value.month}-${value.day}`};
const dayNumber=value=>Date.parse(value+'T12:00:00Z')/86400000;

function groups(rows,key,weight=()=>1){
  const result=new Map();
  for(const row of rows){
    const name=key(row);if(!name)continue;
    const group=result.get(name)||{key:name,count:0,rows:[],orders:new Set()};
    group.count+=Math.max(0,Number(weight(row))||0);group.rows.push(row);
    if(row.orderIndex!=null)group.orders.add(row.orderIndex);
    result.set(name,group);
  }
  return [...result.values()].map(group=>({...group,distinctOrders:group.orders.size})).sort((a,b)=>b.count-a.count||b.distinctOrders-a.distinctOrders);
}

function streak(rows){
  const days=[...new Set(rows.map(row=>row.day))].sort();let best=[],current=[];
  for(const value of days){
    current=!current.length||dayNumber(value)-dayNumber(current.at(-1))===1?[...current,value]:[value];
    if(current.length>best.length)best=current;
  }
  return best;
}

const enriched=orders.filter(order=>Number.isFinite(Date.parse(order.orderedAt))).map((order,orderIndex)=>{
  const local=parts(order.orderedAt);
  const details=(order.receipt?.detailedItems||[]).map(item=>({
    name:safe(item.name)||'Unknown item',quantity:quantity(item.quantity),
    options:(item.options||[]).map(option=>safe(typeof option==='string'?option:option?.name)).filter(Boolean),
    outOfStock:Boolean(item.outOfStock)
  }));
  const detailByName=new Map(details.map(item=>[clean(item.name),item]));
  const history=(order.items||[]).map(item=>{
    const detail=detailByName.get(clean(item.name));
    return {name:safe(item.name)||'Unknown item',quantity:quantity(item.quantity),options:detail?.options||[],outOfStock:detail?.outOfStock||false};
  });
  const items=history.length?history:details;
  const duration=order.fulfilledAt?Math.round((new Date(order.fulfilledAt)-new Date(order.orderedAt))/60000):null;
  return {orderIndex,store:safe(order.storeName)||'Unknown store',orderedAt:order.orderedAt,day:day(order.orderedAt),hour:Number(local.hour),minute:Number(local.minute),items,details,duration,totalQuantity:sum(items.map(item=>item.quantity)),modifierCount:sum(details.map(item=>item.options.length))};
}).sort((a,b)=>new Date(a.orderedAt)-new Date(b.orderedAt));

const units=enriched.flatMap(order=>order.items.map(item=>({orderIndex:order.orderIndex,day:order.day,store:order.store,name:item.name,units:item.quantity})));
const itemGroups=groups(units,row=>clean(row.name),row=>row.units);
const storeGroups=groups(enriched,row=>clean(row.store));
const meals=itemGroups.slice(0,20).map(group=>{
  const restaurants=groups(group.rows,row=>clean(row.store),row=>row.units);
  return {name:group.rows[0].name,restaurant:restaurants[0]?.rows[0].store||group.rows[0].store,units:group.count,orders:group.distinctOrders,share:round(group.distinctOrders/Math.max(1,enriched.length),3)};
});
const restaurants=storeGroups.slice(0,20).map(group=>({name:group.rows[0].store,orders:group.count,share:round(group.count/Math.max(1,enriched.length),3)}));

const basketKey=order=>clean(order.store)+'|'+order.items.map(item=>clean(item.name)+'x'+item.quantity).sort().join('|')+'|'+order.details.flatMap(item=>item.options.map(clean)).sort().join(',');
const basketReplays=groups(enriched,basketKey).filter(group=>group.count>1).map(group=>({store:group.rows[0].store,count:group.count,days:group.rows.map(row=>row.day),items:group.rows[0].items,options:group.rows[0].details.flatMap(item=>item.options)}));
const modifierRows=enriched.flatMap(order=>order.details.filter(item=>item.options.length).map(item=>({orderIndex:order.orderIndex,day:order.day,store:order.store,item:item.name,options:item.options,key:clean(order.store)+'|'+clean(item.name)+'|'+item.options.map(clean).sort().join(',')})));
const modifierReplays=groups(modifierRows,row=>row.key).filter(group=>group.distinctOrders>1).map(group=>({store:group.rows[0].store,item:group.rows[0].item,options:group.rows[0].options,count:group.distinctOrders,days:group.rows.map(row=>row.day)}));
const itemStreaks=itemGroups.slice(0,40).map(group=>({name:group.rows[0].name,restaurant:group.rows[0].store,days:streak(enriched.filter(order=>order.items.some(item=>clean(item.name)===group.key)))})).sort((a,b)=>b.days.length-a.days.length);
const storeStreaks=storeGroups.slice(0,25).map(group=>({name:group.rows[0].store,days:streak(group.rows)})).sort((a,b)=>b.days.length-a.days.length);

const simultaneous=[];
for(let i=0;i<enriched.length;i++)for(let j=i+1;j<enriched.length;j++){
  const minutes=(new Date(enriched[j].orderedAt)-new Date(enriched[i].orderedAt))/60000;if(minutes>2)break;
  if(clean(enriched[i].store)!==clean(enriched[j].store))simultaneous.push({minutes:round(minutes),day:enriched[i].day,a:{store:enriched[i].store,items:enriched[i].items},b:{store:enriched[j].store,items:enriched[j].items}});
}

const waits=enriched.filter(order=>Number.isFinite(order.duration)&&order.duration>=0&&order.duration<=240).map(order=>order.duration);
const waitMinutes=sum(waits);
const quantities=enriched.map(order=>order.totalQuantity),quantityMedian=middle(quantities),quantityP95=percentile(quantities,.95);
const largestBasket=enriched.reduce((best,order)=>!best||order.totalQuantity>best.totalQuantity?order:best,null);
const mostModified=enriched.reduce((best,order)=>!best||order.modifierCount>best.modifierCount?order:best,null);
const hourGroups=groups(enriched,order=>String(order.hour)),peakHour=hourGroups[0]||{key:'0',count:0};
const dayGroups=groups(enriched,order=>order.day),busiestDay=dayGroups[0]||null;

const families=[['tacos',/taco|quesadilla/],['salmon',/salmon|lox/],['eggs',/egg|omelet/],['sushi',/sushi|nigiri|sashimi|roll|poke|omakase/],['bowls',/bowl|acai|açaí/],['sandwiches',/sandwich|burger|toast/],['salads',/salad|greens/],['pizza',/pizza/],['dessert',/cookie|cake|ice cream|chocolate|pudding|parfait/],['produce',/berries|banana|fruit/],['nonfood',/body wash|soap|detergent|paper towel|toothpaste|shampoo|deodorant/]];
const familyRows=units.flatMap(row=>families.filter(([,pattern])=>pattern.test(clean(row.name))).map(([family])=>({...row,family})));
const familyRanking=groups(familyRows,row=>row.family,row=>row.units).map(group=>({name:group.key,units:group.count,orders:group.distinctOrders}));
const mixedBaskets=enriched.map(order=>{const text=order.items.map(item=>clean(item.name)).join(' '),matched=families.filter(([,pattern])=>pattern.test(text)).map(([name])=>name);return {day:order.day,store:order.store,items:order.items,options:order.details.flatMap(item=>item.options),families:matched,modifierCount:order.modifierCount,score:Math.max(0,matched.length-1)*8+Math.min(8,order.totalQuantity)}}).sort((a,b)=>b.score-a.score).slice(0,12);
const lateNight=enriched.filter(order=>order.hour>=23||order.hour<=4).map(order=>({day:order.day,hour:order.hour,minute:order.minute,store:order.store,items:order.items})).slice(0,12);

function caloriesFor(item){
  const text=clean(item.name),options=item.options.map(clean).join(' ');
  let each=/body wash|soap|detergent|paper towel|toothpaste|shampoo|deodorant/.test(text)?0:/salad/.test(text)?550:/taco/.test(text)?280:/burrito/.test(text)?950:/burger/.test(text)?900:/pizza/.test(text)?700:/sushi|roll|poke|nigiri|omakase/.test(text)?520:/salmon|fish/.test(text)?420:/egg|omelet/.test(text)?180:/sandwich|toast/.test(text)?650:/acai|açaí|parfait|pudding|smoothie/.test(text)?500:/bowl/.test(text)?700:/fries/.test(text)?450:/cookie|cake|dessert/.test(text)?500:/berries|fruit/.test(text)?160:/coffee|tea|juice|soda/.test(text)?160:600;
  if(/extra cheese/.test(options))each+=120;if(/avocado|guac/.test(options))each+=120;if(/extra egg|2 egg/.test(options))each+=180;if(/no bread/.test(options))each-=180;
  return Math.max(0,each)*item.quantity;
}
const calories=Math.round(sum(enriched.flatMap(order=>order.items).map(caloriesFor))/1000)*1000;
const candidates=[];
const add=(id,kind,value,evidence)=>candidates.push({id,kind,value,evidence});
meals.slice(0,8).forEach((meal,index)=>{if(meal.units>=5||(meal.orders>=4&&meal.share>=.15))add('dish-'+(index+1),'repetition',meal.units,meal)});
basketReplays.slice(0,5).forEach((replay,index)=>{if(replay.count>=3)add('basket-replay-'+(index+1),'ritual',replay.count,replay)});
modifierReplays.slice(0,5).forEach((replay,index)=>{if(replay.count>=3)add('modifier-replay-'+(index+1),'ritual',replay.count,replay)});
if(itemStreaks[0]?.days.length>=3)add('dish-streak','ritual',itemStreaks[0].days.length,itemStreaks[0]);
if(storeStreaks[0]?.days.length>=3)add('store-streak','ritual',storeStreaks[0].days.length,storeStreaks[0]);
if(waitMinutes>=600)add('waiting','cumulative',waitMinutes,{minutes:waitMinutes,hours:round(waitMinutes/60),eligible:waits.length});
if(calories>=25000)add('calories','cumulative',calories,{calories});
if(mostModified?.modifierCount>=5)add('most-modified','customization',mostModified.modifierCount,mostModified);
if(largestBasket&&largestBasket.totalQuantity>=Math.max(8,quantityP95,quantityMedian*2))add('largest-basket','quantity',largestBasket.totalQuantity,largestBasket);
if(busiestDay?.count>5)add('order-burst','frequency',busiestDay.count,{day:busiestDay.key,orders:busiestDay.rows});
if(familyRanking[0]?.units>=15)add('top-family','repetition',familyRanking[0].units,familyRanking[0]);
const mixed=mixedBaskets.find(basket=>basket.families.includes('nonfood')&&basket.families.length>=2);if(mixed)add('mixed-basket','singularity',mixed.score,mixed);
if(lateNight.some(order=>order.hour>=1&&order.hour<=4))add('odd-hour','timing',lateNight.length,lateNight);

const elapsedDays=enriched.length?Math.max(1,Math.floor((Date.now()-new Date(enriched[0].orderedAt))/86400000)):0;
const multiOrderDays=dayGroups.filter(group=>group.count>1).length;
const facts={
  profile:{firstName:safe(source.source?.ownerName,50)||null},
  coverage:{...source.source,oldest:enriched[0]?.orderedAt||null,newest:enriched.at(-1)?.orderedAt||null,elapsedDays},
  totals:{wait:{minutes:waitMinutes,hours:round(waitMinutes/60),eligible:waits.length,medianMinutes:middle(waits)},calories,simultaneousOrders:simultaneous.length,multiOrderDays,busiestDay:busiestDay?{day:busiestDay.key,orders:busiestDay.count}:null},
  rankings:{meals:meals.slice(0,10),restaurants:restaurants.slice(0,10),families:familyRanking.slice(0,10)},
  patterns:{itemStreaks:itemStreaks.slice(0,10),storeStreaks:storeStreaks.slice(0,8),basketReplays:basketReplays.slice(0,10),modifierReplays:modifierReplays.slice(0,10),simultaneous:simultaneous.slice(0,10),peakHour:{hour:Number(peakHour.key),count:peakHour.count}},
  outliers:{largestBasket,mostModified,mixedBaskets,lateNight,quantityMedian,quantityP95},
  candidates
};

await writeFile(new URL('../data/facts.json',import.meta.url),JSON.stringify(facts),{mode:0o600});
console.log(JSON.stringify({orders:enriched.length,topDish:meals[0]?.units||0,waitHours:facts.totals.wait.hours,calories,candidates:candidates.length}));
