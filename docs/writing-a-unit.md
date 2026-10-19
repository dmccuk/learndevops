# Writing a unit

> This guide covers the page side of a unit. The lab side (`labs/<id>/`, `./start`, `./check`, `./cleanup` and the `labs/_template/` folder) arrives in milestone 2, and this guide will be extended then.

## 1. Add or update the unit in curriculum.yaml

Every unit is one line in `src/data/curriculum.yaml`:

```yaml
- { id: K2, track: K, stage: deploy, runsIn: codespaces, minutes: 45, prerequisites: [K1, C2], title: "Deploying an app", outcome: "Run the course app as a Deployment and reach it through a Service", status: planned }
```

The build checks every field. See spec section 7.1 for what each one means.

## 2. Create or sync the page

```sh
npm run sync
```

This creates `src/content/docs/units/<id>.mdx` as a stub if it is missing, and keeps the page's title and description in step with the YAML.

## 3. Write the page

Replace the `<UnitStub />` component with the full unit template (spec section 7.3), in this order:

1. Header: `<UnitHeader id="K2" />`
2. You'll be able to: the outcome plus two to four specific bullet points
3. Before you start: prerequisites in plain words, each linked to its unit
4. Where this fits: `<WhereThisFits id="K2">` with your paragraph inside
5. Start the lab (milestone 2)
6. The lesson: 400 to 1,200 words, why before how
7. The lab: numbered steps, each command in its own block with expected output underneath
8. Check your work: `./check <id>` with sample PASS output
9. Common errors: at least three, each as "What you see", "Why", "Fix"
10. Clean up: `./cleanup <id>`; for AWS units, a step to confirm nothing is left running
11. Video (optional): `<VideoEmbed />`
12. What's next: `<WhatsNext id="K2" />`
13. Set `lastChecked` in the front matter

Follow the [style guide](style-guide.md).

## 4. Change the status

Set `status: draft` while you work. Draft units are built but left out of the sitemap. Set `status: published` when the unit and its lab pass review.

## Future option

TODO(owner): a browser terminal embedded in the page, using the open-source v86 emulator, could replace the link to webvm.io for browser units (spec section 9.2). Not in scope yet.
