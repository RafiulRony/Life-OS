import api from "./api"

export const getHabits = (params) => api.get("/habits", { params })
export const createHabit = (data) => api.post("/habits", data)
export const updateHabit = (id, data) => api.put(`/habits/${id}`, data)
export const deleteHabit = (id) => api.delete(`/habits/${id}`)
export const toggleHabitCompletion = (id) => api.post(`/habits/${id}/complete`)
export const getHabitHistory = (id, weeks = 12) =>
  api.get(`/habits/${id}/history`, { params: { weeks } })
