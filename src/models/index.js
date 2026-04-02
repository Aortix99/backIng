const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const configs = require('../config/database.js');
const db = {};

const env = process.env.NODE_ENV || 'development';
const config = configs[env] || configs.development;

let sequelize;
if (config.use_env_variable) {
  const url = process.env[config.use_env_variable];
  if (!url) {
    throw new Error(`Falta la variable de entorno ${config.use_env_variable}`);
  }
  sequelize = new Sequelize(url, {
    dialect: config.dialect,
    dialectOptions: config.dialectOptions,
    logging: config.logging,
    pool: config.pool,
  });
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs.readdirSync(__dirname)
  .filter((file) => file !== basename && file.endsWith('.js'))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
