const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avator: {
    type: String,
    default: "",
  },
  createAt: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  updateAt: {
    type: Date,
    required: true,
    default: Date.now(),
  },
});

module.exports = model("User", userSchema);
