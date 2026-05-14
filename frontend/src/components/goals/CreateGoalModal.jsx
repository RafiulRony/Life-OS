import React, { useState } from "react"
import Modal from "../ui/Modal"
import { createGoal, updateGoal } from "../../services/goal.service"

const ICON_OPTIONS = [
  "🎯",
  "💪",
  "📚",
  "⚖️",
  "💰",
  "🏃",
  "🧘",
  "🌱",
  "🎓",
  "✈️",
  "🏠",
  "❤️",
  "🎵",
  "🖊️",
  "🌍",
  "🔥",
  "⭐",
  "🏆",
  "🧠",
  "🕌",
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
  "#f97316", // orange
  "#06b6d4", // cyan
]

const CATEGORY_OPTIONS = [
  "Health & Fitness",
  "Finance",
  "Education",
  "Personal Growth",
  "Career",
  "Relationships",
  "Spirituality",
  "Travel",
  "Hobbies",
  "Other",
]

const UNIT_PRESETS = [
  "KG",
  "Books",
  "Hours",
  "Days",
  "৳",
  "%",
  "Pages",
  "km",
  "Lessons",
  "Custom",
]

export default function CreateGoalModal({
  goal,
  workspaceId,
  onClose,
  onSaved,
}) {
  const isEdit = !!goal

  const [form, setForm] = useState({
    title: goal?.title || "",
    description: goal?.description || "",
    category: goal?.category || "",
    icon: goal?.icon || "🎯",
    color: goal?.color || "#6470f3",
    targetValue: goal?.targetValue ?? "",
    unit: goal?.unit || "",
    customUnit: "",
    startDate: goal?.startDate || "",
    targetDate: goal?.targetDate || "",
  })
  const [unitMode, setUnitMode] = useState(
    goal?.unit && !UNIT_PRESETS.slice(0, -1).includes(goal.unit)
      ? "Custom"
      : goal?.unit || "",
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleUnitSelect = (u) => {
    setUnitMode(u)
    if (u !== "Custom") set("unit", u)
    else set("unit", form.customUnit)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return setError("Title is required")
    if (!form.targetValue || Number(form.targetValue) <= 0)
      return setError("Target value must be greater than 0")
    if (!form.unit.trim()) return setError("Unit is required")

    setLoading(true)
    setError("")
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        category: form.category || undefined,
        icon: form.icon,
        color: form.color,
        targetValue: Number(form.targetValue),
        unit: form.unit.trim(),
        startDate: form.startDate || undefined,
        targetDate: form.targetDate || undefined,
      }

      if (isEdit) {
        await updateGoal(goal.id, payload)
      } else {
        await createGoal({ ...payload, workspaceId })
      }
      onSaved?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save goal")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={isEdit ? "Edit Goal" : "New Goal"}
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        {/* Icon + Title row */}
        <div className="flex gap-3">
          {/* Icon picker */}
          <div className="shrink-0">
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">
              Icon
            </label>
            <div className="relative group">
              <button
                type="button"
                className="w-11 h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xl hover:border-primary-400 transition-colors"
                style={{ backgroundColor: form.color + "20" }}
              >
                {form.icon}
              </button>
              {/* Dropdown */}
              <div className="absolute left-0 top-full mt-1 z-10 hidden group-focus-within:grid grid-cols-5 gap-1 p-2 bg-white dark:bg-surface-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-lg w-44">
                {ICON_OPTIONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => set("icon", ic)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-base hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors ${
                      form.icon === ic
                        ? "bg-primary-50 dark:bg-primary-900/30"
                        : ""
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              className="input"
              placeholder="e.g. Read 20 Books"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Icon grid (always visible) */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1.5">
            Choose Icon
          </label>
          <div className="flex flex-wrap gap-1.5">
            {ICON_OPTIONS.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => set("icon", ic)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                  form.icon === ic
                    ? "ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/30"
                    : "bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                }`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1.5">
            Color
          </label>
          <div className="flex gap-2 flex-wrap">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set("color", c)}
                className={`w-7 h-7 rounded-full transition-all active:scale-90 ${
                  form.color === c
                    ? "ring-2 ring-offset-2 ring-zinc-400 scale-110"
                    : ""
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Target + Unit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">
              Target Value <span className="text-red-400">*</span>
            </label>
            <input
              className="input"
              type="number"
              min="0.01"
              step="any"
              placeholder="e.g. 20"
              value={form.targetValue}
              onChange={(e) => set("targetValue", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">
              Unit <span className="text-red-400">*</span>
            </label>
            <input
              className="input"
              placeholder="e.g. Books, KG, ৳"
              value={form.unit}
              onChange={(e) => set("unit", e.target.value)}
            />
          </div>
        </div>

        {/* Unit presets */}
        <div className="flex flex-wrap gap-1.5">
          {UNIT_PRESETS.slice(0, -1).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => {
                set("unit", u)
                setUnitMode(u)
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                form.unit === u
                  ? "bg-primary-600 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {u}
            </button>
          ))}
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1.5">
            Category
          </label>
          <select
            className="input"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            <option value="">Select category (optional)</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">
              Start Date
            </label>
            <input
              className="input"
              type="date"
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">
              Target Date
            </label>
            <input
              className="input"
              type="date"
              value={form.targetDate}
              onChange={(e) => set("targetDate", e.target.value)}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1.5">
            Description
          </label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Optional notes about this goal…"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            className="btn-secondary flex-1"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex-1"
            disabled={loading}
          >
            {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Goal"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
