import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getDashboard } from "../services/dashboard.service"
import { useAuth } from "../context/AuthContext"
import StatCard from "../components/ui/StatCard"
import TaskCard from "../components/tasks/TaskCard"
import DashboardHabits from "../components/dashboard/DashboardHabits"
import Spinner from "../components/ui/Spinner"
import EmptyState from "../components/ui/EmptyState"
import CreateTaskModal from "../components/tasks/CreateTaskModal"
import Badge from "../components/ui/Badge"

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateTask, setShowCreateTask] = useState(false)

  const load = async () => {
    try {
      const res = await getDashboard()
      setData(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 17) return "Good afternoon"
    return "Good evening"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  const {
    stats,
    todayTasks,
    ongoingTasks,
    completedTasks,
    workspaces,
    todayHabits,
    habitSummary,
  } = data || {}

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {greeting()}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateTask(true)}>
          + New Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon="✅"
          label="Total tasks"
          value={stats?.totalTasks ?? 0}
          color="primary"
        />
        <StatCard
          icon="🎯"
          label="Completed"
          value={stats?.doneTasks ?? 0}
          color="green"
        />
        <StatCard
          icon="⏳"
          label="Pending"
          value={stats?.pendingTasks ?? 0}
          color="amber"
        />
        <StatCard
          icon="📝"
          label="Notes"
          value={stats?.totalNotes ?? 0}
          color="blue"
        />
      </div>

      {/* Today's Habits */}
      <DashboardHabits
        habits={todayHabits}
        summary={habitSummary}
        onRefresh={load}
      />

      {/* Workspaces overview */}
      {workspaces?.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Your Spaces
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {workspaces.map((ws) => (
              <Link
                key={ws.id}
                to={`/workspaces/${ws.id}`}
                className="card p-4 hover:shadow-md transition-all flex items-center gap-3"
              >
                <span className="text-2xl">{ws.emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate">
                    {ws.name}
                  </p>
                  <Badge label={ws.type} variant={ws.type} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Today's tasks */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
            Today & Overdue
          </h2>
          <Link
            to="/tasks"
            className="text-xs text-primary-600 hover:underline"
          >
            View all
          </Link>
        </div>
        {todayTasks?.length > 0 ? (
          <div className="space-y-2">
            {todayTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdated={load}
                onDeleted={load}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🌿"
            title="All clear for today"
            description="No tasks due today. Enjoy the calm."
          />
        )}
      </section>

      {/* Ongoing tasks */}
      {ongoingTasks?.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            In Progress
          </h2>
          <div className="space-y-2">
            {ongoingTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdated={load}
                onDeleted={load}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recently completed */}
      {completedTasks?.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Recently Done
          </h2>
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdated={load}
                onDeleted={load}
              />
            ))}
          </div>
        </section>
      )}

      {showCreateTask && (
        <CreateTaskModal
          onClose={() => setShowCreateTask(false)}
          onCreated={load}
        />
      )}
    </div>
  )
}
