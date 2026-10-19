# Security policy

## Reporting a problem

If you find a security problem in this site, the lab scripts, the course app, or anything a lab asks learners to run, please report it privately.

Use GitHub's private vulnerability reporting: go to the repository's **Security** tab and select **Report a vulnerability**. Please don't open a public issue for security problems.

Include:

- what you found and where (file, unit ID or page),
- how to reproduce it,
- what you think the impact is.

You will get a reply as soon as the maintainer can look at it. This is a volunteer project, so please allow some time.

## Scope

Of particular interest:

- lab scripts or Terraform that could create resources without tags, leave billable resources behind, or ask for long-lived credentials,
- anything that could expose a learner's GitHub or AWS credentials,
- problems with the site's Content Security Policy.

TODO(owner): turn on private vulnerability reporting in the repository settings (Settings → Security → Private vulnerability reporting).
