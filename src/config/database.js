require('dotenv').config();

const pool = {
  max: 5,
  min: 0,
  acquire: 30000,
  idle: 10000,
};

const logging = false;

/** SSL requerido para Supabase y la mayoría de Postgres en la nube */
const postgresDialectOptions = {
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
};

function buildPostgresSequelizeCliConfig() {
  return {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: postgresDialectOptions,
    logging,
    pool,
  };
}

function buildMysqlSequelizeCliConfig() {
  return {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4',
    },
    logging,
    pool,
  };
}

const env = process.env.NODE_ENV || 'development';

if (process.env.DATABASE_URL) {
  const pg = buildPostgresSequelizeCliConfig();
  module.exports = {
    development: pg,
    production: pg,
    test: pg,
    [env]: pg,
  };
} else {
  const mysqlConf = buildMysqlSequelizeCliConfig();
  module.exports = {
    development: mysqlConf,
    production: mysqlConf,
    test: mysqlConf,
    [env]: mysqlConf,
  };
}
