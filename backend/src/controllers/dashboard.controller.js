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

    let goalSummary = null

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

      // Goals summary
      const goals = await prisma.goal.findMany({
        where: { workspaceId: personalWorkspace.id, userId },
        select: { status: true, currentValue: true, targetValue: true },
      })

      const totalGoals = goals.length
      const activeGoals = goals.filter((g) => g.status === "active").length
      const completedGoals = goals.filter(
        (g) => g.status === "completed",
      ).length
      const overallGoalPercent =
        totalGoals > 0
          ? Math.round(
              goals.reduce((sum, g) => {
                const pct =
                  g.targetValue > 0
                    ? Math.min((g.currentValue / g.targetValue) * 100, 100)
                    : 0
                return sum + pct
              }, 0) / totalGoals,
            )
          : 0

      // Active goals for dashboard widget (top 5)
      const activeGoalsList = await prisma.goal.findMany({
        where: { workspaceId: personalWorkspace.id, userId, status: "active" },
        select: {
          id: true,
          title: true,
          icon: true,
          color: true,
          currentValue: true,
          targetValue: true,
          unit: true,
          targetDate: true,
          status: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      })

      const activeGoalsEnriched = activeGoalsList.map((g) => ({
        ...g,
        percent:
          g.targetValue > 0
            ? Math.min(Math.round((g.currentValue / g.targetValue) * 100), 100)
            : 0,
      }))

      goalSummary = {
        total: totalGoals,
        active: activeGoals,
        completed: completedGoals,
        overallPercent: overallGoalPercent,
        activeGoals: activeGoalsEnriched,
      }
    }

    res.json({
      workspaces,
      todayTasks,
      ongoingTasks,
      completedTasks,
      todayHabits,
      habitSummary,
      goalSummary,
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
