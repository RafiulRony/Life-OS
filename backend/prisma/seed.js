const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  const hashedPassword = await bcrypt.hash("password123", 10)

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@lifeos.app" },
    update: {},
    create: {
      name: "Alex Demo",
      email: "demo@lifeos.app",
      password: hashedPassword,
    },
  })

  // Create personal workspace
  const personalWs = await prisma.workspace.upsert({
    where: { id: "personal-demo" },
    update: {},
    create: {
      id: "personal-demo",
      name: "Alex's Space",
      type: "personal",
      emoji: "🏠",
      ownerId: user.id,
      members: { create: { userId: user.id } },
    },
  })

  // Create family workspace
  const familyWs = await prisma.workspace.upsert({
    where: { id: "family-demo" },
    update: {},
    create: {
      id: "family-demo",
      name: "Family Hub",
      type: "family",
      emoji: "👨‍👩‍👧",
      ownerId: user.id,
      members: { create: { userId: user.id } },
    },
  })

  // Seed tasks (upsert each individually for SQLite compatibility)
  const tasks = [
    {
      id: "task-1",
      workspaceId: personalWs.id,
      title: "Plan weekly goals",
      description: "Set intentions for the week ahead",
      status: "pending",
      priority: "high",
      createdById: user.id,
    },
    {
      id: "task-2",
      workspaceId: personalWs.id,
      title: "Read for 30 minutes",
      status: "ongoing",
      priority: "medium",
      createdById: user.id,
    },
    {
      id: "task-3",
      workspaceId: familyWs.id,
      title: "Grocery shopping",
      description: "Weekly groceries for the family",
      status: "pending",
      priority: "high",
      createdById: user.id,
    },
  ]

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {},
      create: task,
    })
  }

  // Seed notes
  await prisma.note.upsert({
    where: { id: "note-1" },
    update: {},
    create: {
      id: "note-1",
      workspaceId: personalWs.id,
      title: "Welcome to LifeOS",
      content:
        "This is your personal space. Use it to organize your life, track tasks, and capture ideas.",
      isPinned: true,
      createdById: user.id,
    },
  })

  console.log("✅ Seed complete!")
  console.log("📧 Demo login: demo@lifeos.app / password123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
