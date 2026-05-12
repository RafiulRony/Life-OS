import React, { useState } from "react"
import { Link } from "react-router-dom"
import { toggleHabitCompletion } from "../../services/habit.service"

function HabitRow({ habit, onToggled }) {
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    if (loading) return
    setLoading(true)
    try {
      await toggleHabitCompletion(habit.id)
      onToggled?.()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-zinc-50 dark:border-zinc-800 last:border-0">
      {/* Toggle button */}
      <button
        onClick={handleToggle}
        disabled={loading}
        aria-label={habit.completedToday ? "Mark incomplete" : "Mark complete"}
        className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-200 active:scale-90 ${
          loading ? "opacity-40" : ""
        } ${
          habit.completedToday
            ? "border-transparent text-white"
            : "border-zinc-200 dark:border-zinc-700 text-transparent hover:border-zinc-400 dark:hover:border-zinc-500"
        }`}
        style={
          habit.completedToday
            ? { backgroundColor: habit.color || "#6470f3" }
            : {}
        }
      >
        {habit.completedToday ? "✓" : ""}
      </button>

      {/* Emoji + title */}
      <span className="text-base leading-none shrink-0">
        {habit.emoji || "✨"}
      </span>
      <span
        className={`text-sm flex-1 min-w-0 truncate transition-colors ${
          habit.completedToday
            ? "line-through text-zinc-400 dark:text-zinc-500"
            : "text-zinc-700 dark:text-zinc-200"
        }`}
      >
        {habit.title}
      </span>

      {/* Done badge */}
      {habit.completedToday && (
        <span className="text-xs text-green-500 font-medium shrink-0">
          Done
        </span>
      )}
    </div>
  )
}

export default function DashboardHabits({ habits, summary, onRefresh }) {
  if (!habits || habits.length === 0) return null

  const { completed, total, percent, allDone } = summary || {}

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
          Today's Habits
        </h2>
        <Link to="/habits" className="text-xs text-primary-600 hover:underline">
          View all
        </Link>
      </div>

      <div className="card p-4 space-y-3">
        {/* Progress bar + count */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              {completed} of {total} completed
            </span>
            <span
              className={`text-xs font-semibold ${
                allDone
                  ? "text-green-500"
                  : percent > 0
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-zinc-400"
              }`}
            >
              {percent}%
            </span>
          </div>
          <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${percent}%`,
                backgroundColor: allDone ? "#10b981" : "#6470f3",
              }}
            />
          </div>
        </div>

        {/* All done banner */}
        {allDone && (
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 rounded-xl px-3 py-2">
            <span className="text-lg">🎉</span>
            <p className="text-xs font-medium text-green-700 dark:text-green-300">
              All habits completed for today!
            </p>
          </div>
        )}

        {/* Habit rows */}
        <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
          {habits.map((habit) => (
            <HabitRow key={habit.id} habit={habit} onToggled={onRefresh} />
          ))}
        </div>
      </div>
    </section>
  )
}
