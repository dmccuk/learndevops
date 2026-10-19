# learndevops.co.uk — Build Specification

**Owner:** dmccuk (GitHub)  
**Version:** 1.1 — 19 October 2026 (design direction changed to the transit map)  
**Audience for this document:** Claude Code (the builder) and the site owner (the reviewer)

---

## 0. Instructions for Claude Code

Read this whole document before writing any code. Then:

1. **Make a plan** that follows the milestones in section 16, and show it to the owner before starting.
2. **Work one milestone at a time.** Commit after each meaningful step with a clear message. Open a pull request per milestone.
3. **Run every check you add** (build, lint, link check, lab tests) before saying a milestone is done.
4. **Verify current versions and syntax yourself.** This spec names tools, not versions. Look up the latest stable release of each tool, pin it, and check its current docs. Where this spec and current upstream docs disagree on syntax, follow upstream and note it in the PR.
5. **Never invent facts.** Prices, free-tier limits, version numbers, quotes and statistics must come from an official source you have checked, with the link recorded next to it in the content (as a footnote or "Last checked" note). If you cannot check something, write `TODO(owner): …` instead.
6. **Ask before** deleting anything, changing the decisions in section 2, or adding any paid service, analytics, tracking or third-party script.
7. Section 17 lists open decisions. Use the stated default, and list each one you relied on in the PR description so the owner can change it.

---

## 1. What we are building

A free, open-source DevOps learning website, hosted on GitHub Pages, at `learndevops.co.uk` (domain to be connected later; see section 13).

**The idea:** a library of **60 short, standalone units** (30–60 minutes each) in **13 tracks**. Each unit teaches one skill and ends with one clear outcome. Every unit can be started cold from a ready-made checkpoint, but also shows where it fits in the whole DevOps pipeline. **Learning paths** and **three projects** string units together into the full "laptop to production" story.

**Audience:** complete beginners and sysadmins moving into DevOps. They use Windows or Mac laptops. Many have never used Linux.

**Hands-on labs run in four places**, and learners need nothing installed to begin:

| Environment | Used for | Learner needs |
| --- | --- | --- |
| Browser | Linux and Git basics | A browser |
| GitHub Codespaces | Most units, including all core Kubernetes units | A free GitHub account |
| Laptop (Multipass VMs) | systemd, SSH, a real multi-node Kubernetes cluster | Multipass installed |
| AWS | Cloud provisioning, deployment, managed Kubernetes | Their own AWS account |

**This is a modern refresh of the existing repo**, not a new one. The original course repo (`dmccuk/devops_tools_course`) is renamed to `dmccuk/learndevops` and rebuilt in place, so its stars, forks and history are kept. The original course is preserved as the git tag `v1-original` and its files are moved into `legacy/`. Link to the tag from the About page as "the original course".

---

## 2. Fixed decisions

| Area | Decision |
| --- | --- |
| Repo | The existing public repo `dmccuk/devops_tools_course`, renamed to `dmccuk/learndevops` and refreshed in place to keep its stars and forks (see section 2.1) |
| Site generator | **Astro** with the **Starlight** docs theme, TypeScript, MDX content |
| Hosting | GitHub Pages, deployed by GitHub Actions |
| Backend | None. Fully static site. |
| Content source | MDX files in `src/content/docs/`, with metadata driven by a single curriculum data file (section 7) |
| Lab environment | One devcontainer for the whole repo, plus one heavier variant for monitoring units |
| Lab tooling | `./start <unit-id>`, `./check <unit-id>` and `./cleanup <unit-id>` scripts (section 9) |
| Sample app | One small Python web app used through the whole course (section 10) |
| Kubernetes locally | `kind` inside Codespaces; `k3s` on Multipass VMs for the laptop unit |
| Kubernetes traffic | **Gateway API** (not the retired Ingress NGINX controller) |
| CI/CD taught | GitHub Actions (Jenkins and GitLab are not part of the main path) |
| IaC taught | Terraform as the default, with a note in each IaC unit that OpenTofu commands are drop-in equivalents |
| AWS default region | `eu-west-2` (London), configurable |
| Language | UK English throughout |
| Licence | Code: MIT. Written content: CC BY 4.0 (see section 17) |
| Analytics | None |

### 2.1 Refreshing the existing repo

Stars and forks belong to the repository, not its name or files. They are lost only if a new repo is created or this one is deleted. So:

1. **Tag first.** Before any change, tag the current `main` as `v1-original` and push the tag. This is the permanent link to the original course.
2. **Rename** `devops_tools_course` to `learndevops` in the repo settings. GitHub redirects the old repo URL. The owner does this step; Claude Code must not rename the repo.
3. **Refresh through a pull request, never a force-push.** Old history stays under the new work. Do not delete the repo, archive it, or rewrite history.
4. **Move the old files** (`packer/`, `terraform/`, `images/`, `server_setup.md`, the old `README.MD`) into `legacy/`, with a `legacy/README.md` explaining they are from the original course and pointing to the `v1-original` tag.
5. **README banner:** the new README opens with "2026 refresh: this course has been rebuilt as learndevops.co.uk. The original course is at tag `v1-original`."
6. **Repo metadata:** update the description and homepage field to the new site URL (owner step).
7. **Forks** need no action; they stay in the fork network with the old content.

---

## 3. Repository structure

Create this layout. Names in angle brackets are examples.

```
learndevops/
├── .devcontainer/
│   ├── devcontainer.json            # default: 2-core, all tools
│   ├── monitoring/devcontainer.json # 4-core variant for O5 and heavy units
│   └── post-create.sh               # installs tools not available as features
├── .github/
│   ├── workflows/
│   │   ├── site.yml                 # build, test, deploy the site
│   │   ├── labs.yml                 # run start + check against solutions
│   │   └── app.yml                  # test the sample app
│   ├── ISSUE_TEMPLATE/              # bug in a lab, content error, unit request
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── dependabot.yml
├── app/                             # the course app (section 10)
├── bin/
│   ├── start                        # ./start <unit-id>
│   ├── check                        # ./check <unit-id>
│   └── cleanup                      # ./cleanup <unit-id>
├── labs/
│   ├── _lib/                        # shared bash helpers (output, asserts, kind, aws tags)
│   ├── _laptop/                     # Multipass cloud-init files and helper scripts
│   └── <k2>/                        # one folder per unit (section 9)
│       ├── lab.yaml
│       ├── start.sh
│       ├── check.sh
│       ├── cleanup.sh
│       ├── starter/
│       └── solution/
├── legacy/                          # original course files (section 2.1), not published
├── docs/                            # maintainer docs (not published)
│   ├── CONTRIBUTING.md
│   ├── writing-a-unit.md
│   ├── custom-domain.md
│   └── style-guide.md
├── public/
│   ├── favicon.svg
│   └── og/                          # social share images
├── src/
│   ├── components/                  # section 8
│   ├── content/docs/                # all MDX pages
│   │   ├── index.mdx                # home page (uses a custom layout)
│   │   ├── start-here/
│   │   ├── tracks/<track-id>/index.mdx
│   │   ├── units/<unit-id>.mdx
│   │   ├── paths/
│   │   ├── projects/
│   │   └── reference/               # glossary, costs, FAQ, about
│   ├── data/curriculum.yaml         # single source of truth (section 7)
│   ├── lib/curriculum.ts            # typed loader + validation (zod)
│   ├── styles/theme.css             # design tokens (section 5)
│   └── content.config.ts            # content collection schema
├── astro.config.mjs
├── package.json
├── CLAUDE.md                        # short guide for future Claude Code sessions
├── LICENSE                          # MIT (code)
├── LICENSE-CONTENT                  # CC BY 4.0 (written content)
└── README.md
```

Unit IDs are lower case in paths and URLs (`k2`), upper case in prose ("K2").

---

## 4. Pages and navigation

### 4.1 Site map

