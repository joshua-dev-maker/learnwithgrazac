const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const { sendMail } = require("../service/sendmail");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const axios = require("axios");
require("dotenv").config();
const db = require("../db/mySQLcon.db");
const { successResMsg, errorResMsg } = require("../utils/appResponse");
const AppError = require("../utils/appError");
const { validateReg, validateLogin } = require("../middlewares/joiValidation");

//registration of new users
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, phoneNumber, email, password, role } =
      req.body;
    // a check to ensure all fields are inputted correctly
    const validatedData = await validateReg.validateAsync(req.body);
    //check if the useremail already exists
    const [user] = await db.execute(
      "SELECT `email` FROM `users` WHERE `email` = ?",
      [{ email: validatedData.email }]
    );
    if (user.length > 0) {
      return res.status(400).json({
        message: "email already exist,please login",
      });
    }
    // a check for password length
    if (password.length < 8) {
      return next(
        new AppError(
          "Password must be atleast 8 letters" || "password too weak",
          401
        )
      );
    }
    if (
      validatedData.password.includes(firstName) ||
      validatedData.password.includes(lastName) ||
      validatedData.password.includes(phoneNumber) ||
      validatedData.password.includes(email)
    ) {
      return next(
        new AppError("password too weak" || "password not secured", 401)
      );
    }
    // hashing the user password
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(validatedData.password, salt);
    // const hashPassword = await bcrypt.hash(validatedData.password, 10);
    // console.log(hashPassword)
    const [newUser] = await db.execute(
      "INSERT INTO users (firstName, lastName,  email, phoneNumber, password) VALUES ( ?, ?, ?, ?, ?)",
      [firstName, lastName, email, phoneNumber, hashPassword]
    );
    // creating a payload
    const userData = {
      id: newUser.id,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      isVerified: req.body.isVerified,
    };
    const token = await jwt.sign(userData, process.env.User_Token, {
      expiresIn: "2h",
    });
    // verification of userEmail
    let mailOptions = {
      to: newUser.email,
      subject: "Verify Email",
      text: `Hi ${firstName},Pls verify your email. ${token}`,
    };

    await sendMail(mailOptions);
    return successResMsg(res, 201, {
      message: `Hi ${firstName.toUpperCase()},Your account has been created successfully.
      Please check your email for verification.`,
      token,
    });
  } catch (error) {
    return errorResMsg(res, 500, { message: error.message });
  }
};
// An endpoint used to verify users account
exports.verifyUserEmail = async (req, res, next) => {
  try {
    const { token } = req.headers;
    const secret_key = process.env.User_Token;
    const decodedToken = await jwt.verify(token, secret_key);
    const [user] = await db.execute("SELECT * FROM users WHERE email =?", [
      {
        email: decodedToken.email,
      },
    ]);
    if (user.verified) {
      return successResMsg(res, 200, {
        message: "user verified already",
      });
    }

    await db.execute(
      "UPDATE users SET isVerified = true WHERE isVerified = false"
    );
    return res.status(201).json({
      message: `Hi ${decodedToken.firstName}, Your account has been verified, You can now proceed to login`,
    });
  } catch (error) {
    return res.status(500).json({
      message: `${error.message}, Try again later.`,
    });
  }
};

// login endpoint for users
// exports.login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;
//     await validateLogin.validateAsync(req.body);
//     if (email && password) {
//       const user = await db.execute(
//         "SELECT password FROM users WHERE email =?",
//         [email]
//       );

//       if (user.length === 0) {
//         return res.status(400).json({
//           message: "email address not found.",
//         });
//       }
//       console.log(user[0][0]);
//       console.log(password);
//       console.log(await bcrypt.compare(user[0][0].password, password));
//       console.log();
//       let hashpass = user[0][0].password;
//       const passMatch = await bcrypt.compare(password, hashpass);
//       if (!passMatch) {
//         return res.status(400).json({ message: "incorrect password" });
//       }
//       if (emailexist[0].isVerified === 0) {
//         return res.status(400).json({
//           message: "Unverified account.",
//         });
//       }
//     }

//     const loginPayload = {
//       email: emailexist[0][0].email,
//       phoneNumber: emailexist[0][0].phoneNumber,
//       role: emailexist[0][0].role,
//     };
//     const loginToken = await jwt.sign(loginPayload, User_Token, {
//       expiresIn: "1h",
//     });
//     return successResMsg(res, 201, {
//       message: `Hi ${emailExists.lastName.toUpperCase()}
//       ${emailExists.firstName.toUpperCase()}, Welcome Back`,
//       loginToken,
//     });
//   } catch (error) {
//     return errorResMsg(res, 500, { message: error.message });
//   }
// };

