-- One-time codes for the email login flow. We hash the code at rest so a
-- DB leak doesn't hand attackers ready-to-use logins.

CREATE TABLE IF NOT EXISTS otp_codes (
  id           BIGSERIAL PRIMARY KEY,
  email        TEXT NOT NULL,
  code_hash    TEXT NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL,
  consumed_at  TIMESTAMPTZ,
  attempts     INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Look up by email, newest first, when verifying.
CREATE INDEX IF NOT EXISTS otp_codes_email_created_idx
  ON otp_codes (lower(email), created_at DESC);