| URL | Page | Notes |
| --- | --- | --- |
| `/` | Home | Custom layout, section 6 |
| `/start-here/` | Start here | How the course works, which path to pick, how labs run |
| `/start-here/environments/` | Your lab environments | Browser, Codespaces, laptop, AWS: setup for each, with Windows and Mac tabs |
| `/start-here/costs-and-safety/` | Costs and safety | Who pays for what, AWS safety rules, disclaimer (section 12) |
| `/curriculum/` | Curriculum | Pipeline map + all 13 tracks with their units |
| `/tracks/<id>/` | Track page | Intro, the stage it covers, unit list with outcomes |
| `/units/<id>/` | Unit page | Section 7.3 template |
| `/paths/` and `/paths/<id>/` | Learning paths | Section 7.5 |
| `/projects/` and `/projects/<id>/` | Projects | Section 7.6 |
| `/reference/glossary/` | Glossary | Every term linked from units |
| `/reference/faq/` | FAQ | Includes "Is DevOps still worth learning now AI writes code?" |
| `/reference/videos/` | Videos | All videos, by unit, including the six older ones |
| `/about/` | About | Owner bio (placeholder), the original course (link to tag `v1-original`), licences, contributing |
| `/404` | Not found | Friendly, with a search box and link to Start here |

### 4.2 Navigation

- **Top bar:** logo `learndevops.co.uk`, links to Curriculum, Paths, Projects, Videos (YouTube), GitHub, theme toggle, search.
- **Sidebar** (Starlight): Start here → Curriculum → Tracks (collapsed groups, one per track, units inside, ordered by ID) → Paths → Projects → Reference.
- **Search:** Starlight's built-in Pagefind search.
- **Unit footer:** Previous / Next within the track, plus "Next in your path" when the learner arrived from a path page (use a `?path=<id>` query parameter; no storage needed).

### 4.3 Progress tracking (optional, client-side only)

Let learners tick a unit as done. Store progress in `localStorage` only, wrapped in try/catch, and show ticks on track and path pages. No accounts, no server. The site must work fully with storage blocked.

---

## 5. Design system

**Direction: the transit map** (chosen by the owner on 19 October 2026, replacing the original dark terminal style). The course is drawn as a metro network: every track is a line with its own colour, every unit is a station, and learning paths are routes. The map is the one bold element; everything around it stays quiet. Implement as CSS custom properties in `src/styles/theme.css`, mapped onto Starlight's `--sl-*` variables. Provide light (default) and dark ("night map") themes.

### 5.1 Colour tokens

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--ld-bg` | `#F6F8FA` | `#0E1A26` | Page background (cool white, not cream; night navy, not black) |
| `--ld-bg-alt` | `#EDF1F5` | `#122130` | Alternate section bands |
| `--ld-surface` | `#FFFFFF` | `#15222F` | Panels and cards |
| `--ld-terminal` | `#14202B` | `#0A131C` | Code and terminal blocks (dark in both themes) |
| `--ld-border` | `#D5DCE3` | `#2A3C4E` | Borders and rules |
| `--ld-text` | `#14202B` | `#DCE4EC` | Body text |
| `--ld-heading` | `#14202B` | `#F2F5F8` | Headings |
| `--ld-muted` | `#4A5866` | `#A3B1BF` | Secondary text |
| `--ld-dim` | `#5C6976` | `#8C9BAA` | Captions, metadata |
| `--ld-accent` | `#2346C0` | `#8FA8FF` | Links and buttons (signage blue) |
| `--ld-on-accent` | `#FFFFFF` | `#0E1A26` | Text on accent buttons |
| `--ld-ok` | `#00783E` | `#5FC08F` | Success, PASS |
| `--ld-warn` | `#B8122B` | `#F08A7A` | Warnings, FAIL, cost notices |

**Line colours**, one per track (`--line-l`, `--line-g` …). The track letter is always shown with its colour, so colour never carries meaning alone. In light mode letters are white on the line colour; in dark mode they are night navy on a lighter version of it.

| Track | Light | Dark | Track | Light | Dark |
| --- | --- | --- | --- | --- | --- |
| L | `#12395F` | `#768CA2` | W | `#0E7490` | `#4393A8` |
| G | `#C2410C` | `#D16F46` | A | `#B8122B` | `#D26777` |
| N | `#5A6876` | `#7E8994` | K | `#2F55D4` | `#6985E0` |
| AI | `#5F6B00` | `#858F3D` | R | `#7C2D12` | `#AE7D6C` |
| P | `#8A5A00` | `#A6823D` | O | `#A3195B` | `#C46C96` |
| C | `#00745F` | `#429889` | S | `#00783E` | `#3D986C` |
| I | `#6A3FA0` | `#9A7CBE` | | | |

All text must meet WCAG 2.2 AA contrast (4.5:1 for body, 3:1 for large text and for line colours against backgrounds) in both themes. `scripts/check-contrast.mjs` checks every pair actually used together, including each line colour, and fails CI if any pair fails.

### 5.2 Typography

- **Overpass** (an open-source face based on highway signage) for all text, in heavy weights (800) for headings. **Overpass Mono** for code and commands only. Self-host via `@fontsource` packages (no Google Fonts requests).
- Scale: body 17px / 1.6; h1 clamp(36px, 4.5vw, 56px); h2 28–36px; h3 20–22px.
- Sentence case everywhere. No uppercase or monospace labels, no "A · B · C" metadata strings, and no labels above headings.

### 5.3 Shape and layout

- Radius 6px for buttons, 10px for panels and cards, round for line badges ("roundels") and stations. Borders 1px. Rails 6px. No shadows, no gradients, no emoji.
- Content max width 1180px on custom pages; Starlight's default width on docs pages.
- Must work at 360px wide with no horizontal page scroll. Touch targets at least 44px.

### 5.4 Map elements

- **Roundel:** the track letter on its line colour.
- **Station:** filled when the unit is ready, hollow when it is coming soon, a double ring for an interchange (a unit that other tracks build on).
- **Unit header:** a station sign (roundel, track name, "Stop 2 of 10") with the line's stations underneath and the current one marked.
- **Track page:** a vertical line diagram of its units.
- **Path page:** a route, with "Change to the … line" wherever it switches track.

---

## 6. Home page

Build `/` as a custom Starlight page (`template: splash` or a custom Astro layout) matching this structure and copy. Text in square brackets is a placeholder for the owner.

1. **Header bar:** logo (a short line with an interchange station, then `learndevops.co.uk`), links: Curriculum, What you'll build, Videos, GitHub, button **Start free** (→ `/start-here/`) on wider screens.
2. **Hero** (two columns, stacking on mobile):
   - Short line above the heading: "Free and hands-on. Nothing to install to start."
   - H1: **From a blank laptop to a working CI/CD pipeline.**
   - Text: "A free DevOps course in 60 short, hands-on units. Start with Linux in your browser, move into a ready-made cloud workspace, and finish by deploying a real app to AWS or Kubernetes."
   - Buttons: **Start unit L1** (→ `/units/l1/`), **View the code on GitHub** (→ repo).
   - Small print: "Works on Windows, Mac and Linux. All you need is a browser and a free GitHub account."
   - Right column: the course map (`TransitMap`): every track as a line in pipeline order, every unit as a station link, with a key for ready, coming soon and interchange stations.
3. **AI band:** H2 "Is DevOps still worth learning now AI writes code?" Text: "**Yes.** AI can write code, but someone still has to build it, test it, ship it, secure it and keep it running. AI means more code arrives, faster. That makes reliable pipelines, infrastructure as code and good monitoring matter more, not less." Link: "Read the full answer" → FAQ.
4. **Pipeline map:** label "The big picture", H2 "Every track teaches one stage of the same pipeline", then the `PipelineMap` component (section 8) with every track clickable.
5. **Ways in:** H2 "Pick a path, or just pick a unit". Cards for the five paths (section 7.5), each with who it's for and unit count.
6. **How every unit works:** four items: **Read** (a short lesson that explains the why), **Do** (a hands-on lab from a ready-made starting point), **Check** (a script tells you whether it worked), **Watch** (videos on the London IAC YouTube channel, where available).
7. **Projects:** three cards (section 7.6).
8. **Who's teaching:** circular `[PHOTO]` placeholder, `[YOUR NAME]`, `[A few lines on your DevOps background]`.
9. **Final call to action:** "Ready? Unit L1 runs right here in your browser." Button **Start unit L1**.
10. **Footer:** `learndevops.co.uk · Free and open source · © 2026 [YOUR NAME]`; links: GitHub, YouTube (`https://www.youtube.com/c/LondonIAC`), Licences, Costs and safety.

