const _ = require("lodash");
const md5 = require("md5");
const ParseBase = require("./base");
const { insertInto } = require("../../model/parse/resource");

class RuntimeParse extends ParseBase {
  /**
   * 判断该条记录是不是monitor记录
   * @param {Object} record
   * @return {Boolean}
   */
  isLegalRecord(record) {
    return true;
  }

  /**
   * 更新记录
   */
  async processRecordAndCacheInProjectMap(record) {
    let pid = _.get(record, ["common", "pid"], 0);
    let visitAt = _.get(record, ["common", "timestamp"], Date.now());
    let errorName = _.get(record, ["detail", "error_name"], "");
    let url = _.get(record, ["detail", "url"], "");
    let statusCode = _.get(record, ["detail", "statusCode"], 0);
    let type = _.get(record, ["detail", "type"], 0);
    let pageType = _.get(record, ["common", "page_type"], "");

    let sameInfo = {
      errorName,
      url,
      statusCode,
      pageType,
    };

    let md5Value = md5(JSON.stringify(sameInfo));

    url = url + "";
    if (url.length > 200) {
      url = url.slice(0, 200);
    }
    errorName = errorName + "";
    if (errorName.length > 254) {
      errorName = errorName.slice(0, 254);
    }

    let monitorRecord = {
      pid,
      log_at: visitAt,
      errorName,
      type,
      url,
      statusCode,
      pageType,
      md5: md5Value,
    };

    let visitAtMap = new Map();
    let monitorRecordList = [];
    if (this.projectMap.has(pid)) {
      visitAtMap = this.projectMap.get(pid);
      if (visitAtMap.has(visitAt)) {
        monitorRecordList = visitAtMap.get(visitAt);
      }
    }
    monitorRecordList.push(monitorRecord);
    visitAtMap.set(visitAt, monitorRecordList);
    this.projectMap.set(pid, visitAtMap);
  }

  async save2DB() {
    let totalRecordCount = this.getRecordCountInProjectMap();
    let processRecordCount = 0;
    let successSaveCount = 0;
    for (let [_projectId, visitAtMap] of this.projectMap) {
      for (let [_visitAtTime, monitorMap] of visitAtMap) {
        for (let monitorRecord of monitorMap) {
          let monitorRes = await insertInto(monitorRecord);
          if (monitorRes) {
            successSaveCount++;
          }
          processRecordCount = processRecordCount + 1;
          this.reportProcess(
            processRecordCount,
            successSaveCount,
            totalRecordCount
          );
        }
      }
    }
  }
  /**
   * 统计 projectmonitorMap 中的记录总数
   */
  getRecordCountInProjectMap() {
    let totalCount = 0;
    for (let [projectId, visitAtMap] of this.projectMap) {
      for (let [visitAtTime, monitorMap] of visitAtMap) {
        for (let monitorRecord of monitorMap) {
          totalCount = totalCount + 1;
        }
      }
    }
    return totalCount;
  }
}

module.exports = RuntimeParse;
