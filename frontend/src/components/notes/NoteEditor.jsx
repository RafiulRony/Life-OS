import React, { useState, useEffect } from "react"
import Modal from "../ui/Modal"
import { createNote, updateNote } from "../../services/note.service"
import { useWorkspace } from "../../context/WorkspaceContext"

export default function NoteEditor({
  note,
  onClose,
  onSaved,
  defaultWorkspaceId,
}) {
  const { workspaces } = useWorkspace()
  const isEdit = !!note

  const [form, setForm] = useState({
    title: note?.title || "",
    content: note?.content || "",
    workspaceId:
      note?.workspaceId || defaultWorkspaceId || workspaces[0]?.id || "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return setError("Title is required")
    setLoading(true)
    setError("")
    try {
      if (isEdit) {
        await updateNote(note.id, { title: form.title, content: form.content })
      } else {
        await createNote(form)
      }
      onSaved?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save note")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={isEdit ? "Edit Note" : "New Note"}
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <div>
          <input
            className="input text-base font-medium"
            placeholder="Note title…"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <textarea
            className="input resize-none"
            rows={8}
            placeholder="Write your thoughts…"
            value={form.content}
            onChange={(e) => set("content", e.target.value)}
          />
        </div>

        {!isEdit && (
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              Workspace
            </label>
            <select
              className="input"
              value={form.workspaceId}
              onChange={(e) => set("workspaceId", e.target.value)}
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.emoji} {ws.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Note"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
