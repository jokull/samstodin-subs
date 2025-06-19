CREATE TABLE `Password` (
	`hash` text NOT NULL,
	`userId` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Password_userId_unique` ON `Password` (`userId`);--> statement-breakpoint
CREATE TABLE `User` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`kennitala` text NOT NULL,
	`althydufelagid` integer DEFAULT true NOT NULL,
	`isAdmin` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `User_email_unique` ON `User` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `User_kennitala_unique` ON `User` (`kennitala`);