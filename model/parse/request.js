const { Schema, model } = require("mongoose")

const RequestErrorSchema = new Schema({
  pid: { type: String, required: true },
  error_name: { type: String },
  requestUrl: { type: String },
  method: { type: String },
  body: { type: Object },
  headers: { type: Object },
  status: { type: Number },
  statusText: { type: String },
  url: { type: String, default: "" },
  log_at: { type: Number, required: true },
  create_time: { type: Number, default: Date.now() },
  update_time: { type: Number, default: Date.now() }
})

const RequestErrorModel = model("request", RequestErrorSchema)

/**
 * 入库
 * @param {object} datas
 */
async function insertInto(infos) {
  try {
    const error = new RequestErrorModel(infos)
    await error.save()
    return error
  } catch (e) {
    return null
  }
}

async function getRequestErrorListInRange(pid, startAt, endAt) {
  try {
    const list = await RequestErrorModel.find({ pid, log_at: { $gte: startAt, $lte: endAt } }).exec()
    return list
  } catch (e) {
    return []
  }
}

module.exports = {
  insertInto,
  getRequestErrorListInRange
}
