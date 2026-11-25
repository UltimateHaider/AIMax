#!/usr/bin/env node
/**
 * Cross-platform Python launcher for the content/SEO build steps.
 * Tries the common interpreter names instead of assuming `python3` exists
 * (Windows) or that `python` exists on Linux CI (it often does not).
 */
const { spawnSync } = require('node:child_process');

const args = process.argv.slice(2);
const candidates = process.platform === 'win32'
  ? ['python', 'py', 'python3']
  : ['python3', 'python'];

for (const command of candidates) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.error && result.error.code === 'ENOENT') continue;
  if (result.error) {
    console.error(`Failed to run ${command}: ${result.error.message}`);
    process.exit(1);
  }
  process.exit(result.status ?? 1);
}

console.error('Python 3 is required but no interpreter was found (tried: ' + candidates.join(', ') + ').');
process.exit(1);
