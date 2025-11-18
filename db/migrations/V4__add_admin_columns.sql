-- D:\eatzy-contracts\db\migrations\V4__add_admin_columns.sql

-- 1. Add the 'username' column
ALTER TABLE "users" ADD COLUMN "username" VARCHAR(50) UNIQUE;

-- 2. CRITICAL FIX: Make the 'phone' column nullable for admin users
ALTER TABLE "users" ALTER COLUMN "phone" DROP NOT NULL;

-- 3. Create index
CREATE INDEX "idx_users_username" ON "users" ("username");