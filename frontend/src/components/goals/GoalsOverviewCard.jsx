import React from "react"

export default function GoalsOverviewCard({ summary }) {
  if (!summary) return null

  const { total, active, completed, overallPercent } = summary

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎯</span>
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Goals Overview
          </h2>
        </div>
        <span className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
          {overallPercent}%
        </span>
      </div>

      {/* Overall progress bar */}
      <div className="mb-4">
        <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-primary-500 transition-all duration-700"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          Overall completion across all goals
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
          <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
            {total}
          </p>
          <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wide">
            Total
          </p>
        </div>
        <div className="text-center p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {active}
          </p>
          <p className="text-[10px] text-blue-500 dark:text-blue-400 font-medium uppercase tracking-wide">
            Active
          </p>
        </div>
        <div className="text-center p-2.5 bg-green-50 dark:bg-green-900/20 rounded-xl">
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {completed}
          </p>
          <p className="text-[10px] text-green-500 dark:text-green-400 font-medium uppercase tracking-wide">
            Done
          </p>
        </div>
      </div>
    </div>
  )
}
