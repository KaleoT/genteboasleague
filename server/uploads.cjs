const path=require('node:path');
const fs=require('node:fs');
const {randomUUID}=require('node:crypto');
const sharp=require('sharp');
const multer=require('multer');
const express=require('express');
const MIME={'image/png':'png','image/jpeg':'jpeg','image/webp':'webp','image/svg+xml':'svg'};
const MAX=5*1024*1024;
module.exports=function uploads({app,db,auth,security,read,setMedia,options={}}){
  const root=path.resolve(options.uploadDirectory||process.env.UPLOADS_PATH||'./uploads');
  for(const dir of ['badges','kits'])fs.mkdirSync(path.join(root,dir),{recursive:true});
  db.exec(`CREATE TABLE IF NOT EXISTS uploaded_assets(url TEXT PRIMARY KEY,category TEXT NOT NULL,filename TEXT NOT NULL,created_at TEXT NOT NULL);
    INSERT OR IGNORE INTO schema_migrations VALUES(8);`);
  let retryTimer=null,retries=0;
  // Only server-generated names registered here may ever be deleted.
  function clean(){
    let busyFile=false;
    const references=[...db.prepare('SELECT payload FROM shared_collections').all(),...db.prepare('SELECT payload FROM migration_backups').all()].map(r=>r.payload);
    for(const a of db.prepare('SELECT * FROM uploaded_assets').all()){
      if(references.some(text=>text.includes(JSON.stringify(a.url))))continue;
      if(!['badges','kits'].includes(a.category)||! /^[a-f0-9-]{36}\.webp$/.test(a.filename))continue;
      try{fs.unlinkSync(path.join(root,a.category,a.filename));db.prepare('DELETE FROM uploaded_assets WHERE url=?').run(a.url);}catch(e){if(e.code==='ENOENT')db.prepare('DELETE FROM uploaded_assets WHERE url=?').run(a.url);else if(['EBUSY','EPERM','EACCES'].includes(e.code))busyFile=true;else console.error(JSON.stringify({event:'upload_cleanup_failed',code:e.code}));}
    }
    if(busyFile&&retries<8&&!retryTimer){retries++;retryTimer=setTimeout(()=>{retryTimer=null;app.locals.cleanupUploads();},250);retryTimer.unref();}else if(!busyFile){retries=0;if(retryTimer){clearTimeout(retryTimer);retryTimer=null;}}
  }
  for(const category of ['badges','kits'])for(const filename of fs.readdirSync(path.join(root,category))){
    if(!/^[a-f0-9-]{36}\.webp$/.test(filename))continue;
    const file=path.join(root,category,filename),url='/uploads/'+category+'/'+filename;
    if(!db.prepare('SELECT url FROM uploaded_assets WHERE url=?').get(url)&&Date.now()-fs.statSync(file).mtimeMs>3600000)try{fs.unlinkSync(file);}catch{}
  }
  app.locals.cleanupUploads=()=>{try{clean();}catch{console.error(JSON.stringify({event:'upload_cleanup_failed'}));}};
  app.locals.cleanupUploads();
  app.use('/uploads',express.static(root,{dotfiles:'deny',index:false,immutable:true,maxAge:'1y',setHeaders(res){res.set('X-Content-Type-Options','nosniff');res.set('Content-Security-Policy',"default-src 'none'; sandbox");}}));
  const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:MAX,files:1,fields:1,fieldSize:32,parts:2},fileFilter(_req,file,cb){if(!MIME[file.mimetype])return cb(Object.assign(Error('Formato inválido. Envie PNG, JPEG, WEBP ou SVG.'),{status:415}));cb(null,true);}}).single('file');
  const limiter=require('express-rate-limit').rateLimit({windowMs:60000,limit:20,keyGenerator:req=>req.user.id,standardHeaders:'draft-8',legacyHeaders:false,message:{message:'Aguarde um minuto antes de enviar outras imagens.'}});
  let processing=0;
  function receive(kind){return (req,res)=>{
    if(!read('teams').value.some(t=>t.id===req.params.id))return res.status(404).json({message:'Clube não encontrado.'});
    if(processing>=4)return res.status(503).json({message:'Servidor processando outras imagens. Tente novamente em instantes.'});
    processing++;
    upload(req,res,async error=>{
      let filePath;
      try{
        if(error)throw error;
        if(!req.file)throw Error('Selecione um arquivo de imagem no campo file.');
        if(kind==='kit'&&!['home','away'].includes(req.body.kit_type))throw Error('kit_type deve ser home ou away.');
        const buffer=req.file.buffer;
        if(req.file.mimetype==='image/svg+xml'){
          const svg=buffer.toString('utf8');
          if(/<!DOCTYPE|<!ENTITY|<\s*(script|foreignObject|image|iframe|object|embed)\b|\bon\w+\s*=|@import|xml:base\s*=/i.test(svg)||/\b(?:href|src)\s*=\s*["'](?!#)/i.test(svg)||/url\(\s*["']?(?!#)/i.test(svg))throw Error('SVG inseguro: remova scripts, recursos externos e conteúdo incorporado.');
        }
        const image=sharp(buffer,{limitInputPixels:20*1024*1024,failOn:'warning',animated:false}),metadata=await image.metadata();
        if(metadata.format!==MIME[req.file.mimetype]||!['png','jpeg','webp','svg'].includes(metadata.format))throw Error('O conteúdo do arquivo não corresponde ao formato informado.');
        if((metadata.pages||1)!==1)throw Error('Envie uma imagem estática, sem animação.');
        const size=kind==='badge'?512:2048;
        const output=await image.rotate().resize(size,size,{fit:'inside',withoutEnlargement:true}).webp({lossless:true,effort:4}).toBuffer();
        if(req.aborted)throw Error('Upload cancelado.');
        const current=db.prepare('SELECT role,team_id,status,token_version FROM users WHERE id=?').get(req.user.id);
        if(!current||current.status!=='active'||current.token_version!==req.user.token_version||current.role!=='admin'&&current.team_id!==req.params.id)throw Object.assign(Error('Sua sessão ou permissão mudou durante o upload. Entre novamente.'),{status:403});
        const category=kind==='badge'?'badges':'kits',filename=randomUUID()+'.webp',url='/uploads/'+category+'/'+filename;
        filePath=path.join(root,category,filename);await fs.promises.writeFile(filePath,output,{flag:'wx'});
        const field=kind==='badge'?'badge_url':'kit_'+req.body.kit_type+'_3d_url';
        const team=setMedia(req.params.id,field,url,{url,category,filename});filePath=null;
        res.status(201).json({url,[field]:url,team});
      }catch(e){if(filePath)await fs.promises.unlink(filePath).catch(()=>{});const status=e.code==='LIMIT_FILE_SIZE'?413:e.status||400;res.status(status).json({error:status===403?'FORBIDDEN':'INVALID_UPLOAD',message:e.code==='LIMIT_FILE_SIZE'?'O arquivo excede o limite de 5 MB.':e instanceof multer.MulterError?'Envie somente um arquivo no campo file e o tipo do uniforme.':e.message.startsWith('SVG')?e.message:'Não foi possível processar a imagem. '+(e.message.startsWith('Input')?'Imagem inválida ou grande demais.':e.message)});}
      finally{processing--;}
    });
  };}
  app.post('/api/teams/:id/upload-badge',auth,security.require_team_owner,limiter,receive('badge'));
  app.post('/api/teams/:id/upload-kit',auth,security.require_team_owner,limiter,receive('kit'));
  app.delete('/api/teams/:id/badge',auth,security.require_team_owner,(req,res)=>{try{const team=setMedia(req.params.id,'badge_url','assets/default-shield.svg');res.json({url:team.badge_url,team});}catch(e){res.status(404).json({message:e.message});}});
  app.delete('/api/teams/:id/kit/:type',auth,security.require_team_owner,(req,res)=>{if(!['home','away'].includes(req.params.type))return res.status(400).json({message:'Tipo de uniforme inválido.'});try{const team=setMedia(req.params.id,'kit_'+req.params.type+'_3d_url','assets/kit-'+req.params.type+'-default.svg');res.json({url:team['kit_'+req.params.type+'_3d_url'],team});}catch(e){res.status(404).json({message:e.message});}});
};
