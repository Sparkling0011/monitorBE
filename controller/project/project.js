const { v4: uuidv4 } = require("uuid")
const { appModel } = require("../../model")
module.exports = {
  createProject: async (req, res) => {
    const pname = req.query.pname; // 获取应用名称
    const pid = uuidv4(); // 生成唯一ID
    const newApp = appModel({ pname, pid })
    await newApp.save()
    res.json({ pid })
  }
}