---

## 7. Content model

### 7.1 Single source of truth: `src/data/curriculum.yaml`

All track, unit, path and project metadata lives here. Pages read it; nothing is duplicated by hand. Validate it with zod in `src/lib/curriculum.ts` and **fail the build** if:

- a unit referenced anywhere (prerequisites, paths, projects) does not exist,
- a unit in the YAML has no MDX page, or an MDX page has no YAML entry,
- a field has an invalid value.

Seed the file with the data in section 7.4–7.6.

Unit fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | string | e.g. `K2` |
| `title` | string | e.g. "Deploying an app" |
| `outcome` | string | Completes "After this unit, you can…" |
| `track` | string | Track ID |
| `stage` | enum | `foundations`, `code`, `build-test`, `package`, `provision`, `configure`, `deploy`, `operate`, `observe`, `security` |
| `runsIn` | enum | `browser`, `codespaces`, `codespaces-4core`, `laptop`, `aws` |
| `alsoRunsIn` | enum[] | Optional. Browser units also run in `codespaces`. |
| `minutes` | number | Estimate, 30–60 |
| `prerequisites` | unit ID[] | Skills needed, as the units that teach them |
| `status` | enum | `planned`, `draft`, `published` |
| `video` | object | Optional: `{ youtubeId, title, legacy: boolean }` |
| `costNote` | boolean | True for any unit that creates billable AWS resources |

**Status rules:** `planned` units appear in lists greyed out with a "Coming soon" badge and a short stub page (title, outcome, where it fits). `draft` units are built but excluded from the sitemap and marked "Draft". Only `published` units count in progress and path totals.

### 7.2 Tracks

```yaml
tracks:
  - { id: L,  name: "Linux and the shell",         stage: foundations, new: false, intro: "The command line skills every other track builds on." }
  - { id: G,  name: "Git and collaboration",       stage: code,        new: false, intro: "Track every change and work with other people safely." }
  - { id: N,  name: "Networking essentials",       stage: foundations, new: false, intro: "Enough networking to debug anything you deploy." }
  - { id: C,  name: "Containers",                  stage: package,     new: false, intro: "Package an app so it runs the same everywhere." }
  - { id: K,  name: "Kubernetes",                  stage: deploy,      new: true,  intro: "Run, scale and update containers on a cluster." }
  - { id: A,  name: "Configuration with Ansible",  stage: configure,   new: false, intro: "Configure many servers the same way, every time." }
  - { id: I,  name: "Infrastructure as code",      stage: provision,   new: false, intro: "Create and destroy infrastructure from code." }
  - { id: P,  name: "CI/CD and delivery",          stage: build-test,  new: false, intro: "Test, build and deploy automatically on every change." }
  - { id: W,  name: "Cloud with AWS",              stage: provision,   new: false, intro: "Use a real cloud account safely and cheaply." }
  - { id: O,  name: "Observability",               stage: observe,     new: false, intro: "Know what your systems are doing, and hear about problems first." }
  - { id: S,  name: "DevSecOps",                   stage: security,    new: true,  intro: "Build security into every stage, not on at the end." }
  - { id: R,  name: "Running production",          stage: operate,     new: true,  intro: "Keep things running, and recover well when they don't." }
  - { id: AI, name: "AI in DevOps",                stage: code,        new: true,  intro: "Use AI assistants for infrastructure work without lowering the bar." }
```

The P track spans two stages: P1–P3 are `build-test`, P4–P6 are `deploy`. Track stage is for colouring only; each unit carries its own stage.

### 7.3 Unit page template

Every unit MDX page follows this exact order. The header block and the "Where this fits" and "What's next" sections are generated from YAML by components; the author writes the rest.

1. **Header** (`UnitHeader`): ID and title; track; badges for stage, runs-in, minutes, "New" if the track is new; `CostNotice` if `costNote` is true.
2. **You'll be able to:** the `outcome`, plus 2–4 specific bullet points.
3. **Before you start:** prerequisite skills in plain words, each linked to its unit ("You should be able to run a container — see C1").
4. **Where this fits** (`WhereThisFits`): the pipeline map with this unit's stage highlighted, plus one author-written paragraph on what happens before and after this step in a real team.
5. **Start the lab** (`StartLab`): tabs for each environment the unit runs in. For Codespaces: an "Open in Codespaces" button, then `./start <id>`. For browser units: "Open the browser terminal" link (section 9.2) and the setup commands to paste. For laptop: Multipass steps. For AWS: a reminder to complete W1 first and the region to use.
6. **The lesson:** short explanation, diagrams where helpful. Explain *why* before *how*. 400–1200 words.
7. **The lab:** numbered steps. Every command in a copyable code block with the expected output shown underneath.
8. **Check your work:** `./check <id>` with sample PASS output. For browser-only steps, a short self-check list with expected outputs.
9. **Common errors:** at least three, each as "What you see" → "Why" → "Fix".
10. **Clean up:** `./cleanup <id>`, and for AWS units a mandatory "confirm nothing is left running" step.
11. **Video** (optional, `VideoEmbed`): click-to-load, `youtube-nocookie.com`. Legacy videos get a note: "This video is from the original course; the approach differs slightly from this unit."
12. **What's next** (`WhatsNext`): next unit in the track, units that list this one as a prerequisite, and the path link if `?path=` is set.
13. **Footer line:** "Last checked: <date>", and an "Edit this page on GitHub" link.

### 7.4 All 60 units

Seed `curriculum.yaml` with these. `status` starts as `planned` for all, then moves to `draft`/`published` as milestones complete. `minutes` are estimates.

