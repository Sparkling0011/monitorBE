const { Router } = require("express");

const {
  getRequestErrorListInRange,
  getRequestDataInRangeHous
} = require("../../controller/request");

const router = Router();

router.get("/list", getRequestErrorListInRange);
router.get("/detail", getRequestDataInRangeHous);

module.exports = router;
