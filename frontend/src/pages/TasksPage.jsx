import React, { useEffect, useState, useCallback } from "react"
import { getTasks } from "../services/task.service"
import { useWorkspace } from "../context/WorkspaceContext"
import TaskCard from "../components/tasks/TaskCard"
import TaskFilters from "../components/tasks/TaskFilters"
import CreateTaskModal from "../components/tasks/CreateTaskModal"
import Spinner from "../components/ui/Spinner"
import EmptyState from "../components/ui/EmptyState"

export default function TasksPage() {
  const { workspaces, activeWorkspace } = useWorkspace()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("")
  const [filters, setFilters] = useState({ status: "", priority: "" })

  const workspaceId =
    selectedWorkspaceId || activeWorkspace?.id || workspaces[0]?.id

  const load = useCallback(async () => {
    if (!workspaceId) return
    setLoading(true)
    try {
      const params = { workspaceId }
      if (filters.status) params.status = filters.status
      if (filters.priority) params.priority = filters.priority
      const res = await getTasks(params)
      setTasks(res.data.tasks)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [workspaceId, filters])

  useEffect(() => {
    load()
  }, [load])

  const currentWorkspace = workspaces.find((w) => w.id === workspaceId)

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
            Tasks
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            {currentWorkspace
              ? `${currentWorkspace.emoji} ${currentWorkspace.name}`
              : "All tasks"}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          + New Task
        </button>
      </div>

      {/* Workspace selector */}
      {workspaces.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => setSelectedWorkspaceId(ws.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                workspaceId === ws.id
                  ? "bg-primary-600 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {ws.emoji} {ws.name}
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <TaskFilters filters={filters} onChange={setFilters} />

      {/* Task list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : tasks.length > 0 ? (
        <div className="space-y-2">
          {tasks.map((task) => (
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
          icon="✅"
          title="No tasks here"
          description="Create your first task to get started."
          action={
            <button className="btn-primary" onClick={() => setShowCreate(true)}>
              + New Task
            </button>
          }
        />
      )}

      {showCreate && (
        <CreateTaskModal
          defaultWorkspaceId={workspaceId}
          onClose={() => setShowCreate(false)}
          onCreated={load}
        />
      )}
    </div>
  )
}