```yaml
units:
  # L · Linux and the shell
  - { id: L1, track: L, stage: foundations, runsIn: browser, alsoRunsIn: [codespaces], minutes: 45, prerequisites: [], title: "The command line", outcome: "Move around, create, copy and find files without a GUI" }
  - { id: L2, track: L, stage: foundations, runsIn: browser, alsoRunsIn: [codespaces], minutes: 40, prerequisites: [L1], title: "Permissions and users", outcome: "Read and change permissions and ownership, and use sudo safely" }
  - { id: L3, track: L, stage: foundations, runsIn: browser, alsoRunsIn: [codespaces], minutes: 40, prerequisites: [L1], title: "Processes and logs", outcome: "Find what is running, stop it, and read system logs" }
  - { id: L4, track: L, stage: foundations, runsIn: laptop, minutes: 45, prerequisites: [L3], title: "Services with systemd", outcome: "Start, stop, enable and debug a service" }
  - { id: L5, track: L, stage: foundations, runsIn: browser, alsoRunsIn: [codespaces], minutes: 60, prerequisites: [L1], title: "Bash scripting", outcome: "Write a script with arguments, loops and proper exit codes" }
  - { id: L6, track: L, stage: foundations, runsIn: browser, alsoRunsIn: [codespaces], minutes: 45, prerequisites: [L1], title: "Text processing", outcome: "Pull answers out of log files with grep, sed, awk and pipes" }

  # G · Git and collaboration
  - { id: G1, track: G, stage: code, runsIn: browser, alsoRunsIn: [codespaces], minutes: 45, prerequisites: [L1], title: "Git basics", outcome: "Commit, branch, merge and undo a mistake" }
  - { id: G2, track: G, stage: code, runsIn: codespaces, minutes: 40, prerequisites: [G1], title: "Working with GitHub", outcome: "Push, open a pull request, review and merge it" }
  - { id: G3, track: G, stage: code, runsIn: browser, alsoRunsIn: [codespaces], minutes: 45, prerequisites: [G1], title: "Conflicts and history", outcome: "Resolve a merge conflict, rebase, and read history to find a change" }
  - { id: G4, track: G, stage: code, runsIn: codespaces, minutes: 30, prerequisites: [G2], title: "Branching strategies", outcome: "Choose trunk-based or feature branches and protect main" }

  # N · Networking essentials
  - { id: N1, track: N, stage: foundations, runsIn: codespaces, minutes: 60, prerequisites: [L1], title: "Networking for DevOps", outcome: "Explain ports, DNS, HTTP and TLS, and debug with curl and dig" }
  - { id: N2, track: N, stage: foundations, runsIn: laptop, minutes: 45, prerequisites: [L2], title: "SSH properly", outcome: "Create keys, write an SSH config and hop through a jump host" }
  - { id: N3, track: N, stage: foundations, runsIn: codespaces, minutes: 45, prerequisites: [N1, C4], title: "Load balancers and proxies", outcome: "Put a reverse proxy in front of two app servers" }

  # C · Containers
  - { id: C1, track: C, stage: package, runsIn: codespaces, minutes: 45, prerequisites: [L1], title: "Containers explained", outcome: "Run, inspect and stop containers, and explain images vs containers" }
  - { id: C2, track: C, stage: package, runsIn: codespaces, minutes: 45, prerequisites: [C1], title: "Writing a Dockerfile", outcome: "Containerise the course app" }
  - { id: C3, track: C, stage: package, runsIn: codespaces, minutes: 40, prerequisites: [C2], title: "Smaller, safer images", outcome: "Use multi-stage builds and non-root users" }
  - { id: C4, track: C, stage: package, runsIn: codespaces, minutes: 45, prerequisites: [C2], title: "Docker Compose", outcome: "Run the app, a database and a proxy together" }
  - { id: C5, track: C, stage: package, runsIn: codespaces, minutes: 30, prerequisites: [C2, G2], title: "Registries", outcome: "Tag and push images to GitHub Container Registry" }

  # K · Kubernetes (new)
  - { id: K1,  track: K, stage: deploy, runsIn: codespaces, minutes: 60, prerequisites: [C1], title: "Kubernetes in an hour", outcome: "Create a cluster and explore nodes, pods and namespaces with kubectl" }
  - { id: K2,  track: K, stage: deploy, runsIn: codespaces, minutes: 45, prerequisites: [K1, C2], title: "Deploying an app", outcome: "Run the course app as a Deployment and reach it through a Service" }
  - { id: K3,  track: K, stage: deploy, runsIn: codespaces, minutes: 40, prerequisites: [K2], title: "Config and secrets", outcome: "Feed settings in with ConfigMaps and Secrets" }
  - { id: K4,  track: K, stage: deploy, runsIn: codespaces, minutes: 45, prerequisites: [K2], title: "Health and rollouts", outcome: "Add health probes, roll out a new version and roll back a bad one" }
  - { id: K5,  track: K, stage: deploy, runsIn: codespaces, minutes: 45, prerequisites: [K2], title: "Scaling and resources", outcome: "Set requests and limits, and scale with the autoscaler" }
  - { id: K6,  track: K, stage: deploy, runsIn: codespaces, minutes: 45, prerequisites: [K2], title: "Storage", outcome: "Run a database on a persistent volume that survives restarts" }
  - { id: K7,  track: K, stage: deploy, runsIn: codespaces, minutes: 45, prerequisites: [K2, N1], title: "Traffic in", outcome: "Route web traffic to several apps with Gateway API" }
  - { id: K8,  track: K, stage: deploy, runsIn: codespaces, minutes: 50, prerequisites: [K3], title: "Helm", outcome: "Install software from a chart and package the course app as one" }
  - { id: K9,  track: K, stage: deploy, runsIn: laptop, minutes: 60, prerequisites: [K2, N2], title: "A real cluster", outcome: "Build a 3-node k3s cluster, drain a node and survive a node failure" }
  - { id: K10, track: K, stage: deploy, runsIn: aws, minutes: 60, costNote: true, prerequisites: [K2, I2, W1], title: "Managed Kubernetes", outcome: "Create an EKS cluster with Terraform, deploy to it and tear it down" }

  # A · Configuration with Ansible
  - { id: A1, track: A, stage: configure, runsIn: codespaces, minutes: 45, prerequisites: [L2], title: "Ansible basics", outcome: "Write an inventory and run commands across many servers" }
  - { id: A2, track: A, stage: configure, runsIn: codespaces, minutes: 50, prerequisites: [A1], title: "Playbooks", outcome: "Install and configure a web server, safely re-runnable" }
  - { id: A3, track: A, stage: configure, runsIn: codespaces, minutes: 50, prerequisites: [A2], title: "Roles and templates", outcome: "Turn a playbook into a reusable role with variables" }
  - { id: A4, track: A, stage: configure, runsIn: codespaces, minutes: 40, prerequisites: [A2], title: "Testing Ansible", outcome: "Use assert, ansible-lint and check-mode dry runs" }

  # I · Infrastructure as code
  - { id: I1, track: I, stage: provision, runsIn: codespaces, minutes: 45, prerequisites: [C1], title: "IaC concepts", outcome: "Plan, apply and destroy infrastructure locally with the Docker provider" }
  - { id: I2, track: I, stage: provision, runsIn: codespaces, minutes: 50, prerequisites: [I1], title: "Variables and modules", outcome: "Make Terraform code reusable with variables, outputs and modules" }
  - { id: I3, track: I, stage: provision, runsIn: aws, minutes: 45, costNote: true, prerequisites: [I2, W1], title: "State", outcome: "Explain state, store it remotely in S3 and recover from drift" }
  - { id: I4, track: I, stage: provision, runsIn: aws, minutes: 50, costNote: true, prerequisites: [I2, W1], title: "Golden images with Packer", outcome: "Bake a machine image with the app's dependencies" }
  - { id: I5, track: I, stage: provision, runsIn: aws, minutes: 60, costNote: true, prerequisites: [I3, N1], title: "A network in AWS", outcome: "Build a VPC, subnets, security groups and a load balancer" }

  # P · CI/CD and delivery
  - { id: P1, track: P, stage: build-test, runsIn: codespaces, minutes: 45, prerequisites: [G2], title: "Your first pipeline", outcome: "Run tests on every push with GitHub Actions" }
  - { id: P2, track: P, stage: build-test, runsIn: codespaces, minutes: 45, prerequisites: [P1, C5], title: "Build and publish", outcome: "Build an image and push it to a registry on every merge" }
  - { id: P3, track: P, stage: build-test, runsIn: codespaces, minutes: 45, prerequisites: [P1], title: "Quality gates", outcome: "Block a merge that fails linting, tests or a security scan" }
  - { id: P4, track: P, stage: deploy, runsIn: aws, minutes: 60, costNote: true, prerequisites: [P2, I5, A2], title: "Deploy from a pipeline", outcome: "Deploy to AWS using OIDC, with no stored keys" }
  - { id: P5, track: P, stage: deploy, runsIn: codespaces, minutes: 50, prerequisites: [K2, G2], title: "GitOps with Argo CD", outcome: "Make Git the source of truth and let Argo CD sync the cluster" }
  - { id: P6, track: P, stage: deploy, runsIn: codespaces, minutes: 50, prerequisites: [K4], title: "Release strategies", outcome: "Run rolling, blue-green and canary releases, and pick between them" }

  # W · Cloud with AWS
  - { id: W1, track: W, stage: provision, runsIn: aws, minutes: 45, prerequisites: [], title: "Account safety", outcome: "Set up MFA, Identity Center and a budget alert before building anything" }
  - { id: W2, track: W, stage: provision, runsIn: aws, minutes: 45, costNote: true, prerequisites: [W1], title: "Core services tour", outcome: "Explain what EC2, S3, IAM and VPC are for" }
  - { id: W3, track: W, stage: provision, runsIn: aws, minutes: 45, prerequisites: [W1], title: "IAM in practice", outcome: "Write least-privilege roles and policies" }
  - { id: W4, track: W, stage: provision, runsIn: aws, minutes: 30, prerequisites: [W1], title: "Cost control", outcome: "Tag resources, track spend and spot a runaway bill" }

  # O · Observability
  - { id: O1, track: O, stage: observe, runsIn: codespaces, minutes: 30, prerequisites: [], title: "Monitoring concepts", outcome: "Explain metrics, logs and traces, and the four golden signals" }
  - { id: O2, track: O, stage: observe, runsIn: codespaces, minutes: 50, prerequisites: [O1, C4], title: "Prometheus and Grafana", outcome: "Collect the app's metrics and build a dashboard" }
  - { id: O3, track: O, stage: observe, runsIn: codespaces, minutes: 45, prerequisites: [O2], title: "Centralised logs", outcome: "Ship logs to Loki and search them" }
  - { id: O4, track: O, stage: observe, runsIn: codespaces, minutes: 45, prerequisites: [O2], title: "Alerts", outcome: "Alert on a real problem and send it to Slack" }
  - { id: O5, track: O, stage: observe, runsIn: codespaces-4core, minutes: 50, prerequisites: [O2, K2], title: "Monitoring Kubernetes", outcome: "Install the Prometheus stack on a cluster and read its health" }

  # S · DevSecOps (new)
  - { id: S1, track: S, stage: security, runsIn: codespaces, minutes: 40, prerequisites: [G2], title: "Secrets hygiene", outcome: "Keep secrets out of Git and rotate a leaked key" }
  - { id: S2, track: S, stage: security, runsIn: codespaces, minutes: 40, prerequisites: [C2, P1], title: "Supply chain scanning", outcome: "Scan dependencies and images in the pipeline" }
  - { id: S3, track: S, stage: security, runsIn: codespaces, minutes: 45, prerequisites: [K2], title: "Policy as code", outcome: "Block insecure Kubernetes manifests before they deploy" }

  # R · Running production (new)
  - { id: R1, track: R, stage: operate, runsIn: codespaces, minutes: 50, prerequisites: [O2], title: "Incidents", outcome: "Follow a runbook, find the cause and write a short postmortem" }
  - { id: R2, track: R, stage: operate, runsIn: codespaces, minutes: 40, prerequisites: [C4], title: "Backups and restores", outcome: "Back up a database and prove the restore works" }
  - { id: R3, track: R, stage: operate, runsIn: codespaces, minutes: 40, prerequisites: [O2], title: "SLOs", outcome: "Set a service level objective and an error budget" }

  # AI · AI in DevOps (new, optional)
  - { id: AI1, track: AI, stage: code, runsIn: codespaces, minutes: 45, prerequisites: [I1, K2], title: "AI for infrastructure code", outcome: "Generate Terraform and Kubernetes manifests with an assistant and review them properly" }
  - { id: AI2, track: AI, stage: code, runsIn: codespaces, minutes: 40, prerequisites: [AI1, P3], title: "Guardrails", outcome: "Route AI-written changes through the same reviews, tests and policy checks as yours" }
```

