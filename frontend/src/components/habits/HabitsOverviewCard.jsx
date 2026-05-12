import React from "react"

export default function HabitsOverviewCard({ summary, habits }) {
  const {
    total,
    totalActive,
    completedToday,
    remaining,
    completionPercent,
    allDone,
  } = summary || {}

  const topStreak = habits
    ? Math.max(
        0,
        ...habits.filter((h) => h.isActive).map((h) => h.currentStreak),
      )
    : 0

  return (
    <div className="card p-5 space-y-4">
      {/* All done banner */}
      {allDone && totalActive > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="text-sm font-semibold text-green-700 dark:text-green-300">
              All habits completed for today!
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              Amazing work. Keep the streak going!
            </p>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
            {total ?? 0}
          </p>
          <p className="text-xs text-zinc-400 mt-0.5">Total habits</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {completedToday ?? 0}
          </p>
          <p className="text-xs text-zinc-400 mt-0.5">Done today</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {remaining ?? 0}
          </p>
          <p className="text-xs text-zinc-400 mt-0.5">Remaining</p>
        </div>
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {topStreak > 0 ? `🔥 ${topStreak}` : "—"}
          </p>
          <p className="text-xs text-zinc-400 mt-0.5">Best streak</p>
        </div>
      </div>

      {/* Progress bar */}
      {totalActive > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">Today's progress</span>
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {completionPercent}%
            </span>
          </div>
          <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${completionPercent}%`,
                backgroundColor:
                  completionPercent === 100 ? "#10b981" : "#6470f3",
              }}
            />
          </div>
          <p className="text-xs text-zinc-400">
            {completedToday} of {totalActive} active habits completed
          </p>
        </div>
      )}
    </div>
  )
}
