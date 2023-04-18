const _ = require('lodash');
const moment = require('moment');
const DATE_FORMAT = require('../constants/date_format');
const Logger = require('../library/logger');


class Base {
  /**
   * 简易logger
   * @returns  null
   */
  async log() {
    let message = ''
    for (let rawMessage of arguments) {
      if (_.isString(rawMessage) === false) {
        message = message + JSON.stringify(rawMessage)
      } else {
        message = message + rawMessage
      }
    }
    let triggerAt = moment().format(DATE_FORMAT.DISPLAY_BY_MILLSECOND)
    console.log(`[${triggerAt}]-[${this.constructor.name}] ` + message)
    let logger = Logger.getLogger4Command(this.constructor.name)
    logger.info(message)
  }

  /**
   * 简易logger
   * @returns  null
   */
  async warn() {
    let message = ''
    for (let rawMessage of arguments) {
      if (_.isString(rawMessage) === false) {
        message = message + JSON.stringify(rawMessage)
      } else {
        message = message + rawMessage
      }
    }
    let triggerAt = moment().format(DATE_FORMAT.DISPLAY_BY_MILLSECOND)
    console.warn(`[${triggerAt}]-[${this.constructor.name}] ` + message)
    let logger = Logger.getLogger4Command(this.constructor.name)
    logger.warn(message)
  }
}

module.exports = Base
