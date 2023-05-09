const { v4: uuidv4 } = require("uuid");
const { projectModel } = require("../../model");
module.exports = {
  createProject: async (req, res) => {
    const { pname } = req.query; // 获取应用名称
    const { uid } = req.user;
    const pid = uuidv4(); // 生成唯一ID
    const newProject = projectModel({ pname, pid, uid });
    await newProject.save();
    res.json({ pid });
  },
  getProjectList: async (req, res) => {
    const { pname, pid, range } = req.query;
    page = parseInt(req.query.page);
    pageSize = parseInt(req.query.pageSize);
    const { uid } = req.user;
    const searchParams = {};
    if (pname) searchParams.pname = pname;
    if (pid) searchParams.pid = pid;
    if (range) {
      let [start, end] = range;
      searchParams.pid = { $gte: parseInt(start), $lte: parseInt(end) };
    }
    const projects = await projectModel
      .find({ uid, ...searchParams })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    const total = await projectModel.countDocuments({ uid, ...searchParams });
    const pageCount = Math.ceil(total / pageSize);

    res.status(200).json({ list: projects, pageCount, page, total });
  },
  deleteProject: async (req, res) => {
    const { uid } = req.user;
    const { pid } = req.body;
    const { deletedCount } = await projectModel.deleteOne({ uid, pid });
    if (deletedCount === 1) res.json({ message: "删除成功", success: true });
    else res.json({ message: "删除失败", success: false });
  },
};
