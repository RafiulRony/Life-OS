const prisma = require("../utils/prisma")

// ─── Helpers ────────────────────────────────────────────────────────────────

const memberSelect = {
  include: {
    user: { select: { id: true, name: true, email: true, avatar: true } },
  },
}

// ─── GET /api/workspaces ─────────────────────────────────────────────────────
const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: { some: { userId: req.user.id, status: "accepted" } },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          where: { status: "accepted" },
          ...memberSelect,
        },
        _count: { select: { tasks: true, notes: true } },
      },
      orderBy: { createdAt: "asc" },
    })

    res.json({ workspaces })
  } catch (err) {
    console.error("Get workspaces error:", err)
    res.status(500).json({ message: "Failed to fetch workspaces" })
  }
}

// ─── GET /api/workspaces/:id ─────────────────────────────────────────────────
const getWorkspace = async (req, res) => {
  try {
    const { id } = req.params

    const workspace = await prisma.workspace.findFirst({
      where: {
        id,
        members: { some: { userId: req.user.id, status: "accepted" } },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          where: { status: "accepted" },
          ...memberSelect,
        },
        _count: { select: { tasks: true, notes: true, goals: true } },
      },
    })

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" })
    }

    res.json({ workspace })
  } catch (err) {
    console.error("Get workspace error:", err)
    res.status(500).json({ message: "Failed to fetch workspace" })
  }
}

// ─── POST /api/workspaces ────────────────────────────────────────────────────
const createWorkspace = async (req, res) => {
  try {
    const { name, description, type, emoji } = req.body

    if (!name) {
      return res.status(400).json({ message: "Workspace name is required" })
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        description,
        type: type || "personal",
        emoji: emoji || "🏠",
        ownerId: req.user.id,
        members: {
          // Owner is always accepted immediately
          create: { userId: req.user.id, status: "accepted" },
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          where: { status: "accepted" },
          ...memberSelect,
        },
      },
    })

    res.status(201).json({ workspace })
  } catch (err) {
    console.error("Create workspace error:", err)
    res.status(500).json({ message: "Failed to create workspace" })
  }
}

// ─── PUT /api/workspaces/:id ─────────────────────────────────────────────────
const updateWorkspace = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, emoji } = req.body

    const workspace = await prisma.workspace.findFirst({
      where: { id, ownerId: req.user.id },
    })

    if (!workspace) {
      return res
        .status(404)
        .json({ message: "Workspace not found or not authorized" })
    }

    const updated = await prisma.workspace.update({
      where: { id },
      data: { name, description, emoji },
    })

    res.json({ workspace: updated })
  } catch (err) {
    console.error("Update workspace error:", err)
    res.status(500).json({ message: "Failed to update workspace" })
  }
}

// ─── DELETE /api/workspaces/:id ──────────────────────────────────────────────
const deleteWorkspace = async (req, res) => {
  try {
    const { id } = req.params

    const workspace = await prisma.workspace.findFirst({
      where: { id, ownerId: req.user.id },
    })

    if (!workspace) {
      return res
        .status(404)
        .json({ message: "Workspace not found or not authorized" })
    }

    await prisma.workspace.delete({ where: { id } })

    res.json({ message: "Workspace deleted" })
  } catch (err) {
    console.error("Delete workspace error:", err)
    res.status(500).json({ message: "Failed to delete workspace" })
  }
}

// ─── POST /api/workspaces/:id/members ────────────────────────────────────────
// Owner invites a user — creates a pending invitation
const addMember = async (req, res) => {
  try {
    const { id } = req.params
    const { email } = req.body

    const workspace = await prisma.workspace.findFirst({
      where: { id, ownerId: req.user.id },
    })

    if (!workspace) {
      return res
        .status(404)
        .json({ message: "Workspace not found or not authorized" })
    }

    const userToAdd = await prisma.user.findUnique({ where: { email } })
    if (!userToAdd) {
      return res.status(404).json({ message: "No user found with that email" })
    }

    if (userToAdd.id === req.user.id) {
      return res.status(400).json({ message: "You are already the owner" })
    }

    const existing = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: id, userId: userToAdd.id } },
    })

    if (existing) {
      if (existing.status === "accepted") {
        return res.status(409).json({ message: "User is already a member" })
      }
      if (existing.status === "pending") {
        return res
          .status(409)
          .json({ message: "Invitation already sent and pending" })
      }
    }

    await prisma.workspaceMember.create({
      data: { workspaceId: id, userId: userToAdd.id, status: "pending" },
    })

    res.json({ message: `Invitation sent to ${userToAdd.name}` })
  } catch (err) {
    console.error("Add member error:", err)
    res.status(500).json({ message: "Failed to send invitation" })
  }
}

