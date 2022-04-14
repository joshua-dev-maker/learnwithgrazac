const express = require("express");
const upload = require("../utils/multer");
const Post = require("../controllers/post.ctrl");
const { allow } = require("../middlewares/auth.middle");

const router = express.Router();

router.post("/createpost", upload.array("attachment", 5), Post.CreatePost);
router.get("/veiwpost", allow, Post.viewAllPost);

module.exports = router;
