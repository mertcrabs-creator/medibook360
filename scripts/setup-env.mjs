// Creates the root .env from .env.example, replacing every __GENERATE__
// with a strong random secret and expanding ${VAR} references.
// Refuses to overwrite an existing .env.
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const target = join(root, '.env');

if (existsSync(target)) {
  console.log('.env already exists - leaving it untouched.');
  process.exit(0);
}

const values = {};
const lines = readFileSync(join(root, '.env.example'), 'utf8')
  .split(/\r?\n/)
  .map((line) => {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) return line;
    let [, key, value] = match;
    if (value === '__GENERATE__') value = randomBytes(32).toString('base64url');
    value = value.replace(/\$\{([A-Z0-9_]+)\}/g, (_, ref) => values[ref] ?? '');
    values[key] = value;
    return `${key}=${value}`;
  });

writeFileSync(target, lines.join('\n'), { encoding: 'utf8', mode: 0o600 });
console.log('Created .env with freshly generated secrets.');
