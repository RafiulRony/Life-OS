import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { WorkspaceProvider } from "./context/WorkspaceContext"
import { ThemeProvider } from "./context/ThemeContext"

import AppLayout from "./components/layout/AppLayout"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import DashboardPage from "./pages/DashboardPage"
import WorkspacePage from "./pages/WorkspacePage"
import TasksPage from "./pages/TasksPage"
import NotesPage from "./pages/NotesPage"
import HabitsPage from "./pages/HabitsPage"

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!user) return <Navigate to="/login" replace />
  return children
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  // Don't block rendering while loading — avoids unmounting/remounting the
  // login/register form (which would clear state and error messages).
  // Once loading resolves, redirect authenticated users to the dashboard.
  if (!loading && user) return <Navigate to="/dashboard" replace />
  return children
}

const FullScreenLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-zinc-400">Loading LifeOS…</p>
    </div>
  </div>
)

const AppRoutes = () => (
  <Routes>
    <Route
      path="/login"
      element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      }
    />
    <Route
      path="/register"
      element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      }
    />

    <Route
      path="/"
      element={
        <ProtectedRoute>
          <WorkspaceProvider>
            <AppLayout />
          </WorkspaceProvider>
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="workspaces/:id" element={<WorkspacePage />} />
      <Route path="tasks" element={<TasksPage />} />
      <Route path="notes" element={<NotesPage />} />
      <Route path="habits" element={<HabitsPage />} />
    </Route>

    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
)

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  )
}
