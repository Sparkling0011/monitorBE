const { Schema, model } = require("mongoose")

const tableMap = new Map()
function getModel(tableName) {
  if (tableMap.has(tableName)) {
    return tableMap.get(tableName)
  }
  const ErrorSchema = new Schema({
    error_type: { type: String },
    error_name: { type: String },
    http_code: { type: Number, default: 0 },
    monitor_ext_id: { type: String },
    during_ms: { type: Number, default: 0 },
    request_size_b: { type: Number, default: 0 },
    response_size_b: { type: Number, default: 0 },
    url: { type: String, default: "" },
    // country: { type: String },
    // province: { type: String },
    // city: { type: String },
    log_at: { type: Number, required: true },
    md5: { type: String },
    create_time: { type: Number },
    update_time: { type: Number }
  }, { collection: tableName })

  const ErrorModel = model(tableName, ErrorSchema)
  tableMap.set(tableName, ErrorModel)
  return ErrorModel
}

function getExtraModel(tableName) {
  if (tableMap.has(tableName)) {
    return tableMap.get(tableName)
  }
  const ExtraSchema = new Schema({
    ext_json: {
      type: String
    },
    create_time: {
      type: Number
    },
    update_time: {
      type: Number
    }
  }, { collection: tableName })
  const ExtraModel = model("Extra", ExtraSchema)
  tableMap.set(tableName, ExtraModel)
  return ExtraModel
}


module.exports = {
  getModel, getExtraModel
}  