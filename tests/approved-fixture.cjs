// Existing feature regressions run with approved accounts. Moderation tests use the real default.
const {createApp:realCreateApp}=require('../server/app.cjs');
exports.createApp=(options)=>{const result=realCreateApp(options);result.db.exec("CREATE TRIGGER IF NOT EXISTS fixture_auto_approve AFTER INSERT ON users BEGIN UPDATE users SET status='active' WHERE id=NEW.id; END;");return result;};
