CREATE TABLE `customerDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`userId` int NOT NULL,
	`documentType` enum('switchboard_photo','meter_photo','roof_photo','property_photo','solar_proposal_pdf','other') NOT NULL,
	`fileUrl` varchar(512) NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileSize` int,
	`mimeType` varchar(100),
	`description` text,
	`extractedData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customerDocuments_id` PRIMARY KEY(`id`)
);
