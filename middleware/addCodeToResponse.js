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
