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

const cardPayment = joi.object({
  card_number: joi.string().required().creditCard(),
  cvv: joi.string().required().min(3).max(4),
  expiry_month: joi.string().required().min(2).max(2),
  expiry_year: joi.string().required().min(2).max(2),
  currency: joi.string().required().valid("NGN"),
  fullname: joi.string().required().min(2).max(50),
  email: joi.string().required().email(),
  authorization: joi.object({
    mode: joi.string().required().valid("pin"),
    pin: joi.string().required().min(4).max(4),
  }),
});

module.exports = {
  validateReg,
  validateLogin,
  validatePost,
  cardPayment,
};
