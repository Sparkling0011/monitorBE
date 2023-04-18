const { parseToken } = require("../library/auth")

exports.authenticateToken = (req, res, next) => {
  if (req.path === "/api/user/login") {
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
  let path = req.path
  if (_.startsWith(path, '/project')) {
    let projectId = parseInt(_.get(path.split('/'), [2], 0))
    _.set(req, ['fee', 'project', 'projectId'], projectId)
  }
  next()
} 
