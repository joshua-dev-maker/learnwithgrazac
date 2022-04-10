const Admin = require("../model/Admin.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { validateReg, validateLogin } = require("../middlewares/joiValidation");
require("dotenv").config();
const User_Token = process.env.User_Token;
const { successResMsg, errorResMsg } = require("../utils/appResponse");
const AppError = require("../utils/appError");

//registration of new admin
exports.addAdmin = async (req, res, next) => {
  try {
    const { firstName, lastName, phoneNumber, email, password } = req.body;
    const validatedData = await validateReg.validateAsync(req.body);
    const numToString = phoneNumber.toString().length;
    // console.log(numToString);
    if (numToString < 10 || numToString > 13) {
      return res.status(404).json({
        message: "Invalid Number",
      });
    }
    let emailExist = await Admin.findOne({ email });
    if (emailExist) {
      return next(new AppError("Email already exist please login", 401));
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
    const hashPassword = await bcrypt.hash(validatedData.password, 10);
    const newAdmin = await Admin.create({
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      phoneNumber: validatedData.phoneNumber,
      email: validatedData.email,
      password: hashPassword,
    });
    let mailOptions = {
      to: newAdmin.email,
      subject: "Verify Email",
      text: `Hi ${firstName},Pls verify your email`,
    };

    await sendMail(mailOptions);
    return successResMsg(res, 201, {
      message: `Hi ${firstName.toUpperCase()},Your account has been created successfully.
      Please check your email for verification.`,
      newAdmin,
    });
  } catch (error) {
    return errorResMsg(res, 500, { message: error.message });
  }
};
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    const secret_key = process.env.JWT_TOKEN;
    const decodedToken = await jwt.verify(token, secret_key);
    const Admin = await Admin.findOne({ email: decodedToken.email }).select(
      "isVerified"
    );
    if (Admin.isVerified) {
      return successResMsg(res, 200, {
        message: "Admin verified already",
      });
    }
    Admin.isVerified = true;
    Admin.save();
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
    // const { email, password } = req.body;
    // const emailExist = await Admin.findOne({ email });
    const validateAccess = await validateLogin.validateAsync(req.body);
    const emailExist = await Admin.findOne({ email: validateAccess.email });
    if (!emailExist) {
      return next(new AppError("Email does not exist please Signup", 401));
    }
    if (emailExist == null) {
      return next(new AppError("please provide a valid email address", 403));
    }
    let passwordExist = await bcrypt.compare(
      validateAccess.password,
      emailExist.password
    );
    if (!passwordExist) {
      return next(new AppError("Invalid details" || "password incorrect", 401));
    }
    const loginPayload = {
      id: emailExist.id,
      email: emailExist.email,
      password: emailExist.password,
      role: emailExist.role,
    };
    const token = await jwt.sign(loginPayload, User_Token, { expiresIn: "2h" });
    return successResMsg(res, 201, {
      message: `Hi ${emailExists.lastName.toUpperCase()} 
      ${emailExists.firstName.toUpperCase()}, Welcome Back`,
      token,
    });
  } catch (error) {
    return errorResMsg(res, 500, { message: error.message });
  }
};
// An endpoint for Admin forgte password link
exports.forgetPasswordLink = async (req, res, next) => {
  try {
    const { email } = req.body;
    const adminEmail = await User.findOne({ email });
    if (!adminEmail) {
      return next(new AppError("email not found", 404));
    }
    const data = {
      id: adminEmail._id,
      email: adminEmail.email,
      role: adminEmail.role,
    };
    // getting a secret token
    const secret_key = process.env.User_Token;
    const token = await jwt.sign(data, secret_key, { expiresIn: "1hr" });
    let mailOptions = {
      to: adminEmail.email,
      subject: "Reset Password",
      text: `Hi ${adminEmail.firstName}, Reset your password with the link below.${token}`,
    };
    await sendMail(mailOptions);
    return successResMsg(res, 200, {
      message: `Hi ${adminEmail.firstName},reset password.`,
    });
  } catch (error) {
    return errorResMsg(res, 500, { message: error.message });
  }
};

exports.resetPassword = async (req, res, next) => {
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
    const loggedAdmin = await Admin.findOne({ email });
    const headerTokenEmail = await jwt.verify(
      req.headers.authorization.split(" ")[1],
      process.env.User_Token
    ).email;
    if (headerTokenEmail !== loggedAdmin.email) {
      return next(new AppError("Forbidden", 404));
    }
    const passwordMatch = await bcrypt.compare(
      oldPassword,
      loggedAdmin.password
    );
    // console.log(passwordMatch);
    if (!passwordMatch) {
      return next(new AppError(`password is not same as old password`, 400));
    }
    if (newPassword !== confirmPassword) {
      return next(new AppError(`Password do not match.`, 400));
    }
    const hashPassword = await bcrypt.hash(confirmPassword, 10);
    const updatedPassword = await User.updateOne(
      { email },
      { password: hashPassword }
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
