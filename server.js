// creating an http server
const express = require("express");
const app = express();
const socialRoute = require("./src/routes/social-login.route");
const ejs = require("ejs");
const passportSetup = require("./src/service/passport-setup");
const session = require("express-session");
require("dotenv").config();
const { connectDB } = require("./src/db/connect.db");
const dataBase = require("./src/db/mySQLcon.db");
const passport = require("passport");
const AdminRouter = require("./src/routes/admin.route");
const UserRouter = require("./src/routes/user.route");
const PostRouter = require("./src/routes/post.route");
const CommentRouter = require("./src/routes/comment.route");

// console.log(passport);

// using express as a middleware

app.use(express.json());

const PORT = process.env.PORT;
connectDB();
dataBase;
// set view engine

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// baseurl
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("home");
});

// using the router for each model
app.use("/api/v1", UserRouter);
app.use("/auth", socialRoute);
app.use("/api/v1", AdminRouter);
app.use("/api/v1", PostRouter);
app.use("/api/v1", CommentRouter);

app.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`);
});
