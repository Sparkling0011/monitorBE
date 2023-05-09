const { Router } = require("express");

const router = Router();
// const { validations, validator } = require("../validator/registerValidator");
const { login, register, getUserInfo, updateUserInfo } =
  require("../controller").user;

router.post("/register", register);
router.post("/login", login);
router.get("/user_info", getUserInfo);
router.post("/update_info", updateUserInfo);

module.exports = router;
