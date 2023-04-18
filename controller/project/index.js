const { v4: uuidv4 } = require("uuid")
const { projectModel } = require("../../model")
module.exports = {
  createProject: async (req, res) => {
    const { pname } = req.query; // 获取应用名称
    const { uid } = req.user
    const pid = uuidv4(); // 生成唯一ID
    const newProject = projectModel({ pname, pid, uid })
    await newProject.save()
    res.json({ pid })
  },
  getProjectList: async (req, res) => {
    const { pageSize, page } = req.query
    const { uid } = req.user
    console.log(uid);
    const projects = await projectModel.find({ uid })
    res.status(200).json({ list: projects, pageCount: 1, page: 1 })
  }
}