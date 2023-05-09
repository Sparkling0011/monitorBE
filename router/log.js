const { Router } = require("express");
const { requestParse, responseParse } = require("./parse/common")
const { ErrorParse, PerformanceParse } = require("./parse")

const router = Router();

router.get("/error", requestParse, ErrorParse, responseParse);
router.get("/perf", requestParse, PerformanceParse, responseParse);

module.exports = router;
