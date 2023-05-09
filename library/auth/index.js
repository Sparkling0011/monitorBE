const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const saltRounds = 10;

exports.parseToken = function (token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) reject(err)
      resolve(user)
    });
  })

}

exports.generateToken = function (username, uid, email) {
  const token = jwt.sign(
    { username, uid, email },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "5h",
    }
  );
  return token
}

exports.encryptPassword = async function (password) {
  const hashPassword = await bcrypt.hash(password, saltRounds);
  return hashPassword
}

exports.vertifyPassword = async function (password, hashPassword) {
  const isValid = await bcrypt.compare(password, hashPassword);
  return isValid
}
