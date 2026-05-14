const prisma = require("../utils/prisma")

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Compute percentage, capped at 100 unless target is 0 */
const calcPercent = (current, target) => {
  if (target <= 0) return 0
  return Math.min(Math.round((current / target) * 100), 100)
}

/** Enrich a goal with computed fields */
const enrichGoal = (goal) => {
  const percent = calcPercent(goal.currentValue, goal.targetValue)
  const remaining = Math.max(goal.targetValue - goal.currentValue, 0)
  return { ...goal, percent, remaining }
}

/** Verify the requesting user is a member of the workspace */
const isMember = async (workspaceId, userId) => {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  })
  return !!member
}

// ─── GET /api/goals?workspaceId=... ─────────────────────────────────────────
const getGoals = async (req, res) => {
  try {
    const { workspaceId, status } = req.query

    if (!workspaceId) {
      return res.status(400).json({ message: "workspaceId is required" })
    }

    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, members: { some: { userId: req.user.id } } },
    })

    if (!workspace) {
      return res.status(403).json({ message: "Not a member of this workspace" })
    }

    if (workspace.type !== "personal") {
      return res
        .status(403)
        .json({ message: "Goals are only available in Personal workspaces" })
    }

    const baseWhere = { workspaceId, userId: req.user.id }
    const filteredWhere = status ? { ...baseWhere, status } : baseWhere

    // Fetch filtered goals (for display) and all goals (for summary) in parallel
    const [goals, allGoals] = await Promise.all([
      prisma.goal.findMany({
        where: filteredWhere,
        include: {
          progressHistory: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.goal.findMany({
        where: baseWhere,
        select: { status: true, currentValue: true, targetValue: true },
      }),
    ])

    const enriched = goals.map(enrichGoal)

    // Summary stats always reflect ALL goals, not the filtered subset
    const total = allGoals.length
    const active = allGoals.filter((g) => g.status === "active").length
    const completed = allGoals.filter((g) => g.status === "completed").length
    const paused = allGoals.filter((g) => g.status === "paused").length
    const overallPercent =
      total > 0
        ? Math.round(
            allGoals.reduce(
              (sum, g) => sum + calcPercent(g.currentValue, g.targetValue),
              0,
            ) / total,
          )
        : 0

    res.json({
      goals: enriched,
      summary: { total, active, completed, paused, overallPercent },
    })
  } catch (err) {
    console.error("Get goals error:", err)
    res.status(500).json({ message: "Failed to fetch goals" })
  }
}

// ─── GET /api/goals/:id ──────────────────────────────────────────────────────
const getGoal = async (req, res) => {
  try {
    const { id } = req.params

    const goal = await prisma.goal.findUnique({
      where: { id },
      include: {
        progressHistory: { orderBy: { createdAt: "desc" } },
      },
    })

    if (!goal) return res.status(404).json({ message: "Goal not found" })
    if (goal.userId !== req.user.id)
      return res.status(403).json({ message: "Not authorized" })

    res.json({ goal: enrichGoal(goal) })
  } catch (err) {
    console.error("Get goal error:", err)
    res.status(500).json({ message: "Failed to fetch goal" })
  }
}

// ─── POST /api/goals ─────────────────────────────────────────────────────────
const createGoal = async (req, res) => {
  try {
    const {
      workspaceId,
      title,
      description,
      category,
      icon,
      color,
      targetValue,
      unit,
      startDate,
      targetDate,
    } = req.body

    if (!workspaceId || !title || targetValue === undefined || !unit) {
      return res.status(400).json({
        message: "workspaceId, title, targetValue, and unit are required",
      })
    }

    if (Number(targetValue) <= 0) {
      return res
        .status(400)
        .json({ message: "targetValue must be greater than 0" })
    }

    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, members: { some: { userId: req.user.id } } },
    })

    if (!workspace) {
      return res.status(403).json({ message: "Not a member of this workspace" })
    }

    if (workspace.type !== "personal") {
      return res
        .status(403)
        .json({ message: "Goals are only available in Personal workspaces" })
    }

    const goal = await prisma.goal.create({
      data: {
        workspaceId,
        userId: req.user.id,
        title: title.trim(),
        description: description?.trim() || null,
        category: category?.trim() || null,
        icon: icon || "🎯",
        color: color || "#6470f3",
        targetValue: Number(targetValue),
        currentValue: 0,
        unit: unit.trim(),
        status: "active",
        startDate: startDate || null,
        targetDate: targetDate || null,
      },
      include: { progressHistory: true },
    })

    res.status(201).json({ goal: enrichGoal(goal) })
  } catch (err) {
    console.error("Create goal error:", err)
    res.status(500).json({ message: "Failed to create goal" })
  }
}

