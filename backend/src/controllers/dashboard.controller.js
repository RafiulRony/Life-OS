const prisma = require("../utils/prisma")

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get all workspaces the user belongs to
    const workspaces = await prisma.workspace.findMany({
      where: { members: { some: { userId } } },
      select: { id: true, name: true, type: true, emoji: true },
    })

    const workspaceIds = workspaces.map((w) => w.id)

    // Today's tasks (due today or overdue pending/ongoing)
    const todayTasks = await prisma.task.findMany({
      where: {
        workspaceId: { in: workspaceIds },
        status: { not: "done" },
        dueDate: { lt: tomorrow },
      },
      include: {
        workspace: { select: { id: true, name: true, emoji: true } },
        assignedTo: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { dueDate: "asc" },
      take: 10,
    })

    // Ongoing tasks
    const ongoingTasks = await prisma.task.findMany({
      where: {
        workspaceId: { in: workspaceIds },
        status: "ongoing",
      },
      include: {
        workspace: { select: { id: true, name: true, emoji: true } },
        assignedTo: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    })

    // Recently completed tasks
    const completedTasks = await prisma.task.findMany({
      where: {
        workspaceId: { in: workspaceIds },
        status: "done",
      },
      include: {
        workspace: { select: { id: true, name: true, emoji: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    })

    // Quick stats
    const [totalTasks, doneTasks, pendingTasks, totalNotes] = await Promise.all(
      [
        prisma.task.count({ where: { workspaceId: { in: workspaceIds } } }),
        prisma.task.count({
          where: { workspaceId: { in: workspaceIds }, status: "done" },
        }),
        prisma.task.count({
          where: { workspaceId: { in: workspaceIds }, status: "pending" },
        }),
        prisma.note.count({ where: { workspaceId: { in: workspaceIds } } }),
      ],
    )

    res.json({
      workspaces,
      todayTasks,
      ongoingTasks,
      completedTasks,
      stats: {
        totalTasks,
        doneTasks,
        pendingTasks,
        totalNotes,
        totalWorkspaces: workspaces.length,
      },
    })
  } catch (err) {
    console.error("Dashboard error:", err)
    res.status(500).json({ message: "Failed to load dashboard" })
  }
}

module.exports = { getDashboard }
