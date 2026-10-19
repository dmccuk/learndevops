# CLAUDE.md

Learn DevOps (learndevops.co.uk) is a free, open-source DevOps course: 60 short standalone units in 13 tracks, plus learning paths and three projects. It is a static Astro + Starlight site deployed to GitHub Pages, with hands-on labs that run in the browser, GitHub Codespaces, Multipass VMs or the learner's own AWS account. The full specification is [docs/SPEC.md](docs/SPEC.md); read it before large changes.

## Commands

- `npm run dev`: local site at <http://localhost:4321/learndevops/>
- `npm run build`: build into `dist/`
- `npm run check`: `astro check`, contrast check, banned-words check, markdown lint
- `npm run check:links`: link check against the built site (build first; `-- --internal-only` skips external sites)
- `npm run sync`: create stub pages for new entries in `src/data/curriculum.yaml` and sync unit titles
- `./start --list`: list lab units (arrives in milestone 2)
- Lab CI locally: see `.github/workflows/labs.yml` (arrives in milestone 2)

Astro needs Node.js 22.22 or later. CI uses Node 24 (`.nvmrc`).

## How things fit together

- `src/data/curriculum.yaml` is the single source of truth for tracks, units, paths and projects. `src/lib/curriculum.ts` validates it with zod and fails the build on errors, including a unit without a page or a page without a unit.
- Unit pages are `src/content/docs/units/<id>.mdx`. Their title and description must match the YAML; `npm run sync` fixes drift.
- Internal links in components must use `url()` from `src/lib/url.ts` so they respect the base path. Root-relative Markdown links in MDX (`[x](/start-here/)`) are prefixed automatically.
- Colour tokens live in `src/styles/theme.css`. Add any new foreground/background pair to `scripts/check-contrast.mjs`.
- Starlight component overrides are in `src/components/starlight/`.

To add a unit, follow `docs/writing-a-unit.md`.

## Rules

- **Verify versions and syntax yourself.** Look up the latest stable release of a tool, pin it, and check its current docs. If upstream docs and the spec disagree, follow upstream and say so in the PR.
- **Never invent facts.** Prices, free-tier limits, versions, quotes and statistics need an official source linked next to them with a "Last checked" date. If you can't check something, write `TODO(owner): …`.
- **Ask the owner before** deleting anything, changing the fixed decisions in spec section 2, or adding any paid service, analytics, tracking or third-party script.
- Work one milestone at a time, one pull request per milestone. Run every check before calling a milestone done.

## Writing style (short form; full guide in docs/style-guide.md)

- UK English. Plain words, second person, active voice. Sentences under 25 words, paragraphs of 1–3 sentences.
- Why before how. Every lesson opens with the problem the tool solves.
- Never write "simply", "just", "easy" or "obviously". No emoji. (`npm run check:prose` enforces this.)
- Every command in its own copyable block, with expected output shown separately. No prompts in copied text.
- Define a term on first use and link it to the glossary.
- One outcome per unit. Units are standalone: say "if you haven't done this before, see C1", never "as you did in the last unit".
- Each unit has one short "In a real team" box.
- Alt text on every image; never carry information by colour alone.
