# Contributing

Thank you for helping. Corrections, clearer explanations and lab fixes are all welcome.

## Reporting a problem

[Open an issue](https://github.com/dmccuk/learndevops/issues/new/choose) and pick the template that fits:

- **Bug in a lab**: a `./start`, `./check` or `./cleanup` command, or a lab step, does not work.
- **Content error**: something on a page is wrong, unclear or out of date.
- **Unit request**: a skill you think the course should teach.

For security problems, follow [SECURITY.md](../SECURITY.md) instead.

## Making a change

1. Fork the repository and create a branch.
2. Install dependencies and start the site (Node.js 22.22 or later):

   ```sh
   npm ci
   npm run dev
   ```

3. Make your change. Follow the [style guide](style-guide.md).
4. Run the checks:

   ```sh
   npm run check
   npm run build
   npm run check:links -- --internal-only
   ```

5. Open a pull request and fill in the template.

## Adding or changing units

All unit, track, path and project data lives in `src/data/curriculum.yaml`. See [writing-a-unit.md](writing-a-unit.md).

## Licences

By contributing, you agree that your code is released under the [MIT licence](../LICENSE) and your written content under [CC BY 4.0](../LICENSE-CONTENT).
