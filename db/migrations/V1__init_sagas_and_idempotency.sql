-- V1 Sagas + Idempotency (v1.57 fix)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "sagas" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
  "saga_type" VARCHAR(50) NOT NULL,
  "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  "payload" JSONB,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT (NOW()),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT (NOW())
);

--
-- THE FIX (v1.57):
-- The primary key MUST be 'idempotency_key' to match the entity
-- and the service logic.
--
CREATE TABLE "processed_events" (
  "idempotency_key" VARCHAR(255) PRIMARY KEY NOT NULL,
  "saga_id" uuid NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT (NOW()),
  FOREIGN KEY ("saga_id") REFERENCES "sagas" ("id")
);