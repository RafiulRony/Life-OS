/*
  Warnings:

  - Added the required column `targetValue` to the `goals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `goals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `goals` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "goal_progress_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "previousValue" REAL NOT NULL,
    "updatedValue" REAL NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "goalId" TEXT NOT NULL,
    CONSTRAINT "goal_progress_history_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_goals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "icon" TEXT DEFAULT '🎯',
    "color" TEXT DEFAULT '#6470f3',
    "targetValue" REAL NOT NULL,
    "currentValue" REAL NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startDate" TEXT,
    "targetDate" TEXT,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "goals_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_goals" ("createdAt", "description", "id", "status", "title", "updatedAt", "workspaceId") SELECT "createdAt", "description", "id", "status", "title", "updatedAt", "workspaceId" FROM "goals";
DROP TABLE "goals";
ALTER TABLE "new_goals" RENAME TO "goals";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
