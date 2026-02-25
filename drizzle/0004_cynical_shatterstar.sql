CREATE TABLE `proposalViews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proposalId` int NOT NULL,
	`accessTokenId` int,
	`ipAddress` varchar(45),
	`userAgent` text,
	`referrer` varchar(512),
	`sessionId` varchar(64) NOT NULL,
	`durationSeconds` int DEFAULT 0,
	`totalSlidesViewed` int DEFAULT 0,
	`deviceType` varchar(20),
	`browser` varchar(50),
	`os` varchar(50),
	`viewedAt` timestamp NOT NULL DEFAULT (now()),
	`lastActivityAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `proposalViews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `slideEngagement` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proposalId` int NOT NULL,
	`viewId` int NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`slideIndex` int NOT NULL,
	`slideType` varchar(50) NOT NULL,
	`slideTitle` varchar(255),
	`timeSpentSeconds` int DEFAULT 0,
	`viewCount` int DEFAULT 1,
	`firstViewedAt` timestamp NOT NULL DEFAULT (now()),
	`lastViewedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `slideEngagement_id` PRIMARY KEY(`id`)
);
