/**
 * Configures git to use the committed .githooks/ directory.
 * Run automatically via `npm run prepare` (fires after npm install).
 */

import { execSync, spawnSync } from 'node:child_process';
import { chmodSync, existsSync } from 'node:fs';
import { resolve, dirname }    from 'node:path';
import { fileURLToPath }       from 'node:url';

const __dirname   = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const hooksDir    = resolve(projectRoot, '.githooks');

// Make sure scripts in the hooks directory are executable.
const preCommit = resolve(hooksDir, 'pre-commit');
if (existsSync(preCommit)) chmodSync(preCommit, 0o755);

// Point git at our committed hooks directory.
const result = spawnSync('git', ['config', 'core.hooksPath', hooksDir], {
  cwd: projectRoot,
  stdio: 'inherit',
});

if (result.status === 0) {
  console.log(`✓ Git hooks configured → ${hooksDir}`);
} else {
  console.warn('⚠ Could not configure git hooks (not inside a git repo?)');
}
