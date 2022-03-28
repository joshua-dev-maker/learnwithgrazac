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

const validateOrder = joi.object({
  farm_order: joi.string().required(),
  User: joi.string().required(),
  qty: joi.number().required().min(1).max(10),
  totalamount: joi.number().required(),
  delivery: joi.string().required(),
});
const validateProduct = joi.object({
  productName: joi.string().required(),
  category: joi.string().required(),
  farmDiv: joi.string().required(),
  Price: joi.string().required(),
});
module.exports = {
  validateReg,
  validateLogin,
  validateOrder,
  validateProduct,
};
