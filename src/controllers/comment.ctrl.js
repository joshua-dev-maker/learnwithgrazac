const { path } = require("path");
const cloudinaryUploadMethod = require("../utils/cloudinary");
const Comment = require("../models/comment.model");

const { pool } = require("../db/postgresql");
//  Posting cars to the database
exports.createComment = async (req, res, next) => {
  try {
    const { postId, body, attachment } = req.body;

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
          message: "error occur",
        });
      }
    }

    // pictures = images;
    const newComment = await pool.query(
      "INSERT INTO Comment (postId, body, attahment ) VALUES ($1, $2, $3) RETURNING *",
      [postId, body, attachment]
    );

    return res.status(201).json({
      message: "comment sent",
      newComment,
    });
  } catch (error) {
    return res.status(500).json({
      message: `${error.message}, Please try again later.`,
    });
  }
};
//
exports.deleteComment = async (req, res, next) => {
  try {
    await pool.query("DELETE  FROM comment WHERE id =?", [email]);
    return res.status(200).json({});
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: `${error.message}, Please try again later.`,
    });
  }
};
