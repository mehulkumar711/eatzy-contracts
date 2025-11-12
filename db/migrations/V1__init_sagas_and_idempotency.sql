/*
Hardened v1.6 migration.
- Adds pgcrypto and uuid-ossp extensions.
- Creates processed_events with a COMPOSITE PRIMARY KEY and NOT EMPTY check.
- Creates sagas table for durable orchestration.
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS processed_events (
  event_id uuid NOT NULL,
  consumer_group text NOT NULL,
  topic text NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  -- Patched: Add CHECK to prevent empty strings from bypassing idempotency
  CONSTRAINT check_consumer_group_not_empty CHECK (consumer_group <> ''),
  
  -- Patched: Use Composite PK for concurrency-safe idempotency
  PRIMARY KEY (event_id, consumer_group)
);

CREATE TABLE IF NOT EXISTS sagas (
  saga_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid UNIQUE NOT NULL,
  current_state text NOT NULL,
  payload jsonb,
  steps jsonb,
  last_error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sagas_order_id ON sagas(order_id);