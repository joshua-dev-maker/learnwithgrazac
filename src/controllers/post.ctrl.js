const Post = require("../models/post.model");
const { successResMsg, errorResMsg } = require("../utils/appResponse");
const AppError = require("../utils/appError");

//An endpoint for creating post
exports.CreatePost = async (req, res, next) => {
  try {
    const { title, body, attachment } = req.body;
    const validatedData = await validatePost.validateAsync(req.body);
    const newPost = await Post.create({
      title,
      body,
      attachment,
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
    const viewAllPost = await Post.find();
    return successResMsg(res, 200, {
      message: "success",
      viewAllPost,
    });
  } catch (error) {
    return errorResMsg(res, 500, { message: error.message });
  }
};
