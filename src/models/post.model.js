const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//craeting a post
const PostSchema = new Schema(
  {
    user_id: {},
    caption: {
      type: String,
      require: true,
    },
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

const PostModel = mongoose.model("Post", PostSchema);

module.exports = PostModel;
