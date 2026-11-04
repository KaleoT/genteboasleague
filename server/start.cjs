const {createApp}=require('./app.cjs');
const {app,db}=createApp();
const server=app.listen(Number(process.env.PORT || 3000),process.env.HOST || '127.0.0.1',()=>console.log(`GBL disponível em http://${process.env.HOST || '127.0.0.1'}:${process.env.PORT || 3000}`));
for(const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.close(()=>{db.close();process.exit(0);}));
