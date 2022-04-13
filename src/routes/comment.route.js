const express = require("express");
const comment = require("../controllers/comment.ctrl");
const { isAdmin } = require("../middlewares/auth.middle");

const router = express.Router();

router.post("/comment", comment.createComment);
router.delete("/comment", isAdmin, comment.deleteComment);

module.exports = router;
