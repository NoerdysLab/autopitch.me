-- autopitch.me — initial schema.
-- Run this once: paste it into the Neon SQL Editor and hit Run.

CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  handle      TEXT NOT NULL,
  name        TEXT NOT NULL,
  tagline     TEXT,
  photo_url   TEXT,
  resume_md   TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ
);

-- Handles and emails are unique among *active* users; soft-deleted rows
-- can keep their old values without blocking new signups.
CREATE UNIQUE INDEX IF NOT EXISTS users_handle_active_idx
  ON users (handle) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_email_active_idx
  ON users (lower(email)) WHERE deleted_at IS NULL;

-- Click log. Stored from day 1 even though analytics aren't shown in V1,
-- so the future $5 dashboard has historical data to display.
CREATE TABLE IF NOT EXISTS clicks (
  id           BIGSERIAL PRIMARY KEY,
  handle       TEXT NOT NULL,
  ai_platform  TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS clicks_handle_created_idx
  ON clicks (handle, created_at DESC);
