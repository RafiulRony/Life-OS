const express = require("express")
const router = express.Router()
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/task.controller")
const { authenticate } = require("../middleware/auth.middleware")

router.use(authenticate)

router.get("/", getTasks)
router.get("/:id", getTask)
router.post("/", createTask)
router.put("/:id", updateTask)
router.delete("/:id", deleteTask)

module.exports = router
