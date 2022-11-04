-- CreateTable
CREATE TABLE `sys_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `github_id` INTEGER NOT NULL,
    `github_login` VARCHAR(40) NOT NULL,
    `email_address` VARCHAR(255) NOT NULL,
    `email_get_updates` BIT(1) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `index_u_on_github_id`(`github_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_watched_repos` (
    `user_id` INTEGER NOT NULL,
    `repo_id` INTEGER NOT NULL,
    `watched_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`user_id`, `repo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_sent_repo_milestones` (
    `user_id` INTEGER NOT NULL,
    `repo_milestone_id` INTEGER NOT NULL,
    `sent_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`user_id`, `repo_milestone_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_repo_milestones` (
    `id` INTEGER NOT NULL,
    `repo_id` INTEGER NOT NULL DEFAULT 0,
    `milestone_type_id` INTEGER NOT NULL DEFAULT 0,
    `milestone_number` INTEGER NOT NULL DEFAULT 0,
    `payload` JSON NULL,
    `reached_at` DATETIME(0) NOT NULL,

    UNIQUE INDEX `index_rm_on_repo_id_milestone_type_number`(`repo_id`, `milestone_type_id`, `milestone_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_repo_milestone_types` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(30) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sys_watched_repos` ADD CONSTRAINT `sys_watched_repos_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `sys_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_sent_repo_milestones` ADD CONSTRAINT `sys_sent_repo_milestones_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `sys_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
