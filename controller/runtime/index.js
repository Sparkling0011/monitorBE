const moment = require('moment')
const _ = require('lodash')

const DATE_FORMAT = require('../../constants/date_format')
const MMonitor = require('../../model/parse/runtime')
const MErrorSummary = require('../../model/summary/error_summary')
const API_RES = require('../../constants/api_res')
const PROVINCE_LIST = require('../../constants/province')
// const Viser = require('~/src/routes/api/error/viser')

const PAGE_SIZE = 10
const MAX_URL = 10

/**
 * 提供一个方法, 集中解析request参数
 * @param {*} request
 */
function parseQueryParam(request) {
  let projectId = _.get(request, ["query", "pid"], 0)
  let startAt = _.get(request, ['query', 'start_at'], 0)
  let endAt = _.get(request, ['query', 'end_at'], 0)
  let url = _.get(request, ['query', 'url'], '')
  let currentPage = _.get(request, ['query', 'current_page'], 1)
  let errorNameListJson = _.get(request, ['query', 'error_name_list_json'], '[]')
  let errorNameList = []
  try {
    errorNameList = JSON.parse(errorNameListJson)
  } catch (error) {
    errorNameList = []
  }

  // 提供默认值
  if (startAt <= 0) {
    startAt = moment().subtract(7, 'day').startOf(DATE_FORMAT.UNIT.DAY).unix()
  }
  if (endAt <= 0) {
    endAt = moment().unix()
  }
  let parseResult = {
    projectId,
    startAt,
    endAt,
    url,
    currentPage,
    errorNameList
  }
  return parseResult
}

module.exports = {
  getErrorDistribution: async (req, res) => {
    let {
      startAt,
      endAt,
      projectId
    } = parseQueryParam(req)
    startAt = moment.unix(startAt).startOf(DATE_FORMAT.UNIT.DAY).unix()
    endAt = moment.unix(endAt).endOf(DATE_FORMAT.UNIT.DAY).unix()

    let errorList = await MErrorSummary.getErrorNameDistributionByTimeWithCache(projectId, startAt, endAt)
    console.log(errorList)

    res.send(API_RES.showResult(errorList))
  },

  //错误日志
  getErrorLogList: async (req, res) => {
    let parseResult = parseQueryParam(req)
    let {
      projectId,
      errorNameList,
      startAt,
      endAt,
      url,
      currentPage
    } = parseResult
    const offset = (currentPage - 1) * PAGE_SIZE

    let errorCount = await MMonitor.getTotalCountByConditionInSameMonth(projectId, startAt, endAt, offset, PAGE_SIZE, errorNameList, url)
    let errorList = await MMonitor.getListByConditionInSameMonth(projectId, startAt, endAt, offset, PAGE_SIZE, errorNameList, url)

    let pageData = {
      pager: {
        current_page: currentPage,
        page_size: PAGE_SIZE,
        total: errorCount
      },
      list: errorList
    }

    res.send(API_RES.showResult(pageData))
  },

  //url分布数
  getUrlDistribution: async (req, res) => {
    let parseResult = parseQueryParam(req)
    let {
      projectId,
      startAt,
      endAt,
      errorNameList
    } = parseResult
    let countType = DATE_FORMAT.UNIT.DAY

    let rawDistributionList = await MErrorSummary.getUrlPathDistributionListByErrorNameList(projectId, startAt, endAt, errorNameList, countType, MAX_URL)
    let distributionList = []
    for (let rawDistribution of rawDistributionList) {
      let { url_path: url, error_count: errorCount } = rawDistribution
      let record = {
        name: url,
        value: errorCount
      }
      distributionList.push(record)
    }
    res.send(API_RES.showResult(distributionList))
  },

  getErrorNameList: async (req, res) => {
    let parseResult = parseQueryParam(req)
    let {
      projectId,
      startAt,
      endAt,
      url,
      errorNameList
    } = parseResult

    let countType = DATE_FORMAT.UNIT.DAY

    let rawDistributionList = await MErrorSummary.getErrorNameDistributionListInSameMonth(projectId, startAt, endAt, countType, errorNameList, url)
    let distributionList = []
    for (let rawDistribution of rawDistributionList) {
      let { error_count: errorCount, error_name: errorName } = rawDistribution
      let distribution = {
        name: errorName,
        value: errorCount
      }
      distributionList.push(distribution)
    }
    res.send(API_RES.showResult(distributionList))
  },

  getGeographyDistribution: async (req, res) => {
    let parseResult = parseQueryParam(req)
    let {
      projectId,
      startAt,
      endAt,
      url,
      errorNameList
    } = parseResult

    let countType = DATE_FORMAT.UNIT.DAY

    const rawRecordList = await MErrorSummary.getList(projectId, startAt, endAt, countType, errorNameList, url)
    let resultList = []
    let distributionMap = {}

    for (let rawRecord of rawRecordList) {
      let cityDistribution = _.get(rawRecord, ['city_distribution'], {})
      // 按省份进行统计
      for (let country of Object.keys(cityDistribution)) {
        let provinceMap = _.get(cityDistribution, [country], {})
        for (let province of Object.keys(provinceMap)) {
          let cityMap = _.get(provinceMap, [province], {})
          for (let city of Object.keys(cityMap)) {
            let errorCount = _.get(cityMap, [city], 0)
            if (_.has(distributionMap, [province])) {
              distributionMap[province] = distributionMap[province] + errorCount
            } else {
              distributionMap[province] = errorCount
            }
          }
        }
      }
    }
    // 只显示国内省份
    for (let province of PROVINCE_LIST) {
      let errorCount = _.get(distributionMap, [province], 0)
      resultList.push({
        name: province,
        value: errorCount
      })
    }
    resultList.sort((a, b) => b['value'] - a['value'])
    res.send(API_RES.showResult(resultList))
  }
}