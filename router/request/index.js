const { Router } = require("express");

const {
  getRequestErrorListInRange
} = require("../../controller/request");

const router = Router();

router.get("/list", getRequestErrorListInRange);

module.exports = router;
