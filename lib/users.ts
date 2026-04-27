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
    SELECT id, email, handle, name, tagline, photo_url, resume_md,
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
    SELECT id, email, handle, name, tagline, photo_url, resume_md,
           created_at, deleted_at
    FROM users
    WHERE lower(email) = ${email.toLowerCase()} AND deleted_at IS NULL
    LIMIT 1
  `) as User[];
  return rows[0] ?? null;
}

export type CreateUserInput = {
  email: string;
  name: string;
  tagline: string | null;
  resume_md: string;
  photo_url: string | null;
};

export class EmailAlreadyExistsError extends Error {
  constructor() {
    super("email_already_exists");
    this.name = "EmailAlreadyExistsError";
  }
}

// Creates a user with a fresh handle, retrying on the (unlikely but possible)
// collision until we find a free one. Email-uniqueness violations surface as
// EmailAlreadyExistsError so the route can return a clean 409 even under a
// race against the precheck.
export async function createUser(input: CreateUserInput): Promise<User> {
  const sql = getSql();

  for (let attempt = 0; attempt < 8; attempt++) {
    const handle = generateHandle();
    try {
      const rows = (await sql`
        INSERT INTO users (email, handle, name, tagline, photo_url, resume_md)
        VALUES (
          ${input.email.toLowerCase()},
          ${handle},
          ${input.name},
          ${input.tagline},
          ${input.photo_url},
          ${input.resume_md}
        )
        RETURNING id, email, handle, name, tagline, photo_url, resume_md,
                  created_at, deleted_at
      `) as User[];
      return rows[0];
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("users_handle_active_idx")) continue;
      if (msg.includes("users_email_active_idx")) {
        throw new EmailAlreadyExistsError();
      }
      throw err;
    }
  }
  throw new Error("Could not allocate a unique handle after 8 tries");
}
