const { Router } = require("express");

const {
  getErrorDistribution,
  getErrorLogList,
  getUrlDistribution,
  getErrorNameList,
  getGeographyDistribution,
} = require("../../controller/runtime");

const router = Router();

router.get("/distribution/summary", getErrorDistribution);

router.get("/log/list", getErrorLogList);

router.get("/distribution/url", getUrlDistribution);

router.get("/distribution/error_name", getErrorNameList);

router.get("/distribution/geography", getGeographyDistribution);

module.exports = router;
