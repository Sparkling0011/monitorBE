const { Router } = require("express");

const router = Router();
const { validations, validator } = require("../validator/registerValidator");
const { login, register } = require("../controller").auth;

router.post("/register", validator(validations), register);
router.post("/login", login);

module.exports = router;
