import React, { useState } from "react"
import Modal from "../ui/Modal"
import { createHabit, updateHabit } from "../../services/habit.service"

const EMOJI_OPTIONS = [
  "✨",
  "💧",
  "📖",
  "🏃",
  "🙏",
  "😴",
  "🧘",
  "🎯",
  "💪",
  "🥗",
  "☕",
  "🎨",
  "🎵",
  "📝",
  "🌱",
  "🔥",
]

const COLOR_OPTIONS = [
  "#6470f3", // primary
  "#f43f5e", // red
  "#f59e0b", // amber
  "#10b981", // green
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#14b8a6", // teal
]

export default function CreateHabitModal({
  habit,
  workspaceId,
  onClose,
  onSaved,
}) {
  const isEdit = !!habit

  const [form, setForm] = useState({
    title: habit?.title || "",
    description: habit?.description || "",
    emoji: habit?.emoji || "✨",
    color: habit?.color || "#6470f3",
    isActive: habit?.isActive ?? true,
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
      if (isEdit) {
        await updateHabit(habit.id, form)
      } else {
        await createHabit({ ...form, workspaceId })
      }
      onSaved?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save habit")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={isEdit ? "Edit Habit" : "New Habit"} onClose={onClose}>
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
            placeholder="e.g. Drink water, Read book, Exercise"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">
            Description (optional)
          </label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Add some details…"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-2">
            Icon
          </label>
          <div className="flex flex-wrap gap-2">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => set("emoji", emoji)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                  form.emoji === emoji
                    ? "bg-primary-100 dark:bg-primary-900/40 scale-110"
                    : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-2">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => set("color", color)}
                className={`w-10 h-10 rounded-xl transition-all ${
                  form.color === color
                    ? "ring-2 ring-offset-2 ring-zinc-400 dark:ring-zinc-500 scale-110"
                    : "hover:scale-105"
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {isEdit && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="w-4 h-4 rounded border-zinc-300 text-primary-600 focus:ring-primary-500"
            />
            <label
              htmlFor="isActive"
              className="text-sm text-zinc-700 dark:text-zinc-300"
            >
              Active (uncheck to pause this habit)
            </label>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Habit"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
