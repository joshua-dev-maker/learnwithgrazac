// const Post = require("../models/post.model");
const { pool } = require("pg");
const { successResMsg, errorResMsg } = require("../utils/appResponse");
const AppError = require("../utils/appError");
const cloudinaryUploadMethod = require("../utils/cloudinary");

//An endpoint for creating post
exports.CreatePost = async (req, res, next) => {
  try {
    const { mysqlUserId, caption, body, attachment } = req.body;
    const urls = [];
    const files = req.files;
    console.log(files);
    if (!files) return next(new AppError("No attachment..", 400));
    // return res.status(400).json({ message: "No picture attached!" });
    for (const file of files) {
      const { path } = file;
      const newPath = await cloudinaryUploadMethod(path);

      urls.push(newPath);
    }
    images = urls.map((url) => url.res);

    await validatePost.validateAsync(req.body);

    await pool.query(
      "INSERT INTO Post (mysqlUserId,caption, body,attachment) VALUES ($1, $2, $3,$4)",
      [mysqlUserId, caption, body, images]
    );
    return successResMsg(res, 201, {
      message: "Post successfully created",
      newPost,
    });
  } catch (error) {
    return errorResMsg(res, 500, { message: error.message });
  }
};

// viewing all post in a limit of 10
exports.viewAllPost = async (req, res, next) => {
  try {
    // pagination
    const allPost = await pool.query(
      "SELECT * FROM post By id LIMIT 10 OFFSET (2 - 1) * 10"
    );
    const count = await pool.query("SELECT COUNT(*)FROM post");
    return successResMsg(res, 200, {
      message: "post fetch successfully",
      count: count.rows[0],
      allPost: allPost.rows,
    });
  } catch (error) {
    return errorResMsg(res, 500, { message: error.message });
  }
};
