/*
  Warnings:

  - You are about to drop the column `experience` on the `profils` table. All the data in the column will be lost.
  - You are about to drop the column `formation` on the `profils` table. All the data in the column will be lost.
  - Added the required column `experiences` to the `profils` table without a default value. This is not possible if the table is not empty.
  - Added the required column `formations` to the `profils` table without a default value. This is not possible if the table is not empty.
  - Added the required column `langues` to the `profils` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `lettres` MODIFY `descriptionPoste` TEXT NULL;

-- AlterTable
ALTER TABLE `profils` DROP COLUMN `experience`,
    DROP COLUMN `formation`,
    ADD COLUMN `experiences` JSON NOT NULL,
    ADD COLUMN `formations` JSON NOT NULL,
    ADD COLUMN `langues` JSON NOT NULL;

-- CreateTable
CREATE TABLE `offres` (
    `id` VARCHAR(191) NOT NULL,
    `titre` VARCHAR(191) NOT NULL,
    `entreprise` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `url` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'EN_ATTENTE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cvs` (
    `id` VARCHAR(191) NOT NULL,
    `titre` VARCHAR(191) NOT NULL,
    `contenu` TEXT NOT NULL,
    `templateId` VARCHAR(191) NOT NULL DEFAULT 'classic',
    `promptUsed` TEXT NULL,
    `modelUsed` VARCHAR(191) NULL,
    `tokensUsed` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `profilId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `offres` ADD CONSTRAINT `offres_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cvs` ADD CONSTRAINT `cvs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cvs` ADD CONSTRAINT `cvs_profilId_fkey` FOREIGN KEY (`profilId`) REFERENCES `profils`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
