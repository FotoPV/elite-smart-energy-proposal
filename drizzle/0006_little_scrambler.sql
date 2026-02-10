ALTER TABLE `customers` ADD `existingSolar` enum('none','under_5_years','over_5_years') DEFAULT 'none';--> statement-breakpoint
ALTER TABLE `customers` DROP COLUMN `hasExistingSolar`;--> statement-breakpoint
ALTER TABLE `customers` DROP COLUMN `existingSolarSize`;--> statement-breakpoint
ALTER TABLE `customers` DROP COLUMN `existingSolarAge`;