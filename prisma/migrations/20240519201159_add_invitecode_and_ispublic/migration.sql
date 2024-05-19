/*
  Warnings:

  - A unique constraint covering the columns `[invite_code]` on the table `chat_groups` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `invite_code` to the `chat_groups` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "chat_groups" ADD COLUMN     "invite_code" TEXT NOT NULL,
ADD COLUMN     "is_public" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "chat_groups_invite_code_key" ON "chat_groups"("invite_code");
