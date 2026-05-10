import React, { useState } from "react"
import Modal from "../ui/Modal"
import { createTask } from "../../services/task.service"
import { useWorkspace } from "../../context/WorkspaceContext"

export default function CreateTaskModal({
  onClose,
  onCreated,
  defaultWorkspaceId,
}) {
  const { workspaces } = useWorkspace()
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    workspaceId: defaultWorkspaceId || workspaces[0]?.id || "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return setError("Title is required")
    setLoading(true)
    setError("")
    try {
      await createTask({
        ...form,
        dueDate: form.dueDate || undefined,
      })
      onCreated?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="New Task" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">
            Title *
          </label>
          <input
            className="input"
            placeholder="What needs to be done?"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">
            Description
          </label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Add some details…"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              Priority
            </label>
            <select
              className="input"
              value={form.priority}
              onChange={(e) => set("priority", e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              Due date
            </label>
            <input
              type="date"
              className="input"
              value={form.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">
            Workspace
          </label>
          <select
            className="input"
            value={form.workspaceId}
            onChange={(e) => set("workspaceId", e.target.value)}
          >
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.emoji} {ws.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating…" : "Create Task"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
