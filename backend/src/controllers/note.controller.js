const prisma = require("../utils/prisma")

const isMember = async (workspaceId, userId) => {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  })
  return !!member
}

const getNotes = async (req, res) => {
  try {
    const { workspaceId } = req.query

    if (!workspaceId) {
      return res.status(400).json({ message: "workspaceId is required" })
    }

    const member = await isMember(workspaceId, req.user.id)
    if (!member) {
      return res.status(403).json({ message: "Not a member of this workspace" })
    }

    const notes = await prisma.note.findMany({
      where: { workspaceId },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
    })

    res.json({ notes })
  } catch (err) {
    console.error("Get notes error:", err)
    res.status(500).json({ message: "Failed to fetch notes" })
  }
}

const getNote = async (req, res) => {
  try {
    const { id } = req.params

    const note = await prisma.note.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
      },
    })

    if (!note) {
      return res.status(404).json({ message: "Note not found" })
    }

    const member = await isMember(note.workspaceId, req.user.id)
    if (!member) {
      return res.status(403).json({ message: "Not authorized" })
    }

    res.json({ note })
  } catch (err) {
    console.error("Get note error:", err)
    res.status(500).json({ message: "Failed to fetch note" })
  }
}

const createNote = async (req, res) => {
  try {
    const { workspaceId, title, content } = req.body

    if (!workspaceId || !title) {
      return res
        .status(400)
        .json({ message: "workspaceId and title are required" })
    }

    const member = await isMember(workspaceId, req.user.id)
    if (!member) {
      return res.status(403).json({ message: "Not a member of this workspace" })
    }

    const note = await prisma.note.create({
      data: {
        workspaceId,
        title,
        content,
        createdById: req.user.id,
      },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
      },
    })

    res.status(201).json({ note })
  } catch (err) {
    console.error("Create note error:", err)
    res.status(500).json({ message: "Failed to create note" })
  }
}

const updateNote = async (req, res) => {
  try {
    const { id } = req.params
    const { title, content, isPinned } = req.body

    const note = await prisma.note.findUnique({ where: { id } })
    if (!note) {
      return res.status(404).json({ message: "Note not found" })
    }

    const member = await isMember(note.workspaceId, req.user.id)
    if (!member) {
      return res.status(403).json({ message: "Not authorized" })
    }

    const updated = await prisma.note.update({
      where: { id },
      data: { title, content, isPinned },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
      },
    })

    res.json({ note: updated })
  } catch (err) {
    console.error("Update note error:", err)
    res.status(500).json({ message: "Failed to update note" })
  }
}

const deleteNote = async (req, res) => {
  try {
    const { id } = req.params

    const note = await prisma.note.findUnique({ where: { id } })
    if (!note) {
      return res.status(404).json({ message: "Note not found" })
    }

    if (note.createdById !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the note creator can delete it" })
    }

    await prisma.note.delete({ where: { id } })

    res.json({ message: "Note deleted" })
  } catch (err) {
    console.error("Delete note error:", err)
    res.status(500).json({ message: "Failed to delete note" })
  }
}

module.exports = { getNotes, getNote, createNote, updateNote, deleteNote }
