-- Replace the public sample (Alex Chen → Phil Knight). The home page's
-- "see a sample →" link points at /x4k9, and the demo features Phil
-- Knight as the worked example, so the sample should match.
--
-- Idempotent: safe to re-run. Deletes both the old Alex row and any
-- prior Phil row, then inserts fresh Phil data.

DELETE FROM users WHERE lower(email) = 'phil@stanford.edu';
DELETE FROM users WHERE lower(email) = 'alex@stanford.edu';

INSERT INTO users (
  email, handle, resume_slug, name, tagline, photo_url,
  linkedin_url, instagram_url, x_url, theme, resume_md
) VALUES (
  'phil@stanford.edu',
  'x4k9',
  'k7n2',
  'Phil Knight',
  'MBA @ Stanford GSB',
  NULL,
  'https://www.linkedin.com/in/philknight-gsb',
  NULL,
  NULL,
  'warm',
  $md$# Phil Knight
*MBA Candidate, Stanford GSB · Portland, OR*

GSB MBA, Class of 2026. Distance runner, accidental shoe importer.
Looking to talk to running-store owners about Japanese athletic shoes —
and to anyone who'd argue product or brand wins in footwear.

**Reach me:** phil@stanford.edu

---

## Education
- **Stanford Graduate School of Business** — MBA Candidate (2024–2026)
- **University of Oregon** — B.B.A. (2018–2022). Ran the mile (4:13 PR)
  under coach Bill Bowerman.

## Experience

### Founder, Blue Ribbon Sports — 2024–present
- Importing Onitsuka Tiger running shoes from Kobe, Japan.
- Selling out of the trunk of a Plymouth Valiant at track meets across the
  Pacific Northwest.
- $8,000 in first-year sales; reordering monthly. Margins improving with volume.
- Working name for the eventual rebrand: **"Nike."**

### United States Army Reserve — 2022–2023
- Active duty followed by reserve service.
- Reads as reliability under pressure on a résumé; reads as discipline to me.

### Price Waterhouse — Audit Intern, Summer 2023
- Learned to read a balance sheet. Learned I'd rather sell shoes.

## What I'm working on
- A second-year GSB paper arguing that Japanese athletic shoes can break the
  German hold on the US running market.
- Cold-emailing every track coach in the Pacific Northwest to get our shoes
  on more athletes' feet.

## What energizes me
- Running splits.
- Pricing puzzles.
- People who'd rather build than analyze.

## Things I'm proud of
- Sub-4:15 mile.
- Got Bowerman to bring product feedback into the company before we'd even
  named it.
- Talked my way into Onitsuka's Kobe office on a one-week visa.
$md$
);
