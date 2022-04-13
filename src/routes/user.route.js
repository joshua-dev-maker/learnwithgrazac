const express = require("express");
const User = require("../controllers/user.ctrl");

const router = express.Router();

router.post("/create", User.register);
router.post("/auth/verify", User.verifyUserEmail);
router.post("/auth/user/login", User.login);
router.post("/auth/payment", User.payment);
router.post("/auth/reset-url", User.forgetUserPasswordLink);
router.patch("/auth/resetpassword", User.resetUserPassword);
router.patch("/auth/passwordupdate", User.updateUserPassword);

module.exports = router;
