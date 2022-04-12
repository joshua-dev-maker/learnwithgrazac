const express = require("express");
const comment = require("../controllers/comment.ctrl");
const { isAdmin } = require("../middlewares/auth.middle");

const router = express.Router();

router.post("/createcomment", comment.createComment);
router.post("/delete", isAdmin, comment.deleteComment);

module.exports = router;
