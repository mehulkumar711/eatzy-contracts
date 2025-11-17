--
-- Core Eatzy Schema (v1.59)
--

-- Users Table
CREATE TABLE "users" (
  "id" uuid PRIMARY KEY NOT NULL,
  "phone" VARCHAR(20) UNIQUE NOT NULL,
  "role" VARCHAR(20) NOT NULL,
  "pin_hash" VARCHAR(255),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT (NOW()),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT (NOW())
);

-- Vendors Table
CREATE TABLE "vendors" (
  "id" uuid PRIMARY KEY NOT NULL,
  "name" VARCHAR(255) NOT NULL,
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

--
-- THE FIX (v1.59): Add the missing enum and orders table
--
CREATE TYPE "order_status" AS ENUM (
  'PENDING',
  'VENDOR_ACCEPTED',
  'VENDOR_REJECTED',
  'READY_FOR_PICKUP',
  'RIDER_ASSIGNED',
  'RIDER_PICKED_UP',
  'DELIVERED',
  'CANCELLED'
);

CREATE TABLE "orders" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
  "user_id" uuid NOT NULL,
  "vendor_id" uuid NOT NULL,
  "rider_id" uuid,
  "status" order_status NOT NULL DEFAULT 'PENDING',
  "total_amount_paise" INT NOT NULL,
  "saga_id" uuid NOT NULL UNIQUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT (NOW()),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT (NOW())
);

-- Foreign Keys
ALTER TABLE "menu_items" ADD FOREIGN KEY ("vendor_id") REFERENCES "vendors" ("id");
ALTER TABLE "orders" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");
ALTER TABLE "orders" ADD FOREIGN KEY ("vendor_id") REFERENCES "vendors" ("id");
ALTER TABLE "orders" ADD FOREIGN KEY ("rider_id") REFERENCES "riders" ("id");
ALTER TABLE "orders" ADD FOREIGN KEY ("saga_id") REFERENCES "sagas" ("id");

-- Add Indexes for performance
CREATE INDEX "idx_users_phone" ON "users" ("phone");
CREATE INDEX "idx_menu_items_vendor_id" ON "menu_items" ("vendor_id");
CREATE INDEX "idx_orders_user_id" ON "orders" ("user_id");
CREATE INDEX "idx_orders_status" ON "orders" ("status");