const { generateToken, encryptPassword, vertifyPassword } = require("../../library/auth")

const { userModel } = require("../../model");

const adminInfo = {
  userId: '1',
  username: 'admin',
  realName: 'Admin',
  // avatar: Random.image(),
  desc: 'manager',
  // password: Random.string('upper', 4, 16),
  token: 1,
  permissions: [
    {
      label: '主控台',
      value: 'dashboard_console',
    },
    {
      label: '监控页',
      value: 'dashboard_monitor',
    },
    {
      label: '工作台',
      value: 'dashboard_workplace',
    },
    {
      label: '基础列表',
      value: 'basic_list',
    },
    {
      label: '基础列表删除',
      value: 'basic_list_delete',
    },
  ],
};

module.exports = {
  login: async (req, res) => {
    const { auth, password } = req.body;
    const user = await userModel.findOne({
      $or: [{ username: auth }, { email: auth }],
    });
    if (!user) {
      res.status(400).json({ message: "不存在此用户,请先注册" })
      return
    }
    const isValid = await vertifyPassword(password, user.password)
    if (isValid) {
      const token = generateToken(user.username, password)
      res.status(200).json({ token });
    } else {
      res.status(400).send("密码错误");
    }
  },
  register: async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      res.status(400).json({ message: "请求信息错误" })

    const user = await userModel.findOne({ $or: [{ username }, { email }] });
    if (user) {
      if (user.username === username) {
        res.status(400).json({ message: "用户名已存在" });
      } else if (user.email === email) {
        res.status(400).json({ message: "邮箱已存在" });
      }
    } else {
      const hashPassword = await encryptPassword(password)
      const newUser = userModel({ username, email, password: hashPassword });
      await newUser.save();
      res.status(200).json({ message: "注册成功,请登录" });
    }
  },
  getUserInfo: async (req, res) => {
    res.status(200).json(adminInfo)
  }
};



