const express = require("express");
const Post = require("../controllers/post.ctrl");
const { allow } = require("../middlewares/auth.middle");

const router = express.Router();

router.post("/createpost", allow, Post.CreatePost);
router.get("/veiwpost", allow, Post.viewAllPost);

module.exports = router;
