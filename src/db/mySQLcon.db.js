// const mysql = require("mysql2");
// require("dotenv").config();

// const dataBase = async () => {
//   try {
//     const conn = await mysql.createConnection({
//       host: "localhost",
//       user: "root",
//       password: process.env.mysql_password,
//       dataBase: "learngrazac",
//     });

//     console.log("MySQL server is running");
//   } catch (error) {
//     console.log(error.message);
//   }
// };

// module.exports = dataBase;

const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();
// creating connection
const database = mysql.createConnection({
  host: "learngrazac.cmct4vnvmxke.us-east-1.rds.amazonaws.com",
  user: "admin",
  password: process.env.mysql_password,
  database: "learngrazac",
});

database.connect(function (err) {
  if (err) {
    return console.error("error: " + err.message);
  }

  console.log("Connected to the MySQL server.");
});
module.exports = database.promise();
