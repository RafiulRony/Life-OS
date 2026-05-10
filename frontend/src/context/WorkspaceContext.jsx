import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import { getWorkspaces } from "../services/workspace.service"
import { useAuth } from "./AuthContext"

const WorkspaceContext = createContext(null)

export const WorkspaceProvider = ({ children }) => {
  const { user } = useAuth()
  const [workspaces, setWorkspaces] = useState([])
  const [activeWorkspace, setActiveWorkspace] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchWorkspaces = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await getWorkspaces()
      const list = res.data.workspaces
      setWorkspaces(list)
      // Default to first workspace if none active
      if (!activeWorkspace && list.length > 0) {
        setActiveWorkspace(list[0])
      }
    } catch (err) {
      console.error("Failed to fetch workspaces", err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

  const selectWorkspace = (workspace) => setActiveWorkspace(workspace)

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        loading,
        fetchWorkspaces,
        selectWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext)
  if (!ctx)
    throw new Error("useWorkspace must be used within WorkspaceProvider")
  return ctx
}
