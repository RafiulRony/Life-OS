const prisma = require("../utils/prisma")

// YYYY-MM-DD in local time
const getLocalDateString = () => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

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

    // Today's habits — only from personal workspace
    const todayStr = getLocalDateString()
    const personalWorkspace = workspaces.find((w) => w.type === "personal")
    let todayHabits = []
    let habitSummary = null

    if (personalWorkspace) {
      const habits = await prisma.habit.findMany({
        where: { workspaceId: personalWorkspace.id, userId, isActive: true },
        include: {
          completions: {
            where: { date: todayStr },
            select: { id: true, date: true },
          },
        },
        orderBy: { createdAt: "asc" },
      })

      todayHabits = habits.map((h) => ({
        id: h.id,
        title: h.title,
        emoji: h.emoji,
        color: h.color,
        completedToday: h.completions.length > 0,
      }))

      const completedCount = todayHabits.filter((h) => h.completedToday).length
      habitSummary = {
        total: todayHabits.length,
        completed: completedCount,
        remaining: todayHabits.length - completedCount,
        allDone:
          todayHabits.length > 0 && completedCount === todayHabits.length,
        percent:
          todayHabits.length > 0
            ? Math.round((completedCount / todayHabits.length) * 100)
            : 0,
      }
    }

    res.json({
      workspaces,
      todayTasks,
      ongoingTasks,
      completedTasks,
      todayHabits,
      habitSummary,
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
