-- Optional social profile URLs that show up as small branded buttons
-- below the AI buttons on a user's pitch page. LinkedIn already lives
-- in users.linkedin_url and serves double duty (also drives the
-- LinkedIn-based AI prompts). These two are display-only.

ALTER TABLE users ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS x_url TEXT;
