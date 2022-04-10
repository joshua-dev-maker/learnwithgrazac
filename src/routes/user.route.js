const express = require("express");
const User = require("../controllers/user.ctrl");
const router = express.Router();

router.post("/create", User.register);
router.post("/login", User.login);
router.post("/paymentlink", User.payment);
router.post("/password-reset-url", User.forgetUserPasswordLink);

module.exports = router;
