const Admin = require("../models/admin.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../service/sendmail");
const { validateReg, validateLogin } = require("../middlewares/joiValidation");
require("dotenv").config();
const User_Token = process.env.User_Token;
const { successResMsg, errorResMsg } = require("../utils/appResponse");
const AppError = require("../utils/appError");
const db = require("../db/mySQLcon.db");

//registration of new admin
exports.addAdmin = async (req, res, next) => {
  try {
    const { firstName, lastName, phoneNumber, email, password } = req.body;
    const validatedData = await validateReg.validateAsync(req.body);

    // checking if admin already has an account
    const [admin] = await db.execute(
      "SELECT `email` FROM `admins` WHERE `email` = ?",
      [{ email: validatedData.email }]
    );

    if (admin.length > 0) {
      return res.status(400).json({
        message: "the email already exist",
      });
    }

    // a check for password length

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
    const hashPassword = await bcrypt.hash(validatedData.password, 10);
    //creating a new admin
    const [newAdmin] = await db.execute(
      "INSERT INTO admins (firstName, lastName,  email, phoneNumber, password) VALUES ( ?, ?, ?, ?, ?)",
      [firstName, lastName, email, phoneNumber, hashPassword]
    );
    // creating a payload
    const data = {
      id: newAdmin[0],
      firstName: req.body.firstName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      role: req.body.role,
    };
    const token = await jwt.sign(data, process.env.User_Token, {
      expiresIn: "2h",
    });
    let mailOptions = {
      to: newAdmin.email,
      subject: "Verify Email",
      text: `Hi ${firstName},Pls verify your email.${token}`,
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
//verifying email for admin account
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.headers;
    const secret_key = process.env.User_Token;
    const decodedToken = await jwt.verify(token, secret_key);
    const newAdmin = await db.execute("SELECT * FROM admins WHERE email = ?", [
      {
        email: decodedToken.email,
      },
    ]);

    if (newAdmin.verified) {
      return successResMsg(res, 200, {
        message: "admin verified already",
      });
    }

    await db.execute(
      "UPDATE admins SET isVerified = true WHERE isVerified = false"
    );
    return res.status(201).json({
      message: `Hi ${decodedToken.firstName}, Your account has been verified, 
      You can now proceed to login`,
    });
  } catch (error) {
    return res.status(500).json({
      message: `${error.message}, Try again later.`,
    });
  }
};
// login endpoint for Admin
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    await validateLogin.validateAsync(req.body);
    if (email && password) {
      const [admin] = await db.execute("SELECT * FROM admins WHERE email =?", [
        email,
      ]);
      emailexist = [admin];
    }
    // if (emailexist.length === 0) {
    //   return res.status(400).json({
    //     message: "email address not found.",
    //   });
    // }
    // const passMatch = await bcrypt.compareSync(password, admin[0].password);
    // if (!passMatch) {
    //   return res.status(400).json({ message: "incorrect password" });
    // }
    // if (emailexist[0].isVerified === 0) {
    //   return res.status(400).json({
    //     message: "Unverified account.",
    //   });
    // }
    const loginPayload = {
      email: emailexist[0][0].email,
      phoneNumber: emailexist[0][0].phoneNumber,
      role: emailexist[0][0].role,
    };
    const loginToken = await jwt.sign(loginPayload, User_Token, {
      expiresIn: "1h",
    });
    return successResMsg(res, 201, {
      message: `Hi ${emailExists.lastName.toUpperCase()} 
      ${emailExists.firstName.toUpperCase()}, Welcome Back`,
      loginToken,
    });
  } catch (error) {
    return errorResMsg(res, 500, { message: error.message });
  }
};
// An endpoint for Admin forgte password link
exports.forgetPasswordLink = async (req, res, next) => {
  try {
    const { email } = req.body;
    const [admin] = await db.execute("SELECT * FROM admin WHERE email =?", [
      email,
    ]);
    if (admin.length === 0) {
      return res.status(400).json({
        message: "email address not found.",
      });
    }
    //creating a payload
    const verificationdata = {
      id: adminEmail._id,
      email: adminEmail.email,
      role: adminEmail.role,
    };
    // getting a secret token
    const secret_key = process.env.User_Token;
    const token = await jwt.sign(verificationdata, secret_key, {
      expiresIn: "1hr",
    });
    const decodedToken = await jwt.verify(token, secret_key);
    let mailOptions = {
      to: adminEmail.email,
      subject: "Reset Password",
      text: `Hi ${admin[0].firstName}, Reset your password with the link below.${token}`,
    };
    await sendMail(mailOptions);
    return successResMsg(res, 200, {
      message: `Hi ${admin[0].firstName},reset password.`,
      decodedToken,
    });
  } catch (error) {
    return errorResMsg(res, 500, { message: error.message });
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const { email, token } = req.query;
    const secret_key = process.env.User_Token;
    const decoded_token = await jwt.verify(token, secret_key);
    console.log(decoded_token);
    if (decoded_token.email !== email) {
      return next(new AppError("Email do not match.", 404));
    }
    if (newPassword !== confirmPassword) {
      return next(new AppError("Password do not match.", 404));
    }
    await bcrypt.hash(confirmPassword, 10);
    await db.execute(
      "UPDATE admin SET isVerified = true WHERE isVerified = true"
    );
    const hashPassword = await bcrypt.hash(confirmPassword, 10);
    const resettedPassword = await Admin.updateOne(
      { email },
      { password: hashPassword },
      {
        new: true,
      }
    );
    return successResMsg(res, 200, {
      message: `Password has been changed successfully.`,
      resettedPassword,
    });
  } catch (error) {
    return errorResMsg(res, 500, { message: error.message });
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const { email } = req.query;
    const loggedAdmin = await db.execute("SELECT * FROM admin WHERE email =?", [
      email,
    ]);
    const headerTokenEmail = await jwt.verify(
      req.headers.authorization.split(" ")[1],
      process.env.User_Token
    ).email;
    if (headerTokenEmail !== loggedAdmin[0][0].email) {
      return next(new AppError("Forbidden", 404));
    }
    const passwordMatch = await bcrypt.compare(
      oldPassword,
      loggedAdmin[0][0].password
    );
    // console.log(passwordMatch);
    if (!passwordMatch) {
      return next(new AppError(`password is not same as old password`, 400));
    }
    if (newPassword !== confirmPassword) {
      return next(new AppError(`Password do not match.`, 400));
    }
    const hashPassword = await bcrypt.hash(confirmPassword, 10);
    await db.execute(
      "SELECT * FROM admin WHERE email =?",
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
