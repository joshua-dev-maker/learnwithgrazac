const multer = require("multer");
const path = require("path");

//multer config

module.exports = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (
      ext != ".jpg" &&
      ext !== ".jpeg" &&
      ext !== ".png" &&
      ext !== ".docs" &&
      ext !== ".pdf"
    ) {
      cb(new Error("File type is not supported", false));
      return;
    }
    cb(null, true);
  },
});
const multer = require("multer");

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

const maxSize = 10 * 1000 * 1000;

const upload = multer({
  storage,
  limits: { fileSize: maxSize },
});

module.exports = upload;
