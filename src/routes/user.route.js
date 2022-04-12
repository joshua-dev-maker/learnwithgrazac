const express = require("express");
const User = require("../controllers/user.ctrl");

const router = express.Router();

router.post("/create", User.register);
router.post("/verifyemail", User.verifyUserEmail);
router.post("/login", User.login);
router.post("/transaction", User.payment);
router.post("/password-reset-url", User.forgetUserPasswordLink);
router.patch("/resetpassword", User.resetUserPassword);
router.patch("/passwordupdate", User.updateUserPassword);

module.exports = router;
