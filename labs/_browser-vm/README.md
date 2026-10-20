# In-browser VM image

Linux running inside the web page, with no server, using the [v86](https://github.com/copy/v86) emulator (BSD-2-Clause). Status: proof of concept. Test pages are at `/poc/terminal/` (one VM) and `/poc/network/` (two networked VMs).

## How it works

1. `Dockerfile` builds a 32-bit Alpine Linux image, based on v86's official Alpine recipe, with a `learner` user (password `learner`), bash, git, the core tools, rsync and an SSH server.
2. `.github/workflows/browser-vm.yml` turns the image into v86's format: a file list (`fs.json`) and one compressed file per file (`rootfs-flat/`), which the VM loads on demand over HTTP.
3. `build-state.mjs` boots the VM once in Node, runs the common tools so their files are already loaded, and saves the machine state (`state.bin.zst`). Visitors restore this state instead of booting Linux.
4. On `main`, the workflow publishes everything as a GitHub Release (`browser-vm-<date>-<commit>`) and redeploys the site. `site.yml` downloads the newest release into `public/vm/` before building.
5. `src/components/BrowserVM.astro` loads v86 and xterm.js only when the learner selects Start, restores the state, then runs `ld-net` to give each VM its own name and address. VMs on the same page share a private network through v86's `inbrowser` backend.

## Measured (local preview, headless Chrome, 20 October 2026)

| | One VM | Two VMs |
| --- | --- | --- |
| Download on first start | about 24 MB | about 24 MB (shared) |
| Restore | 0.7 s | 1.0 s |
| Ready, after naming and setup | 7.6 s | 13.5 s |
| JavaScript memory | about 60 MB | about 58 MB |

Checks that pass: `pwd`, `ls`, `cat`, `git init`, bash 5.2, grep, awk, sed, `sudo`, `free`, `df`; between two VMs, `ping`, `ssh` and `scp`.

## Known limits

- No internet access from the VMs.
- No systemd (Alpine uses OpenRC). Units that need systemd use the multi-machine lab (spec section 9.6).
- Every VM from this image shares the same SSH host keys. Acceptable for a sandbox with no outside network.
- Pages with a VM allow inline styles in their Content Security Policy, because xterm.js adds styles at run time. Scripts stay hash-checked.
- Start-up after restore still takes several seconds, mostly restarting the shell. Worth trimming before units depend on it.

## Licences

v86 is BSD-2-Clause (`LICENSE-v86` in the release). SeaBIOS is LGPL-3.0 (`COPYING.LESSER`). Alpine packages carry their own free-software licences.

## To work on it locally

Docker is needed to build the image, so it is built in GitHub Actions. To use a built image locally:

```sh
gh run download <run-id> -n browser-vm -D public/vm
npm run dev
```
