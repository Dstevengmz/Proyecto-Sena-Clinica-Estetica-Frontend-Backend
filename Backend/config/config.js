require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME ,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    timezone: '-05:00',
    dialectOptions: {
      dateStrings: true,
      typeCast: true,
    },
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    timezone: '-05:00',
    dialectOptions: {
      dateStrings: true,
      typeCast: true,
    },
  },
};
