import React from "react"
import { Link } from "react-router-dom"

function GoalRow({ goal }) {
  const percent = goal.percent ?? 0

  return (
    <div className="py-2.5 border-b border-zinc-50 dark:border-zinc-800 last:border-0">
      <div className="flex items-center gap-2.5 mb-1.5">
        <span className="text-base leading-none shrink-0">
          {goal.icon || "🎯"}
        </span>
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200 flex-1 min-w-0 truncate">
          {goal.title}
        </span>
        <span
          className="text-xs font-semibold shrink-0"
          style={{ color: goal.color || "#6470f3" }}
        >
          {percent}%
        </span>
      </div>
      <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden ml-7">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            backgroundColor: goal.color || "#6470f3",
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-zinc-400 mt-0.5 ml-7">
        <span>
          {goal.currentValue} {goal.unit}
        </span>
        <span>
          {goal.targetValue} {goal.unit}
        </span>
      </div>
    </div>
  )
}

export default function DashboardGoals({ goals, summary }) {
  if (!goals || goals.length === 0) return null

  const { active, completed, overallPercent } = summary || {}

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
          Active Goals
        </h2>
        <Link to="/goals" className="text-xs text-primary-600 hover:underline">
          View all →
        </Link>
      </div>

      <div className="card p-4">
        {/* Mini summary */}
        <div className="flex items-center gap-4 mb-3 pb-3 border-b border-zinc-50 dark:border-zinc-800">
          <div className="flex-1">
            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-primary-500 transition-all duration-700"
                style={{ width: `${overallPercent || 0}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 shrink-0">
            {overallPercent || 0}% overall
          </span>
          {completed > 0 && (
            <span className="text-xs text-green-500 shrink-0">
              {completed} done
            </span>
          )}
        </div>

        {goals.slice(0, 4).map((goal) => (
          <GoalRow key={goal.id} goal={goal} />
        ))}

        {goals.length > 4 && (
          <Link
            to="/goals"
            className="block text-center text-xs text-zinc-400 hover:text-primary-600 mt-2 pt-2 border-t border-zinc-50 dark:border-zinc-800 transition-colors"
          >
            +{goals.length - 4} more goals
          </Link>
        )}
      </div>
    </section>
  )
}
