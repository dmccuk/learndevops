# Switching to learndevops.co.uk

The site first lives at `https://dmccuk.github.io/learndevops/`. Moving it to `https://learndevops.co.uk/` is a two-variable change in the workflow plus some DNS and GitHub settings.

## Steps

1. **Add the CNAME file.** Create `public/CNAME` containing one line:

   ```text
   learndevops.co.uk
   ```

2. **Change the build variables** in `.github/workflows/site.yml`:

   ```yaml
   env:
     SITE_URL: https://learndevops.co.uk
     BASE_PATH: /
   ```

   Everything else (links, canonical URLs, sitemap, robots.txt) follows these two values.

3. **Set the DNS records** at the domain registrar:
   - A and AAAA records for the apex domain `learndevops.co.uk`, pointing at GitHub Pages.
   - A `CNAME` record for `www` pointing at `dmccuk.github.io`.

   Copy the current IP addresses from GitHub's [Managing a custom domain for your GitHub Pages site](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) page at the time of the switch. Do not copy them into this repository; they can change.

4. **Verify the domain** in your GitHub account settings (**Settings → Pages → Add a domain**), so nobody else can take it over. See [Verifying your custom domain for GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages).

5. **Set the custom domain** in the repository's **Settings → Pages**, enter `learndevops.co.uk`, and save. When GitHub has issued the certificate, tick **Enforce HTTPS**.

6. **Check the live site.** Run the link checker against the deployed site:

   ```sh
   npx linkinator https://learndevops.co.uk/ --recurse
   ```

7. Update the repository's description and homepage field, and the links in `README.md`.

## Notes

- `robots.txt` only works at the root of a domain. While the site is a project site under `/learndevops/`, search engines read `dmccuk.github.io/robots.txt` instead, which this repository does not control. After the switch, `https://learndevops.co.uk/robots.txt` is served from this site.
