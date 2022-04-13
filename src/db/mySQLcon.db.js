const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();
// creating connection
const database = mysql.createConnection({
  host: process.env.mysql_host,
  user: process.env.mysql_username,
  password: process.env.mysql_password,
  database: "database11",
  port: process.env.mysql_port,
});

database.connect(function (err) {
  if (err) {
    return console.error("error: " + err.message);
  }

  console.log("Connected to the MySQL server.");
});
module.exports = database.promise();
