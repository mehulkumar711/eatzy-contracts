-- db/migrations/V4__add_admin_columns.sql

-- Add the 'username' column for admin login capability
ALTER TABLE "users" ADD COLUMN "username" VARCHAR(50) UNIQUE;

-- Create an index for fast lookups by username
CREATE INDEX "idx_users_username" ON "users" ("username");