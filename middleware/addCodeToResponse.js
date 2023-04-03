exports.addCodeToResponse = (_req, res, next) => {
  res.sendJson = res.json;

  res.json = function (body) {
    console.log(body);
    res.sendJson({
      code: res.statusCode,
      result: body,
    });
  };

  next();
};
