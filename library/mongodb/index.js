const mongoose = require("mongoose");

exports.main = async function () {
  await mongoose.connect("mongodb://127.0.0.1:27017/monitor");
};
