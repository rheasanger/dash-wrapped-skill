import {readFile,writeFile} from 'node:fs/promises';

const facts=JSON.parse(await readFile(new URL('../data/facts.json',import.meta.url),'utf8'));
const name=String(process.env.WRAPPED_NAME||facts.profile?.firstName||'').trim().split(/\s+/)[0];
if(!name)throw new Error('Re-run with WRAPPED_NAME="FirstName"');
const title=value=>String(value||'').toLowerCase().replace(/\b\w/g,char=>char.toUpperCase());
const plural=(value,count)=>{const label=title(value);if(Number(count)<=1||/s$/i.test(label))return label;if(/taco$/i.test(label))return label+'s';return label;};
const shortDate=value=>value?new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z')).toUpperCase():'';
const icon=value=>/taco/i.test(value)?'🌮':/salmon|fish/i.test(value)?'🐟':/sushi|nigiri|roll|omakase/i.test(value)?'🍣':/egg|omelet/i.test(value)?'🍳':/salad|greens/i.test(value)?'🥗':/sandwich|toast/i.test(value)?'🥪':/bowl|acai|açaí/i.test(value)?'🥣':/pizza/i.test(value)?'🍕':'🍽️';
const doodle=value=>/taco/i.test(value)?'taco':/salmon|fish|sushi|nigiri|poke/i.test(value)?'fish':/egg|omelet/i.test(value)?'egg':'bowl';
const top=facts.rankings?.meals?.[0],wait=facts.totals?.wait||{},calories=Number(facts.totals?.calories)||0;
const candidates=facts.candidates||[],candidate=id=>candidates.find(item=>item.id===id);
const cards=[];

if(calories>=25000)cards.push({
  template:'abundance',claimIds:['calories'],kicker:'ALL TOGETHER',hero:Math.round(calories/1000)+'K',headline:'CALORIES',
  icons:(facts.rankings?.meals||[]).slice(0,8).map(item=>icon(item.name)),proof:'A YEAR-LONG PARADE OF '+(facts.rankings?.families||[]).slice(0,4).map(item=>String(item.name).toUpperCase()).join(', '),punchline:'YOUR FORK LOGGED OVERTIME.'
});
if(top)cards.push({
  template:'obsession',claimIds:['dish-1'],kicker:'MOST ORDERED DISH',hero:top.units+'×',headline:plural(top.name,top.units),label:'FROM '+title(top.restaurant),doodle:doodle(top.name),proof:top.orders+' SEPARATE ORDERS',punchline:'HAD YOU IN A CHOKEHOLD.'
});
if(Number(wait.hours)>=10){const minutes=Number(wait.minutes)||0,days=Math.floor(minutes/1440),hours=Math.floor((minutes%1440)/60),mins=Math.round(minutes%60);cards.push({
  template:'waiting',claimIds:['waiting'],kicker:'WAITING FOR FOOD',hero:String(Math.round(Number(wait.hours))),headline:'HOURS',breakdown:[days+' DAYS',hours+' HOURS',mins+' MINUTES'],proof:minutes.toLocaleString('en-US')+' MINUTES OF LITTLE CAR, BIG FEELINGS',punchline:'YOUR FOOD TOOK A LONG WEEKEND.'
})}

const modified=candidate('most-modified');
if(modified){const order=modified.evidence||{},options=(order.details||[]).flatMap(item=>item.options||[]);cards.push({
  template:'modifiers',claimIds:[modified.id],kicker:[shortDate(order.day),title(order.store)].filter(Boolean).join(' · '),hero:String(modified.value),headline:'DECISIONS\nIN ONE ORDER',items:options.slice(0,12),proof:(order.items||[]).slice(0,2).map(item=>title(item.name)).join(' + '),punchline:'THE KITCHEN GOT A BRIEFING.'
})}

