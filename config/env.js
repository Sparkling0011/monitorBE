// 环境变量值=>
// development
// testing
// production

let env = process.env.NODE_ENV || 'development'
module.exports = env