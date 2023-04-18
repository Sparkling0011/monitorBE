const moment = require('moment')
const _ = require('lodash')

const ParseBase = require('./base')
const { insertInto } = require('../../model/parse/perf')
const DATE_FORMAT = require("../../constants/date_format")

class PerfParse extends ParseBase {
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

  // record = {
  //   name: 'http://127.0.0.1:5500/test.html',
  //   entryType: 'navigation',
  //   startTime: 0,
  //   duration: 0,
  //   initiatorType: 'navigation',
  //   nextHopProtocol: '',
  //   renderBlockingStatus: 'non-blocking',
  //   workerStart: 0,
  //   redirectStart: 0,
  //   redirectEnd: 0,
  //   fetchStart: 1.7000000178813934,
  //   domainLookupStart: 1.7000000178813934,
  //   domainLookupEnd: 1.7000000178813934,
  //   connectStart: 1.7000000178813934,
  //   secureConnectionStart: 0,
  //   connectEnd: 1.7000000178813934,
  //   requestStart: 7.800000011920929,
  //   responseStart: 9.300000011920929,
  //   responseEnd: 11,
  //   transferSize: 300,
  //   encodedBodySize: 3529,
  //   decodedBodySize: 3529,
  //   responseStatus: 200,
  //   serverTiming: [],
  //   unloadEventStart: 13.300000011920929,
  //   unloadEventEnd: 13.300000011920929,
  //   domInteractive: 99.5,
  //   domContentLoadedEventStart: 99.5,
  //   domContentLoadedEventEnd: 99.7000000178814,
  //   domComplete: 0,
  //   loadEventStart: 0,
  //   loadEventEnd: 0,
  //   type: 'reload',
  //   redirectCount: 0,
  //   activationStart: 0,
  //   url: '127.0.0.1:5500/test.html'
  // }

  async processRecordAndCacheInProjectMap(record) {
    let pid = _.get(record, ['common', 'pid'], 0)
    let visitAt = _.get(record, ['common', "timestamp"], Date.now())
    let timing = _.get(record, ["detail"])
    console.log(record)

    let monitorRecord = {
      pid,
      url: timing.url,
      dnsTime: parseInt(timing.domainLookupEnd - timing.domainLookupStart),
      tcpTime: parseInt(timing.connectEnd - timing.connectStart),
      requestTime: parseInt(timing.responseStart - timing.requestStart),
      ttfb: parseInt(timing.responseStart - timing.redirectStart),
      responseTime: parseInt(timing.responseEnd - timing.responseStart),
      domParseTime: parseInt(timing.domContentLoadedEventStart - timing.domInteractive),
      resourceLoadTime: parseInt(timing.domComplete - timing.domContentLoadedEventEnd),
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

module.exports = PerfParse
