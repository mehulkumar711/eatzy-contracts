--
-- Core Eatzy Schema (v1.32)
--

-- Users Table (for all roles)
CREATE TABLE "users" (
  "id" uuid PRIMARY KEY NOT NULL,
  "phone" VARCHAR(20) UNIQUE NOT NULL,
  "role" VARCHAR(20) NOT NULL, -- 'customer', 'vendor', 'rider'
  "pin_hash" VARCHAR(255), -- For login
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT (NOW()),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT (NOW())
);

-- Vendors Table
CREATE TABLE "vendors" (
  "id" uuid PRIMARY KEY NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  -- other fields like 'address', 'is_open', etc.
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT (NOW()),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT (NOW())
);

-- Menu Items Table
CREATE TABLE "menu_items" (
  "id" uuid PRIMARY KEY NOT NULL,
  "vendor_id" uuid NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "price_paise" INT NOT NULL DEFAULT 0,
  "is_available" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT (NOW()),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT (NOW())
);

-- Riders Table
CREATE TABLE "riders" (
  "id" uuid PRIMARY KEY NOT NULL,
  "phone" VARCHAR(20) UNIQUE NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT (NOW()),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT (NOW())
);

-- Add Foreign Key constraint for menu_items
ALTER TABLE "menu_items" ADD FOREIGN KEY ("vendor_id") REFERENCES "vendors" ("id");

-- Add Indexes for performance
CREATE INDEX "idx_users_phone" ON "users" ("phone");
CREATE INDEX "idx_menu_items_vendor_id" ON "menu_items" ("vendor_id");