### 7.5 Learning paths

```yaml
paths:
  - id: beginner
    name: "Complete beginner"
    for: "No Linux or Git experience yet"
    units: [L1, L2, L3, L5, L6, G1, G2, G3, N1, C1, C2, C3, C4, P1, P2]
    endsWith: "An app that is tested and built on every push"
  - id: servers
    name: "Servers and automation"
    for: "Sysadmins moving into DevOps"
    units: [W1, N2, A1, A2, A3, A4, I1, I2, I3, I4, I5, P1, P2, P3, P4, O2, O4]
    endsWith: "Project 1: Ship it on servers"
  - id: kubernetes
    name: "Kubernetes"
    for: "Comfortable running Docker containers"
    units: [K1, K2, K3, K4, K5, K6, K7, K8, P5, O5, K9]
    optional: [K10]
    endsWith: "Project 2: Ship it on Kubernetes"
  - id: reliability
    name: "Reliability"
    for: "Already deploying, and want to run things well"
    units: [O1, O2, O3, O4, O5, R1, R2, R3, S1, S2, S3]
    endsWith: "Project 3: Keep it running"
  - id: one-tool
    name: "Just one tool"
    for: "Need a single skill for work"
    units: []        # page explains: pick any one track and follow it in order
    endsWith: "That track's last unit"
```

Note: the beginner path drops L4 (needs a laptop VM) so the whole path runs with no installs. Mention L4 as an optional extra on the path page. The Kubernetes and Reliability paths are free if K10 is skipped.

### 7.6 Projects

Projects are pages with a brief, acceptance criteria, a lab folder (`labs/project-1/` etc.), and a `./check project-1` script. They reuse units, so most of the work is wiring things together.

```yaml
projects:
  - id: project-1
    name: "Ship it on servers"
    summary: "The course app on EC2 behind a load balancer, deployed automatically on every merge."
    draws: [W1, I1, I2, I3, I4, I5, A1, A2, A3, A4, P1, P2, P3, P4, O2, O4]
    runsIn: aws
    costNote: true
  - id: project-2
    name: "Ship it on Kubernetes"
    summary: "The same app on a cluster, deployed by GitOps, with dashboards and alerts."
    draws: [C1, C2, C3, C4, C5, K1, K2, K3, K4, K5, K6, K7, K8, P1, P2, P3, P5, O5]
    runsIn: codespaces-4core
  - id: project-3
    name: "Keep it running"
    summary: "A broken system to diagnose, fix and write up, then harden."
    draws: [O1, O2, O3, O4, R1, R2, R3, S1, S2, S3]
    runsIn: codespaces
```

Project 3 ships with a deliberately broken setup (`./start project-3` injects three faults: a bad config value, a memory limit that causes restarts, and a missing alert). The check passes when all three are fixed and a postmortem file exists with the required headings.

---

## 8. Components

Build these as Astro components in `src/components/`. Each must work with JavaScript disabled unless noted, and pass the contrast check in both themes.

| Component | Purpose |
| --- | --- |
| `PipelineMap` | Inline SVG of the pipeline (spec below). Props: `highlightStage?`, `highlightTrack?`, `interactive` (tracks become links). |
| `UnitHeader` | Title, badges, cost notice, generated from YAML by unit ID |
| `WhereThisFits` | `PipelineMap` with the unit's stage highlighted, plus a slot for the author's paragraph |
| `StartLab` | Environment tabs (Starlight `Tabs`), Open in Codespaces button, start command |
| `Terminal` | Styled shell block: prompt in accent, output in muted text, copy button copies commands only (not output or prompts) |
| `ExpectedOutput` | Collapsible block showing what the learner should see |
| `CheckYourWork` | Shows the `./check` command and sample PASS output |
| `CommonError` | "What you see / Why / Fix" block |
| `CostNotice` | Warning panel for AWS units, linking to Costs and safety |
| `VideoEmbed` | Click-to-load YouTube (`youtube-nocookie.com`), with title and legacy note |
| `UnitCard` / `TrackCard` / `PathCard` | Cards for lists |
| `WhatsNext` | Next unit, dependent units, path continuation |
| `ProgressTick` | Optional client-side island (section 4.3) |
| `TransitMap` | The course as a metro network (section 5.4); the home hero and the curriculum page |
| `Roundel` / `LineStrip` / `StationList` | Track badge, a line's stations, and a vertical line or route of units (section 5.4) |
| `GlossaryTerm` | Inline term with a link to the glossary entry |

### 8.1 Pipeline map

Recreate this layout as responsive SVG (it must stay readable at 360px; switch to a single-column list of stages with track chips below 640px):

