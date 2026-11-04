// Detach the server with file-backed stdio so the Windows launcher can exit.
const fs=require('node:fs'),path=require('node:path');
const {spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..');
fs.mkdirSync(path.join(root,'data'),{recursive:true});
const out=fs.openSync(path.join(root,'data','server-output.log'),'a');
const err=fs.openSync(path.join(root,'data','server-error.log'),'a');
try{
  const child=spawn(process.execPath,['--env-file=.env','server/start.cjs'],{cwd:root,detached:true,windowsHide:true,stdio:['ignore',out,err]});
  child.on('error',()=>{process.stderr.write('Nao foi possivel iniciar o servidor.\n');process.exitCode=1;});
  child.unref();
}finally{fs.closeSync(out);fs.closeSync(err);}
