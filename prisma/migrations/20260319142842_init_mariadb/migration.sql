-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL DEFAULT 0,
    `wins` INTEGER NOT NULL DEFAULT 0,
    `losses` INTEGER NOT NULL DEFAULT 0,
    `githubId` VARCHAR(191) NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_githubId_key`(`githubId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Match` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `player1` VARCHAR(191) NOT NULL,
    `player2` VARCHAR(191) NOT NULL,
    `score1` INTEGER NOT NULL,
    `score2` INTEGER NOT NULL,
    `winner` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
