import React, { useEffect, useState, useCallback } from "react"
import { getGoals } from "../services/goal.service"
import { useWorkspace } from "../context/WorkspaceContext"
import GoalCard from "../components/goals/GoalCard"
import GoalsOverviewCard from "../components/goals/GoalsOverviewCard"
import CreateGoalModal from "../components/goals/CreateGoalModal"
import Spinner from "../components/ui/Spinner"
import EmptyState from "../components/ui/EmptyState"

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "paused", label: "Paused" },
  { value: "cancelled", label: "Cancelled" },
]

export default function GoalsPage() {
  const { workspaces } = useWorkspace()
  const [goals, setGoals] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [statusFilter, setStatusFilter] = useState("")
  const [error, setError] = useState("")

  const personalWorkspace = workspaces.find((w) => w.type === "personal")

  const load = useCallback(async () => {
    if (!personalWorkspace) return
    setLoading(true)
    setError("")
    try {
      const params = { workspaceId: personalWorkspace.id }
      if (statusFilter) params.status = statusFilter
      const res = await getGoals(params)
      setGoals(res.data.goals)
      setSummary(res.data.summary)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || "Failed to load goals")
    } finally {
      setLoading(false)
    }
  }, [personalWorkspace, statusFilter])

  useEffect(() => {
    load()
  }, [load])

  const handleEdit = (goal) => {
    setEditingGoal(goal)
    setShowCreate(true)
  }

  const handleCloseModal = () => {
    setShowCreate(false)
    setEditingGoal(null)
  }

  if (!personalWorkspace) {
    return (
      <div className="max-w-4xl mx-auto">
        <EmptyState
          icon="🏠"
          title="No Personal Workspace"
          description="Goals are only available in your Personal workspace. Please create one first."
        />
      </div>
    )
  }

  const activeGoals = goals.filter((g) => g.status === "active")
  const completedGoals = goals.filter((g) => g.status === "completed")
  const pausedGoals = goals.filter((g) => g.status === "paused")
  const cancelledGoals = goals.filter((g) => g.status === "cancelled")

  const groupedGoals =
    statusFilter === ""
      ? [
          { label: "Active", items: activeGoals, show: activeGoals.length > 0 },
          { label: "Paused", items: pausedGoals, show: pausedGoals.length > 0 },
          {
            label: "Completed",
            items: completedGoals,
            show: completedGoals.length > 0,
          },
          {
            label: "Cancelled",
            items: cancelledGoals,
            show: cancelledGoals.length > 0,
          },
        ]
      : [{ label: null, items: goals, show: true }]

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
            Goals
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            {personalWorkspace.emoji} {personalWorkspace.name}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          + New Goal
        </button>
      </div>

      {/* Overview card */}
      {summary && summary.total > 0 && <GoalsOverviewCard summary={summary} />}

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              statusFilter === value
                ? "bg-primary-600 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {label}
            {value === "" && summary ? ` (${summary.total})` : ""}
            {value === "active" && summary ? ` (${summary.active})` : ""}
            {value === "completed" && summary ? ` (${summary.completed})` : ""}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl">
          {error}
        </p>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Spinner size="lg" />
        </div>
      ) : goals.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="No goals yet"
          description="Set your first long-term goal and start tracking your progress."
          action={
            <button
              className="btn-primary mt-2"
              onClick={() => setShowCreate(true)}
            >
              + Create Goal
            </button>
          }
        />
      ) : (
        <div className="space-y-6">
          {groupedGoals
            .filter((g) => g.show)
            .map(({ label, items }) => (
              <div key={label || "all"}>
                {label && (
                  <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                    {label} · {items.length}
                  </h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {items.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onUpdated={load}
                      onDeleted={load}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Create / Edit modal */}
      {showCreate && (
        <CreateGoalModal
          goal={editingGoal}
          workspaceId={personalWorkspace.id}
          onClose={handleCloseModal}
          onSaved={load}
        />
      )}
    </div>
  )
}