// / logging in a user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // validate with joi
    // await validateLogin.validateAsync(req.body);
    //  checking email and password match
    if (email && password) {
      const [user] = await db.execute("SELECT * FROM users WHERE email =?", [
        email,
      ]);
      if (user.length === 0) {
        return res.status(400).json({
          message: "email address not found.",
        });
      }
      console.log(password, user[0].password);
      const passMatch = await bcrypt.compare(password, user[0].password);
      console.log(passMatch);
      if (!passMatch) {
        return res.status(400).json({ message: "incorrect password" });
      }
      if (user[0].isVerified === 0) {
        return res.status(400).json({
          message: "Unverified account.",
        });
      }
    }
    // creating a payload
    const data = {
      id: email[0].id,
      email: email.email,
      role: email.role,
    };

    const token = await jwt.sign(data, process.env.User_Token, {
      expiresIn: "1h",
    });
    return successResMsg(res, 200, {
      message: "User logged in sucessfully",
      token,
    });
  } catch (error) {
    return errorResMsg(res, 500, { message: error.message });
  }
};
exports.forgetUserPasswordLink = async (req, res, next) => {
  try {
    const { email } = req.body;
    const [user] = await db.execute("SELECT * FROM users WHERE email =?", [
      email,
    ]);
    if (user.length === 0) {
      return res.status(400).json({
        message: "email address not found.",
      });
    }
    //creating a payload
    const verificationdata = {
      id: email._id,
      email: email.email,
      role: email.role,
    };
    // getting a secret token
    const secret_key = process.env.User_Token;
    const token = await jwt.sign(verificationdata, secret_key, {
      expiresIn: "1hr",
    });
    const decodedToken = await jwt.verify(token, secret_key);
    let mailOptions = {
      to: email.email,
      subject: "Reset Password",
      text: `Hi ${user[0].firstName}, Reset your password with the link below.${token}`,
    };
    await sendMail(mailOptions);
    return successResMsg(res, 200, {
      message: `Hi ${user[0].firstName},reset password.`,
      decodedToken,
    });
  } catch (error) {
    return errorResMsg(res, 500, { message: error.message });
  }
};

exports.resetUserPassword = async (req, res, next) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const { email, token } = req.query;
    const secret_key = process.env.User_Token;
    const decoded_token = await jwt.verify(token, secret_key);
    console.log(decoded_token);
    // if (decoded_token.email !== email) {
    //   return next(new AppError("Email do not match.", 404));
    // }
    if (newPassword !== confirmPassword) {
      return next(new AppError("Password do not match.", 404));
    }
    await bcrypt.hash(confirmPassword, 10);
    await db.execute(
      "UPDATE admins SET password = password WHERE password = password",
      [newPassword]
    );
    return successResMsg(res, 200, {
      message: `Password has been changed successfully.`,
      newPassword,
    });
  } catch (error) {
    return errorResMsg(res, 500, { message: error.message });
  }
};

exports.updateUserPassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const { email } = req.query;
    const loggedUser = await db.execute("SELECT * FROM users WHERE email =?", [
      email,
    ]);
    // const headerTokenEmail = await jwt.verify(
    //   req.headers.authorization.split(" ")[1],
    //   process.env.User_Token
    // ).email;
    // if (headerTokenEmail !== loggedUser.email) {
    //   return next(new AppError("Forbidden", 404));
    // }
    // const passwordMatch = await bcrypt.compare(
    //   oldPassword,
    //   loggedUser[0][0].password
    // );
    // if (!passwordMatch) {
    //   return next(new AppError(`password is not same as old password`, 400));
    // }
    if (newPassword !== confirmPassword) {
      return next(new AppError(`Password do not match.`, 400));
    }

    const hashPassword = await bcrypt.hash(confirmPassword, 10);

    await db.execute(
      "SELECT * FROM users WHERE email =?",
      [email],
      [{ password: hashPassword }]
    );
    return successResMsg(res, 200, {
      message: `Password has been updated successfully.`,
    });
  } catch (error) {
    return errorResMsg(res, 500, {
      message: `${error.message}, Please Try agin later.`,
    });
  }
};
exports.payment = async (req, res, next) => {
  const { email, phonenumber, name } = req.body;
  try {
    const data = await axios({
      method: "post",
      url: "https://api.flutterwave.com/v3/payments",
      headers: {
        Authorization: `Bearer ${process.env.FLUT_SEC_KEY}`,
      },
      data: {
        tx_ref: "hooli-tx-1920bbtytty",
        amount: "100",
        currency: "NGN",
        redirect_url: "https://localhost:6111/",
        customer: {
          email,
          phonenumber,
          name,
        },
      },
    });
    console.log("data:", data.data);
    console.log(data.data.status);
    if (!data.data.status || data.data.status !== "success") {
      return res.status(404).json({
        messasge: "payment Unsuccessful",
      });
    }
    await db.execute(
      "UPDATE users SET userstatus = true WHERE userstatus = false"
    );
    return res.status(200).json({
      data: data.data,
    });
  } catch (error) {
    console.log(error);
  }
};
