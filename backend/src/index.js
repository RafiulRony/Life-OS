require("dotenv").config()
const express = require("express")
const cors = require("cors")

const authRoutes = require("./routes/auth.routes")
const workspaceRoutes = require("./routes/workspace.routes")
const taskRoutes = require("./routes/task.routes")
const noteRoutes = require("./routes/note.routes")
const dashboardRoutes = require("./routes/dashboard.routes")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
)
app.use(express.json())

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "LifeOS API is running", version: "2.0.0" })
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/workspaces", workspaceRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/notes", noteRoutes)
app.use("/api/dashboard", dashboardRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  })
})

app.listen(PORT, () => {
  console.log(`🚀 LifeOS API running on http://localhost:${PORT}`)
})
