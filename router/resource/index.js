const { Router } = require("express");

const {
  getResourceErrorListInRange,
  getResourceTypeCountInRange,
} = require("../../controller/resource");

const router = Router();

router.get("/list", getResourceErrorListInRange);
router.get("/trend", getResourceTypeCountInRange);

module.exports = router;
