const GitHubStrategy = require("passport-github").Strategy;
const passport = require("passport");
const User = require("../models/user.model");
const keys = require("./keys");

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
  cb(null, id);
});
// passport.use(
//   new GitHubStrategy(
//     {
//       clientID: keys.github.GITHUB_CLIENT_SECRET,
//       clientSecret: keys.github.GITHUB_CLIENT_SECRET,
//       callbackURL: "http://localhost:6111/auth/github/callback",
//     },
//     (accessToken, refreshToken, profile, cb) => {
//       (accessToken, refreshToken, profile, cb) => cb(null, profile);
//     }
//   )
// );

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:6111/auth/github/callback",
    },
    (accessToken, refreshToken, profile, cb) => {
      cb(null, profile);
    }
  )
);
