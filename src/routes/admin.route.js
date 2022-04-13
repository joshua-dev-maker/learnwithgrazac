const express = require("express");
const Admin = require("../controllers/admin.ctrl");
const { authorize, isAdmin } = require("../middlewares/auth.middle");

const router = express.Router();

router.post("/admin", Admin.addAdmin);
router.post("/auth/verify-email", Admin.verifyEmail);
router.post("/auth/login", Admin.login);
router.post("/auth/passwordlink", Admin.forgetPasswordLink);
router.patch("/auth/resetpassword", Admin.forgotPassword);
router.patch("/auth/passwordupdate", authorize, isAdmin, Admin.updatePassword);

module.exports = router;
