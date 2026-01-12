const { Sequelize } = require('sequelize');
require('dotenv').config();

const config = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  },
  test: {
    username: 'root',
    password: null,
    database: 'test_db',
    host: '127.0.0.1',
    port: 3306,
    dialect: 'mysql',
  },
  production: {
    username: 'root',
    password: null,
    database: 'prod_db',
    host: '127.0.0.1',
    port: 3306,
    dialect: 'mysql',
  },
};

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize({
  dialect: dbConfig.dialect,
  host: dbConfig.host,
  port: Number(dbConfig.port),
  username: dbConfig.username,
  password: dbConfig.password || undefined,
  database: dbConfig.database,
  logging: false,
});

module.exports = config;
module.exports.sequelize = sequelize;
