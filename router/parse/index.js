const _ = require("lodash")
const RequestParse = require("./request")
const PerfParse = require("./perf")
const RuntimeParse = require("./runtime")
const ResourceParse = require("./resource")
const { ERROR_TYPE_Request, ERROR_TYPE_Resource, ERROR_TYPE_JS, PERFORMANCE } = require("../../constants/monitor_type")

async function ErrorParse(req, res, next) {
  if (req.type !== 'error') {
    res.status(400).json({ message: "不合法的记录" })
    return
  }
  let errorType = req.code
  let parser
  switch (errorType) {
    case ERROR_TYPE_Request:
      parser = new RequestParse()
      break;
    case ERROR_TYPE_JS:
      parser = new RuntimeParse()
      break;
    case ERROR_TYPE_Resource:
      parser = new ResourceParse()
      break;
    default:
      break;
  }

  if (!parser.isLegalRecord()) res.status(400).json({ message: "不合法的记录" })
  await parser.processRecordAndCacheInProjectMap(req.logInfo)
  await parser.save2DB()
  next()
}

async function PerformanceParse(req, res, next) {
  if (req.type !== 'perf') {
    res.status(400).json({ message: "不合法的记录" })
    return
  }

  if (req.code === PERFORMANCE) {
    parser = new PerfParse()
  }

  if (!parser.isLegalRecord()) res.status(400).json({ message: "不合法的记录" })
  await parser.processRecordAndCacheInProjectMap(req.logInfo)
  await parser.save2DB()
  next()
}


module.exports = { ErrorParse, PerformanceParse }

