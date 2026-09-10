# G59 Merch Archive — GitHub Pages version

This works like the layout you liked: real folders with real photos, and
the page builds itself from whatever's in those folders. You never hand-edit
HTML to add a drop — you just make a folder, drop photos in, and push.

## How it's organized

```
collections/
  drop/
    2024-10-18-fw-essentials/
      info.json      <- optional: title, date, link
      preview.jpg    <- optional: cover photo shown big at the top
      IMG_0231.jpg   <- any other photos, real filenames, any names
      IMG_0232.jpg
  tour/
    2024-grey-day-tour/
      ...
  collabs/
  samples/
  employee/
  books/
```

Every folder inside `collections/<category>/` becomes one section on that
category's page — its own heading, optional date/link, a cover photo, and a
grid of every other photo in the folder. A GitHub Action rebuilds the whole
site every time you push, so there's no script to run yourself.

A fully worked example is already in
`collections/drop/EXAMPLE-2024-10-18-fw-essentials/` — open its `info.json`
and `README.txt` to see the pattern, then delete that folder once you don't
need it anymore.

---

## Adding a new drop/collection

1. Pick the category folder (`collections/drop/`, `collections/tour/`, etc.)
2. Make a new folder inside it, named however you like — a date
   (`2024-10-18-fw-essentials`) or a name (`agenda-2059-collection`) both
   work fine, since the folder *name* isn't shown unless you set a title.
3. Drop your photos straight into that folder. Real filenames are fine —
   you don't need to rename or number anything.
4. Optional: add an `info.json` file in that same folder to control the
   heading, date, and link shown at the top of the section:
   ```json
   {
     "title": "F/W essentials collection",
     "date": "Oct 18, 2024",
     "link": "https://x.com/SUICIDEBOYS/status/1847353128964018189"
   }
   ```
   If you skip `info.json`, the folder name is used as the title and no
   date/link line is shown.
5. Optional: name one photo `preview.jpg` (or `.png`/`.webp`) to control
   which photo is used as the big cover image. If you skip this, the first
   photo found is used as the cover automatically.
6. Commit and push. The site rebuilds and redeploys on its own — usually
   live within a minute or two.

You can nest photos in sub-folders inside a collection folder too (e.g. to
group them locally on your computer) — the build script finds every photo
no matter how deep it's nested.

---

## Getting your photos out of Google Sites

Google Sites won't let you bulk-export images, so this part is manual, page
by page, for each of your 6 current sub-sites:

1. Open the sub-site in your browser.
2. Right-click each photo → **Save image as...** → save it into a
   collection folder as described above.
3. A browser extension like "Image Downloader" or "Fatkun Batch Download
   Image" can grab every image on a page in one click if there are a lot
   per drop — much faster than one at a time.

Also grab these small images from your current homepage the same way and
put them straight in `assets/img/`:
- your circular logo → save as `logo.jpg`
- the Instagram icon → save as `icon-instagram.png`
- the X icon → save as `icon-x.png`
- the "link" icon → save as `icon-link.png`

---

## Putting it on GitHub Pages

1. Create a free GitHub account if needed: https://github.com/join
2. Create a new repository (Public), e.g. `g59-merch-archive`.
3. Upload everything in this project into that repo — on the repo page,
   **Add file → Upload files**, then drag this whole folder's contents in.
4. Go to **Settings → Pages**. Under "Build and deployment", set **Source**
   to **GitHub Actions** (not "Deploy from a branch" — this project builds
   the site itself with the included workflow).
5. Push a commit (uploading files counts) and check the **Actions** tab —
   you'll see "Build and deploy site" running. Once it finishes, your site
   is live at `https://yourname.github.io/g59-merch-archive/`.
6. Still in **Settings → Pages**, under "Custom domain" enter
   `www.g59mercharchive.xyz` and save (the included `CNAME` file also
   states this, so this just confirms it).

Note: the workflow in `.github/workflows/deploy.yml` runs on pushes to a
branch called `main`. If your repo's default branch is `master` instead
(GitHub shows this at the top of the Code tab), open that file and change
`branches: [main]` to `branches: [master]`.

## Pointing your domain at GitHub

Wherever you bought g59mercharchive.xyz, open its DNS settings and add:

**For the root domain (g59mercharchive.xyz)** — four A records, all
pointing to:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**For the www subdomain** — one CNAME record:
```
www  →  yourname.github.io
```
(replace `yourname` with your GitHub username)

DNS changes can take minutes to a few hours. Once live, tick "Enforce
HTTPS" in **Settings → Pages**.

---

## Notes

- Nothing here needs installing or building on your own computer — GitHub
  does the building. `scripts/build.mjs` is only there for the GitHub
  Action to run; you can ignore it.
- If you want to preview a change locally before pushing, and you have
  Node.js installed, run `node scripts/build.mjs` from this folder and open
  `_site/index.html` in a browser.
- To rename a category or add a new one, edit `data/categories.json`.
