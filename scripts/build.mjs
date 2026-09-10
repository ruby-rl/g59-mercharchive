// Builds the static site into _site/ by scanning each category folder
// (drop/, tour/, collabs/, samples/, employee/, books/) sitting at the
// root of the repo. Run automatically by .github/workflows/deploy.yml on
// every push - you never need to run this yourself, just add photos and
// push.
//
// Usage (only if you want to preview locally): node scripts/build.mjs

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "_site");
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function isImageFile(name) {
  return IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase());
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function relFromRoot(absPath) {
  return path.relative(ROOT, absPath).split(path.sep).join("/");
}

// Recursively find every image inside a folder (handles nested subfolders).
function findImages(dir) {
  let found = [];
  if (!fs.existsSync(dir)) return found;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found = found.concat(findImages(full));
    } else if (isImageFile(entry.name)) {
      found.push(full);
    }
  }
  return found.sort();
}

function readInfo(folderPath) {
  const infoPath = path.join(folderPath, "info.json");
  if (!fs.existsSync(infoPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(infoPath, "utf8"));
  } catch (err) {
    console.warn(`Could not parse info.json in ${folderPath}:`, err.message);
    return {};
  }
}

function findPreviewImage(folderPath) {
  for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
    const candidate = path.join(folderPath, `preview${ext}`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

// Category folders live directly at the repo root: <categoryKey>/<collectionFolder>/
function buildCollectionSection(categoryKey, folderName) {
  const folderPath = path.join(ROOT, categoryKey, folderName);
  const info = readInfo(folderPath);
  const title = info.title || folderName;

  const preview = findPreviewImage(folderPath);
  const allImages = findImages(folderPath).filter((p) => p !== preview);
  const coverImage = preview || allImages[0] || null;
  const gridImages = allImages.filter((p) => p !== coverImage);

  const dateLine = info.date
    ? `<p class="collection-meta">${
        info.link
          ? `<a href="${escapeHtml(info.link)}" target="_blank" rel="noopener">${escapeHtml(info.date)}</a>`
          : escapeHtml(info.date)
      }</p>`
    : "";

  const coverHtml = coverImage
    ? `<button class="thumb collection-cover"><img src="${relFromRoot(coverImage)}" alt="${escapeHtml(title)}" loading="lazy" /></button>`
    : "";

  const gridHtml = gridImages
    .map(
      (imgPath) =>
        `<button class="thumb"><img src="${relFromRoot(imgPath)}" alt="${escapeHtml(title)} photo" loading="lazy" /></button>`
    )
    .join("\n        ");

  return `
    <section class="collection">
      <h2>${escapeHtml(title)}</h2>
      ${dateLine}
      ${coverHtml}
      <div class="gallery">
        ${gridHtml}
      </div>
    </section>`;
}

function buildCategoryPage(category) {
  const categoryDir = path.join(ROOT, category.key);
  let sectionsHtml = `<p class="empty-state">No collections added to this category yet. See README.md for how to add one.</p>`;

  if (fs.existsSync(categoryDir)) {
    const folders = fs
      .readdirSync(categoryDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => b.localeCompare(a)); // newest-looking names first

    if (folders.length > 0) {
      sectionsHtml = folders
        .map((folderName) => buildCollectionSection(category.key, folderName))
        .join("\n");
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(category.title)} &middot; G59 Merch Archive</title>
  <link rel="stylesheet" href="assets/css/style.css" />
</head>
<body>
  <div class="wrap">
    <a class="back-link" href="index.html">&larr; back to home</a>
    <h1 class="page-title">${escapeHtml(category.title)}</h1>
    <p class="page-sub">click any picture to make it bigger and zoom in</p>
    ${sectionsHtml}
  </div>

  <div id="lightbox" class="lightbox">
    <img id="lightbox-img" src="" alt="Full size merch photo" />
  </div>

  <script src="assets/js/gallery.js"></script>
</body>
</html>
`;
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  copyDir(path.join(ROOT, "assets"), path.join(OUT, "assets"));

  fs.copyFileSync(path.join(ROOT, "index.html"), path.join(OUT, "index.html"));

  if (fs.existsSync(path.join(ROOT, "CNAME"))) {
    fs.copyFileSync(path.join(ROOT, "CNAME"), path.join(OUT, "CNAME"));
  }

  const categories = JSON.parse(
    fs.readFileSync(path.join(ROOT, "data", "categories.json"), "utf8")
  );

  for (const category of categories) {
    // Copy this category's whole folder (with all its photos) into _site/
    const categorySrc = path.join(ROOT, category.key);
    if (fs.existsSync(categorySrc)) {
      copyDir(categorySrc, path.join(OUT, category.key));
    }

    const html = buildCategoryPage(category);
    fs.writeFileSync(path.join(OUT, `${category.key}.html`), html);
    console.log(`Built ${category.key}.html`);
  }

  console.log(`\nDone. Output in ${OUT}`);
}

main();
