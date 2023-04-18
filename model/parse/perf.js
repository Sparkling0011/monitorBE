const { Schema, model } = require("mongoose")

const PerfSchema = new Schema({
  pid: { type: String, required: true },
  url: { type: String },
  dnsTime: { type: Number },
  tcpTime: { type: Number },
  requestTime: { type: Number },
  ttfb: { type: Number },
  responseTime: { type: Number },
  domParseTime: { type: Number },
  resourceLoadTime: { type: Number },
  log_at: { type: Number, required: true },
  create_time: { type: Number, default: Date.now() },
  update_time: { type: Number, default: Date.now() }
})

const PerfModel = model("Performance", PerfSchema)

/**
 * 入库
 * @param {object} datas
 */
async function insertInto(infos) {
  try {
    console.log(infos)
    const perf = new PerfModel(infos)
    await perf.save()
    return error
  } catch (e) {
    return null
  }
}

async function getPerfListInRange(pid, startAt, endAt) {
  try {
    const list = await PerfModel.find({ pid, log_at: { $gte: startAt, $lte: endAt } }).exec()
    return list
  } catch (e) {
    return []
  }
}

module.exports = {
  insertInto,
  getPerfListInRange
}
