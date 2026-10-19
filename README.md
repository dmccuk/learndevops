# Learn DevOps

> **2026 refresh:** this course has been rebuilt as [learndevops.co.uk](https://dmccuk.github.io/learndevops/). The original course is at tag [`v1-original`](https://github.com/dmccuk/learndevops/tree/v1-original), and its files are in [`legacy/`](legacy/).

A free, open-source DevOps course: 66 short, hands-on units in 13 tracks, from a blank laptop to a working CI/CD pipeline. Start with Linux in your browser, move into a ready-made cloud workspace, and finish by deploying a real app to AWS or Kubernetes.

**Read the course:** <https://dmccuk.github.io/learndevops/> (moving to learndevops.co.uk later).

## Where the labs run

| Environment | Used for | You need |
| --- | --- | --- |
| Browser | Linux and Git basics | A browser |
| GitHub Codespaces | Most units | A free GitHub account |
| Multi-machine lab | A small fleet of Linux servers for SSH, files, performance and Ansible | Codespaces, or Docker on your computer |
| Laptop (Multipass) | A multi-node Kubernetes cluster | Multipass installed |
| AWS | Cloud provisioning and deployment | Your own AWS account |

### GitHub Codespaces costs

Codespaces bill your own GitHub account, within a free monthly allowance. At the time of writing, GitHub Free accounts get 120 core hours and 15 GB-month of storage a month. A 2-core codespace uses 2 core hours per hour. See [About billing for GitHub Codespaces](https://docs.github.com/en/billing/concepts/product-billing/github-codespaces) for current figures. Last checked: 19 October 2026.

Stop codespaces when you take a break and delete them when you finish a unit: go to [github.com/codespaces](https://github.com/codespaces), select **…** next to the codespace, then **Delete**. See [Deleting a codespace](https://docs.github.com/en/codespaces/developing-in-a-codespace/deleting-a-codespace).

### AWS costs

AWS units create real resources in your own account, and AWS bills you for them. Read [Costs and safety](https://dmccuk.github.io/learndevops/start-here/costs-and-safety/) first. You are responsible for any charges in your own cloud accounts. Follow the cleanup steps in every unit.

## Working on the site

You need Node.js 22.22 or later (the CI uses Node 24; see `.nvmrc`).

```sh
npm ci
npm run dev          # local site at http://localhost:4321/learndevops/
npm run build        # build into dist/
npm run check        # type check, contrast, banned words, markdown lint
npm run check:links  # link check against dist/ (build first)
npm run sync         # create stub pages for new units in curriculum.yaml
```

All track, unit, path and project data lives in [`src/data/curriculum.yaml`](src/data/curriculum.yaml). The build fails if a unit is missing a page, a page has no unit, or a reference points at a unit that doesn't exist.

See [`docs/`](docs/) for the full specification, the style guide and how to contribute.

## Licences

- Code: [MIT](LICENSE)
- Written content: [CC BY 4.0](LICENSE-CONTENT)

## Contributing and security

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) and [SECURITY.md](SECURITY.md).
