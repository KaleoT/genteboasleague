const fs=require('node:fs'),path=require('node:path');
const {randomBytes}=require('node:crypto');
function setup(root=path.resolve(__dirname,'..')){
  const file=path.join(root,'.env');if(fs.existsSync(file))return;
  const config=fs.readFileSync(path.join(root,'.env.example'),'utf8').replace('replace-with-a-random-secret-of-at-least-32-bytes',randomBytes(48).toString('base64url'));
  try{fs.writeFileSync(file,config,{flag:'wx'});}catch(error){if(error.code!=='EEXIST')throw error;}
}
if(require.main===module)setup();
module.exports={setup};
