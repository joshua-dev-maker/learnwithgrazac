const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();
// creating connection
const database = mysql.createConnection({
  host: "another.cmfp3wnd6dpd.us-east-1.rds.amazonaws.com",
  user: "root",
  password: "123456789",
  database: "another",
  port: "3306",
});

database.connect(function (err) {
  if (err) {
    return console.error("error: " + err.message);
  }

  console.log("Connected to the MySQL server.");
});
module.exports = database.promise();
