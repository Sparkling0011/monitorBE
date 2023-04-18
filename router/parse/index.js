const _ = require("lodash")
const RequestParse = require("./request")
const PerfParse = require("./perf")
const { ERROR_TYPE_Request, ERROR_TYPE_Resource, ERROR_TYPE_JS, PERFORMANCE } = require("../../constants/monitor_type")

async function ErrorParse(req, res, next) {
  let type = _.get(req, ["body", 'type'], '')
  if (type !== 'error') {
    res.status(400).json({ message: "不合法的记录" })
    return
  }
  let errorType = _.get(req, ["body", 'code'])
  let parser
  if (errorType === ERROR_TYPE_Request) {
    parser = new RequestParse()
  }

  if (errorType === ERROR_TYPE_JS) {

  }

  if (errorType === PERFORMANCE) {
    parser = new PerfParse()
  }

  // res.status(400).json({ message: "不合法的记录" })
  // return next()

  if (!parser.isLegalRecord()) res.status(400).json({ message: "不合法的记录" })
  await parser.processRecordAndCacheInProjectMap(req.body)
  // await parser.save2DB()
  res.json({ message: "保存成功" })
}

async function PerformanceParse(req, res) {
  const data = _.get(req, ["query", "d"], "")
  // 解码并解析JSON数据
  const logInfo = JSON.parse(decodeURIComponent(data));


  let type = _.get(logInfo, ['type'], '')
  if (type !== 'perf') {
    res.status(400).json({ message: "不合法的记录" })
    return
  }

  let code = _.get(logInfo, ["code"], '')

  if (code === PERFORMANCE) {
    parser = new PerfParse()
  }

  if (!parser.isLegalRecord()) res.status(400).json({ message: "不合法的记录" })
  await parser.processRecordAndCacheInProjectMap(logInfo)
  await parser.save2DB()
  //返回一个1x1像素的透明GIF图片作为响应
  res.set('Content-Type', 'image/gif');
  res.send(Buffer.from('R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=', 'base64'));
}


module.exports = { ErrorParse, PerformanceParse }

