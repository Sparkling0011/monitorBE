const Logger = require("../library/logger")
exports.addCodeToResponse = (_req, res, next) => {
  res.sendJson = res.json;

  res.json = function (body) {
    const { message } = body
    res.sendJson({
      code: res.statusCode,
      message,
      result: body,
    });
  };

  next();
};

exports.errorHandler = (err, _req, res, next) => {
  Logger.error(err)
  res.status(500).json({ error: "Internal Server Error" });
}

