import React, { useEffect, useState } from "react"
import { getHabitHistory } from "../../services/habit.service"

// Generate last N weeks of dates as a grid (columns = weeks, rows = days Sun-Sat)
const buildCalendarGrid = (weeks = 12) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Find the Sunday of the current week
  const dayOfWeek = today.getDay()
  const startOfCurrentWeek = new Date(today)
  startOfCurrentWeek.setDate(today.getDate() - dayOfWeek)

  // Go back (weeks - 1) more weeks
  const start = new Date(startOfCurrentWeek)
  start.setDate(start.getDate() - (weeks - 1) * 7)

  const grid = []
  const cursor = new Date(start)

  for (let w = 0; w < weeks; w++) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const y = cursor.getFullYear()
      const m = String(cursor.getMonth() + 1).padStart(2, "0")
      const day = String(cursor.getDate()).padStart(2, "0")
      week.push(`${y}-${m}-${day}`)
      cursor.setDate(cursor.getDate() + 1)
    }
    grid.push(week)
  }

  return grid
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"]

function HeatmapCell({ date, completed, color, isToday, isFuture }) {
  let cellClass = "w-4 h-4 rounded-sm transition-all "
  if (isFuture) {
    cellClass += "bg-zinc-100 dark:bg-zinc-800 opacity-30"
  } else if (!completed) {
    cellClass += "bg-zinc-100 dark:bg-zinc-800"
  }
  if (isToday) {
    cellClass += " ring-1 ring-offset-1 ring-zinc-400 dark:ring-zinc-500"
  }

  return (
    <div
      title={`${date}${completed ? " ✓" : ""}`}
      className={cellClass}
      style={
        completed && !isFuture ? { backgroundColor: color || "#6470f3" } : {}
      }
    />
  )
}

export default function HabitProgress({ habit }) {
  const [completedDates, setCompletedDates] = useState(null)
  const [loading, setLoading] = useState(true)
  const weeks = 12
  const grid = buildCalendarGrid(weeks)
  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getHabitHistory(habit.id, weeks)
      .then((res) => {
        if (!cancelled) setCompletedDates(new Set(res.data.completions))
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [habit.id])

  if (loading) {
    return (
      <div className="h-20 flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Month labels: show month name at the start of each month
  const monthLabels = grid.map((week) => {
    const firstDay = new Date(week[0] + "T00:00:00")
    return firstDay.getDate() <= 7
      ? firstDay.toLocaleString("default", { month: "short" })
      : ""
  })

  const legendSteps = [
    { opacity: 0, empty: true },
    { opacity: 0.35, empty: false },
    { opacity: 0.6, empty: false },
    { opacity: 0.85, empty: false },
    { opacity: 1, empty: false },
  ]

  return (
    <div className="space-y-2 overflow-x-auto">
      {/* Month labels */}
      <div className="flex gap-1 pl-5">
        {monthLabels.map((label, i) => (
          <div key={i} className="w-4 text-center shrink-0">
            <span className="text-xs text-zinc-400 leading-none">{label}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1">
          {DAY_LABELS.map((d, i) => (
            <span
              key={i}
              className="text-xs text-zinc-400 w-3 h-4 flex items-center justify-center leading-none"
            >
              {i % 2 === 1 ? d : ""}
            </span>
          ))}
        </div>

        {/* Grid columns = weeks */}
        {grid.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1 shrink-0">
            {week.map((date) => (
              <HeatmapCell
                key={date}
                date={date}
                completed={completedDates?.has(date) ?? false}
                color={habit.color}
                isToday={date === today}
                isFuture={date > today}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 pl-5 pt-1">
        <span className="text-xs text-zinc-400 mr-1">Less</span>
        {legendSteps.map((step, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-sm ${step.empty ? "bg-zinc-100 dark:bg-zinc-800" : ""}`}
            style={
              !step.empty
                ? {
                    backgroundColor: habit.color || "#6470f3",
                    opacity: step.opacity,
                  }
                : {}
            }
          />
        ))}
        <span className="text-xs text-zinc-400 ml-1">More</span>
      </div>
    </div>
  )
}
