const { Router } = require("express");

const { ErrorParse, PerformanceParse } = require("./parse")
const router = Router();

router.post("/error", ErrorParse);
router.get("/perf", PerformanceParse);

module.exports = router;
