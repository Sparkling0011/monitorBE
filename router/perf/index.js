const { Router } = require("express");

const {
  getPerfListInRange
} = require("../../controller/perf");

const router = Router();

// router.get("/list", getPerfListInRange);

module.exports = router;
