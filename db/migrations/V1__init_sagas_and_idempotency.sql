CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS processed_events (
  event_id uuid NOT NULL,
  consumer_group text NOT NULL CHECK (consumer_group <> ''),
  topic text NOT NULL,
  created_at timestamptz DEFAULT now(),
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