CREATE TABLE `proposalAccessTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proposalId` int NOT NULL,
	`customerId` int NOT NULL,
	`token` varchar(64) NOT NULL,
	`expiresAt` timestamp,
	`isActive` boolean DEFAULT true,
	`viewCount` int DEFAULT 0,
	`lastViewedAt` timestamp,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `proposalAccessTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `proposalAccessTokens_token_unique` UNIQUE(`token`)
);
