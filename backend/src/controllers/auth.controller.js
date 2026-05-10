const bcrypt = require("bcryptjs")
const prisma = require("../utils/prisma")
const { generateToken } = require("../utils/jwt")

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, createdAt: true },
    })

    // Create a default personal workspace for the new user
    await prisma.workspace.create({
      data: {
        name: `${name}'s Space`,
        type: "personal",
        emoji: "🏠",
        ownerId: user.id,
        members: {
          create: { userId: user.id },
        },
      },
    })

    const token = generateToken(user.id)

    res.status(201).json({ user, token })
  } catch (err) {
    console.error("Register error:", err)
    res.status(500).json({ message: "Registration failed" })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const token = generateToken(user.id)

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      token,
    })
  } catch (err) {
    console.error("Login error:", err)
    res.status(500).json({ message: "Login failed" })
  }
}

const getMe = async (req, res) => {
  res.json({ user: req.user })
}

module.exports = { register, login, getMe }
