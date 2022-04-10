const joi = require("joi");

const validateReg = joi.object({
  firstName: joi.string().required(),
  lastName: joi.string().required(),
  phoneNumber: joi.number().required(),
  email: joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net", "org", "ng"] },
  }),
  password: joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).min(8),
});
const validateLogin = joi.object({
  email: joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net", "org", "ng"] },
  }),
  password: joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).min(8),
});

const validatePost = joi.object({
  title: joi.string().required(),
  body: joi.string().required(),
  attachment: joi.string(),
});
const validateComment = joi.object({
  productName: joi.string().required(),
  category: joi.string().required(),
  farmDiv: joi.string().required(),
  Price: joi.string().required(),
});
module.exports = {
  validateReg,
  validateLogin,
  validatePost,
  validateComment,
};
