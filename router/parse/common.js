const _ = require("lodash")
async function requestParse(req, _res, next) {
  const data = _.get(req, ["query", "d"], "")
  // 解码并解析JSON数据
  const logInfo = JSON.parse(decodeURIComponent(data));
  req.logInfo = logInfo
  req.type = _.get(logInfo, ["type"], "")
  req.code = _.get(logInfo, ["code"], -1)
  next()
}

async function responseParse(_req, res) {
  //返回一个1x1像素的透明GIF图片作为响应
  res.set('Content-Type', 'image/gif');
  res.send(Buffer.from('R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=', 'base64'));
}

module.exports = {
  requestParse, responseParse
}