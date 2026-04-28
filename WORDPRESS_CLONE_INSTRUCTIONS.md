# WordPress Source Clone — Staging Instructions

Goal: get the live WordPress source (theme, plugins, uploads, database) into
`wordpress-source/` on the `claude/clone-wordpress-github-Tqtpr` branch.

The XML export is already committed. Three artifacts remain.

---

## Artifact 1 — wp-content/ (theme + plugins + uploads)

In **Closte File Manager**:
1. Navigate to your site root (the folder containing `wp-config.php`)
2. Right-click `wp-content` → **Compress / Download as zip**
3. Save the zip

Upload via Dropbox (or directly to GitHub):
- Extract and place contents at `wordpress-source/wp-content/`
- The result should be:
  ```
  wordpress-source/wp-content/
    themes/
    plugins/
    uploads/
  ```

> **Git LFS:** `uploads/` binary files are tracked via LFS (see `.gitattributes`).
> Run `git lfs install` before committing if you haven't already.

---

## Artifact 2 — Database dump

In **Closte → phpMyAdmin** (or Database tools):
1. Select the interactivism database
2. Click **Export** → Quick → Format: SQL → **Go**
3. Save the `.sql` file

Place it at:
```
wordpress-source/database/interactivism.sql
```

> The SQL dump contains user data and site URLs. Claude will scrub credentials
> and add a URL-replacement script before the final commit.

---

## Artifact 3 — wp-config.php (optional)

Download `wp-config.php` from the site root via File Manager.
Place at `wordpress-source/wp-config.php` temporarily — Claude will extract
the DB prefix and any non-credential constants, then discard the file before
committing.

---

## Commit and push (after all artifacts are in place)

```bash
git add wordpress-source/
git commit -m "feat: WordPress source clone — wp-content, database, config"
git push -u origin claude/clone-wordpress-github-Tqtpr
```