// ─── DELETE /api/workspaces/:id/members/:userId ──────────────────────────────
// Owner removes a member (accepted or pending)
const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params

    const workspace = await prisma.workspace.findFirst({
      where: { id, ownerId: req.user.id },
    })

    if (!workspace) {
      return res
        .status(404)
        .json({ message: "Workspace not found or not authorized" })
    }

    if (userId === req.user.id) {
      return res.status(400).json({ message: "Owner cannot remove themselves" })
    }

    await prisma.workspaceMember.delete({
      where: { workspaceId_userId: { workspaceId: id, userId } },
    })

    res.json({ message: "Member removed" })
  } catch (err) {
    console.error("Remove member error:", err)
    res.status(500).json({ message: "Failed to remove member" })
  }
}

// ─── GET /api/workspaces/invitations ─────────────────────────────────────────
// Current user's pending invitations
const getInvitations = async (req, res) => {
  try {
    const invitations = await prisma.workspaceMember.findMany({
      where: { userId: req.user.id, status: "pending" },
      include: {
        workspace: {
          include: {
            owner: { select: { id: true, name: true, email: true } },
            _count: { select: { members: { where: { status: "accepted" } } } },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    })

    res.json({ invitations })
  } catch (err) {
    console.error("Get invitations error:", err)
    res.status(500).json({ message: "Failed to fetch invitations" })
  }
}

// ─── POST /api/workspaces/invitations/:id/accept ─────────────────────────────
const acceptInvitation = async (req, res) => {
  try {
    const { id } = req.params // workspaceMember id

    const invitation = await prisma.workspaceMember.findFirst({
      where: { id, userId: req.user.id, status: "pending" },
    })

    if (!invitation) {
      return res
        .status(404)
        .json({ message: "Invitation not found or already handled" })
    }

    await prisma.workspaceMember.update({
      where: { id },
      data: { status: "accepted", joinedAt: new Date() },
    })

    res.json({ message: "Invitation accepted" })
  } catch (err) {
    console.error("Accept invitation error:", err)
    res.status(500).json({ message: "Failed to accept invitation" })
  }
}

// ─── POST /api/workspaces/invitations/:id/reject ─────────────────────────────
const rejectInvitation = async (req, res) => {
  try {
    const { id } = req.params // workspaceMember id

    const invitation = await prisma.workspaceMember.findFirst({
      where: { id, userId: req.user.id, status: "pending" },
    })

    if (!invitation) {
      return res
        .status(404)
        .json({ message: "Invitation not found or already handled" })
    }

    await prisma.workspaceMember.delete({ where: { id } })

    res.json({ message: "Invitation rejected" })
  } catch (err) {
    console.error("Reject invitation error:", err)
    res.status(500).json({ message: "Failed to reject invitation" })
  }
}

// ─── DELETE /api/workspaces/:id/leave ────────────────────────────────────────
// Non-owner member leaves a workspace
const leaveWorkspace = async (req, res) => {
  try {
    const { id } = req.params

    const workspace = await prisma.workspace.findUnique({ where: { id } })
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" })
    }

    if (workspace.ownerId === req.user.id) {
      return res
        .status(400)
        .json({
          message:
            "Owner cannot leave. Transfer ownership or delete the workspace.",
        })
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: id, userId: req.user.id } },
    })

    if (!membership) {
      return res
        .status(404)
        .json({ message: "You are not a member of this workspace" })
    }

    await prisma.workspaceMember.delete({
      where: { workspaceId_userId: { workspaceId: id, userId: req.user.id } },
    })

    res.json({ message: "You have left the workspace" })
  } catch (err) {
    console.error("Leave workspace error:", err)
    res.status(500).json({ message: "Failed to leave workspace" })
  }
}

module.exports = {
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
}
