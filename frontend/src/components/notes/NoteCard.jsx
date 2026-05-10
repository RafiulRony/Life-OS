import React from "react"
import { updateNote, deleteNote } from "../../services/note.service"

export default function NoteCard({ note, onUpdated, onDeleted, onClick }) {
  const handlePin = async (e) => {
    e.stopPropagation()
    try {
      await updateNote(note.id, { isPinned: !note.isPinned })
      onUpdated?.()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm("Delete this note?")) return
    try {
      await deleteNote(note.id)
      onDeleted?.()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div
      onClick={onClick}
      className={`card p-4 cursor-pointer group hover:shadow-md transition-all ${
        note.isPinned ? "border-primary-200 dark:border-primary-800" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 line-clamp-1">
          {note.isPinned && <span className="mr-1">📌</span>}
          {note.title}
        </h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={handlePin}
            className={`text-sm transition-colors ${note.isPinned ? "text-primary-500" : "text-zinc-300 hover:text-primary-500"}`}
            title={note.isPinned ? "Unpin" : "Pin"}
          >
            📌
          </button>
          <button
            onClick={handleDelete}
            className="text-zinc-300 hover:text-red-500 transition-colors text-sm"
            title="Delete"
          >
            ✕
          </button>
        </div>
      </div>

      {note.content && (
        <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
          {note.content}
        </p>
      )}

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-zinc-300 dark:text-zinc-600">
          {new Date(note.updatedAt).toLocaleDateString()}
        </span>
        {note.createdBy && (
          <span className="text-xs text-zinc-400">{note.createdBy.name}</span>
        )}
      </div>
    </div>
  )
}