if(cards.length<4){const ritual=candidate('dish-streak');if(ritual&&Number(ritual.value)>=5){const item=ritual.evidence||{};cards.push({
  template:'ritual',claimIds:[ritual.id],kicker:[shortDate(item.days?.[0]),title(item.restaurant)].filter(Boolean).join(' · '),hero:String(item.days?.length||ritual.value),headline:'DAYS\nSAME MEAL',days:(item.days||[]).map(day=>String(Number(day.slice(-2)))),cardLabel:'SAME AGAIN',label:plural(item.name,item.days?.length),doodle:doodle(item.name),proof:'THE MENU BECAME A FORMALITY',punchline:'YOUR KITCHEN ENTERED WITNESS PROTECTION.'
})}}

if(cards.length<4){const burst=candidate('largest-basket');if(burst){const order=burst.evidence||{};cards.push({
  template:'quantity',claimIds:[burst.id],kicker:[shortDate(order.day),title(order.store)].filter(Boolean).join(' · '),hero:String(burst.value),headline:'ITEMS\nIN ONE ORDER',items:(order.items||[]).map(item=>(item.quantity>1?item.quantity+'× ':'')+title(item.name)),proof:'ONE RECEIPT. VERY LITTLE RESTRAINT.',punchline:'ONE CART COULD NOT HOLD THE VISION.'
})}}

if(cards.length<4&&Number(facts.totals?.simultaneousOrders)>=3){const pair=facts.patterns?.simultaneous?.[0];if(pair)cards.push({
  template:'pairing',claimIds:['simultaneous-orders'],kicker:[shortDate(pair.day),'TWO STORES'].filter(Boolean).join(' · '),headline:'WEIRDEST\nMIX.',leftLabel:title(pair.a?.store),leftItems:(pair.a?.items||[]).map(item=>title(item.name)),rightLabel:title(pair.b?.store),rightItems:(pair.b?.items||[]).map(item=>title(item.name)),proof:'PLACED WITHIN '+Math.max(1,Math.round(Number(pair.minutes)||0))+' MINUTES',punchline:'CHOOSING WAS CANCELLED.'
})}

if(cards.length<4){const odd=candidate('odd-hour'),order=Array.isArray(odd?.evidence)?odd.evidence.find(item=>item.hour>=1&&item.hour<=4):null;if(order){const minute=String(order.minute||0).padStart(2,'0');cards.push({
  template:'odd-hour',claimIds:[odd.id],kicker:[shortDate(order.day),title(order.store)].join(' · '),hero:(order.hour%12||12)+':'+minute,headline:'AM',items:(order.items||[]).map(item=>title(item.name)),proof:'AN AFTER-HOURS MENU DECISION',punchline:'SLEEP WAS NOT ON THE MENU.'
})}}

const selected=cards.slice(0,4);
const cover=[
  {value:String(facts.coverage?.elapsedDays||0),label:'DAYS OF RECEIPTS'},
  calories?{value:Math.round(calories/1000)+'K',label:'CALORIES'}:null,
  top?{value:top.units+'×',label:plural(top.name,top.units)}:null,
  wait.hours?{value:Math.round(Number(wait.hours))+'H',label:'WAITING FOR FOOD'}:null
].filter(Boolean);
while(cover.length<4)cover.push({value:'—',label:'FIND A BETTER STAT'});
const finaleRows=(rows,valueKey)=>rows.slice(0,5).map(item=>({name:title(item.name),value:item[valueKey]+'×'}));
const story={
  slug:name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-dash-wrapped',
  cover:{alt:name+"'s DoorDash Wrapped cover",name,stats:cover.slice(0,4),teaser:'THE RECEIPTS HAVE A THEORY.'},
  cards:selected.map(card=>({...card,alt:[card.hero,card.headline,card.proof].filter(Boolean).join(' ')})),
  finale:{alt:name+"'s top meals and restaurants",headline:'THE RECEIPTS\nHAVE SPOKEN.',footer:'CASE CLOSED. APP STILL OPEN.',meals:finaleRows(facts.rankings?.meals||[],'units'),restaurants:finaleRows(facts.rankings?.restaurants||[],'orders')}
};
await writeFile(new URL('../story.json',import.meta.url),JSON.stringify(story,null,2)+'\n',{mode:0o600});
console.log(JSON.stringify({name,cards:selected.map(card=>card.template)}));
