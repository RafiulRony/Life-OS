import React, { useState } from "react"
import {
  toggleHabitCompletion,
  deleteHabit,
} from "../../services/habit.service"

export default function HabitCard({ habit, onUpdated, onDeleted, onEdit }) {
  const [toggling, setToggling] = useState(false)

  const handleToggle = async (e) => {
    e.stopPropagation()
    if (toggling) return
    setToggling(true)
    try {
      await toggleHabitCompletion(habit.id)
      onUpdated?.()
    } catch (err) {
      console.error(err)
    } finally {
      setToggling(false)
    }
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm(`Delete "${habit.title}"?`)) return
    try {
      await deleteHabit(habit.id)
      onDeleted?.()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    onEdit?.(habit)
  }

  const done = habit.completedToday
  const inactive = !habit.isActive

  return (
    <div
      className={`card p-4 group transition-all hover:shadow-md ${
        inactive ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Completion toggle */}
        <button
          onClick={handleToggle}
          disabled={toggling || inactive}
          className={`shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center text-base transition-all duration-200 active:scale-90 ${
            done
              ? "border-transparent text-white scale-105"
              : "border-zinc-200 dark:border-zinc-700 text-transparent hover:border-zinc-400"
          } ${toggling ? "opacity-50" : ""}`}
          style={done ? { backgroundColor: habit.color || "#6470f3" } : {}}
          title={done ? "Mark incomplete" : "Mark complete"}
          aria-label={done ? "Mark incomplete" : "Mark complete"}
        >
          {done ? "✓" : ""}
        </button>

        {/* Emoji + info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none">{habit.emoji || "✨"}</span>
            <p
              className={`text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate ${
                done ? "line-through text-zinc-400 dark:text-zinc-500" : ""
              }`}
            >
              {habit.title}
            </p>
            {inactive && (
              <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full shrink-0">
                paused
              </span>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {habit.currentStreak > 0 && (
              <span className="text-xs text-amber-500 font-medium flex items-center gap-0.5">
                🔥 {habit.currentStreak}d streak
              </span>
            )}
            <span className="text-xs text-zinc-400">
              ✅ {habit.totalCompleted} total
            </span>
            {habit.longestStreak > 0 && (
              <span className="text-xs text-zinc-400">
                🏆 best {habit.longestStreak}d
              </span>
            )}
            {habit.lastCompleted && (
              <span className="text-xs text-zinc-400">
                last{" "}
                {habit.lastCompleted === new Date().toISOString().split("T")[0]
                  ? "today"
                  : habit.lastCompleted}
              </span>
            )}
          </div>
        </div>

        {/* Color dot */}
        <div
          className="w-2 h-2 rounded-full shrink-0 opacity-60"
          style={{ backgroundColor: habit.color || "#6470f3" }}
        />

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={handleEdit}
            className="text-zinc-300 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors text-sm p-1"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            className="text-zinc-300 hover:text-red-500 transition-colors text-sm p-1"
            title="Delete"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
