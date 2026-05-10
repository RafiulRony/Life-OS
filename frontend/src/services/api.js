import axios from "axios"

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("lifeos_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally — redirect to login
// Skip auth endpoints: a 401 on /auth/login or /auth/register means wrong
// credentials, not an expired session, so we should not force a redirect.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthEndpoint = err.config?.url?.startsWith("/auth/")
    if (err.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("lifeos_token")
      localStorage.removeItem("lifeos_user")
      window.location.href = "/login"
    }
    return Promise.reject(err)
  },
)

export default api
