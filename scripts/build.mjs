import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(path.join(root, 'src/ha-worldclock-card.js'), 'utf8');
const marker = '/* GENERATED_ARTWORK */ Object.freeze({})';
if (!source.includes(marker)) throw new Error('Artwork marker missing from card source');

const names = ['san-francisco', 'stuttgart', 'tahoe', 'hawaii'];
const artwork = Object.fromEntries(await Promise.all(names.map(async (name) => [
  name,
  `data:image/webp;base64,${(await readFile(path.join(root, 'artwork', `${name}.webp`))).toString('base64')}`,
])));
const output = source.replace(marker, `Object.freeze(${JSON.stringify(artwork)})`);
await mkdir(path.join(root, 'dist'), { recursive: true });
await Promise.all([
  writeFile(path.join(root, 'ha-worldclock-card.js'), output),
  writeFile(path.join(root, 'dist/ha-worldclock-card.js'), output),
]);
