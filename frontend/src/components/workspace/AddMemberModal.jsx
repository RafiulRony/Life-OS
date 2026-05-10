import React, { useState } from "react"
import Modal from "../ui/Modal"
import { addMember } from "../../services/workspace.service"

export default function AddMemberModal({ workspaceId, onClose, onAdded }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return setError("Email is required")
    setLoading(true)
    setError("")
    try {
      await addMember(workspaceId, email.trim())
      onAdded?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add member")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Add Member" onClose={onClose} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">
            Email address
          </label>
          <input
            className="input"
            type="email"
            placeholder="friend@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Adding…" : "Add Member"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
