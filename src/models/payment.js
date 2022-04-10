const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//signup for new admin
const PaymentSchema = new Schema(
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
    },
  },
  { timestamps: true }
);
//

const PaymentModel = mongoose.model("Payment", PaymentSchema);

module.exports = PaymentModel;
