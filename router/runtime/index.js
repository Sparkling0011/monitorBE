const { Router } = require("express");

const {
  getRuntimeErrorList,
  getIntervalCountInRange
} = require("../../controller/runtime");

const router = Router();

router.get("/list", getRuntimeErrorList);
router.get("/intervalCount", getIntervalCountInRange)

module.exports = router;
