import { existsSync, mkdirSync, readFileSync, copyFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const [date, sourceArg] = process.argv.slice(2);
if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '') || !sourceArg) {
  console.error('Usage: node scripts/publish.mjs YYYY-MM-DD /path/to/brief.html');
  process.exit(1);
}

const source = resolve(sourceArg);
if (!existsSync(source)) {
  console.error(`Source not found: ${source}`);
  process.exit(1);
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = dirname(source);
const destinationAssets = join(root, 'assets', date);
let html = readFileSync(source, 'utf8');
const references = [...new Set(html.match(/assets\/[A-Za-z0-9._-]+/g) ?? [])];

for (const reference of references) {
  const sourceAsset = join(sourceDir, reference);
  if (!existsSync(sourceAsset)) {
    console.error(`Referenced asset not found: ${sourceAsset}`);
    process.exit(1);
  }
}

mkdirSync(destinationAssets, { recursive: true });
for (const reference of references) {
  const filename = basename(reference);
  const destination = filename === 'lucide.min.js'
    ? join(root, 'assets', filename)
    : join(destinationAssets, filename);
  copyFileSync(join(sourceDir, reference), destination);
  if (filename !== 'lucide.min.js') {
    html = html.replaceAll(reference, `assets/${date}/${filename}`);
  }
}

writeFileSync(join(root, `${date}.html`), html);
writeFileSync(join(root, 'index.html'), html);
console.log(`Published ${date}.html and index.html from ${source}`);
