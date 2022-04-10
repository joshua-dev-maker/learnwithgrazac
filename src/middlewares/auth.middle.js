const jwt = require("jsonwebtoken");
require("dotenv").config();
const { successResMsg, errorResMsg } = require("../utils/appResponse");
const { AppError } = require("../utils/appError");

const authorize = async (req, res, next) => {
  try {
    const authorizationArr = req.headers.authorization.split(" ");
    if (!authorizationArr.includes("Bearer")) {
      return next(new AppError("Token requires a bearer..", 401));
    }
    let token = authArray[1];
    if (!token) {
      return next(new AppError("Token is required", 401));
    }
    console.log(await jwt.verify(token, secret_key));
    const secret_key = process.env.JWT_TOKEN;
    const decryptToken = await jwt.verify(secret_key, {
      expiresIn: "1h",
    });
    req.user = decryptToken;
    next();
  } catch (error) {
    return errorResMsg(res, 500, { message: error.message });
  }
};
const isAdmin = async (req, res, next) => {
  try {
    const { role } = req.user;
    if (!role === admin)
      return next(new AppError("you do not have permission to access..", 401));
    else {
      next();
    }
  } catch (error) {
    return errorResMsg(res, 500, { message: error.message });
  }
};

const allow = async (req, res, next) => {
  try {
    const { isPaid, role } = req.user;
    if (!isPaid && role == "user") {
      return res.status(401).json({
        message: "payment required",
      });
    } else {
      next();
    }
  } catch (error) {
    return errorResMsg(res, 500, { message: error.message });
  }
};
module.exports = { authorize, isAdmin, allow };
