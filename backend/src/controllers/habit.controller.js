const prisma = require("../utils/prisma")

// Get today's date string in YYYY-MM-DD using local timezone
const getTodayString = () => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

// Calculate streak from sorted completion dates (desc)
const calculateStreaks = (dates) => {
  if (!dates.length) return { current: 0, longest: 0 }

  // Sort ascending
  const sorted = [...dates].sort()
  const today = getTodayString()
  const yesterday = (() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
  })()

  // Current streak: count consecutive days ending today or yesterday
  let current = 0
  const lastDate = sorted[sorted.length - 1]
  if (lastDate === today || lastDate === yesterday) {
    let checkDate = lastDate
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (sorted[i] === checkDate) {
        current++
        // Move checkDate back one day
        const d = new Date(checkDate + "T00:00:00")
        d.setDate(d.getDate() - 1)
        const y = d.getFullYear()
        const mo = String(d.getMonth() + 1).padStart(2, "0")
        const day = String(d.getDate()).padStart(2, "0")
        checkDate = `${y}-${mo}-${day}`
      } else {
        break
      }
    }
  }

  // Longest streak
  let longest = 1
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T00:00:00")
    const curr = new Date(sorted[i] + "T00:00:00")
    const diff = (curr - prev) / (1000 * 60 * 60 * 24)
    if (diff === 1) {
      run++
      if (run > longest) longest = run
    } else {
      run = 1
    }
  }

  return { current, longest }
}

// Enrich habit with computed fields
const enrichHabit = (habit) => {
  const today = getTodayString()
  const dates = habit.completions.map((c) => c.date)
  const { current, longest } = calculateStreaks(dates)
  const completedToday = dates.includes(today)
  const lastCompleted = dates.length ? [...dates].sort().reverse()[0] : null

  return {
    ...habit,
    completedToday,
    currentStreak: current,
    longestStreak: longest,
    totalCompleted: dates.length,
    lastCompleted,
  }
}

// GET /api/habits?workspaceId=...
const getHabits = async (req, res) => {
  try {
    const { workspaceId } = req.query

    if (!workspaceId) {
      return res.status(400).json({ message: "workspaceId is required" })
    }

    // Verify workspace belongs to user and is personal
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        members: { some: { userId: req.user.id, status: "accepted" } },
      },
    })

    if (!workspace) {
      return res.status(403).json({ message: "Not a member of this workspace" })
    }

    if (workspace.type !== "personal") {
      return res
        .status(403)
        .json({ message: "Habits are only available in Personal workspaces" })
    }

    const habits = await prisma.habit.findMany({
      where: { workspaceId, userId: req.user.id },
      include: { completions: { select: { date: true, id: true } } },
      orderBy: { createdAt: "asc" },
    })

    const enriched = habits.map(enrichHabit)

    // Today's summary
    const today = getTodayString()
    const activeHabits = enriched.filter((h) => h.isActive)
    const completedToday = activeHabits.filter((h) => h.completedToday).length
    const totalActive = activeHabits.length

    res.json({
      habits: enriched,
      summary: {
        total: habits.length,
        totalActive,
        completedToday,
        remaining: totalActive - completedToday,
        completionPercent:
          totalActive > 0
            ? Math.round((completedToday / totalActive) * 100)
            : 0,
        allDone: totalActive > 0 && completedToday === totalActive,
      },
    })
  } catch (err) {
    console.error("Get habits error:", err)
    res.status(500).json({ message: "Failed to fetch habits" })
  }
}

// POST /api/habits
const createHabit = async (req, res) => {
  try {
    const { workspaceId, title, description, emoji, color } = req.body

    if (!workspaceId || !title) {
      return res
        .status(400)
        .json({ message: "workspaceId and title are required" })
    }

    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        members: { some: { userId: req.user.id, status: "accepted" } },
      },
    })

    if (!workspace) {
      return res.status(403).json({ message: "Not a member of this workspace" })
    }

    if (workspace.type !== "personal") {
      return res
        .status(403)
        .json({ message: "Habits are only available in Personal workspaces" })
    }

    const habit = await prisma.habit.create({
      data: {
        workspaceId,
        userId: req.user.id,
        title: title.trim(),
        description: description?.trim() || null,
        emoji: emoji || "✨",
        color: color || "#6470f3",
      },
      include: { completions: { select: { date: true, id: true } } },
    })

    res.status(201).json({ habit: enrichHabit(habit) })
  } catch (err) {
    console.error("Create habit error:", err)
    res.status(500).json({ message: "Failed to create habit" })
  }
}

// PUT /api/habits/:id
const updateHabit = async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, emoji, color, isActive } = req.body

    const habit = await prisma.habit.findUnique({ where: { id } })
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" })
    }

    if (habit.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" })
    }

    const updated = await prisma.habit.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && {
          description: description?.trim() || null,
        }),
        ...(emoji !== undefined && { emoji }),
        ...(color !== undefined && { color }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { completions: { select: { date: true, id: true } } },
    })

    res.json({ habit: enrichHabit(updated) })
  } catch (err) {
    console.error("Update habit error:", err)
    res.status(500).json({ message: "Failed to update habit" })
  }
}

// DELETE /api/habits/:id
const deleteHabit = async (req, res) => {
  try {
    const { id } = req.params

    const habit = await prisma.habit.findUnique({ where: { id } })
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" })
    }

    if (habit.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" })
    }

    await prisma.habit.delete({ where: { id } })

    res.json({ message: "Habit deleted" })
  } catch (err) {
    console.error("Delete habit error:", err)
    res.status(500).json({ message: "Failed to delete habit" })
  }
}

// POST /api/habits/:id/complete  — toggle today's completion
const toggleCompletion = async (req, res) => {
  try {
    const { id } = req.params
    const today = getTodayString()

    const habit = await prisma.habit.findUnique({
      where: { id },
      include: { completions: { select: { date: true, id: true } } },
    })

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" })
    }

    if (habit.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" })
    }

    const existing = habit.completions.find((c) => c.date === today)

    if (existing) {
      // Unmark
      await prisma.habitCompletion.delete({ where: { id: existing.id } })
    } else {
      // Mark complete
      await prisma.habitCompletion.create({
        data: { habitId: id, date: today },
      })
    }

    // Return updated habit
    const updated = await prisma.habit.findUnique({
      where: { id },
      include: { completions: { select: { date: true, id: true } } },
    })

    res.json({ habit: enrichHabit(updated), completed: !existing })
  } catch (err) {
    console.error("Toggle completion error:", err)
    res.status(500).json({ message: "Failed to toggle completion" })
  }
}

// GET /api/habits/:id/history?weeks=12
const getHabitHistory = async (req, res) => {
  try {
    const { id } = req.params
    const weeks = parseInt(req.query.weeks) || 12

    const habit = await prisma.habit.findUnique({ where: { id } })
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" })
    }

    if (habit.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" })
    }

    // Get completions for the last N weeks
    const since = new Date()
    since.setDate(since.getDate() - weeks * 7)
    const sinceStr = since.toISOString().split("T")[0]

    const completions = await prisma.habitCompletion.findMany({
      where: { habitId: id, date: { gte: sinceStr } },
      select: { date: true },
      orderBy: { date: "asc" },
    })

    res.json({ completions: completions.map((c) => c.date) })
  } catch (err) {
    console.error("Get habit history error:", err)
    res.status(500).json({ message: "Failed to fetch habit history" })
  }
}

module.exports = {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleCompletion,
  getHabitHistory,
}
