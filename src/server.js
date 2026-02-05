require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');
const { exec } = require('child_process');
const { ensureDatabaseExists } = require('./utils/init-bd');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // COMENTADO: No conectar a BD por el momento
    // // 1. Crear la base de datos si no existe
    // await ensureDatabaseExists();

    // // 2. Conectar con Sequelize
    // await sequelize.authenticate();
    // console.log('✅ Conexión establecida con la base de datos');

    // // 3. Ejecutar migraciones con sequelize-cli (esto sí deja rastro)
    // exec('npx sequelize-cli db:migrate', (err, stdout, stderr) => {
    //   if (err) {
    //     console.error('❌ Error al ejecutar migraciones:', stderr);
    //     process.exit(1);
    //   }

    //   console.log('🛠️ Migraciones ejecutadas:\n', stdout);

    //   // 4. Iniciar el servidor
    //   app.listen(PORT, () => {
    //     console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    //   });
    // });

    // Iniciar servidor sin conectar a BD
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log('⚠️ Base de datos desconectada (modo testing)');
      //vacio
    });

  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
  }
})();
