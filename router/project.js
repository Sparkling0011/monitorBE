const { Router } = require("express")
const { createProject, getProjectList } = require("../controller/project")

const router = Router()

router.get("/create", createProject)
router.get("/list", getProjectList)

module.exports = router