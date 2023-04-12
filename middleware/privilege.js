const { parseToken } = require("../library/auth")

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  //token为空
  if (!token) {
    return res.sendStatus(401);
  }

  //token有效，解析token
  parseToken(token)
    .then((user) => {
      req.user = user;
      next();
    }).catch((err) => {
      res.status(403).json({ err })
    })
};
