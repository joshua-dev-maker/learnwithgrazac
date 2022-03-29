const express = require("express");
const router = express.Router();
require("dotenv").config();
const passport = require("passport");

router.get("/login", (req, res) => {
  if (req.user) {
    return res.redirect("/");
  }
  res.render("login");
});

router.get("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

//auth
router.get("/github", passport.authenticate("github", { scope: ["profile"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

module.exports = router;
