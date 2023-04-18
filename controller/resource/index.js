const _ = require('lodash')

const DATE_FORMAT = require('../../constants/date_format')
const API_RES = require('../../constants/api_res')
const { getRequestErrorListInRange } = require("../../model/parse/request")

const PAGE_SIZE = 10
const MAX_URL = 10

/**
 * 提供一个方法, 集中解析request参数
 * @param {*} request
 */
function parseQueryParam(request) {
  let pid = _.get(request, ["query", "pid"], "")
  let startAt = _.get(request, ['query', 'start_at'], 0)
  let endAt = _.get(request, ['query', 'end_at'], 0)

  // // 提供默认值
  // if (startAt <= 0) {
  //   startAt = moment().subtract(7, 'day').startOf(DATE_FORMAT.UNIT.DAY).unix()
  // }
  // if (endAt <= 0) {
  //   endAt = moment().unix()
  // }
  let parseResult = {
    pid,
    startAt,
    endAt,
  }
  return parseResult
}

module.exports = {
  getRequestErrorListInRange: async (req, res) => {
    let {
      startAt,
      endAt,
      pid
    } = parseQueryParam(req)
    // startAt = moment.unix(startAt).startOf(DATE_FORMAT.UNIT.DAY).unix()
    // endAt = moment.unix(endAt).endOf(DATE_FORMAT.UNIT.DAY).unix()
    // const { pageSize, page } = req.query

    const list = await getRequestErrorListInRange(pid, startAt, endAt)

    res.json({ list, pageCount: list.length, page: 1 })
  }
}