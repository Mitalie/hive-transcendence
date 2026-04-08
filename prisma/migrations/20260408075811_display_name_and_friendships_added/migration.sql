-- AlterTable
ALTER TABLE `User` ADD COLUMN `avatarUrl` VARCHAR(191) NULL,
    ADD COLUMN `bio` TEXT NULL,
    ADD COLUMN `displayName` VARCHAR(191) NULL,
    ADD COLUMN `lastActiveAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `Friendship` (
    `id` VARCHAR(191) NOT NULL,
    `requesterId` VARCHAR(191) NOT NULL,
    `addresseeId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Friendship_requesterId_idx`(`requesterId`),
    INDEX `Friendship_addresseeId_idx`(`addresseeId`),
    UNIQUE INDEX `Friendship_requesterId_addresseeId_key`(`requesterId`, `addresseeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Friendship` ADD CONSTRAINT `Friendship_requesterId_fkey` FOREIGN KEY (`requesterId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Friendship` ADD CONSTRAINT `Friendship_addresseeId_fkey` FOREIGN KEY (`addresseeId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
