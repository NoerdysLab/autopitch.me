-- Background theme for the public pitch page. Five tasteful tints; new
-- users default to "warm" (the original cream). See lib/themes.ts for the
-- canonical key list — the CHECK constraint mirrors it so a typo can't
-- silently land an unrenderable value in the DB.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'warm';

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_theme_check;

ALTER TABLE users
  ADD CONSTRAINT users_theme_check
  CHECK (theme IN ('warm', 'sage', 'blush', 'sky', 'mauve'));
