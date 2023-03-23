const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { userModel } = require("../../model");

const saltRounds = 10;

module.exports = {
  login: async (req, res) => {
    const { auth, password } = req.body;
    const user = await userModel.findOne({
      $or: [{ username: auth }, { email: auth }],
    });
    const isValid = await bcrypt.compare(password, user.password);
    if (isValid) {
      const token = jwt.sign(
        { username: user.username, password: password },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "1h",
        }
      );
      res.status(200).json({ msg: "登录成功", token });
    } else {
      res.status(400).send("密码错误");
    }
  },
  register: async (req, res) => {
    const { username, email, password } = req.body;

    const user = await userModel.findOne({ $or: [{ username }, { email }] });
    if (user) {
      if (user.username === username) {
        res.status(400).send("用户名已存在");
      } else if (user.email === email) {
        res.status(400).send("邮箱已存在");
      }
    } else {
      const hashPassword = await bcrypt.hash(password, saltRounds);
      const newUser = userModel({ username, email, password: hashPassword });
      await newUser.save();
      res.status(200).send("注册成功,请登录");
    }
  },
};
