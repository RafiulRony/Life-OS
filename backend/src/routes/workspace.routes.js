const express = require("express")
const router = express.Router()
const {
  getWorkspaces,
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  removeMember,
} = require("../controllers/workspace.controller")
const { authenticate } = require("../middleware/auth.middleware")

router.use(authenticate)

router.get("/", getWorkspaces)
router.get("/:id", getWorkspace)
router.post("/", createWorkspace)
router.put("/:id", updateWorkspace)
router.delete("/:id", deleteWorkspace)
router.post("/:id/members", addMember)
router.delete("/:id/members/:userId", removeMember)

module.exports = router
