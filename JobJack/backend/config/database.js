const { Pool } = require("pg");
require("dotenv").config();

const connectionPool = new Pool({
  user: process.env.user,
  password: process.env.PASSWORD,
  host: process.env.HOST,
  port: process.env.DB_PORT,
  database: process.env.DATABASE,
  ssl: {
    rejectUnauthorized: false, // Optional: Set to false as we're dealing with a self-signed certificate from the server
  },
});

module.exports = connectionPool;
