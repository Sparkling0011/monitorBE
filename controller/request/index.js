const _ = require("lodash");

const DATE_FORMAT = require("../../constants/date_format");
const API_RES = require("../../constants/api_res");
const {
  getRequestErrorListInRange,
  getRequestDataInRangeHous,
} = require("../../model/parse/request");

/**
 * 提供一个方法, 集中解析request参数
 * @param {*} request
 */
function parseQueryParam(request) {
  let pid = _.get(request, ["query", "pid"], "");
  let startAt = _.get(request, ["query", "startAt"], 0);
  let endAt = _.get(request, ["query", "endAt"], 0);
  let page = _.get(request, ["query", "page"], 1);
  let pageSize = _.get(request, ["query", "pageSize"], 10);

  startAt = parseInt(startAt);
  endAt = parseInt(endAt);
  const pageInfo = {
    pageSize: parseInt(pageSize),
    page: parseInt(page),
  };

  // 提供默认值
  if (startAt <= 0) {
    startAt = moment().subtract(7, "day").startOf(DATE_FORMAT.UNIT.DAY).unix();
  }
  if (endAt <= 0) {
    endAt = moment().unix();
  }
  let parseResult = {
    pid,
    startAt,
    endAt,
    pageInfo,
  };
  return parseResult;
}

module.exports = {
  getRequestErrorListInRange: async (req, res) => {
    let { startAt, endAt, pid, pageInfo } = parseQueryParam(req);

    const listInfo = await getRequestErrorListInRange(
      pid,
      startAt,
      endAt,
      pageInfo
    );

    res.json({ ...listInfo });
  },
  getRequestDataInRangeHous: async (req, res) => {
    let { startAt, endAt, pid } = parseQueryParam(req);
    let list = await getRequestDataInRangeHous(pid, startAt, endAt);
    res.json(list);
  },
};
