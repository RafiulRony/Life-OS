import React, { useState } from "react"
import { deleteGoal, updateGoal } from "../../services/goal.service"
import UpdateProgressModal from "./UpdateProgressModal"

const STATUS_CONFIG = {
  active: {
    label: "Active",
    className:
      "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  },
  completed: {
    label: "Completed",
    className:
      "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  },
  paused: {
    label: "Paused",
    className:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  },
}

export default function GoalCard({ goal, onUpdated, onDeleted, onEdit }) {
  const [showProgress, setShowProgress] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)

  const percent = goal.percent ?? 0
  const remaining =
    goal.remaining ?? Math.max(goal.targetValue - goal.currentValue, 0)
  const status = STATUS_CONFIG[goal.status] || STATUS_CONFIG.active

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm(`Delete "${goal.title}"? This cannot be undone.`)) return
    try {
      await deleteGoal(goal.id)
      onDeleted?.()
    } catch (err) {
      console.error(err)
    }
  }

  const handleStatusChange = async (newStatus) => {
    if (statusLoading) return
    setStatusLoading(true)
    try {
      await updateGoal(goal.id, { status: newStatus })
      onUpdated?.()
    } catch (err) {
      console.error(err)
    } finally {
      setStatusLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return null
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const isOverdue =
    goal.targetDate &&
    goal.status === "active" &&
    new Date(goal.targetDate + "T00:00:00") < new Date()

  return (
    <>
      <div className="card p-4 group hover:shadow-md transition-all duration-200">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: (goal.color || "#6470f3") + "20" }}
          >
            {goal.icon || "🎯"}
          </div>

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate">
                  {goal.title}
                </h3>
                {goal.category && (
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {goal.category}
                  </p>
                )}
              </div>
              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {goal.status !== "completed" && goal.status !== "cancelled" && (
                  <button
                    onClick={() => setShowProgress(true)}
                    className="text-xs px-2 py-1 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 transition-colors font-medium"
                    title="Update progress"
                  >
                    +
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit?.(goal)
                  }}
                  className="text-xs px-2 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  title="Edit goal"
                >
                  ✎
                </button>
                <button
                  onClick={handleDelete}
                  className="text-xs px-2 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-400 hover:bg-red-100 transition-colors"
                  title="Delete goal"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.className}`}
              >
                {status.label}
              </span>
              {goal.targetDate && (
                <span
                  className={`text-[10px] ${isOverdue ? "text-red-500" : "text-zinc-400"}`}
                >
                  {isOverdue ? "⚠ Overdue · " : ""}Due{" "}
                  {formatDate(goal.targetDate)}
                </span>
              )}
              {goal.status === "completed" && goal.completedAt && (
                <span className="text-[10px] text-green-500">
                  ✓ Completed{" "}
                  {new Date(goal.completedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress section */}
        <div className="mt-4 space-y-2">
          {/* Values */}
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
                {goal.currentValue}
              </span>
              <span className="text-sm text-zinc-400 ml-1">{goal.unit}</span>
            </div>
            <div className="text-right">
              <span
                className="text-sm font-semibold"
                style={{ color: goal.color || "#6470f3" }}
              >
                {percent}%
              </span>
              <p className="text-[10px] text-zinc-400">
                {remaining > 0
                  ? `${remaining} ${goal.unit} left`
                  : "Goal reached!"}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${percent}%`,
                backgroundColor: goal.color || "#6470f3",
              }}
            />
          </div>

          {/* Target */}
          <div className="flex justify-between text-[10px] text-zinc-400">
            <span>0 {goal.unit}</span>
            <span>
              Target: {goal.targetValue} {goal.unit}
            </span>
          </div>
        </div>

        {/* Description */}
        {goal.description && (
          <p className="mt-3 text-xs text-zinc-400 line-clamp-2">
            {goal.description}
          </p>
        )}

        {/* Quick status actions for active goals */}
        {goal.status === "active" && (
          <div className="mt-3 pt-3 border-t border-zinc-50 dark:border-zinc-800 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleStatusChange("paused")}
              disabled={statusLoading}
              className="text-[10px] px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 transition-colors font-medium"
            >
              Pause
            </button>
            <button
              onClick={() => handleStatusChange("cancelled")}
              disabled={statusLoading}
              className="text-[10px] px-2 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Resume button for paused goals */}
        {goal.status === "paused" && (
          <div className="mt-3 pt-3 border-t border-zinc-50 dark:border-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleStatusChange("active")}
              disabled={statusLoading}
              className="text-[10px] px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors font-medium"
            >
              Resume
            </button>
          </div>
        )}
      </div>

      {showProgress && (
        <UpdateProgressModal
          goal={goal}
          onClose={() => setShowProgress(false)}
          onUpdated={() => {
            setShowProgress(false)
            onUpdated?.()
          }}
        />
      )}
    </>
  )
}
