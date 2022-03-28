const GitHubStrategy = require("passport-github").Strategy;
const passport = require("passport");

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:6111/auth/github/callback",
    },
    (accessToken, refreshToken, profile, cb) => {
      // User.findOrCreate({ githubId: profile.id }, (err, user) => {
      //   return cb(err, user);
      // });
      console.log(profile);
      cb(null, profile);
    }
  )
);
