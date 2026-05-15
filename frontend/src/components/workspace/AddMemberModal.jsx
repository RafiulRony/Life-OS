import React, { useState } from "react"
import Modal from "../ui/Modal"
import { addMember } from "../../services/workspace.service"

export default function AddMemberModal({ workspaceId, onClose, onAdded }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return setError("Email is required")
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      const res = await addMember(workspaceId, email.trim())
      setSuccess(res.data.message || "Invitation sent!")
      setEmail("")
      onAdded?.()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send invitation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Invite Member" onClose={onClose} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-zinc-400">
          Enter the email address of the person you want to invite. They will
          receive a pending invitation they can accept or decline.
        </p>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
            ✓ {success}
          </p>
        )}

        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1.5">
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
            Close
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Sending…" : "Send Invite"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
