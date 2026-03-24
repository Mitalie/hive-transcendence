/*
  Warnings:

  - You are about to drop the column `player1` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `player2` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `winner` on the `Match` table. All the data in the column will be lost.
  - Added the required column `opponentName` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `opponentType` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `player1Id` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Match` DROP COLUMN `player1`,
    DROP COLUMN `player2`,
    DROP COLUMN `winner`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `opponentName` VARCHAR(191) NOT NULL,
    ADD COLUMN `opponentType` VARCHAR(191) NOT NULL,
    ADD COLUMN `player1Id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_player1Id_fkey` FOREIGN KEY (`player1Id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
