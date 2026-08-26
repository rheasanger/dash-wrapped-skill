import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {chmod,copyFile,cp,mkdir,mkdtemp,readFile,readdir,rm,writeFile} from 'node:fs/promises';
import {homedir,tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {promisify} from 'node:util';

const exec=promisify(execFile);
const platform={
  'darwin-arm64':'darwin-arm64',
  'linux-x64':'linux-amd64'
}[`${process.platform}-${process.arch}`];

if(!platform){
  throw new Error(`DoorDash CLI does not publish a build for ${process.platform}-${process.arch}. Use Linux x86_64 or macOS Apple Silicon.`);
}

const installDir=process.env.DD_CLI_INSTALL_DIR||join(homedir(),'.local','bin');
const installPath=join(installDir,'dd-cli');
const workDir=await mkdtemp(join(tmpdir(),'dd-cli-install-'));

async function download(url,path){
  const response=await fetch(url,{headers:{accept:'application/octet-stream','user-agent':'dash-wrapped-installer'}});
  if(!response.ok)throw new Error(`Download failed with HTTP ${response.status}: ${url}`);
  await writeFile(path,Buffer.from(await response.arrayBuffer()),{mode:0o600});
}

async function findFile(root,predicate){
  for(const entry of await readdir(root,{withFileTypes:true})){
    const path=join(root,entry.name);
    if(entry.isDirectory()){
      const nested=await findFile(path,predicate);
      if(nested)return nested;
    }else if(predicate(entry.name))return path;
  }
  return null;
}

try{
  const releaseResponse=await fetch('https://api.github.com/repos/doordash-oss/doordash-cli/releases/latest',{headers:{accept:'application/vnd.github+json','user-agent':'dash-wrapped-installer'}});
  if(!releaseResponse.ok)throw new Error(`Could not resolve the latest DoorDash CLI release (HTTP ${releaseResponse.status}).`);
  const release=await releaseResponse.json();
  const archiveSuffix=`-${platform}.tar.gz`;
  const archiveAsset=release.assets?.find(asset=>asset.name?.endsWith(archiveSuffix));
  const checksumAsset=release.assets?.find(asset=>asset.name===`${archiveAsset?.name}.sha256`);
  if(!archiveAsset||!checksumAsset)throw new Error(`Release ${release.tag_name||'(unknown)'} is missing the ${platform} archive or checksum.`);

  const archivePath=join(workDir,archiveAsset.name);
  const checksumPath=`${archivePath}.sha256`;
  await Promise.all([
    download(archiveAsset.browser_download_url,archivePath),
    download(checksumAsset.browser_download_url,checksumPath)
  ]);

  const expected=(await readFile(checksumPath,'utf8')).trim().split(/\s+/)[0]?.toLowerCase();
  const actual=createHash('sha256').update(await readFile(archivePath)).digest('hex');
  if(!expected||actual!==expected)throw new Error(`SHA256 mismatch for ${archiveAsset.name}.`);

  await exec('tar',['-xzf',archivePath,'-C',workDir],{timeout:30000});
  const binary=await findFile(workDir,name=>name===archiveAsset.name.replace(/\.tar\.gz$/,''));
  if(!binary)throw new Error(`The verified archive did not contain ${archiveAsset.name.replace(/\.tar\.gz$/,'')}.`);

  await mkdir(installDir,{recursive:true,mode:0o700});
  const bundledRuntime=join(dirname(binary),'_internal');
  try{
    await readdir(bundledRuntime);
    await rm(join(installDir,'_internal'),{recursive:true,force:true});
    await cp(bundledRuntime,join(installDir,'_internal'),{recursive:true});
  }catch(error){
    if(error.code!=='ENOENT')throw error;
  }
  await copyFile(binary,installPath);
  await chmod(installPath,0o700);
  const {stdout}=await exec(installPath,['--version'],{timeout:10000});
  console.log(`Installed ${stdout.trim()||release.tag_name} at ${installPath}`);
}finally{
  await rm(workDir,{recursive:true,force:true});
}
