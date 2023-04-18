const mongoose = require("mongoose")
const { Schema, model } = mongoose

const projectSchema = new Schema({
  pid: {
    type: String,
    required: true,
    unique: true
  },
  pname: {
    type: String,
    required: true
  },
  uid: {
    type: String,
    required: true
  },
  // owner: {
  //   id: {
  //     type: Schema.Types.ObjectId,
  //     ref: 'User'
  //   },
  //   name: String
  // },
  createAt: {
    type: Date,
    default: Date.now(),
    required: true,
  },
})

module.exports = model("Project", projectSchema)