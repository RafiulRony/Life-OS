import React, { useEffect, useState, useCallback } from "react"
import { getHabits } from "../services/habit.service"
import { useWorkspace } from "../context/WorkspaceContext"
import HabitsOverviewCard from "../components/habits/HabitsOverviewCard"
import HabitCard from "../components/habits/HabitCard"
import CreateHabitModal from "../components/habits/CreateHabitModal"
import HabitProgress from "../components/habits/HabitProgress"
import Spinner from "../components/ui/Spinner"
import EmptyState from "../components/ui/EmptyState"

export default function HabitsPage() {
  const { workspaces } = useWorkspace()
  const [habits, setHabits] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [expandedHabitId, setExpandedHabitId] = useState(null)
  const [error, setError] = useState("")

  // Find personal workspace
  const personalWorkspace = workspaces.find((w) => w.type === "personal")

  const load = useCallback(async () => {
    if (!personalWorkspace) return
    setLoading(true)
    setError("")
    try {
      const res = await getHabits({ workspaceId: personalWorkspace.id })
      setHabits(res.data.habits)
      setSummary(res.data.summary)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || "Failed to load habits")
    } finally {
      setLoading(false)
    }
  }, [personalWorkspace])

  useEffect(() => {
    load()
  }, [load])

  const handleEdit = (habit) => {
    setEditingHabit(habit)
    setShowCreate(true)
  }

  const handleCloseModal = () => {
    setShowCreate(false)
    setEditingHabit(null)
  }

  const activeHabits = habits.filter((h) => h.isActive)
  const inactiveHabits = habits.filter((h) => !h.isActive)

  if (!personalWorkspace) {
    return (
      <div className="max-w-4xl mx-auto">
        <EmptyState
          icon="🏠"
          title="No Personal Workspace"
          description="Habits are only available in your Personal workspace. Please create one first."
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
            Habits
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            {personalWorkspace.emoji} {personalWorkspace.name}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          + New Habit
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : habits.length === 0 ? (
        <EmptyState
          icon="✨"
          title="No habits yet"
          description="Start building positive routines. Track daily habits and build streaks."
          action={
            <button className="btn-primary" onClick={() => setShowCreate(true)}>
              + Create Your First Habit
            </button>
          }
        />
      ) : (
        <>
          {/* Overview card */}
          <HabitsOverviewCard summary={summary} habits={habits} />

          {/* Active habits */}
          {activeHabits.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
                Active Habits
              </h2>
              {activeHabits.map((habit) => (
                <div key={habit.id} className="space-y-2">
                  <HabitCard
                    habit={habit}
                    onUpdated={load}
                    onDeleted={load}
                    onEdit={handleEdit}
                  />
                  {/* Expandable progress */}
                  <div className="pl-4">
                    <button
                      onClick={() =>
                        setExpandedHabitId(
                          expandedHabitId === habit.id ? null : habit.id,
                        )
                      }
                      className="text-xs text-zinc-400 hover:text-primary-600 transition-colors flex items-center gap-1"
                    >
                      {expandedHabitId === habit.id ? "▼" : "▶"} View progress
                    </button>
                    {expandedHabitId === habit.id && (
                      <div className="mt-3 card p-4">
                        <HabitProgress habit={habit} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Inactive habits */}
          {inactiveHabits.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
                Paused Habits
              </h2>
              {inactiveHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onUpdated={load}
                  onDeleted={load}
                  onEdit={handleEdit}
                />
              ))}
            </section>
          )}
        </>
      )}

      {showCreate && (
        <CreateHabitModal
          habit={editingHabit}
          workspaceId={personalWorkspace.id}
          onClose={handleCloseModal}
          onSaved={load}
        />
      )}
    </div>
  )
}
