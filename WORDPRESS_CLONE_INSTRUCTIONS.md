# WordPress Source Clone — Staging Instructions

These instructions cover collecting the three source artifacts from Closte and
staging them in this repository so the full WordPress content is preserved
alongside the existing static crawl.

---

## Step 1 — WordPress XML Export (all content)

1. Log in to Closte → open WordPress admin for interactivism.com
2. Go to **Tools → Export**
3. Select **All content**
4. Click **Download Export File** — you'll get a `.xml` file

**Stage it:**
```bash
cp ~/Downloads/interactivism.wordpress.*.xml wordpress-source/xml-export/
```

**Parse it (generates structured JSON with every post, page, media URL):**
```bash
python3 parse_wp_export.py wordpress-source/xml-export/<filename>.xml \
    --out wordpress-source/xml-export/parsed.json
```

The `parsed.json` will contain:
- Every post and page (title, slug, date, full HTML content, excerpt)
- Every attachment with its original URL
- All media URLs found inside post content
- Categories, tags, authors, custom fields
- A summary count of everything

---

## Step 2 — Full Media Library

In Closte, open **File Manager** (or connect via SFTP):

1. Navigate to `wp-content/uploads/`
2. Select the entire `uploads/` folder and download as a `.zip`
3. Extract the zip so you have the year/month folder structure:

```
uploads/
  2022/
    01/
      image.jpg
  2023/
    ...
```

**Stage it:**
```bash
# Extract into wordpress-source/uploads/ preserving the year/month tree
unzip uploads.zip -d wordpress-source/
# or if the zip contains "uploads/" at its root:
unzip uploads.zip -d wordpress-source/uploads/ --junk-paths   # adjust as needed
```

> **Git LFS note:** The `.gitattributes` in `wordpress-source/` routes all
> image, video, PDF, and font files in `uploads/` through Git LFS automatically.
> Make sure `git lfs install` has been run on your machine before committing.

---

## Step 3 — Active Theme Files

In Closte File Manager:

1. Navigate to `wp-content/themes/`
2. Identify the active theme (check **Appearance → Themes** in WP admin)
3. Download the active theme folder as a `.zip`

**Stage it:**
```bash
unzip <theme-name>.zip -d wordpress-source/theme/
```

---

## Commit and Push

```bash
cd refresh   # repo root
git add wordpress-source/
git commit -m "feat: WordPress source clone — XML export, uploads, theme"
git push -u origin claude/clone-wordpress-github-Tqtpr
```

> If `git lfs install` hasn't been run yet, do that first:
> ```bash
> git lfs install
> git add wordpress-source/
> git commit -m "feat: WordPress source clone — XML export, uploads, theme"
> git push -u origin claude/clone-wordpress-github-Tqtpr
> ```

---

## What comes next

Once the XML export is parsed, Claude can:
- Cross-reference the 73 crawled pages against the full post list to find gaps
- Pull any missing page content directly from `parsed.json`
- Use the uploads media inventory to verify every image referenced in the static site is present
- Use the theme PHP templates as the authoritative source for layout logic
