ALTER TABLE `vppProviders` ADD `slug` varchar(50);--> statement-breakpoint
ALTER TABLE `vppProviders` ADD `providerType` varchar(20) DEFAULT 'fixed';--> statement-breakpoint
ALTER TABLE `vppProviders` ADD `baseRateCents` decimal(8,2);--> statement-breakpoint
ALTER TABLE `vppProviders` ADD `monthlyFee` decimal(8,2);--> statement-breakpoint
ALTER TABLE `vppProviders` ADD `wholesaleMargin` decimal(8,2);