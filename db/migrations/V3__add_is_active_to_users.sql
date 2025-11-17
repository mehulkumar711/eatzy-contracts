--
-- Migration V3: Fixes schema mismatch from V2
-- 1. Adds 'is_active' to users (fixes P0 crash)
--

ALTER TABLE "users"
ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;