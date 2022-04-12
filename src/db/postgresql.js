const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

// creating connection:
const pool = new Pool({
  host: process.env.PostgreSQL_host,
  user: process.env.PostgreSQL_user,
  port: process.env.PostgreSQL_port,
  password: process.env.PostgreSQL_password,
  database: process.env.PostgreSQL_data,
});

pool.query("SELECT NOW()", (err, res) => {
  if (!err) {
    console.log(" PGsql running");
  } else {
    console.log(err.message);
  }
});

module.exports = pool;
