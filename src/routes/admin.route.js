const express = require("express");
const Admin = require("../controllers/admin.ctrl");
const { authorize, isAdmin } = require("../middlewares/auth.middle");

const router = express.Router();

router.post("/registeradmin", Admin.addAdmin);
router.post("/verifyemail", Admin.verifyEmail);
router.post("/adminlogin", Admin.login);
router.post("/adminpasswordlink", Admin.forgetPasswordLink);
router.patch("/adminresetpassword", Admin.resetPassword);
router.patch("/adminpasswordupdate", authorize, isAdmin, Admin.updatePassword);

module.exports = router;
