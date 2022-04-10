const Post = require("../models/post.model");
const { pool } = require("pg");
const { successResMsg, errorResMsg } = require("../utils/appResponse");
const AppError = require("../utils/appError");
const cloudinaryUploadMethod = require("../utils/cloudinary");

//An endpoint for creating post
exports.CreatePost = async (req, res, next) => {
  try {
    const { title, body, attachment } = req.body;

    const validatedData = await validatePost.validateAsync(req.body);
    let attachmentUpload = req.files;

    const urls = [];
    const files = req.files;
    if (!files)
      return res.status(400).json({ message: "No picture attached!" });
    for (const file of files) {
      const { path } = file;
      try {
        const newPath = await cloudinaryUploadMethod(path);
        urls.push(newPath.res);
      } catch (error) {
        return res.status(500).json({
          message: "Error uploading",
        });
      }
    }
    images = urls.map((url) => url.res);

    const newPost = await Post.create({
      title,
      body,
      attachment: images,
    });
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
    const { page, limit } = req.query;
    if (limit === null || page === null) {
      limit = 1;
      page = 1;
    }
    const viewAllPost = await Post.find()
      .limit(limit * 10)
      .skip((page - 1) * limit)
      .sort({ user: -1 })
      .exec();
    const count = await Post.countDocuments();
    return successResMsg(res, 200, {
      message: "Post successfully fetched",
      viewAllPost,
      total: viewAllPost.length,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    return errorResMsg(res, 500, { message: error.message });
  }
};
