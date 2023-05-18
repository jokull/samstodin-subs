-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "kennitala" TEXT NOT NULL DEFAULT '',
    "althydufelagid" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_User" ("createdAt", "email", "id", "kennitala", "updatedAt") SELECT "createdAt", "email", "id", "kennitala", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_kennitala_key" ON "User"("kennitala");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
