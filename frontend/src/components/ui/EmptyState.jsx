import React from "react"

export default function EmptyState({
  icon = "📭",
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl mb-3">{icon}</span>
      <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-zinc-400 max-w-xs mb-4">{description}</p>
      )}
      {action}
    </div>
  )
}
