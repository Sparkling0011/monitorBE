const {
  generateToken,
  encryptPassword,
  vertifyPassword,
} = require("../../library/auth");

const { userModel } = require("../../model");

module.exports = {
  login: async (req, res) => {
    const { auth, password } = req.body;
    const user = await userModel.findOne({
      $or: [{ username: auth }, { email: auth }],
    });
    if (!user) {
      res.status(400).json({ message: "不存在此用户,请先注册" });
      return;
    }
    const isValid = await vertifyPassword(password, user.password);
    if (isValid) {
      const token = generateToken(user.username, user._id, user.email);
      res
        .status(200)
        .json({ token, user: { _id: user._id, username: user.username } });
    } else {
      res.status(400).send("密码错误");
    }
  },
  register: async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      res.status(400).json({ message: "请求信息错误" });

    const user = await userModel.findOne({ $or: [{ username }, { email }] });
    if (user) {
      if (user.username === username) {
        res.status(400).json({ message: "用户名已存在" });
      } else if (user.email === email) {
        res.status(400).json({ message: "邮箱已存在" });
      }
    } else {
      const hashPassword = await encryptPassword(password);
      const newUser = userModel({ username, email, password: hashPassword });
      await newUser.save();
      res.status(200).json({ message: "注册成功,请登录" });
    }
  },
  getUserInfo: async (req, res) => {
    const { uid } = req.user;
    const { username, email, avator } = await userModel.findOne({ _id: uid });
    res.status(200).json({ username, email, avator });
  },
  updateUserInfo: async (req, res) => {
    const { uid } = req.user;
    const { username, avatar, password } = req.body;
    console.log(req.body);
    try {
      const user = await userModel.findOne({ _id: uid });
      if (username) user.username = username;
      if (avatar) user.avatar = avatar;
      if (password) user.password = encryptPassword(password);
      user.save();
      res.status(200).json({ message: "更新成功" });
    } catch (err) {
      res.status(500).json({ err });
    }
  },
};
