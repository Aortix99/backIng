const mysql = require('mysql2/promise');

async function ensureDatabaseExists() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
  console.log(`📦 Base de datos '${process.env.DB_NAME}' verificada`);
  await connection.end();
}

module.exports = { ensureDatabaseExists };
