import React from "react"
import Badge from "../ui/Badge"
import { updateTask, deleteTask } from "../../services/task.service"

const statusCycle = { pending: "ongoing", ongoing: "done", done: "pending" }
const statusIcon = { pending: "○", ongoing: "◑", done: "●" }

export default function TaskCard({ task, onUpdated, onDeleted }) {
  const handleStatusToggle = async () => {
    try {
      await updateTask(task.id, { status: statusCycle[task.status] })
      onUpdated?.()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Delete this task?")) return
    try {
      await deleteTask(task.id)
      onDeleted?.()
    } catch (err) {
      console.error(err)
    }
  }

  const isOverdue =
    task.dueDate &&
    task.status !== "done" &&
    new Date(task.dueDate) < new Date()

  return (
    <div
      className={`card p-4 group transition-all hover:shadow-md ${task.status === "done" ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Status toggle */}
        <button
          onClick={handleStatusToggle}
          className={`mt-0.5 text-lg shrink-0 transition-colors ${
            task.status === "done"
              ? "text-green-500"
              : task.status === "ongoing"
                ? "text-blue-500"
                : "text-zinc-300 hover:text-zinc-500"
          }`}
          title={`Mark as ${statusCycle[task.status]}`}
        >
          {statusIcon[task.status]}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium text-zinc-800 dark:text-zinc-100 ${task.status === "done" ? "line-through" : ""}`}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <Badge label={task.status} variant={task.status} />
            <Badge label={task.priority} variant={task.priority} />
            {task.workspace && (
              <span className="text-xs text-zinc-400">
                {task.workspace.emoji} {task.workspace.name}
              </span>
            )}
            {task.dueDate && (
              <span
                className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-zinc-400"}`}
              >
                📅 {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
            {task.assignedTo && (
              <span className="text-xs text-zinc-400">
                👤 {task.assignedTo.name}
              </span>
            )}
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-500 transition-all text-sm shrink-0"
          title="Delete task"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
