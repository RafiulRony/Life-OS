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
  getInvitations,
  acceptInvitation,
  rejectInvitation,
  leaveWorkspace,
} = require("../controllers/workspace.controller")
const { authenticate } = require("../middleware/auth.middleware")

router.use(authenticate)

router.get("/", getWorkspaces)
router.post("/", createWorkspace)

// Invitations (must come before /:id to avoid route conflict)
router.get("/invitations", getInvitations)
router.post("/invitations/:id/accept", acceptInvitation)
router.post("/invitations/:id/reject", rejectInvitation)

router.get("/:id", getWorkspace)
router.put("/:id", updateWorkspace)
router.delete("/:id", deleteWorkspace)
router.post("/:id/members", addMember)
router.delete("/:id/members/:userId", removeMember)
router.delete("/:id/leave", leaveWorkspace)

module.exports = router
