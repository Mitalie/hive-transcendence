-- AlterTable
ALTER TABLE `User` ADD COLUMN `avatarData` LONGBLOB NULL,
    ADD COLUMN `avatarMime` VARCHAR(191) NULL;
