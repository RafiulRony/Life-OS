import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { register as registerService } from "../services/auth.service"
import { useAuth } from "../context/AuthContext"

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await registerService(form)
      login(res.data.user, res.data.token)
      navigate("/dashboard")
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white dark:from-surface-950 dark:to-surface-900 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-5xl">🧩</span>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-3">
            LifeOS
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Organize life together</p>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-5">
            Create your account
          </h2>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg mb-4">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Name
              </label>
              <input
                className="input"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Email
              </label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Password
              </label>
              <input
                className="input"
                type="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full mt-2"
              disabled={loading}
            >
              {loading ? "Creating account…" : "Get started"}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-400 mt-5">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary-600 hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
