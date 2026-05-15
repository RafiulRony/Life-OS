import api from "./api"

export const getWorkspaces = () => api.get("/workspaces")
export const getWorkspace = (id) => api.get(`/workspaces/${id}`)
export const createWorkspace = (data) => api.post("/workspaces", data)
export const updateWorkspace = (id, data) => api.put(`/workspaces/${id}`, data)
export const deleteWorkspace = (id) => api.delete(`/workspaces/${id}`)
export const addMember = (id, email) =>
  api.post(`/workspaces/${id}/members`, { email })
export const removeMember = (id, userId) =>
  api.delete(`/workspaces/${id}/members/${userId}`)
export const leaveWorkspace = (id) => api.delete(`/workspaces/${id}/leave`)
export const getInvitations = () => api.get("/workspaces/invitations")
export const acceptInvitation = (memberId) =>
  api.post(`/workspaces/invitations/${memberId}/accept`)
export const rejectInvitation = (memberId) =>
  api.post(`/workspaces/invitations/${memberId}/reject`)
