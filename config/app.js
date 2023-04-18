const path = require("path")
const env = require("./env")


const production = {
  name: '监控平台生产环境',
  port: 8000,
  proxy: false,
  absoluteLogPath: path.resolve(__dirname, '../', 'log')
}

// 下面的特定环境可以深度合并到上面的默认环境

// 开发环境配置
const development = {
  name: '监控平台开发环境',
  port: 8000,
  proxy: false,
  absoluteLogPath: path.resolve(__dirname, '../', 'log')
}
// 测试环境配置
const testing = {
  name: 'fee监控平台测试环境',
  port: 8000,
  proxy: false,
  absoluteLogPath: path.resolve(__dirname, '../', 'log')
}

let config = {
  development,
  testing,
  production
}

module.exports = config[env]
