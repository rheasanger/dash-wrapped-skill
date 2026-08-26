import {execFile} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {promisify} from 'node:util';

const exec=promisify(execFile);
const cli=process.env.DD_CLI_PATH||'dd-cli';
const intent=process.env.DD_CLI_INTENT;
const concurrency=Math.max(1,Math.min(10,Number(process.env.DD_RECEIPT_CONCURRENCY||10)));

if(!intent||!/^Summary: .+\nuser prompt\/purpose: ".+"$/s.test(intent)){
  throw new Error('DD_CLI_INTENT must contain the required Summary and user prompt/purpose lines.');
}

async function retry(fn){
  let error;
  for(let i=0;i<3;i++){
    try{return await fn()}catch(e){error=e;if(i<2)await new Promise(r=>setTimeout(r,500*(2**i)))}
  }
  throw error;
}

async function cliCall(args){
  return retry(async()=>{
    const {stdout}=await exec(cli,['--json-output',...args,'--intent',intent],{timeout:45000,maxBuffer:32*1024*1024});
    const envelope=JSON.parse(stdout),body=envelope.structuredContent||envelope;
    if(envelope.isError||body.success===false)throw new Error(body.message||'DoorDash CLI error');
    return body;
  });
}

const text=(value,max=100)=>{
  if(typeof value!=='string')return null;
  const clean=value.normalize('NFKC').replace(/[\u0000-\u001f\u007f<>{}\[\]`]/g,' ').replace(/\s+/g,' ').trim();
  return clean?clean.slice(0,max):null;
};
const quantity=value=>Math.max(1,Math.min(100,Number.isFinite(Number(value))?Math.trunc(Number(value)):1));
const timestamp=value=>{
  if(typeof value!=='string'||!Number.isFinite(Date.parse(value)))return null;
  return new Date(value).toISOString();
};
const optionText=value=>typeof value==='string'?text(value,120):text(value?.name||value?.item_option_name||value?.display_name,120);

function sanitizeItems(items=[]){
  if(!Array.isArray(items))return [];
  return items.slice(0,100).map(item=>({
    name:text(item?.item_name||item?.name,120)||'Unknown item',
    quantity:quantity(item?.quantity??item?.order_item_quantity),
    options:(Array.isArray(item?.item_option_details)?item.item_option_details:[]).slice(0,30).map(optionText).filter(Boolean),
    outOfStock:item?.is_out_of_stock===true
  }));
}

function sanitizeReceipt(receipt={}){
  const orders=Array.isArray(receipt.orders)?receipt.orders:Array.isArray(receipt.receipt?.orders)?receipt.receipt.orders:[];
  return {
    storeName:text(receipt.store_name||receipt.receipt?.store_name,120),
    // Receipt lines carry options and substitutions; history items remain the
    // authoritative source for aggregate quantity because some receipt shapes
    // omit quantity entirely.
    detailedItems:orders.slice(0,20).flatMap(order=>sanitizeItems(order?.order_item_line_details))
  };
}

const maxOrders=100;
const history=await cliCall(['order','history','--days','365','--max',String(maxOrders)]);
const input=(Array.isArray(history.orders)?history.orders:[]).slice(0,maxOrders);
const orders=new Array(input.length);
let cursor=0,success=0;

async function worker(){
  while(true){
    const i=cursor++;
    if(i>=input.length)return;
    const source=input[i];
    let receipt=null;
    try{
      receipt=sanitizeReceipt(await cliCall(['order','receipt','--order-uuid',source.order_uuid]));
      success++;
    }catch{}
    orders[i]={
      storeName:text(source.store_name,120)||'Unknown store',
      orderedAt:timestamp(source.order_date||source.ordered_at),
      fulfilledAt:timestamp(source.order_fulfilled_at||source.fulfilled_at),
      fulfillmentType:text(source.fulfillment_type,40),
      isGroupOrder:source.is_group_order===true?true:null,
      items:sanitizeItems(source.items),
      receipt
    };
  }
}

await Promise.all(Array.from({length:concurrency},worker));
const ownerName=text(process.env.WRAPPED_NAME,50)?.split(/\s+/)[0]||null;
const output={
  generatedAt:new Date().toISOString(),
  source:{route:'dd-cli',requestedDays:365,maxOrders,returned:orders.length,capReached:orders.length>=maxOrders,receiptsFound:success,timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone,ownerName},
  orders:orders.filter(order=>order.orderedAt)
};
const dataDir=new URL('../data/',import.meta.url);
await mkdir(dataDir,{recursive:true,mode:0o700});
await writeFile(new URL('orders.json',dataDir),JSON.stringify(output),{mode:0o600});
console.log(JSON.stringify(output.source));
