const { Router } = require("express")
const { createProject, getProjectList, deleteProject } = require("../controller/project")

const router = Router()

router.get("/create", createProject)
router.get("/list", getProjectList)
router.delete("/delete", deleteProject)

module.exports = router