import React, { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useWorkspace } from "../../context/WorkspaceContext"
import CreateWorkspaceModal from "../workspace/CreateWorkspaceModal"

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
        isActive
          ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
      }`
    }
  >
    <span className="text-base">{icon}</span>
    <span>{label}</span>
  </NavLink>
)

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const { workspaces, activeWorkspace, selectWorkspace, fetchWorkspaces } =
    useWorkspace()
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const workspaceTypeEmoji = {
    personal: "🏠",
    family: "👨‍👩‍👧",
    friends: "👥",
    community: "🌍",
  }

  return (
    <>
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 flex flex-col
          bg-white dark:bg-surface-900
          border-r border-zinc-100 dark:border-zinc-800
          transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-5 border-b border-zinc-100 dark:border-zinc-800">
          <span className="text-2xl">🧩</span>
          <div>
            <h1 className="text-base font-bold text-zinc-900 dark:text-white leading-tight">
              LifeOS
            </h1>
            <p className="text-xs text-zinc-400">v2</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <NavItem to="/dashboard" icon="🏡" label="Dashboard" />
          <NavItem to="/tasks" icon="✅" label="Tasks" />
          <NavItem to="/notes" icon="📝" label="Notes" />

          {/* Workspaces */}
          <div className="pt-4">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Workspaces
              </span>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-zinc-400 hover:text-primary-600 transition-colors text-lg leading-none"
                title="New workspace"
              >
                +
              </button>
            </div>

            <div className="space-y-0.5">
              {workspaces.map((ws) => (
                <NavLink
                  key={ws.id}
                  to={`/workspaces/${ws.id}`}
                  onClick={() => selectWorkspace(ws)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150 ${
                      isActive
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    }`
                  }
                >
                  <span>{ws.emoji || workspaceTypeEmoji[ws.type] || "📁"}</span>
                  <span className="truncate">{ws.name}</span>
                  {ws._count && (
                    <span className="ml-auto text-xs text-zinc-400">
                      {ws._count.tasks}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-sm font-semibold text-primary-700 dark:text-primary-300 shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-zinc-400 hover:text-red-500 transition-colors text-sm"
              title="Sign out"
            >
              ↩
            </button>
          </div>
        </div>
      </aside>

      {showCreateModal && (
        <CreateWorkspaceModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            fetchWorkspaces()
            setShowCreateModal(false)
          }}
        />
      )}
    </>
  )
}
