-- Optional LinkedIn URL per user. Used by the ChatGPT/Perplexity/Gemini
-- buttons because those AIs don't reliably fetch URLs from a prefilled
-- prompt; pointing them at LinkedIn (which they may already know about,
-- or can search for) is a more useful fallback than the autopitch URL.
ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Backfill the Alex Chen sample so /x4k9 demonstrates the multi-AI flow.
UPDATE users
SET linkedin_url = 'https://www.linkedin.com/in/alex-chen-stanford'
WHERE email = 'alex@stanford.edu' AND linkedin_url IS NULL;
