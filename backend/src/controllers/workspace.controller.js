const prisma = require("../utils/prisma")

const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: { some: { userId: req.user.id } },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
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

const getWorkspace = async (req, res) => {
  try {
    const { id } = req.params

    const workspace = await prisma.workspace.findFirst({
      where: {
        id,
        members: { some: { userId: req.user.id } },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
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
          create: { userId: req.user.id },
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    })

    res.status(201).json({ workspace })
  } catch (err) {
    console.error("Create workspace error:", err)
    res.status(500).json({ message: "Failed to create workspace" })
  }
}

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

const addMember = async (req, res) => {
  try {
    const { id } = req.params
    const { email } = req.body

    // Only owner can add members
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
      return res.status(404).json({ message: "User not found" })
    }

    const existing = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: id, userId: userToAdd.id } },
    })

    if (existing) {
      return res.status(409).json({ message: "User is already a member" })
    }

    await prisma.workspaceMember.create({
      data: { workspaceId: id, userId: userToAdd.id },
    })

    res.json({ message: "Member added successfully" })
  } catch (err) {
    console.error("Add member error:", err)
    res.status(500).json({ message: "Failed to add member" })
  }
}

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

module.exports = {
  getWorkspaces,
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  removeMember,
}
