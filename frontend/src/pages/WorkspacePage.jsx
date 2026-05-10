import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  getWorkspace,
  deleteWorkspace,
  removeMember,
} from "../services/workspace.service"
import { getTasks } from "../services/task.service"
import { getNotes } from "../services/note.service"
import { useAuth } from "../context/AuthContext"
import { useWorkspace } from "../context/WorkspaceContext"
import TaskCard from "../components/tasks/TaskCard"
import NoteCard from "../components/notes/NoteCard"
import CreateTaskModal from "../components/tasks/CreateTaskModal"
import NoteEditor from "../components/notes/NoteEditor"
import AddMemberModal from "../components/workspace/AddMemberModal"
import Badge from "../components/ui/Badge"
import Spinner from "../components/ui/Spinner"
import EmptyState from "../components/ui/EmptyState"

export default function WorkspacePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { fetchWorkspaces } = useWorkspace()
  const navigate = useNavigate()

  const [workspace, setWorkspace] = useState(null)
  const [tasks, setTasks] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("tasks")
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showCreateNote, setShowCreateNote] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [wsRes, taskRes, noteRes] = await Promise.all([
        getWorkspace(id),
        getTasks({ workspaceId: id }),
        getNotes({ workspaceId: id }),
      ])
      setWorkspace(wsRes.data.workspace)
      setTasks(taskRes.data.tasks)
      setNotes(noteRes.data.notes)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const handleDelete = async () => {
    if (
      !confirm(`Delete workspace "${workspace.name}"? This cannot be undone.`)
    )
      return
    try {
      await deleteWorkspace(id)
      fetchWorkspaces()
      navigate("/dashboard")
    } catch (err) {
      console.error(err)
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (!confirm("Remove this member?")) return
    try {
      await removeMember(id, memberId)
      load()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!workspace) {
    return <EmptyState icon="🔍" title="Workspace not found" />
  }

  const isOwner = workspace.ownerId === user?.id
  const tabs = [
    { key: "tasks", label: `Tasks (${tasks.length})` },
    { key: "notes", label: `Notes (${notes.length})` },
    { key: "members", label: `Members (${workspace.members?.length ?? 0})` },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Workspace header */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{workspace.emoji}</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {workspace.name}
                </h1>
                <Badge label={workspace.type} variant={workspace.type} />
              </div>
              {workspace.description && (
                <p className="text-sm text-zinc-400 mt-1">
                  {workspace.description}
                </p>
              )}
              <p className="text-xs text-zinc-400 mt-1">
                Created by {workspace.owner?.name}
              </p>
            </div>
          </div>

          {isOwner && (
            <div className="flex items-center gap-2 shrink-0">
              {workspace.type !== "personal" && (
                <button
                  className="btn-secondary text-xs"
                  onClick={() => setShowAddMember(true)}
                >
                  + Add member
                </button>
              )}
              <button className="btn-danger text-xs" onClick={handleDelete}>
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="flex gap-4 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="text-center">
            <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
              {workspace._count?.tasks ?? tasks.length}
            </p>
            <p className="text-xs text-zinc-400">Tasks</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
              {workspace._count?.notes ?? notes.length}
            </p>
            <p className="text-xs text-zinc-400">Notes</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
              {workspace.members?.length ?? 0}
            </p>
            <p className="text-xs text-zinc-400">Members</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "tasks" && (
        <section className="space-y-3">
          <div className="flex justify-end">
            <button
              className="btn-primary"
              onClick={() => setShowCreateTask(true)}
            >
              + New Task
            </button>
          </div>
          {tasks.length > 0 ? (
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
              title="No tasks yet"
              description="Add the first task to this workspace."
              action={
                <button
                  className="btn-primary"
                  onClick={() => setShowCreateTask(true)}
                >
                  + New Task
                </button>
              }
            />
          )}
        </section>
      )}

      {activeTab === "notes" && (
        <section className="space-y-3">
          <div className="flex justify-end">
            <button
              className="btn-primary"
              onClick={() => setShowCreateNote(true)}
            >
              + New Note
            </button>
          </div>
          {notes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onUpdated={load}
                  onDeleted={load}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="📝"
              title="No notes yet"
              description="Capture ideas and plans for this workspace."
              action={
                <button
                  className="btn-primary"
                  onClick={() => setShowCreateNote(true)}
                >
                  + New Note
                </button>
              }
            />
          )}
        </section>
      )}

      {activeTab === "members" && (
        <section className="space-y-3">
          {isOwner && workspace.type !== "personal" && (
            <div className="flex justify-end">
              <button
                className="btn-secondary"
                onClick={() => setShowAddMember(true)}
              >
                + Add Member
              </button>
            </div>
          )}
          <div className="space-y-2">
            {workspace.members?.map((m) => (
              <div
                key={m.id}
                className="card p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-sm font-semibold text-primary-700 dark:text-primary-300">
                    {m.user.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                      {m.user.name}
                    </p>
                    <p className="text-xs text-zinc-400">{m.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {m.user.id === workspace.ownerId && (
                    <Badge label="owner" variant="personal" />
                  )}
                  {isOwner && m.user.id !== user?.id && (
                    <button
                      onClick={() => handleRemoveMember(m.user.id)}
                      className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modals */}
      {showCreateTask && (
        <CreateTaskModal
          defaultWorkspaceId={id}
          onClose={() => setShowCreateTask(false)}
          onCreated={load}
        />
      )}
      {showCreateNote && (
        <NoteEditor
          defaultWorkspaceId={id}
          onClose={() => setShowCreateNote(false)}
          onSaved={load}
        />
      )}
      {showAddMember && (
        <AddMemberModal
          workspaceId={id}
          onClose={() => setShowAddMember(false)}
          onAdded={load}
        />
      )}
    </div>
  )
}
