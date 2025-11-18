ALTER TABLE "users" ADD COLUMN "username" VARCHAR(50) UNIQUE;
CREATE INDEX "idx_users_username" ON "users" ("username");