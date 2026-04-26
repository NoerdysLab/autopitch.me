-- Unguessable per-user resume slug. The old scheme of "/<handle>r" let
-- anyone who knew a pitch URL trivially derive the raw markdown URL,
-- which in turn leaks the résumé to scrapers. Replace it with a random
-- 12-char slug under /r/<slug> that's independent of the handle.

ALTER TABLE users ADD COLUMN IF NOT EXISTS resume_slug TEXT;

-- Backfill existing rows with random slugs. Use a 12-char hex string
-- derived from md5(random() || id) — collision-safe per-row, idempotent
-- across re-runs because the WHERE NULL guard skips backfilled rows.
UPDATE users
SET resume_slug = substr(md5(random()::text || id::text), 1, 12)
WHERE resume_slug IS NULL;

ALTER TABLE users ALTER COLUMN resume_slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_resume_slug_idx
  ON users (resume_slug);
