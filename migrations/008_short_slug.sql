-- Resume slugs were 12 hex chars; we're shortening them to 4 chars from
-- the full a–z + 0–9 alphabet. Existing 12-char slugs no longer pass the
-- /r/[slug] route's isValidResumeSlug check, so they'd 404 anyway —
-- regenerate every row to a fresh 4-char slug. Loops with a retry guard
-- in case of unique-index collisions on the new (smaller) space.

DO $$
DECLARE
  u RECORD;
  candidate TEXT;
  tries INT;
BEGIN
  FOR u IN
    SELECT id FROM users WHERE length(resume_slug) <> 4
  LOOP
    tries := 0;
    LOOP
      candidate := substr(md5(random()::text || u.id::text || tries::text), 1, 4);
      BEGIN
        UPDATE users SET resume_slug = candidate WHERE id = u.id;
        EXIT;
      EXCEPTION WHEN unique_violation THEN
        tries := tries + 1;
        IF tries > 10 THEN
          RAISE 'Could not allocate a unique 4-char slug for user %', u.id;
        END IF;
      END;
    END LOOP;
  END LOOP;
END $$;
