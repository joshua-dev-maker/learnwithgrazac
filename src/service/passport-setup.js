const GitHubStrategy = require("passport-github").Strategy;
const passport = require("passport");
const User = require("../models/user.git");
const keys = require("./keys");

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
  cb(null, id);
});
// passport.serializeUser(async (User, done) => {
//   done(null, User.id);
// });

// passport.deserializeUser((id, done) => {
//   User.findById(id).then((User) => {
//     done(null, User);
//   });
// });

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:6111/auth/github/callback",
    },
    (accessToken, refreshToken, profile, cb) => {
      User.findOne({ githubID: profile.id }).then((currentUser) => {
        if (currentUser) {
          console.log("User exists");
          done(null, current);
        } else {
          const newUser = new User({
            firstName: profile.displayName.split(" ")[0],
            lastName: profile.displayName.split(" ")[1],
            githubID: profile.id,
            email: email.emails[0].value,
            isVerified: true,
          });
          console.log(profile);

          // console.log(newUser.email)
          const data = {
            email: newUser.email,
            id: newUser._id,
            role: newUser.role,
          };
          // getting a secret token when login is successful
          const secret_key = process.env.SECRET;
          const token = jwt.sign(data, secret_key, { expiresIn: "2h" });

          console.log("heyyyyyy");
          console.log(newUser, token);
          newUser.save();
          cb(null, newUser);
        }
      });
    }
  )
);

// const GitHubStrategy = require("passport-github").Strategy;
// const passport = require("passport");
// const githubUser = require("../models/user.model");
// const db = require("../db/mySQLcon.db");
// const keys = require("./keys");
// const jwt = require("jsonwebtoken");
// // console.log(db);
// passport.serializeUser((users, cb) => {
//   cb(null, users.id);
// });

// passport.deserializeUser((id, cb) => {
//   cb(null, id);
// });

// // passport.serializeUser(async (user, cb) => {
// //   cb(null, user.id);
// // });

// // passport.deserializeUser((id, cb) => {
// //   githubUser.findById(id).then((user) => {
// //     cb(null, user);
// //   });
// // });

// passport.use(
//   new GitHubStrategy(
//     {
//       clientID: process.env.GITHUB_CLIENT_ID,
//       clientSecret: process.env.GITHUB_CLIENT_SECRET,
//       callbackURL: "http://localhost:6111/auth/github/callback",
//     },
//     (accessToken, refreshToken, profile, cb) => {
//       console.log(",,,,,,,,,,,,,,,,,");
//       const findUser = db.execute(
//         "SELECT `id` FROM `users` WHERE `githubID` = ?",
//         [profile.id]
//       );
//       console.log(findUser);
//       console.log(findUser);
//       if (findUser) {
//         console.log("User exists" + findUser);
//         cb(null, findUser);
//       } else {
//         console.log(profile);
//         githubfirstname = profile.displayName.split(" ")[0];
//         githublastname = profile.displayName.split(" ")[1];
//         githubID = profile.id;
//         console.log(firstname);
//         console.log(lastname);
//         role = "User";
//         const newUsers = db.execute(
//           "INSERT INTO users (firstName, lastName,  email, phoneNumber, role, password) VALUES ( ?, ?, ?, ?, ?, ?)",
//           [githubfirstname, githublastname, email, phoneNumber, role, password]
//         );
//         console.log("................");
//         console.log(newUsers);
//       }
//     }
//   )
// );
