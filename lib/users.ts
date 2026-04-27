import { getSql, isDbConfigured } from "./db";
import { generateHandle, generateResumeSlug } from "./handle";
import { DEFAULT_THEME, type ThemeKey } from "./themes";

// User store. Queries Neon when DATABASE_URL is set; falls back to an
// in-memory Phil Knight sample so the /x4k9 demo keeps rendering before
// the database is provisioned.

export type User = {
  id: string;
  email: string;
  handle: string;
  resume_slug: string;
  name: string;
  tagline: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  x_url: string | null;
  theme: ThemeKey;
  resume_md: string;
  created_at: string;
  deleted_at: string | null;
};

const SAMPLE: User = {
  id: "sample",
  email: "phil@stanford.edu",
  handle: "x4k9",
  resume_slug: "k7n2",
  name: "Phil Knight",
  tagline: "MBA @ Stanford GSB",
  photo_url: null,
  linkedin_url: "https://www.linkedin.com/in/philknight-gsb",
  instagram_url: null,
  x_url: null,
  theme: "warm",
  resume_md: `# Phil Knight
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
`,
  created_at: new Date("2026-01-15").toISOString(),
  deleted_at: null,
};

export async function getUserByHandle(handle: string): Promise<User | null> {
  if (!isDbConfigured()) {
    return handle === SAMPLE.handle ? SAMPLE : null;
  }

  const sql = getSql();
  const rows = (await sql`
    SELECT id, email, handle, resume_slug, name, tagline, photo_url,
           linkedin_url, instagram_url, x_url, theme, resume_md,
           created_at, deleted_at
    FROM users
    WHERE handle = ${handle} AND deleted_at IS NULL
    LIMIT 1
  `) as User[];
  return rows[0] ?? null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  if (!isDbConfigured()) {
    return email.toLowerCase() === SAMPLE.email.toLowerCase() ? SAMPLE : null;
  }

  const sql = getSql();
  const rows = (await sql`
    SELECT id, email, handle, resume_slug, name, tagline, photo_url,
           linkedin_url, instagram_url, x_url, theme, resume_md,
           created_at, deleted_at
    FROM users
    WHERE lower(email) = ${email.toLowerCase()} AND deleted_at IS NULL
    LIMIT 1
  `) as User[];
  return rows[0] ?? null;
}

export async function getUserByResumeSlug(slug: string): Promise<User | null> {
  if (!isDbConfigured()) {
    return slug === SAMPLE.resume_slug ? SAMPLE : null;
  }
  const sql = getSql();
  const rows = (await sql`
    SELECT id, email, handle, resume_slug, name, tagline, photo_url,
           linkedin_url, instagram_url, x_url, theme, resume_md,
           created_at, deleted_at
    FROM users
    WHERE resume_slug = ${slug} AND deleted_at IS NULL
    LIMIT 1
  `) as User[];
  return rows[0] ?? null;
}

export async function getUserById(id: string): Promise<User | null> {
  if (!isDbConfigured()) {
    return id === SAMPLE.id ? SAMPLE : null;
  }
  const sql = getSql();
  const rows = (await sql`
    SELECT id, email, handle, resume_slug, name, tagline, photo_url,
           linkedin_url, instagram_url, x_url, theme, resume_md,
           created_at, deleted_at
    FROM users
    WHERE id = ${id}::uuid
    LIMIT 1
  `) as User[];
  return rows[0] ?? null;
}

export async function softDeleteUser(id: string): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE users
    SET deleted_at = now()
    WHERE id = ${id}::uuid AND deleted_at IS NULL
  `;
}

export type UpdateUserInput = {
  name: string;
  tagline: string | null;
  resume_md: string;
  photo_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  x_url: string | null;
  theme: ThemeKey;
};

// Flat update of the editable profile fields. Caller decides what photo_url
// to pass — the route handler handles "no change / replace / remove" logic
// before calling here, so this stays a dumb writer.
export async function updateUser(
  id: string,
  input: UpdateUserInput,
): Promise<User> {
  const sql = getSql();
  const rows = (await sql`
    UPDATE users
    SET name = ${input.name},
        tagline = ${input.tagline},
        resume_md = ${input.resume_md},
        photo_url = ${input.photo_url},
        linkedin_url = ${input.linkedin_url},
        instagram_url = ${input.instagram_url},
        x_url = ${input.x_url},
        theme = ${input.theme}
    WHERE id = ${id}::uuid AND deleted_at IS NULL
    RETURNING id, email, handle, resume_slug, name, tagline, photo_url,
              linkedin_url, instagram_url, x_url, theme, resume_md,
              created_at, deleted_at
  `) as User[];
  if (!rows[0]) throw new Error("User not found or deleted");
  return rows[0];
}

export type CreateUserInput = {
  email: string;
  name: string;
  tagline: string | null;
  resume_md: string;
  photo_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  x_url: string | null;
  theme?: ThemeKey;
};

// Creates a user with a fresh handle, retrying on the (unlikely but possible)
// collision until we find a free one. With ~1M handles and a small user base
// this loop almost never iterates more than once.
export async function createUser(input: CreateUserInput): Promise<User> {
  const sql = getSql();

  for (let attempt = 0; attempt < 8; attempt++) {
    const handle = generateHandle();
    const resumeSlug = generateResumeSlug();
    try {
      const rows = (await sql`
        INSERT INTO users (email, handle, resume_slug, name, tagline, photo_url,
                           linkedin_url, instagram_url, x_url, theme, resume_md)
        VALUES (
          ${input.email.toLowerCase()},
          ${handle},
          ${resumeSlug},
          ${input.name},
          ${input.tagline},
          ${input.photo_url},
          ${input.linkedin_url},
          ${input.instagram_url},
          ${input.x_url},
          ${input.theme ?? DEFAULT_THEME},
          ${input.resume_md}
        )
        RETURNING id, email, handle, resume_slug, name, tagline, photo_url,
                  linkedin_url, instagram_url, x_url, theme, resume_md,
                  created_at, deleted_at
      `) as User[];
      return rows[0];
    } catch (err) {
      // 23505 = unique_violation. If it's the handle or slug index, retry
      // with new randoms; otherwise (e.g. email already exists) bubble up.
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("users_handle_active_idx")) continue;
      if (msg.includes("users_resume_slug_idx")) continue;
      throw err;
    }
  }
  throw new Error("Could not allocate a unique handle after 8 tries");
}
