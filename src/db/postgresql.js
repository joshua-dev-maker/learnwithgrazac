const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

// creating connection:
const pool = new Pool({
  host: "database-2.cmct4vnvmxke.us-east-1.rds.amazonaws.com",
  user: "learngrazac",
  port: process.env.PostgreSQL_port,
  password: "123456789",
  database: "learngrazac",
});

pool.query("SELECT NOW()", (err, res) => {
  if (!err) {
    console.log(" PGsql running");
  } else {
    console.log(err.message);
  }
});

module.exports = pool;
