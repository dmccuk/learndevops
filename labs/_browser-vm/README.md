# In-browser VM image

Linux running inside the web page, with no server, using the [v86](https://github.com/copy/v86) emulator (BSD-2-Clause). Used by unit L1 and the playground pages: `/playground/` (one VM) and `/playground/network/` (two networked VMs).

## How it works

1. `Dockerfile` builds a 32-bit Alpine Linux image, based on v86's official Alpine recipe, with a `learner` user (password `learner`), bash, git, the core tools, rsync and an SSH server.
2. `.github/workflows/browser-vm.yml` turns the image into v86's format: a file list (`fs.json`) and one compressed file per file (`rootfs-flat/`), which the VM loads on demand over HTTP.
3. `build-state.mjs` boots the VM once in Node, runs the common tools so their files are already loaded, and saves the machine state (`state.bin.zst`). Visitors restore this state instead of booting Linux.
4. On `main`, the workflow publishes everything as a GitHub Release (`browser-vm-<date>-<commit>`) and redeploys the site. `site.yml` downloads the newest release into `public/vm/` before building.
5. `src/components/BrowserVM.astro` loads v86 and xterm.js only when the learner selects Start (and starts downloading when they point at the button). It restores the state, then types one hidden start-up command: set the terminal size, run `ld-net` to give the VM its own name, MAC address and IP address, set the prompt, and run any setup for the unit. When the shell prints a marker, the terminal is shown. VMs on the same page share a private network through v86's `inbrowser` backend.

## Measured (local preview, headless Chrome, 20 October 2026)

| | One VM (playground) | One VM (unit L1, with setup) | Two VMs |
| --- | --- | --- | --- |
| Download on first start | about 25 MB | about 25 MB | about 25 MB (shared) |
| Restore | 0.8 s | 0.9 s | 1.0–1.4 s |
| Ready | 4.1 s | 4.8 s | 6.2 s |

On the live site, expect a few seconds more on a first visit while files download.

What made it faster (round 2):

- `ld-net` sets a MAC address per VM instead of reloading the network driver. Every VM restores from the same state, so they start with the same MAC; v86 does not filter by MAC, so a guest-set address works.
- One start-up command instead of five, and no shell restart. The prompt is set directly.
- Every program start costs about 0.4 s in the emulator, so start-up runs as few programs as possible.

Checks that pass: every command and expected output in unit L1 (17 checks), `git init`, bash 5.2, grep, awk, sed, `sudo`, `free`, `df`; between two VMs, `ping`, `ssh` and `scp`.

## Known limits

- No internet access from the VMs.
- No systemd (Alpine uses OpenRC). Units that need systemd use the multi-machine lab (spec section 9.6).
- Every VM from this image shares the same SSH host keys. Acceptable for a sandbox with no outside network.
- Pages with a VM allow inline styles in their Content Security Policy, because xterm.js adds styles at run time. Scripts stay hash-checked.
- Each program start takes about 0.4 s, so commands feel slower than on a real computer.
- A learner who types the SSH password the instant the prompt appears can occasionally have it rejected; typing it again works.

## Licences

v86 is BSD-2-Clause (`LICENSE-v86` in the release). SeaBIOS is LGPL-3.0 (`COPYING.LESSER`). Alpine packages carry their own free-software licences.

## To work on it locally

Docker is needed to build the image, so it is built in GitHub Actions. To use a built image locally:

```sh
gh run download <run-id> -n browser-vm -D public/vm
npm run dev
```
