import React from "react"
import { useTheme } from "../../context/ThemeContext"
import { useWorkspace } from "../../context/WorkspaceContext"

export default function TopBar({ onMenuClick }) {
  const { dark, toggle } = useTheme()
  const { activeWorkspace } = useWorkspace()

  return (
    <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-surface-900 shrink-0">
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        {activeWorkspace && (
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <span>{activeWorkspace.emoji}</span>
            <span className="font-medium text-zinc-700 dark:text-zinc-200">
              {activeWorkspace.name}
            </span>
          </div>
        )}
      </div>

      {/* Right: theme toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-base"
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {dark ? "☀️" : "🌙"}
        </button>
      </div>
    </header>
  )
}
