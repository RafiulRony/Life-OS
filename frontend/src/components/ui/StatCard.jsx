import React from "react"

export default function StatCard({ icon, label, value, color = "primary" }) {
  const colors = {
    primary:
      "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400",
    green:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  }

  return (
    <div className="card p-4 flex items-center gap-4">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${colors[color]}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
          {value}
        </p>
        <p className="text-xs text-zinc-400">{label}</p>
      </div>
    </div>
  )
}
