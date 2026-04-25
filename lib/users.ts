// Stub user store. Real implementation will hit Neon Postgres; for the
// scaffold we ship a single sample so the static pitch page renders.

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
  if (handle === SAMPLE.handle) return SAMPLE;
  return null;
}
