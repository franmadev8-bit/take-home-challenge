/*
  Warnings:

  - You are about to drop the column `status` on the `Notifications` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'email',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Notifications" ("createdAt", "id", "message", "read", "type", "userId") SELECT "createdAt", "id", "message", "read", "type", "userId" FROM "Notifications";
DROP TABLE "Notifications";
ALTER TABLE "new_Notifications" RENAME TO "Notifications";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
