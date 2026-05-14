const express = require("express")
const router = express.Router()
const {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  updateProgress,
  getProgressHistory,
} = require("../controllers/goal.controller")
const { authenticate } = require("../middleware/auth.middleware")

router.use(authenticate)

router.get("/", getGoals)
router.post("/", createGoal)
router.get("/:id", getGoal)
router.put("/:id", updateGoal)
router.delete("/:id", deleteGoal)
router.post("/:id/progress", updateProgress)
router.get("/:id/history", getProgressHistory)

module.exports = router