- Title: "Every track teaches one stage of the same pipeline"
- Eight stages top to bottom, joined by arrows: **Code → Build and test → Package → Provision → Configure → Deploy → Run and operate → Observe**, with a return arrow from Observe to Code labelled "What you observe feeds the next change".
- Track chips to the right of each stage:
  - Code: G Git and collaboration; AI AI in DevOps (optional)
  - Build and test: P CI/CD: test and build
  - Package: C Containers
  - Provision: I Infrastructure as code; W Cloud with AWS
  - Configure: A Configuration (Ansible)
  - Deploy: K Kubernetes; P CI/CD: deploy, GitOps
  - Run and operate: R Running production
  - Observe: O Observability
- Two full-width bands underneath: "Across every stage: S · DevSecOps (secrets, scanning, policy)" and "Underneath everything: L · Linux and the shell, N · Networking".
- New tracks (K, S, R, AI) use the accent outline, with a "New track" key.
- When `highlightStage` is set, that stage and its chips use the accent; everything else is dimmed.
- `role="img"` plus a full text alternative listing stages and tracks.

---

## 9. Lab tooling

### 9.1 The three commands

From the repo root inside a Codespace (or a cloned repo on a laptop):

```
./start <unit-id>     # build the starting state for that unit
./check <unit-id>     # test the learner's work; PASS/FAIL per criterion
./cleanup <unit-id>   # remove everything the unit created
```

Requirements:

