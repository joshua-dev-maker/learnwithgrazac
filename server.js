// creating an http server
const express = require("express");
const userRoutes = require("./src/routes/user.route");
const ejs = require("ejs");
const passportSetup = require("./src/utils/passport-setup");
require("dotenv").config();

const connectDB = require("./src/db/connect.db");
const passport = require("passport");
// console.log(passport);

// using express as a middleware
const app = express();

app.use(express.json());

const PORT = process.env.PORT;
connectDB();
// set view engine
app.set("view engine", "ejs");

// baseurl
app.get("/", (req, res) => {
  res.render("home");
});
app.get("/auth/github", passport.authenticate("github"));

app.get(
  "auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);
// using the router for each model
app.use("/api/v1", userRoutes);
// app.use("/api/v1", AdminRouter);
// app.use("/api/v1", ProductRouter);
// app.use("/api/v1", OrderRouter);

app.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`);
});
