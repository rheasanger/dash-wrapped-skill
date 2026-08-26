import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

const exec=promisify(execFile);
const cli=process.env.DD_CLI_PATH||'dd-cli';
const setupUrl='https://github.com/doordash-oss/doordash-cli';
const intent=process.env.DD_CLI_INTENT;

if(!intent||!/^Summary: .+\nuser prompt\/purpose: ".+"$/s.test(intent)){
  console.error('DoorDash CLI preflight failed: DD_CLI_INTENT must contain the required Summary and user prompt/purpose lines.');
  process.exit(1);
}

try{
  const {stdout}=await exec(cli,['--json-output','order','history','--days','1','--max','1','--intent',intent],{timeout:45000,maxBuffer:2*1024*1024});
  const envelope=JSON.parse(stdout),body=envelope.structuredContent||envelope;
  if(envelope.isError||body.success===false)throw new Error(body.message||'DoorDash CLI error');
  console.log('DoorDash CLI connection verified.');
}catch(error){
  const reason=error.code==='ENOENT'?`DoorDash CLI was not found at ${cli}`:error.message;
  console.error(`DoorDash CLI preflight failed: ${reason}`);
  console.error(`Run \`${cli} login\` on this computer, then retry. Setup: ${setupUrl}`);
  process.exitCode=1;
}
