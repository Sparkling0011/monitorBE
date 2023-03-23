const { body, validationResult } = require("express-validator");
exports.validator = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    res.status("400").json({ error: errors.array() });
  };
};

exports.validations = [
  body("username").isLength({ min: 3 }).withMessage("用户名长度最小为3").bail(),
  body("email").isEmail().withMessage("邮箱格式不正确").bail(),
  body("password").isLength({ min: 6 }).withMessage("密码长度最小为6").bail(),
];
