import React, { useState } from "react"
import Modal from "../ui/Modal"
import { createWorkspace } from "../../services/workspace.service"

const TYPES = [
  { value: "personal", label: "Personal", emoji: "🏠", desc: "Just for you" },
  {
    value: "family",
    label: "Family",
    emoji: "👨‍👩‍👧",
    desc: "Family coordination",
  },
  { value: "friends", label: "Friends", emoji: "👥", desc: "Friend group" },
  {
    value: "community",
    label: "Community",
    emoji: "🌍",
    desc: "Community & volunteers",
  },
]

export default function CreateWorkspaceModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    type: "personal",
    description: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const selectedType = TYPES.find((t) => t.value === form.type)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError("Name is required")
    setLoading(true)
    setError("")
    try {
      await createWorkspace({
        ...form,
        emoji: selectedType?.emoji,
      })
      onCreated?.()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create workspace")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="New Workspace" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">
            Name *
          </label>
          <input
            className="input"
            placeholder="e.g. Family Hub, Study Group…"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-2">
            Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => set("type", t.value)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                  form.type === t.value
                    ? "border-primary-400 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-600"
                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                }`}
              >
                <span className="text-xl">{t.emoji}</span>
                <div>
                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                    {t.label}
                  </p>
                  <p className="text-xs text-zinc-400">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">
            Description
          </label>
          <input
            className="input"
            placeholder="What's this workspace for?"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating…" : "Create Workspace"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
