import React, { useState } from "react"
import Modal from "../ui/Modal"
import { updateGoalProgress } from "../../services/goal.service"

export default function UpdateProgressModal({ goal, onClose, onUpdated }) {
  const [mode, setMode] = useState("add") // "add" | "subtract" | "set"
  const [value, setValue] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const percent =
    goal.targetValue > 0
      ? Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100)
      : 0

  const previewValue = () => {
    const num = Number(value)
    if (isNaN(num) || value === "") return goal.currentValue
    if (mode === "add")
      return Math.min(goal.currentValue + num, goal.targetValue)
    if (mode === "subtract") return Math.max(goal.currentValue - num, 0)
    return Math.min(Math.max(num, 0), goal.targetValue)
  }

  const previewPercent = () => {
    const pv = previewValue()
    return goal.targetValue > 0
      ? Math.min(Math.round((pv / goal.targetValue) * 100), 100)
      : 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const num = Number(value)
    if (!value || isNaN(num) || num < 0)
      return setError("Enter a valid positive number")
    if (mode !== "set" && num === 0)
      return setError("Value must be greater than 0")

    setLoading(true)
    setError("")
    try {
      await updateGoalProgress(goal.id, {
        value: num,
        mode,
        note: note.trim() || undefined,
      })
      onUpdated?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update progress")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Update Progress" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Goal info */}
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{ backgroundColor: (goal.color || "#6470f3") + "15" }}
        >
          <span className="text-2xl">{goal.icon || "🎯"}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate">
              {goal.title}
            </p>
            <p className="text-xs text-zinc-500">
              {goal.currentValue} / {goal.targetValue} {goal.unit} · {percent}%
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>
              Current: {goal.currentValue} {goal.unit}
            </span>
            <span>
              Target: {goal.targetValue} {goal.unit}
            </span>
          </div>
          <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${percent}%`,
                backgroundColor: goal.color || "#6470f3",
              }}
            />
          </div>
        </div>

        {/* Mode selector */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1.5">
            Update Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "add", label: "+ Add", desc: "Increase" },
              { key: "subtract", label: "− Subtract", desc: "Decrease" },
              { key: "set", label: "= Set", desc: "Exact value" },
            ].map(({ key, label, desc }) => (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition-all border ${
                  mode === key
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
                }`}
              >
                <div className="font-semibold">{label}</div>
                <div className="text-zinc-400 text-[10px]">{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Value input */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1.5">
            {mode === "add"
              ? "Amount to Add"
              : mode === "subtract"
                ? "Amount to Subtract"
                : "New Value"}{" "}
            <span className="text-zinc-400">({goal.unit})</span>
          </label>
          <input
            className="input text-lg font-semibold"
            type="number"
            min="0"
            step="any"
            placeholder="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
        </div>

        {/* Preview */}
        {value !== "" && !isNaN(Number(value)) && (
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl space-y-2">
            <p className="text-xs text-zinc-500 font-medium">Preview</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">
                {goal.currentValue} →{" "}
                <strong className="text-zinc-800 dark:text-zinc-100">
                  {previewValue()}
                </strong>{" "}
                {goal.unit}
              </span>
              <span
                className="font-bold text-base"
                style={{ color: goal.color || "#6470f3" }}
              >
                {previewPercent()}%
              </span>
            </div>
            <div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${previewPercent()}%`,
                  backgroundColor: goal.color || "#6470f3",
                }}
              />
            </div>
            {previewValue() >= goal.targetValue && (
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                🎉 This will complete your goal!
              </p>
            )}
          </div>
        )}

        {/* Note */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1.5">
            Note <span className="text-zinc-400">(optional)</span>
          </label>
          <input
            className="input"
            placeholder="e.g. Finished chapter 3…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

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
            {loading ? "Saving…" : "Update Progress"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
