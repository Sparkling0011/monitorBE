const moment = require('moment')
const _ = require('lodash')

const ParseBase = require('./base')
const { insertInto } = require('../../model/parse/request')
const DATE_FORMAT = require("../../constants/date_format")

class RequestParse extends ParseBase {
  /**
   * 判断该条记录是不是monitor记录
   * @param {Object} record
   * @return {Boolean}
   */
  isLegalRecord() {
    return true
  }

  /**
   * 更新记录
   */
  async processRecordAndCacheInProjectMap(record) {
    let pid = _.get(record, ['common', 'pid'], 0)
    let visitAt = _.get(record, ['common', "timestamp"], Date.now())
    let errorName = _.get(record, ['detail', 'error_no'], '')
    let url = _.get(record, ['detail', 'url'], '')
    let method = _.get(record, ["detail", "method"])
    let status = _.get(record, ["detail", "status"])
    let statusText = _.get(record, ["detail", "statusText"], "")
    let headers = _.get(record, ["detail", "headers"], {})
    let body = _.get(record, ["detail", "body"], {})
    let requestUrl = _.get(record, ["detail", "url"])

    // 强制转换为字符串
    url = url + ''
    if (url.length > 200) {
      // url最长是200个字符
      url = url.slice(0, 200)
    }

    // 对error_name长度做限制
    errorName = errorName + ''
    if (errorName.length > 254) {
      errorName = errorName.slice(0, 254)
    }

    let monitorRecord = {
      pid,
      errorName,
      url,
      method,
      body,
      headers,
      status,
      statusText,
      requestUrl,
      log_at: visitAt
    }

    let visitAtMap = new Map()
    let monitorRecordList = []
    if (this.projectMap.has(pid)) {
      visitAtMap = this.projectMap.get(pid)
      if (visitAtMap.has(visitAt)) {
        monitorRecordList = visitAtMap.get(visitAt)
      }
    }
    monitorRecordList.push(monitorRecord)
    visitAtMap.set(visitAt, monitorRecordList)
    this.projectMap.set(pid, visitAtMap)
    return true
  }

  async save2DB() {
    let totalRecordCount = this.getRecordCountInProjectMap()
    let processRecordCount = 0
    let successSaveCount = 0
    for (let [projectId, visitAtMap] of this.projectMap) {
      for (let [visitAtTime, monitorMap] of visitAtMap) {
        let visitAt = moment(visitAtTime, DATE_FORMAT.DATABASE_BY_MINUTE).unix()
        for (let monitorRecord of monitorMap) {
          let record = await insertInto(monitorRecord)
          console.log(record)
          if (record) successSaveCount++
          processRecordCount++
          this.reportProcess(processRecordCount, successSaveCount, totalRecordCount)
        }
      }
    }
    if (successSaveCount !== totalRecordCount)
      return false
    return true
  }

  /**
   * 统计 projectmonitorMap 中的记录总数
   */
  getRecordCountInProjectMap() {
    let totalCount = 0
    for (let [projectId, visitAtMap] of this.projectMap) {
      for (let [visitAt, monitorMap] of visitAtMap) {
        for (let monitorRecord of monitorMap) {
          totalCount = totalCount + 1
        }
      }
    }
    return totalCount
  }
}

module.exports = RequestParse
