const format=require('../js/backup-format.js');
const {randomUUID}=require('node:crypto');
module.exports=function backup({app,db,auth,admin,read,votes,restore}){
  db.exec(`CREATE TABLE IF NOT EXISTS legacy_schedule_votes(id TEXT PRIMARY KEY,payload TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS migration_backups(id TEXT PRIMARY KEY,created_at TEXT NOT NULL,payload TEXT NOT NULL);
    INSERT OR IGNORE INTO schema_migrations VALUES(7);`);
  function snapshot(){const values={};for(const key of Object.keys(require('./shared-seed.json')))values[key]=read(key).value;values.schedules=votes();return format.pack(values);}
  app.get('/api/admin/export-backup',auth,admin,(req,res)=>res.json(snapshot()));
  app.get('/api/admin/backups',auth,admin,(req,res)=>res.json(db.prepare('SELECT id,created_at FROM migration_backups ORDER BY created_at DESC').all()));
  app.get('/api/admin/backups/:id',auth,admin,(req,res)=>{const row=db.prepare('SELECT payload FROM migration_backups WHERE id=?').get(req.params.id);if(!row)return res.status(404).json({message:'Backup não encontrado.'});res.json(JSON.parse(row.payload));});
  app.post('/api/admin/migrate-backup',auth,admin,(req,res)=>{
    try{
      const values=format.unpack(req.body),previous=snapshot(),id=randomUUID();
      restore(values,{id,created_at:new Date().toISOString(),payload:JSON.stringify(previous)});
      const counts={teams:values.teams.length,rosters:values.teams.reduce((n,t)=>n+t.roster.length,0),rankings:values.ranking.historico.length+values.ranking.temporada2026.length,titles:values.finals.length,records:values.records.length,transfers:values.transfers.length,proposals:values.proposals.length,schedules:values.schedules.length,news:values.news.length,tournaments:values.history.length};
      res.json({message:'Backup migrado com sucesso.',counts,restore_point_id:id});
    }catch(error){res.status(error.status||400).json({error:'INVALID_BACKUP',message:error.code?'A migração falhou e foi revertida ('+error.code+'). Verifique referências e identificadores do arquivo.':error.message});}
  });
};
