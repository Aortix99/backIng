const mysql = require('mysql2/promise');

/**
 * Solo aplica a MySQL local: crea la BD si no existe.
 * Con Supabase/Postgres (DATABASE_URL) la base ya existe; no hace nada.
 */
async function ensureDatabaseExists() {
  if (process.env.DATABASE_URL) {
    return;
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
  console.log(`📦 Base de datos '${process.env.DB_NAME}' verificada`);
  await connection.end();
}

module.exports = { ensureDatabaseExists };
