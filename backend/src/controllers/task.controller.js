const prisma = require("../utils/prisma")

// Verify user is an accepted member of the workspace
const isMember = async (workspaceId, userId) => {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  })
  return !!member && member.status === "accepted"
}

const getTasks = async (req, res) => {
  try {
    const { workspaceId, status, priority, assignedToId } = req.query

    if (!workspaceId) {
      return res.status(400).json({ message: "workspaceId is required" })
    }

    const member = await isMember(workspaceId, req.user.id)
    if (!member) {
      return res.status(403).json({ message: "Not a member of this workspace" })
    }

    const where = { workspaceId }
    if (status) where.status = status
    if (priority) where.priority = priority
    if (assignedToId) where.assignedToId = assignedToId

    const tasks = await prisma.task.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
        assignedTo: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    })

    res.json({ tasks })
  } catch (err) {
    console.error("Get tasks error:", err)
    res.status(500).json({ message: "Failed to fetch tasks" })
  }
}

const getTask = async (req, res) => {
  try {
    const { id } = req.params

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        workspace: true,
        createdBy: { select: { id: true, name: true, avatar: true } },
        assignedTo: { select: { id: true, name: true, avatar: true } },
      },
    })

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    const member = await isMember(task.workspaceId, req.user.id)
    if (!member) {
      return res.status(403).json({ message: "Not authorized" })
    }

    res.json({ task })
  } catch (err) {
    console.error("Get task error:", err)
    res.status(500).json({ message: "Failed to fetch task" })
  }
}

const createTask = async (req, res) => {
  try {
    const { workspaceId, title, description, priority, dueDate, assignedToId } =
      req.body

    if (!workspaceId || !title) {
      return res
        .status(400)
        .json({ message: "workspaceId and title are required" })
    }

    const member = await isMember(workspaceId, req.user.id)
    if (!member) {
      return res.status(403).json({ message: "Not a member of this workspace" })
    }

    const task = await prisma.task.create({
      data: {
        workspaceId,
        title,
        description,
        priority: priority || "medium",
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedToId: assignedToId || null,
        createdById: req.user.id,
      },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
        assignedTo: { select: { id: true, name: true, avatar: true } },
      },
    })

    res.status(201).json({ task })
  } catch (err) {
    console.error("Create task error:", err)
    res.status(500).json({ message: "Failed to create task" })
  }
}

const updateTask = async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, status, priority, dueDate, assignedToId } =
      req.body

    const task = await prisma.task.findUnique({ where: { id } })
    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    const member = await isMember(task.workspaceId, req.user.id)
    if (!member) {
      return res.status(403).json({ message: "Not authorized" })
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assignedToId,
      },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
        assignedTo: { select: { id: true, name: true, avatar: true } },
      },
    })

    res.json({ task: updated })
  } catch (err) {
    console.error("Update task error:", err)
    res.status(500).json({ message: "Failed to update task" })
  }
}

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params

    const task = await prisma.task.findUnique({ where: { id } })
    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    // Only creator can delete
    if (task.createdById !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the task creator can delete it" })
    }

    await prisma.task.delete({ where: { id } })

    res.json({ message: "Task deleted" })
  } catch (err) {
    console.error("Delete task error:", err)
    res.status(500).json({ message: "Failed to delete task" })
  }
}

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask }
