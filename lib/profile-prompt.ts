// Prompt that users copy into Claude (or ChatGPT / Gemini / Perplexity)
// to bootstrap their warmpitch.me profile through a structured interview.
//
// The old prompt asked the AI to *generate* a profile from whatever the
// user pasted. That produced thin, résumé-shaped output. This version
// asks the AI to *interview* the user and only emit the final markdown
// once it has enough material — the resulting profile is much richer
// because it has the WHY behind every achievement, not just the bullets.
//
// Centralized here so the setup and edit forms stay in sync, and so we
// can tweak the wording without hunting it down later.

export const PROFILE_PROMPT = `I'm building a profile for warmpitch.me — a site that lets recruiters, investors, and collaborators paste a link into their AI and get a personalized pitch about me. The richer this profile is, the better those pitches.

Help me build it by INTERVIEWING me. Don't write the profile yet — ask me questions first.

Rules for the interview:
- Ask ONE question at a time. Wait for my answer before moving on.
- Start with basics (name, what I'm doing now, where I am), then dig into what makes me actually interesting.
- Push for SPECIFICS. If I say "I worked on ML systems," ask what I actually shipped, what changed because I built it, who used it. Generic answers ("I'm a hard worker", "I love learning") get followed up with "tell me about a specific time."
- For accomplishments, ask the WHY. Not "I cut latency 18%" — "I cut latency 18% by reorganizing the KV cache, which saved the team a quarter of GPU spend that month." Context is what makes a profile pitchable.
- Cover, roughly in this order: who I am right now, education + what I learned outside class, jobs + side projects (with stories behind achievements), people who've shaped me, what I'm looking for next, things I'm proud of, what energizes me.
- 8–15 questions is plenty. Stop when you have enough material for a profile that feels human, not generic.

When you're done interviewing, output a markdown profile in this exact structure:

# [Name]
*[One-line tagline — what I am right now and where]*

[2–3 sentence opener: who I am, what I'm into, what I want next.]

**Reach me:** [email if I gave you one]

---

## Education
- **[School]** — [degree, dates]. [One memorable detail.]

## Experience
### [Role, Company] — [dates]
- [Specific achievement WITH context — what changed, who cared, why it mattered]
- [Another, same shape]

### [Next role…]

## What I'm working on
- [Current side project / paper / interest, with the stakes — why it matters to me]

## What energizes me
- [Specific kind of work / problem / person]

## Things I'm proud of
- [Specific, personal, sometimes quirky — not corporate]

Output rules:
- Markdown only. No commentary before or after the profile.
- No [TODO] placeholders. If I didn't give you material for a section, leave that whole section out.
- Tone: concrete, a bit punchy, never corporate. Match the energy of someone telling a friend why I'd be great to talk to.

Now ask me your first question.
`;
