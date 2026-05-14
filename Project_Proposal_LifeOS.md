# Project Proposal

## LifeOS — A Collaborative Life Management Platform

---

**Submitted by:** [Your Name]
**Student ID:** [Your Student ID]
**Department:** [Your Department]
**University:** [Your University Name]
**Supervisor:** [Supervisor Name]
**Submission Date:** May 2026

---

## 1. Introduction

In today's fast-paced world, people struggle to manage their personal responsibilities while also coordinating with family members, friends, and community groups. Existing productivity tools are either too focused on individual use or too complex and corporate-oriented to be practical for everyday life.

**LifeOS** is a web-based collaborative life management platform designed to bridge this gap. It provides a unified digital space where individuals can manage their personal tasks, habits, goals, and notes — while also collaborating with others through shared workspaces for families, friend groups, and communities.

The core philosophy of LifeOS is simple:

> _"Helping people organize life together."_

---

## 2. Problem Statement

Current productivity and task management tools suffer from several limitations:

- **Fragmentation:** People use multiple separate apps for tasks, habits, notes, and goals, leading to scattered information and context switching.
- **Lack of collaboration for personal life:** Tools like Trello or Asana are designed for professional teams, not for families or friend groups.
- **Complexity:** Most platforms are feature-heavy and overwhelming for everyday personal use.
- **No shared accountability:** There is no easy way for a family or group of friends to share responsibilities, track habits together, or coordinate plans in one place.

LifeOS addresses all of these problems by combining personal productivity with collaborative coordination in a single, human-centered platform.

---

## 3. Objectives

The primary objectives of this project are:

1. Design and develop a full-stack web application for personal and collaborative life management.
2. Implement a workspace system that supports personal, family, friends, and community spaces.
3. Build a task management system with priority levels, deadlines, status tracking, and member assignment.
4. Develop a habit tracker with daily completion tracking and streak monitoring.
5. Create a notes system for capturing and organizing personal and shared information.
6. Implement a goal management module to track long-term objectives.
7. Build a dashboard that provides a unified overview of all life activities.
8. Ensure secure user authentication and data isolation using JWT-based authentication.
9. Deliver a responsive, accessible, and visually clean user interface.

---

## 4. Scope of the Project

### 4.1 In Scope

- User registration and login with JWT authentication
- Personal and collaborative workspace management
- Task creation, assignment, prioritization, and status tracking
- Daily habit tracking with completion history
- Note creation and management (personal and shared)
- Goal setting and progress tracking
- Dashboard with life overview statistics
- Dark mode and responsive UI
- RESTful API backend

### 4.2 Out of Scope (Future Work)

- Real-time collaboration (WebSockets)
- Mobile application (iOS/Android)
- Calendar integration
- Push notifications and reminders
- AI-powered suggestions
- Community/public spaces

---

## 5. Proposed System

### 5.1 System Overview

LifeOS is a web application with a decoupled frontend and backend architecture. Users can register, create workspaces, and invite members. Within each workspace, they can manage tasks, notes, goals, and habits collaboratively.

### 5.2 Key Modules

#### Authentication Module

- User registration with name, email, and password
- Secure login with hashed passwords (bcrypt)
- JWT-based session management
- Protected routes on both frontend and backend

#### Workspace Module

- Create workspaces of types: Personal, Family, Friends, Community
- Invite and manage workspace members
- Each workspace acts as an isolated collaborative environment

#### Task Management Module

- Create tasks with title, description, priority (Low / Medium / High), and due date
- Assign tasks to workspace members
- Track task status: Pending → Ongoing → Done
- Filter and sort tasks by status and priority

#### Habit Tracker Module

- Create personal daily habits with emoji and color customization
- Mark habits as complete each day
- View completion history and calculate streaks
- Visual progress indicators

#### Notes Module

- Create and edit rich text notes within workspaces
- Pin important notes for quick access
- Personal and shared note support

#### Goal Management Module

- Define long-term goals within workspaces
- Track goal status: Active, Completed, Paused
- Link goals to tasks for structured progress

#### Dashboard Module

- Overview of today's tasks, habit status, and goal progress
- Quick statistics and activity summary
- Workspace-level activity feed

---

## 6. Technology Stack

