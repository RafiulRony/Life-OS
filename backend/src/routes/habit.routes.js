const express = require("express")
const router = express.Router()
const {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleCompletion,
  getHabitHistory,
} = require("../controllers/habit.controller")
const { authenticate } = require("../middleware/auth.middleware")

router.use(authenticate)

router.get("/", getHabits)
router.post("/", createHabit)
router.put("/:id", updateHabit)
router.delete("/:id", deleteHabit)
router.post("/:id/complete", toggleCompletion)
router.get("/:id/history", getHabitHistory)

module.exports = router
