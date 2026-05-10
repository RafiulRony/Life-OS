import React, { useEffect, useState, useCallback } from "react"
import { getNotes } from "../services/note.service"
import { useWorkspace } from "../context/WorkspaceContext"
import NoteCard from "../components/notes/NoteCard"
import NoteEditor from "../components/notes/NoteEditor"
import Spinner from "../components/ui/Spinner"
import EmptyState from "../components/ui/EmptyState"

export default function NotesPage() {
  const { workspaces, activeWorkspace } = useWorkspace()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("")

  const workspaceId =
    selectedWorkspaceId || activeWorkspace?.id || workspaces[0]?.id

  const load = useCallback(async () => {
    if (!workspaceId) return
    setLoading(true)
    try {
      const res = await getNotes({ workspaceId })
      setNotes(res.data.notes)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    load()
  }, [load])

  const handleEdit = (note) => {
    setEditingNote(note)
    setShowEditor(true)
  }

  const handleClose = () => {
    setShowEditor(false)
    setEditingNote(null)
  }

  const currentWorkspace = workspaces.find((w) => w.id === workspaceId)
  const pinned = notes.filter((n) => n.isPinned)
  const unpinned = notes.filter((n) => !n.isPinned)

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
            Notes
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            {currentWorkspace
              ? `${currentWorkspace.emoji} ${currentWorkspace.name}`
              : ""}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowEditor(true)}>
          + New Note
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

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No notes yet"
          description="Capture ideas, plans, and thoughts."
          action={
            <button className="btn-primary" onClick={() => setShowEditor(true)}>
              + New Note
            </button>
          }
        />
      ) : (
        <>
          {/* Pinned */}
          {pinned.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                📌 Pinned
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pinned.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onUpdated={load}
                    onDeleted={load}
                    onClick={() => handleEdit(note)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* All notes */}
          {unpinned.length > 0 && (
            <section>
              {pinned.length > 0 && (
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                  All Notes
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {unpinned.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onUpdated={load}
                    onDeleted={load}
                    onClick={() => handleEdit(note)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {showEditor && (
        <NoteEditor
          note={editingNote}
          defaultWorkspaceId={workspaceId}
          onClose={handleClose}
          onSaved={load}
        />
      )}
    </div>
  )
}
