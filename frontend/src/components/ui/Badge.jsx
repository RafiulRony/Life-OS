import React from "react"

const variants = {
  pending:
    "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  ongoing: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  done: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  high: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300",
  medium: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
  low: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  personal:
    "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  family: "bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  friends: "bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  community:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
}

export default function Badge({ label, variant }) {
  const cls = variants[variant] || "bg-zinc-100 text-zinc-600"
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  )
}
