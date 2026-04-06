CREATE TABLE `ai_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider` text NOT NULL,
	`model` text NOT NULL,
	`api_key` text NOT NULL,
	`temperature` real DEFAULT 0.7 NOT NULL,
	`top_p` real DEFAULT 0.9 NOT NULL,
	`max_tokens` integer DEFAULT 4096 NOT NULL,
	`custom_endpoint` text,
	`custom_settings` text,
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ai_settings_user_id_idx` ON `ai_settings` (`user_id`);
