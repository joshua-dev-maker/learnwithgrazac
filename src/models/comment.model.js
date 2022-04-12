const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//craeting a post
const commentSchema = new Schema(
  {
    post_id: {},
    body: {
      type: String,
      required: true,
    },
    attachment: {
      type: String,
    },
  },
  { timestamps: true }
);
//

const commentModel = mongoose.model("comment", commentSchema);

module.exports = commentModel;
