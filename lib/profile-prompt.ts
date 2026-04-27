// Prompt that users can copy into ChatGPT/Claude to bootstrap a rich
// markdown profile of themselves — broader than a résumé. Centralized
// here so the setup and edit forms stay in sync, and so we can tweak
// the wording without hunting it down later.

export const PROFILE_PROMPT = `I'm building an AI-readable profile of myself for warmpitch.me — a tool that lets recruiters, investors, collaborators, and others learn about me through their favorite LLM.

Generate a comprehensive markdown document covering both my professional background and personal context that any AI could use to pitch me accurately. Go beyond a résumé — include:

- Education, work history, and notable projects
- Technical and soft skills
- Side projects, writing, talks, or anything I've shipped publicly
- What kinds of opportunities I'm open to (full-time, internships, founding, advisory, freelance)
- What energizes me, what I'm strong at, what I value
- Where I'm headed

Use clean markdown — \`#\` for sections, \`-\` for bullets. Don't invent details; mark \`[TODO]\` placeholders for anything you don't know.

Here's what I have to start with:

[paste your résumé, LinkedIn URL, a bio, anything you've got]
`;
