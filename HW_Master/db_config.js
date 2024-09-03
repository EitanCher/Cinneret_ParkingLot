const { Pool } = require('pg');
// "Pool" - manage a pool of connections, support simultaneous queries
const pool = new Pool({
  user:     process.env.DB_USER,
  password: process.env.DB_PSWD,
  host:     process.env.DB_HOST,
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT
});

module.exports = pool;
