# Style guide

Follow these rules for every page on the site. `npm run check:prose` enforces the banned words and the no-emoji rule.

## Language

- **UK English** spelling and punctuation: colour, organise, licence (noun), artefact.
- **Plain words.** Prefer "use" to "utilise", "start" to "initiate".
- **Second person, active voice.** "You create a branch", not "A branch is created".
- **Short sentences and paragraphs.** Sentences under 25 words. Paragraphs of one to three sentences.
- **Never write** "simply", "just", "easy" or "obviously". They make learners who are stuck feel worse.
- **No emoji.**

## Structure

- **Why before how.** Every lesson opens with the problem the tool solves, before any commands.
- **One outcome per unit.** If a unit needs two outcomes, split it into two units.
- **Standalone units.** Never write "as you did in the last unit". Write "if you haven't done this before, see C1", and link to it.
- **In a real team.** Each unit has one short box describing how this step looks at work.

## Commands and output

- Put every command in its own copyable code block.
- Show the expected output separately, underneath. Never mix output into the block the learner copies.
- Never include a prompt (`$`, `PS>`) in copied text.
- Use `sh` for Linux and macOS commands and `powershell` for Windows commands.

## Terms

- Define a term the first time you use it on a page.
- Link that first use to its glossary entry (`/reference/glossary/#term`). Add the term to `src/data/glossary.yaml` if it is missing.

## Facts and numbers

- Prices, free-tier limits, version numbers, quotes and statistics must link to an official source.
- Add a "Last checked: <date>" note next to them, and set `lastChecked` in the page front matter.
- If you cannot check a fact, write `TODO(owner): …` in an MDX comment instead of guessing.

## Accessibility

- Alt text on every image. Diagrams need a text alternative.
- Never carry information by colour alone. Pair colour with text, such as "PASS" and "FAIL".
- Link text must make sense on its own. Avoid "click here".
