const { Router } = require("express");

const {
  getLoadingDataInRange
} = require("../../controller/perf");

const router = Router();

router.get("/loading", getLoadingDataInRange);

module.exports = router;
