import React, { useEffect, useState, useCallback } from "react"
import {
  getInvitations,
  acceptInvitation,
  rejectInvitation,
} from "../../services/workspace.service"

export default function InvitationsPanel({ onAccepted }) {
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null) // memberId being acted on

  const load = useCallback(async () => {
    try {
      const res = await getInvitations()
      setInvitations(res.data.invitations)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleAccept = async (inv) => {
    setActionLoading(inv.id)
    try {
      await acceptInvitation(inv.id)
      setInvitations((prev) => prev.filter((i) => i.id !== inv.id))
      onAccepted?.()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (inv) => {
    setActionLoading(inv.id)
    try {
      await rejectInvitation(inv.id)
      setInvitations((prev) => prev.filter((i) => i.id !== inv.id))
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading || invitations.length === 0) return null

  return (
    <div className="space-y-2">
      {invitations.map((inv) => {
        const ws = inv.workspace
        const busy = actionLoading === inv.id
        return (
          <div
            key={inv.id}
            className="card p-4 border-l-4 border-primary-500 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl shrink-0">{ws.emoji || "📁"}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate">
                  {ws.name}
                </p>
                <p className="text-xs text-zinc-400">
                  Invited by {ws.owner?.name} · {ws._count?.members ?? 0} member
                  {ws._count?.members !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleReject(inv)}
                disabled={busy}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                Decline
              </button>
              <button
                onClick={() => handleAccept(inv)}
                disabled={busy}
                className="btn-primary text-xs py-1.5 px-3"
              >
                {busy ? "…" : "Accept"}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
