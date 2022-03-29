const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//signup for new admin
const PostSchema = new Schema(
  {
    title: {
      type: String,
      require: true,
    },
    body: {
      type: String,
      required: true,
    },
    attachment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
//

const AdminModel = mongoose.model("Admin", AdminSchema);

module.exports = AdminModel;