| Layer          | Technology                       | Purpose                                |
| -------------- | -------------------------------- | -------------------------------------- |
| Frontend       | React 18                         | UI component framework                 |
| Styling        | Tailwind CSS                     | Utility-first CSS styling              |
| HTTP Client    | Axios                            | API communication                      |
| Routing        | React Router v6                  | Client-side navigation                 |
| Backend        | Node.js + Express.js             | RESTful API server                     |
| ORM            | Prisma                           | Database access and migrations         |
| Database       | SQLite (dev) / PostgreSQL (prod) | Data persistence                       |
| Authentication | JWT + bcryptjs                   | Secure auth and password hashing       |
| Build Tool     | Vite                             | Fast frontend development and bundling |

---

## 7. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client Browser                    │
│                                                      │
│   React SPA (Vite + Tailwind CSS + React Router)    │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│   │Dashboard │ │  Tasks   │ │  Habits  │  ...       │
│   └──────────┘ └──────────┘ └──────────┘           │
└────────────────────────┬────────────────────────────┘
                         │ HTTP / REST API (Axios)
┌────────────────────────▼────────────────────────────┐
│               Node.js + Express.js API               │
│                                                      │
│   Auth │ Workspaces │ Tasks │ Notes │ Habits │ Goals │
│                                                      │
│              JWT Middleware (Auth Guard)             │
└────────────────────────┬────────────────────────────┘
                         │ Prisma ORM
┌────────────────────────▼────────────────────────────┐
│                SQLite / PostgreSQL DB                │
│                                                      │
│  Users │ Workspaces │ Tasks │ Notes │ Habits │ Goals │
└─────────────────────────────────────────────────────┘
```

---

## 8. Database Design

The core data models and their relationships are as follows:

| Model           | Key Fields                                                                   |
| --------------- | ---------------------------------------------------------------------------- |
| User            | id, name, email, password, avatar, createdAt                                 |
| Workspace       | id, name, type, emoji, ownerId, createdAt                                    |
| WorkspaceMember | id, workspaceId, userId, joinedAt                                            |
| Task            | id, title, status, priority, dueDate, workspaceId, createdById, assignedToId |
| Note            | id, title, content, isPinned, workspaceId, createdById                       |
| Goal            | id, title, description, status, workspaceId                                  |
| Habit           | id, title, emoji, color, userId, workspaceId                                 |
| HabitCompletion | id, habitId, date (YYYY-MM-DD)                                               |

**Key Relationships:**

- A User can own multiple Workspaces
- A Workspace has many Members (many-to-many via WorkspaceMember)
- A Workspace contains Tasks, Notes, Goals, and Habits
- A Habit has many HabitCompletions (one per day, enforced by unique constraint)

---

## 9. Project Timeline

| Phase                                | Activities                                             | Duration   |
| ------------------------------------ | ------------------------------------------------------ | ---------- |
| Phase 1 — Planning                   | Requirements gathering, system design, database schema | Week 1–2   |
| Phase 2 — Backend Development        | API development, authentication, database setup        | Week 3–5   |
| Phase 3 — Frontend Development       | UI components, pages, API integration                  | Week 6–9   |
| Phase 4 — Integration & Testing      | End-to-end testing, bug fixing, performance tuning     | Week 10–11 |
| Phase 5 — Documentation & Deployment | Final documentation, deployment, presentation prep     | Week 12    |

---

## 10. Expected Outcomes

Upon completion, the LifeOS project will deliver:

1. A fully functional web application accessible via a browser
2. A secure REST API with complete CRUD operations for all modules
3. A responsive and accessible user interface with dark mode support
4. A working collaborative workspace system with member management
5. Complete project documentation including system design, API docs, and user guide
6. A deployed or locally runnable application for demonstration

---

## 11. Tools and Development Environment

- **Code Editor:** Visual Studio Code
- **Version Control:** Git / GitHub
- **API Testing:** Postman
- **Database GUI:** Prisma Studio
- **Package Manager:** npm
- **OS:** Windows

---

## 12. Conclusion

LifeOS is a meaningful and technically substantial project that demonstrates full-stack web development skills including frontend UI development, RESTful API design, database modeling, authentication, and collaborative system architecture.

Unlike typical CRUD applications, LifeOS solves a real-world problem — the lack of a simple, human-centered platform for managing life collaboratively. It is designed with a clear vision, a practical feature set, and a scalable architecture that can grow beyond the initial submission.

This project will serve as a strong demonstration of applied software engineering principles and modern web development practices.

---

## 13. References

1. React Documentation — https://react.dev
2. Express.js Documentation — https://expressjs.com
3. Prisma ORM Documentation — https://www.prisma.io/docs
4. Tailwind CSS Documentation — https://tailwindcss.com/docs
5. JSON Web Tokens (JWT) — https://jwt.io
6. Node.js Documentation — https://nodejs.org/en/docs

---

_End of Project Proposal_
