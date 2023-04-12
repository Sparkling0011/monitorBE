const mongoose = require("mongoose")
const { Schema, model } = mongoose

const appSchema = new Schema({
  pname: {
    type: String,
    required: true
  },
  pid: {
    type: String,
    require: true,
  },
  createAt: {
    type: Date,
    default: Date.now(),
    required: true,
  },
})

module.exports = model("app", appSchema)