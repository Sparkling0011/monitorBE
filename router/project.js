const { Router } = require("express")
const { createProject } = require("../controller/project/project")

const router = Router()

router.get("/create", createProject)

module.exports = router