- **Bash**, `set -euo pipefail`, shellcheck-clean. Shared helpers in `labs/_lib/`.
- **Idempotent.** Running `start` twice gives the same state. `start` warns before overwriting the learner's work and offers `--reset`.
- **Workspace:** each unit works in `~/workspace/<unit-id>/`, copied from `labs/<unit-id>/starter/`.
- **Clusters:** units that need Kubernetes create a kind cluster named `ld-<unit-id>` (or reuse `ld-shared` when the unit's `lab.yaml` says so). `cleanup` deletes it.
- **Check output:** one line per criterion, `PASS` in green or `FAIL` in red with a one-line hint and a link to the "Common errors" section. Exit code 0 only if all pass. Respect `NO_COLOR`.
- **Environment guard:** `start` reads `runsIn` from `labs/<unit-id>/lab.yaml` and stops with a friendly message if run in the wrong place (for example a laptop-only unit inside Codespaces).
- **Help:** `./start --list` prints all units with their status and environment.

`labs/<unit-id>/lab.yaml`:

```yaml
id: K2
runsIn: codespaces
cluster: own            # own | shared | none
needs: [kind, kubectl, docker]
aws: false
```

### 9.2 Browser environment

- Tier 1 units (L1–L3, L5, L6, G1, G3) are designed to work in a browser Linux terminal with **no network access**.
- Link out to **https://webvm.io** in a new tab. Do **not** embed it in an iframe and do **not** self-host or download CheerpX: its public deployment is free for individuals, but hosting it elsewhere requires a commercial licence.
- Because the browser VM cannot reach the internet, each browser unit provides a **setup block**: a single paste-able heredoc command that creates the practice files (for example sample logs for L6). Keep each setup block under 60 lines.
- Browser units use self-check lists with expected outputs instead of `./check`. Each also offers "Prefer a full environment? Do this unit in Codespaces," where `./check` works.
- Future option (not in scope now): self-host the open-source v86 emulator to embed a terminal. Leave a `TODO(owner)` in `docs/`.

### 9.3 Codespaces environment

`.devcontainer/devcontainer.json` (default, 2-core):

- Base image: the official Ubuntu devcontainer base image.
- Use official devcontainer **features** where they exist (verify current names and versions): Docker-in-Docker, kubectl + Helm, Terraform, AWS CLI, Python, GitHub CLI.
- `post-create.sh` installs, with **pinned versions and verified checksums**: kind, Ansible + ansible-lint, Packer, Trivy, kubeconform, Kyverno CLI, Argo CD CLI, k9s (optional), `jq`, `yq`, `dig` (dnsutils), `shellcheck`.
- `hostRequirements`: 2 CPUs, 8 GB RAM.
- Forward ports used by labs (app 8000, Grafana 3000, Prometheus 9090, Argo CD 8080) with labels.
- On create, print a welcome message pointing to `./start --list`.
- Add `PATH` so `start`, `check` and `cleanup` work from anywhere.

`.devcontainer/monitoring/devcontainer.json`: same, but 4 CPUs and 16 GB, for O5 and Project 2. Units that need it show a second "Open in Codespaces (4-core)" button using the `devcontainer_path` query parameter.

The README and Environments page must state the Codespaces free allowance, link to GitHub's billing docs, and tell learners how to stop and delete codespaces. Look the current allowance up from GitHub's docs; do not hard-code it from this spec.

### 9.4 Laptop environment (Multipass)

- Units L4, N2 and K9 run on Multipass VMs on the learner's laptop (Windows, macOS including Apple Silicon, Linux).
- Provide `labs/_laptop/` with cloud-init files and scripts:
  - `make-vm.sh` / `make-vm.ps1`: create Ubuntu LTS VMs with the course's SSH key and tools.
  - `k3s-cluster.sh` / `.ps1`: create three VMs (`ld-server`, `ld-agent-1`, `ld-agent-2`) and join them into a k3s cluster.
  - `teardown.sh` / `.ps1`: delete and purge all `ld-` VMs.
- Every laptop unit explains RAM needs (K9 needs about 6 GB free; verify and state it) and includes a teardown step.

### 9.5 AWS environment

AWS labs create **real, billable resources in the learner's own account**. Rules for every AWS unit and its Terraform:

- W1 is a hard prerequisite: MFA on the root user, an IAM Identity Center user for daily work, a monthly budget with an email alert.
- **No long-lived access keys.** Learners sign in with `aws sso login`. Pipelines use GitHub OIDC (P4).
- Every resource is tagged `Project = learndevops` and `Unit = <unit-id>`, via provider `default_tags`.
- Default region `eu-west-2`, set in one variable.
- Smallest instance types that work (prefer Graviton `t4g` where the AMI allows). **No NAT gateways.** No Elastic IPs left unattached.
- Every lab ends with `terraform destroy` followed by `./cleanup <unit-id>`, which uses the Resource Groups Tagging API to list anything still tagged `Project = learndevops` and fails loudly if something is left.
- A standalone `./cleanup aws-all` finds and lists (and, with `--yes`, deletes) every leftover tagged resource across regions.
- Each AWS unit's page shows an estimated cost for completing the lab within a stated time, calculated from current AWS pricing pages and linked to them, with a "Last checked" date.
- K10 notes that the EKS control plane has an hourly charge and that the AWS free plan may not include EKS, so learners may need a paid account; verify both before publishing.

---

## 10. The course app

A small web app the learner builds, packages, deploys and monitors throughout. Keep it under ~300 lines so beginners can read all of it.

- **Language:** Python 3 with FastAPI, served by uvicorn on port 8000.
- **What it does:** a "status board" page listing services and their status, stored in memory by default or in PostgreSQL when `DATABASE_URL` is set.
- **Endpoints:**
  - `GET /` — HTML page showing the status board, the app version and the hostname (so learners can see which pod answered, and when a rollout changes the version).
  - `GET /health` — liveness: `{"status": "ok"}`.
  - `GET /ready` — readiness: checks the database when configured.
  - `GET /metrics` — Prometheus metrics (request count, latency histogram, app info with version).
  - `POST /api/services` and `GET /api/services` — simple JSON API.
- **Config by environment variable:** `APP_VERSION`, `APP_COLOUR` (changes the page accent, used to show blue-green and canary releases), `DATABASE_URL`, `LOG_LEVEL`. Logs are JSON lines on stdout.
- **Fault switches** for R1 and Project 3, off by default: `FAULT_SLOW_MS`, `FAULT_ERROR_RATE`, `FAULT_LEAK_MB`.
- **Tests:** pytest, at least 90% line coverage, run in `app.yml`.
- **No Dockerfile in `app/`.** Writing it is the C2 lab. Reference Dockerfiles live in `labs/c2/solution/` and `labs/c3/solution/`.

---

## 11. Content writing rules

Put these in `docs/style-guide.md` and follow them for every page.

- **UK English.** Plain words, second person ("you"), active voice. Sentences under 25 words; paragraphs of 1–3 sentences.
- **Why before how.** Every lesson opens with the problem the tool solves.
- **Never write** "simply", "just", "easy", "obviously". No emoji.
- **Every command** is in its own copyable block, with expected output shown separately. Never mix prompts into the copied text.
- **Define a term on first use** and link it to the glossary.
- **One outcome per unit.** If a unit needs two outcomes, split it.
- **Standalone:** never say "as you did in the last unit". Say "if you haven't done this before, see C1".
- **Real-world note:** each unit has one short box, "In a real team", describing how this step looks at work.
- **Facts and numbers** (prices, limits, versions) link to an official source and carry a "Last checked" date.
- **Accessibility:** alt text on every image, diagrams with text alternatives, no information carried by colour alone.

---

## 12. Costs and safety page

`/start-here/costs-and-safety/` must cover:

1. **Who pays for what:** a table. The owner pays only for the domain. Browser units are free. Codespaces bill the learner's GitHub account, within a free monthly allowance (look up and link the current figure). Multipass is free. AWS units use the learner's own account and card.
2. **Things only run when you use them:** codespaces stop after an idle timeout (look up the current default and how to change it); kind clusters are deleted by `./cleanup`; VMs by the teardown script.
3. **AWS rules:** the W1 gate, no access keys, tags, cleanup checks, no NAT gateways, delete the account's resources the same day.
4. **The AWS free plan:** what new accounts get (look up the current credits and duration on AWS's site and link it), and that some services may need a paid plan.
5. **If you get a bill you didn't expect:** steps to find the resource (Cost Explorer, tags, `./cleanup aws-all`) and how to contact AWS support.
6. **Disclaimer:** "You are responsible for any charges in your own cloud accounts. Follow the cleanup steps in every unit." Also show this in the footer of every AWS unit and the site footer link.

---

## 13. Hosting and the custom domain

### 13.1 Now: GitHub Pages without a custom domain

- Deploy with GitHub's official Pages actions or Astro's official GitHub Pages action (check Astro's current deployment docs).
- The site will first live at `https://dmccuk.github.io/learndevops/`. Read `site` and `base` from environment variables in `astro.config.mjs`:
  - `SITE_URL` (default `https://dmccuk.github.io`)
  - `BASE_PATH` (default `/learndevops`)
- **All internal links must respect `base`.** Use Astro's `import.meta.env.BASE_URL` helpers. Add a CI link check that runs against the built site with the base path so broken links fail the build.

### 13.2 Later: switching to learndevops.co.uk

Write `docs/custom-domain.md` with these steps, and make the switch a two-line change:

1. In the repo's Pages settings, set the custom domain to `learndevops.co.uk` and tick "Enforce HTTPS" once the certificate is issued.
2. Add `public/CNAME` containing `learndevops.co.uk`.
3. Set `SITE_URL=https://learndevops.co.uk` and `BASE_PATH=/` in the workflow.
4. At the domain registrar, add the GitHub Pages DNS records for an apex domain (A and AAAA records) and a `www` CNAME to `dmccuk.github.io`. Copy the current IP addresses from GitHub's "Managing a custom domain" docs at the time of the switch; do not hard-code them in this repo.
5. Verify the domain in GitHub account settings to prevent takeover.
6. Run the link checker against the live site.

---

## 14. Quality, SEO, privacy

### 14.1 CI checks (`site.yml`, on every pull request)

- `astro check` and TypeScript strict mode.
- Build succeeds and curriculum validation passes (section 7.1).
- Markdown lint, and a prose check for banned words (section 11).
- Internal and external link check (external failures warn, internal ones fail).
- Contrast check (section 5.1).
- Lighthouse CI on the home page, a unit page and the curriculum page: performance ≥ 90, accessibility ≥ 95, best practices ≥ 95, SEO ≥ 95.
- On merge to `main`: deploy to Pages.

### 14.2 Lab checks (`labs.yml`)

- shellcheck on every script.
- For every unit with `runsIn: codespaces` and `status` `draft` or `published`: in a matrix job, run `start`, copy `solution/` over the workspace, run `check` (must pass), run `cleanup`. kind works on GitHub-hosted runners.
- Also run `check` on the untouched starter and require it to **fail**, so checks cannot pass by accident.
- For AWS units: `terraform fmt -check`, `terraform validate`, tflint, and a policy test that every resource gets the required tags. No real AWS resources are created in CI.
- Weekly scheduled run to catch upstream tool changes.

### 14.3 SEO

- Unique title and description per page from front matter; units use "K2 Deploying an app — Learn DevOps".
- Sitemap (`@astrojs/sitemap`), robots.txt, canonical URLs that respect `SITE_URL`.
- Open Graph images: generate one per track at build time, plus a default.
- JSON-LD `Course` schema on the home page and `LearningResource` on unit pages.

### 14.4 Privacy and security

- No cookies, no analytics, no third-party scripts. Fonts self-hosted.
- YouTube only loads after a click.
- A strict Content Security Policy via `<meta>` tag where Pages allows it.
- `SECURITY.md` with how to report a problem.

---

## 15. Existing videos

These six videos from the original course can be attached to units as **legacy** videos (`legacy: true`), which shows the note from section 7.3. Chapters 7–16 of the original course have no videos.

| Original chapter | Video | Attach to |
| --- | --- | --- |
| 1. Build your first AWS EC2 instance | https://www.youtube.com/watch?v=XzWyudb4N04 | W2 |
| 2. Set up IAM and save your access and secret keys | https://www.youtube.com/watch?v=1y3IsgvvY84 | none: it teaches stored access keys, which this course now avoids. List it on the Videos page only, with that note. |
| 3. Set up your control node | https://youtu.be/1l545lhadz4 | none (replaced by Codespaces). Videos page only. |
| 4. Install, configure and run Packer | https://youtu.be/dIAhHhQ_J-c | I4 |
| 5. Install Terraform and build instances in AWS | https://youtu.be/VS2sQgUgomE | I1 (concepts) |
| 6. Terraform code: build your datacentre | https://youtu.be/yLvDSrnWMyQ | I5 |

Old video descriptions may link to files on `main` that move into `legacy/`. List the six videos in `docs/video-plan.md` with a `TODO(owner)` to update each description to point at the `v1-original` tag.

Leave a `video` field empty on all other units. Add `docs/video-plan.md` listing the 12 recommended new short videos for the owner to record: K1, K2, P1, W1, C1, I1, A1, O2, P5, and one walkthrough per project.

---

## 16. Milestones and acceptance criteria

Build in this order. Each milestone is one pull request.

### M1 — Site skeleton and design (no lesson content)

- Before starting: confirm the owner has tagged `v1-original` and renamed the repo (section 2.1).
- Move the original files into `legacy/` and add the README banner.
- Repo structure, Astro + Starlight, theme tokens, fonts, both themes.
- Home page (section 6), Start here, Environments, Costs and safety (section 12), About, FAQ, Glossary (initial 40 terms), Videos, 404.
- `curriculum.yaml` seeded with all 60 units (status `planned`), tracks, paths and projects; validation in place.
- Generated stub pages for every unit, track, path and project.
- `PipelineMap` and all list components.
- CI (site checks) and Pages deployment working at `dmccuk.github.io/learndevops/`.
- **Done when:** the site is live, every link works, Lighthouse targets met, all 60 stub pages exist and validation fails if a unit is removed from either YAML or MDX.

### M2 — Lab tooling and the course app

- `.devcontainer/` (both variants), `post-create.sh`, `bin/start|check|cleanup`, `labs/_lib/`.
- The course app with tests.
- `labs.yml` workflow running against a sample unit.
- `docs/writing-a-unit.md` showing how to add a unit end to end, using a `labs/_template/` folder.
- **Done when:** a fresh Codespace opens with every tool on `PATH`, `./start --list` works, and the template unit's start/check/cleanup pass in CI.

### M3 — Pilot units (prove the format)

Write these units completely, with labs, checks, common errors and solutions: **L1, G1, C1, C2, K1, K2**. Mark them `published`.

- **Done when:** each pilot unit passes the lab CI (solution passes, starter fails), the browser units work in webvm.io with no network, and the owner has reviewed them. **Stop and wait for owner feedback before M4.**

### M4 — Beginner path

All units in the beginner path (section 7.5), plus L4.

### M5 — Kubernetes track and Project 2

K1–K9, P5, O5 and Project 2 (including the 4-core devcontainer). K10 is written but stays `draft` until the owner has run it in a real AWS account.

### M6 — Servers path, AWS units and Project 1

W1–W4, I1–I5, A1–A4, N2, P3, P4, O2, O4 and Project 1, with all AWS safety rules in section 9.5. AWS units stay `draft` until the owner has run each one in a real account and confirmed cleanup.

### M7 — Reliability, security, AI

O1, O3, R1–R3, S1–S3, N3, C5, G4, P6, AI1, AI2 and Project 3.

### M8 — Polish

Progress ticks, Open Graph images, JSON-LD, full glossary, final accessibility audit, custom domain docs.

---

## 17. Open decisions (use the default; list in each PR)

| Decision | Default | Owner to confirm |
| --- | --- | --- |
| Repo name | Rename `dmccuk/devops_tools_course` to `dmccuk/learndevops` (section 2.1) | Decided |
| Owner name, photo and bio | Dennis McCarthy, photo in `src/assets/`, bio on the home and About pages | Decided |
| Content licence | CC BY 4.0 (code MIT) | Yes |
| Kubernetes Gateway API implementation for K7 | An actively maintained implementation that works on kind (for example Envoy Gateway); verify maintenance status first | Yes |
| Policy engine for S3 | Kyverno | No |
| Log store for O3 | Grafana Loki | No |
| Slack for O4 | Use a learner-created free Slack workspace and incoming webhook; offer a webhook test endpoint alternative for learners without Slack | Yes |
| Analytics | None | Yes (any change needs owner approval) |
| Progress tracking | Client-side only, M8 | No |

---

## 18. `CLAUDE.md` for the repo

Create `CLAUDE.md` at the repo root with:

- One paragraph on what the project is.
- Commands: `npm run dev`, `npm run build`, `npm run check`, `./start --list`, how to run lab CI locally.
- "To add a unit, follow `docs/writing-a-unit.md`."
- The rules from section 0 (verify versions, never invent facts, ask before adding services).
- The style rules from section 11 in short form.
- A pointer to this spec, saved as `docs/SPEC.md`.

---

## 19. Future options (not scheduled)

Ideas the owner wants to keep in view. None of these is part of milestones M1 to M8. Each one needs the owner's approval before work starts, and anything that adds a backend, accounts, cookies or a third-party service changes the fixed decisions in section 2 and the privacy rules in section 14.4.

### 19.1 Badges and progress

Build in this order, so each step works without the next.

1. **Map badges (no backend, part of M8).** Ticking a unit as done fills its station on the learner's own map. Completing a track earns that line's roundel; completing a path earns a route badge. Stored in `localStorage` only (section 4.3).
2. **Proof-of-work records (no backend).** When every criterion in `./check <unit>` passes, the script writes a dated completion record (unit ID, date, check results) into the learner's own repository or fork. Their GitHub profile then shows real evidence of completed labs. A record cannot be earned by ticking a box.
3. **Synced progress with accounts (backend, see 19.3).** Progress and badges follow the learner across devices.
4. **Verifiable certificates (backend and paid, see 19.5).** Shareable credentials that an employer can check, for example in the Open Badges format. Only for assessed work.

### 19.2 Bringing learners back

- **"Continue where you left off":** the home map highlights the learner's next station (local progress).
- **Review drills:** each unit ends with 3–5 recall questions (add these from M3 onwards, so this needs no rework later). The site suggests revisiting them after one day, one week and one month.
- **Reminders without collecting emails:** a "Remind me to review" button that downloads a calendar file (`.ics`).
- **"Break it" drills:** repeatable fault scenarios in the style of Project 3, for practising diagnosis.
- **What's new:** an RSS feed of new and updated units, linked from the footer and the YouTube channel.
- **Community:** GitHub Discussions for questions and "show what you built". Free, with no tracking on this site.
- **Measuring return visits** needs analytics, which section 2 rules out. If the owner wants numbers, consider a cookie-free, privacy-friendly counter, and record that decision here first.

### 19.3 Optional accounts with Supabase and OAuth

Use [Supabase](https://supabase.com/docs) (hosted Postgres, auth and row-level security) to sync progress, badges and review schedules across devices.

**Principles**

- **Accounts are optional.** Every page, lab and local progress feature keeps working with no account and with storage blocked. Signing in only adds syncing.
- **Sign in with GitHub first.** Learners already need a GitHub account for Codespaces, so GitHub OAuth adds no new account. Google can be added later. No passwords stored by the course.
- **Store the minimum:** user ID, GitHub username, completed unit IDs with dates, badge IDs and review dates. No tracking of page views.
- **Row-level security** on every table, so learners can only read and write their own rows. The site uses only the public anon key; no service keys in the browser or the repository.
- **The site stays static** on GitHub Pages. Supabase is called from a small client-side island loaded only when the learner opens their progress panel or signs in.

**Changes this needs before it ships**

- Section 2: Backend changes from "None" to "Optional Supabase for signed-in learners".
- Section 14.4: a privacy notice explaining what is stored, why, where it is hosted, and how to export or delete it (UK GDPR). Sign-in sets cookies or storage for the session, so explain that too.
- The CSP adds the project's Supabase URL to `connect-src`.
- A "Delete my account and data" button, and a data export.
- An import step that uploads existing local progress on first sign-in.
- A sketch of the schema to agree first: `profiles`, `progress (user_id, unit_id, completed_at, check_passed)`, `badges (user_id, badge_id, earned_at)`, `reviews (user_id, unit_id, due_at)`.

TODO(owner): check Supabase's current free-plan limits and pricing on its official pages before choosing it, and record the "Last checked" date here.

**Alternative:** if syncing is the only goal, a private GitHub Gist written through GitHub OAuth could hold progress with no database at all. Compare the two before building.

### 19.4 Content licence and monetisation

The written content is currently CC BY 4.0, which lets anyone reuse it, including commercially. **Decide before most units are written:** if the owner wants to keep commercial rights to the lessons, switch new content to **CC BY-NC 4.0**. A change only applies going forward; content already published under CC BY stays reusable under CC BY. Code stays MIT either way.

### 19.5 Ways to earn from the course

Keep the core course free. That builds trust and the audience everything else depends on. Options, roughly in order of effort:

- **Sponsorship:** GitHub Sponsors, or a sponsor for a track ("Kubernetes track supported by …"), shown as a plain text credit with no tracking scripts.
- **YouTube:** the videos in `docs/video-plan.md`.
- **Paid video course:** the same units recorded as a structured video course on a paid platform, with the free text course as the funnel.
- **Assessed certificates:** a paid, proctored or project-based assessment that issues a verifiable credential (19.1, step 4). Needs accounts (19.3).
- **Live cohorts and mentoring:** a few weeks of guided group sessions through a path, CV and portfolio reviews, or one-to-one mentoring.
- **Team training:** companies pay for private delivery, a branded copy for onboarding, or a team progress dashboard. Often the best earner for open DevOps material. Needs accounts with team roles.

Avoid affiliate links inside lessons. They conflict with advice to use the cheapest option that works. Any paid offer must be clearly separate from the free course, and the free course must never be cut back to push people to pay.