// ─── PUT /api/goals/:id ──────────────────────────────────────────────────────
const updateGoal = async (req, res) => {
  try {
    const { id } = req.params
    const {
      title,
      description,
      category,
      icon,
      color,
      targetValue,
      unit,
      status,
      startDate,
      targetDate,
    } = req.body

    const goal = await prisma.goal.findUnique({ where: { id } })
    if (!goal) return res.status(404).json({ message: "Goal not found" })
    if (goal.userId !== req.user.id)
      return res.status(403).json({ message: "Not authorized" })

    if (targetValue !== undefined && Number(targetValue) <= 0) {
      return res
        .status(400)
        .json({ message: "targetValue must be greater than 0" })
    }

    const data = {}
    if (title !== undefined) data.title = title.trim()
    if (description !== undefined)
      data.description = description?.trim() || null
    if (category !== undefined) data.category = category?.trim() || null
    if (icon !== undefined) data.icon = icon
    if (color !== undefined) data.color = color
    if (targetValue !== undefined) data.targetValue = Number(targetValue)
    if (unit !== undefined) data.unit = unit.trim()
    if (status !== undefined) data.status = status
    if (startDate !== undefined) data.startDate = startDate || null
    if (targetDate !== undefined) data.targetDate = targetDate || null

    const updated = await prisma.goal.update({
      where: { id },
      data,
      include: {
        progressHistory: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    })

    res.json({ goal: enrichGoal(updated) })
  } catch (err) {
    console.error("Update goal error:", err)
    res.status(500).json({ message: "Failed to update goal" })
  }
}

// ─── DELETE /api/goals/:id ───────────────────────────────────────────────────
const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params

    const goal = await prisma.goal.findUnique({ where: { id } })
    if (!goal) return res.status(404).json({ message: "Goal not found" })
    if (goal.userId !== req.user.id)
      return res.status(403).json({ message: "Not authorized" })

    await prisma.goal.delete({ where: { id } })
    res.json({ message: "Goal deleted" })
  } catch (err) {
    console.error("Delete goal error:", err)
    res.status(500).json({ message: "Failed to delete goal" })
  }
}

// ─── POST /api/goals/:id/progress ────────────────────────────────────────────
const updateProgress = async (req, res) => {
  try {
    const { id } = req.params
    const { value, note, mode = "set" } = req.body
    // mode: "set" (absolute) | "add" (increment) | "subtract" (decrement)

    if (value === undefined || value === null) {
      return res.status(400).json({ message: "value is required" })
    }

    const numValue = Number(value)
    if (isNaN(numValue)) {
      return res.status(400).json({ message: "value must be a number" })
    }

    const goal = await prisma.goal.findUnique({ where: { id } })
    if (!goal) return res.status(404).json({ message: "Goal not found" })
    if (goal.userId !== req.user.id)
      return res.status(403).json({ message: "Not authorized" })

    if (goal.status === "completed" || goal.status === "cancelled") {
      return res
        .status(400)
        .json({ message: `Cannot update progress on a ${goal.status} goal` })
    }

    const previousValue = goal.currentValue
    let newValue

    if (mode === "add") {
      newValue = previousValue + numValue
    } else if (mode === "subtract") {
      newValue = previousValue - numValue
    } else {
      newValue = numValue
    }

    // Prevent negative progress
    if (newValue < 0) {
      return res.status(400).json({ message: "Progress cannot be negative" })
    }

    // Cap at target (goals don't exceed target unless explicitly set)
    const cappedValue = Math.min(newValue, goal.targetValue)

    // Determine if goal is now completed
    const isCompleted = cappedValue >= goal.targetValue
    const newStatus = isCompleted ? "completed" : goal.status
    const completedAt =
      isCompleted && !goal.completedAt ? new Date() : goal.completedAt

    // Run update + history creation in a transaction
    const [updated] = await prisma.$transaction([
      prisma.goal.update({
        where: { id },
        data: {
          currentValue: cappedValue,
          status: newStatus,
          completedAt,
        },
        include: {
          progressHistory: { orderBy: { createdAt: "desc" }, take: 10 },
        },
      }),
      prisma.goalProgressHistory.create({
        data: {
          goalId: id,
          previousValue,
          updatedValue: cappedValue,
          note: note?.trim() || null,
        },
      }),
    ])

    res.json({
      goal: enrichGoal(updated),
      justCompleted: isCompleted && !goal.completedAt,
    })
  } catch (err) {
    console.error("Update progress error:", err)
    res.status(500).json({ message: "Failed to update progress" })
  }
}

// ─── GET /api/goals/:id/history ──────────────────────────────────────────────
const getProgressHistory = async (req, res) => {
  try {
    const { id } = req.params
    const limit = Math.min(parseInt(req.query.limit) || 50, 100)

    const goal = await prisma.goal.findUnique({ where: { id } })
    if (!goal) return res.status(404).json({ message: "Goal not found" })
    if (goal.userId !== req.user.id)
      return res.status(403).json({ message: "Not authorized" })

    const history = await prisma.goalProgressHistory.findMany({
      where: { goalId: id },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    res.json({ history })
  } catch (err) {
    console.error("Get progress history error:", err)
    res.status(500).json({ message: "Failed to fetch progress history" })
  }
}

module.exports = {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  updateProgress,
  getProgressHistory,
}
