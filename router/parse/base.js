const Base = require('../base');
const moment = require('moment');
const DATE_FORMAT = require('../../constants/date_format');


/**
 * 提供框架方法, 方便编写处理函数
 */
class ParseBase extends Base {
  constructor() {
    super()
    // 统一按项目进行统计
    this.projectMap = new Map()
    this.startAtMoment = null
    this.endAtMoment = null

    this.DATE_FORMAT_ARGUMENTS = DATE_FORMAT.COMMAND_ARGUMENT_BY_MINUTE
    this.DATE_FORMAT_DISPLAY = DATE_FORMAT.COMMAND_ARGUMENT_BY_MINUTE
  }

  /**
   * [可覆盖]检查请求参数, 默认检查传入的时间范围是否正确, 如果有自定义需求可以在子类中进行覆盖
   * @param {*} args
   * @param {*} options
   * @return {Boolean}
   */
  isArgumentsLegal(args, options) { }

  /**
   * 解析指定时间范围内的日志记录, 并录入到数据库中
   * @param {*} startAt
   * @param {*} endAt
   * @return null
   */

  /**
   * [必须覆盖]判断该条记录是不是需要解析的记录
   * 标准结构 => {"type":"product","code":10001,"detail":{"duration_ms":35544},"extra":{},"common":{"pid":"platfe_saas","uuid":"59b979cb-4e2a-4a34-aabf-5240a6794194","ssid":"c6a39184-0689-498b-b973-a5c0c9496494","ucid":1000000026017035,"timestamp":1537426981231},"msg":"","project_id":1,"time":1537426981,"ua":{"ua":"Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/537.36 (@33cd7097eede00b9c4ce59f5cf7d0e7f1eee86d8) Safari/537.36 nw(0.30.5) dtsaas(2.0.11)","browser":{"name":"Chrome","version":"537.36","major":"537"},"engine":{"name":"WebKit","version":"537.36"},"os":{"name":"Windows","version":"7"},"device":{},"cpu":{}},"ip":"60.169.167.181","country":"中国","province":"北京","city":"北京"}
   * @param {Object} record
   * @return {Boolean}
   */
  isLegalRecord(record) {
    this.mustBeOverride()
    return true
  }

  /**
   * [必须覆盖]处理记录, 并将结果缓存在this.ProjectMap中
   * {"type":"product","code":10001,"detail":{"duration_ms":30807},"extra":{},"common":{"pid":"platfe_saas","uuid":"d0511ce2-2482-4f7b-8f11-09ed75004963","ssid":"0c11d4b5-b970-419c-b1ac-f1b7922398fc","ucid":null,"timestamp":1537365073569},"msg":""}
   * @param {Object} record
   */
  async processRecordAndCacheInProjectMap(record) {
    this.mustBeOverride()
    return true
  }

  /**
   * [必须覆盖]将数据同步到数据库中
   */
  async save2DB() {
    this.mustBeOverride()
    let processRecordCount = 0
    let successSaveCount = 0
    let totalRecordCount = this.getRecordCountInProjectMap()

    // 处理的时候调一下这个方法, 专业打印处理进度
    this.reportProcess(processRecordCount, successSaveCount, totalRecordCount)
    return { totalRecordCount, processRecordCount, successSaveCount }
  }

  /**
   * 汇报进度
   * @param {*} processRecordCount
   * @param {*} successSaveCount
   * @param {*} totalRecordCount
   */
  reportProcess(processRecordCount, successSaveCount, totalRecordCount) {
    this.log(`当前已处理${processRecordCount}/${totalRecordCount}条记录, 已成功${successSaveCount}条`)

  }

  /**
   * [必须覆盖]统计 projectUvMap 中的记录总数
   */
  getRecordCountInProjectMap() {
    this.mustBeOverride()
    let totalCount = 0
    // for (let [projectId, countAtMap] of projectMap) {
    //   for (let [countAtTime, distribution] of countAtMap) {
    //     totalCount = totalCount + 1
    //   }
    // }
    return totalCount
  }

  mustBeOverride() {
    this.warn('注意, 这里有个方法没有覆盖')
    this.warn('当场退出←_←')
    process.exit(0)
  }
}
module.exports = ParseBase
