import { getSql, isDbConfigured } from "./db";
import { generateHandle } from "./handle";

// User store. Queries Neon when DATABASE_URL is set; falls back to an
// in-memory sample so the /x4k9 demo keeps rendering before the database
// is provisioned.

export type User = {
  id: string;
  email: string;
  handle: string;
  name: string;
  tagline: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
  resume_md: string;
  created_at: string;
  deleted_at: string | null;
};

const SAMPLE: User = {
  id: "sample",
  email: "alex@stanford.edu",
  handle: "x4k9",
  name: "Alex Chen",
  tagline: "CS @ Stanford · ML systems & founder energy",
  photo_url: null,
  linkedin_url: "https://www.linkedin.com/in/alex-chen-stanford",
  resume_md: `# Alex Chen

CS @ Stanford (B.S. expected 2026). Interested in ML systems, fast inference,
and small teams shipping ambitious products. Looking for summer roles, founding
engineer conversations, or interesting research collaborations.

**Reach me:** alex@stanford.edu

---

## Education
- **Stanford University** — B.S. Computer Science, AI track (2022–2026, GPA 3.92)
- Coursework: CS 224N (NLP), CS 229 (ML), CS 149 (Parallel Computing), CS 248 (Graphics)

## Experience

### Anthropic — Inference Performance Intern (Summer 2025)
- Cut p50 latency on a production model path by 18% by reorganizing the KV-cache
  layout and rewriting two hot CUDA kernels.
- Owned a benchmark harness used by ~30 engineers to evaluate quantization
  variants before rollout.

### Stanford NLP Group — Research Assistant (2024–present, w/ Prof. Manning)
- Co-author on a paper exploring tokenizer-free byte-level retrieval (under
  review, EMNLP 2026).
- Built the eval pipeline that runs nightly across 12 datasets.

### Ramp — SWE Intern (Summer 2024)
- Shipped the merchant-category enrichment service used by the categorization
  ML model. ~$40M/mo of transactions flow through it.

## Projects
- **tinygrep** — single-binary, SIMD-accelerated grep replacement. 4k★ on
  GitHub. Posted #1 on Hacker News in March 2025.
- **paperboat** — Mac app that turns arXiv papers into spaced-repetition decks.
  ~600 weekly active users.

## Skills
Python, Rust, TypeScript, CUDA, PyTorch, JAX, Postgres, distributed training.

## Things I'm proud of
- Ran the Stanford CS curriculum in 2.5 years instead of 4.
- Cold-emailed 47 researchers in freshman year; the 12 who replied shaped
  every subsequent project.
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
    SELECT id, email, handle, name, tagline, photo_url, linkedin_url, resume_md,
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
    SELECT id, email, handle, name, tagline, photo_url, linkedin_url, resume_md,
           created_at, deleted_at
    FROM users
    WHERE lower(email) = ${email.toLowerCase()} AND deleted_at IS NULL
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
    SELECT id, email, handle, name, tagline, photo_url, linkedin_url, resume_md,
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
        linkedin_url = ${input.linkedin_url}
    WHERE id = ${id}::uuid AND deleted_at IS NULL
    RETURNING id, email, handle, name, tagline, photo_url, linkedin_url, resume_md,
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
};

// Creates a user with a fresh handle, retrying on the (unlikely but possible)
// collision until we find a free one. With ~1M handles and a small user base
// this loop almost never iterates more than once.
export async function createUser(input: CreateUserInput): Promise<User> {
  const sql = getSql();

  for (let attempt = 0; attempt < 8; attempt++) {
    const handle = generateHandle();
    try {
      const rows = (await sql`
        INSERT INTO users (email, handle, name, tagline, photo_url, linkedin_url, resume_md)
        VALUES (
          ${input.email.toLowerCase()},
          ${handle},
          ${input.name},
          ${input.tagline},
          ${input.photo_url},
          ${input.linkedin_url},
          ${input.resume_md}
        )
        RETURNING id, email, handle, name, tagline, photo_url, linkedin_url, resume_md,
                  created_at, deleted_at
      `) as User[];
      return rows[0];
    } catch (err) {
      // 23505 = unique_violation. If it's the handle index, retry with a new
      // handle; otherwise (e.g. email already exists) bubble up.
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("users_handle_active_idx")) continue;
      throw err;
    }
  }
  throw new Error("Could not allocate a unique handle after 8 tries");
}
