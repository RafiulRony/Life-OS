import React from "react"

export default function TaskFilters({ filters, onChange }) {
  const set = (k, v) => onChange({ ...filters, [k]: v })

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Status filter */}
      <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
        {["all", "pending", "ongoing", "done"].map((s) => (
          <button
            key={s}
            onClick={() => set("status", s === "all" ? "" : s)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              (filters.status || "all") === s ||
              (!filters.status && s === "all")
                ? "bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Priority filter */}
      <select
        className="input !w-auto text-xs py-1.5"
        value={filters.priority || ""}
        onChange={(e) => set("priority", e.target.value)}
      >
        <option value="">All priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
    </div>
  )
}
