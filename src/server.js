require('dotenv').config();
const path = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');

const app = require('./app');
const { sequelize } = require('./models');
const { ensureDatabaseExists } = require('./utils/init-bd');

const execAsync = promisify(exec);
const PORT = process.env.PORT || 5000;
const PROJECT_ROOT = path.join(__dirname, '..');

(async () => {
  try {
    try {
      await ensureDatabaseExists();
    } catch (e) {
      console.warn(
        '⚠️ ensureDatabaseExists omitido o falló (si la BD ya existe, puedes ignorar):',
        e.message
      );
    }

    await sequelize.authenticate();
    console.log('✅ Conexión establecida con la base de datos');

    try {
      const { stdout, stderr } = await execAsync('npx sequelize-cli db:migrate', {
        cwd: PROJECT_ROOT,
        maxBuffer: 1024 * 1024,
        shell: true,
      });
      if (stdout) console.log('🛠️ Migraciones:\n', stdout);
      if (stderr) console.warn(stderr);
    } catch (migrateErr) {
      console.error('❌ Error al ejecutar migraciones:', migrateErr.stderr || migrateErr.message);
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error.message);
    process.exit(1);
  }
})();
