const { Schema, model } = require("mongoose")


const TABLE_COLUMN = [
  `id`,
  `error_type`,
  `error_name`,
  `url_path`,
  `city_distribution_id`,
  `count_at_time`,
  `count_type`,
  `error_count`,
  `create_time`,
  `update_time`
]
const tableMap = new Map()
function getModel(tableName) {
  if (tableMap.has(tableName)) {
    return tableMap.get(tableName)
  }
  const ErrorDistributionSchema = new Schema({
    error_type: { type: String },
    error_name: { type: String },
    url_path: { type: String },
    count_at_time: { type: Number },
    count_type: { type: String },
    error_count: { type: Number },
    create_time: { type: Number },
    update_time: { type: Number }
  }, { collection: tableName })

  const ErrorDistributionModel = model(tableName, ErrorDistributionSchema)
  tableMap.set(tableName, ErrorDistributionModel)
  return ErrorDistributionModel
}



module.exports = {
  getModel
}  