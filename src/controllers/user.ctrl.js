const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const { sendMail } = require("../db/sendmail");
const passport = require("passport");
require("dotenv").config();

const { successResMsg, errorResMsg } = require("../utils/appResponse");
const AppError = require("../utils/appError");
const { validateReg, validateLogin } = require("../middlewares/joiValidation");

//registration of new users
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, phoneNumber, email, password, role } =
      req.body;
    // a check to ensure all fields are inputted correctly
    const validatedData = await validateUserReg.validateAsync(req.body);
    //check if the useremail already exists
    const emailExists = await User.findOne({ email: validatedData.email });
    if (emailExists)
      return next(new AppError("Email exist!..please login", 401));
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
    // console.log(hashPassword)
    const newUsers = await User.create({
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      phoneNumber: validatedData.phoneNumber,
      email: validatedData.email,
      password: hashPassword,
      role,
    });
    // verification of userEmail
    let mailOptions = {
      to: newUsers.email,
      subject: "Verify Email",
      text: `Hi ${firstName},Pls verify your email`,
    };

    await sendMail(mailOptions);
    return successResMsg(res, 201, {
      message: `Hi ${firstName.toUpperCase()},Your account has been created successfully.
      Please check your email for verification.`,
      newUsers,
    });
  } catch (error) {
    return errorResMsg(res, 500, { message: error.message });
  }
};
// login endpoint for users
exports.login = async (req, res, next) => {
  try {
    const validatedLogin = await validateLogin.validateAsync(req.body);
    const emailExist = await User.findOne({ email: validatedLogin.email });
    if (!emailExist) {
      return next(
        new AppError("email does not exists.please signup" || "not found", 401)
      );
    }
    if (emailExist == null) {
      return next(new AppError("please provide a valid email address", 403));
    }
    let passwordExist = await bcrypt.compare(
      validatedLogin.password,
      emailExist.password
    );
    if (!passwordExist) {
      return next(
        new AppError("Login Unsuccessful, please verify details", 401)
      );
    }
    //creating a login payload
    const loginPayload = {
      id: emailExist.id,
      email: emailExist.email,
      password: emailExist.password,
      role: emailExist.role,
    };
    const token = await jwt.sign(loginPayload, User_Token, { expiresIn: "2h" });
    return successResMsg(res, 200, {
      message: `Hi ${emailExists.lastName.toUpperCase()} 
      ${emailExists.firstName.toUpperCase()}, Welcome Back`,
      token,
    });
  } catch (error) {
    return errorResMsg(res, 500, { message: error.message });
  }
};
// An endpoint used to verify users account
exports.verifyUserEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    const secret_key = process.env.JWT_TOKEN;
    const decodedToken = await jwt.verify(token, secret_key);
    const User = await User.findOne({ email: decodedToken.email }).select(
      "isVerified"
    );
    if (User.isVerified) {
      return successResMsg(res, 200, {
        message: "user verified already",
      });
    }
    User.isVerified = true;
    User.save();
    return res.status(201).json({
      message: `Hi ${decodedToken.firstName}, Your account has been verified, You can now proceed to login`,
    });
  } catch (error) {
    return res.status(500).json({
      message: `${error.message}, Try again later.`,
    });
  }
};
exports.forgetUserPasswordLink = async (req, res, next) => {
  try {
    const { email } = req.body;
    const userEmail = await User.findOne({ email });
    if (!userEmail) {
      return next(new AppError("email not found", 404));
    }
    const data = {
      id: userEmail._id,
      email: userEmail.email,
      role: userEmail.role,
    };
    // getting a secret token
    const secret_key = process.env.User_Token;
    const token = await jwt.sign(data, secret_key, { expiresIn: "1hr" });
    let mailOptions = {
      to: userEmail.email,
      subject: "Reset Password",
      text: `Hi ${userEmail.firstName}, Reset your password with the link below.${token}`,
    };
    await sendMail(mailOptions);
    return successResMsg(res, 200, {
      message: `Hi ${userEmail.firstName},reset password.`,
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
    if (decoded_token.email !== email) {
      return next(new AppError("Email do not match.", 404));
    }
    if (newPassword !== confirmPassword) {
      return next(new AppError("Password do not match.", 404));
    }
    const hashPassword = await bcrypt.hash(confirmPassword, 10);
    const updatedPassword = await User.updateOne(
      { email },
      { password: hashPassword },
      {
        new: true,
      }
    );
    return successResMsg(res, 200, {
      message: `Password has been changed successfully.`,
      updatedPassword,
    });
  } catch (error) {
    return errorResMsg(res, 500, { message: error.message });
  }
};

exports.updateUserPassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const { email } = req.query;
    const loggedUser = await User.findOne({ email });
    const headerTokenEmail = await jwt.verify(
      req.headers.authorization.split(" ")[1],
      process.env.User_Token
    ).email;
    if (headerTokenEmail !== loggedUser.email) {
      return next(new AppError("Forbidden", 404));
    }
    const passwordMatch = await bcrypt.compare(
      oldPassword,
      loggedUser.password
    );
    if (!passwordMatch) {
      return next(new AppError(`password is not same as old password`, 400));
    }
    if (newPassword !== confirmPassword) {
      return next(new AppError(`Password do not match.`, 400));
    }
    const hashPassword = await bcrypt.hash(confirmPassword, 10);
    const resetPassword = await User.updateOne(
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
// An endpoint for users payment with flutterwave
exports.payment = async (req, res, next) => {
  try {
    console.log("here...........................");
    console.log(process.env.payStack_secret_key);
    const data = await axios({
      url: "https://api.paystack.co/transaction/initialize",
      method: "post",
      headers: {
        Authorization: `Bearer ${process.env.payStack_secret_key}`,
      },
      data: {
        email: "temitopejulius99@gmail.com",
        amount: "4000",
      },
    });
    // console.log(data);
    return successResMsg(res, 200, {
      data: data.data.data,
    });
  } catch (error) {
    // console.log(error);
    message: error;
  }
};
// An endpoint verifying payment from users
exports.paymentVerification = async (req, res, next) => {
  try {
    const { reference } = req.query;
    // console.log("here...........................");
    // console.log(process.env.payStack_secret_key);
    const data = await axios({
      url: `https://api.paystack.co/transaction/verify/${reference}`,
      method: "get",
      headers: {
        Authorization: `Bearer ${process.env.payStack_secret_key}`,
      },
    });
    console.log(data);
    return successResMsg(res, 200, {
      data: data.data.data.gateway_response,
    });
  } catch (error) {
    message: error;
  }
};
