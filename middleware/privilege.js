const { parseToken } = require("../library/auth")
const _ = require("lodash")

exports.authenticateToken = (req, res, next) => {
  if (!req.path.startsWith("/api")) return res.status(400).json({ message: "错误的请求" })
  if (req.path === "/api/user/login" || req.path === "/api/user/register") {
    return next()
  }
  if (req.path.startsWith("/api/log")) {
    return next()
  }
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  //token为空
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Missing Token" });
  }

  //token有效，解析token
  parseToken(token)
    .then((user) => {
      req.user = user;
      next();
    }).catch((err) => {
      res.status(403).json({ err: "Forbidden: Invalid Token" })
    })
};

exports.appendProjectInfo = function (req, res, next) {
  let path = req.body
  if (_.startsWith(path, '/api/log')) {
    let projectId = parseInt(_.get(path, ["common", "pid"], 0))
    _.set(req, ['pid'], projectId)
  }
  next()
} 
