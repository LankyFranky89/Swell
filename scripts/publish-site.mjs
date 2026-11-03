// Copy the built site from dist/ to the repository root, where GitHub Pages serves it.
import { cpSync, existsSync, rmSync, writeFileSync } from 'node:fs';

const keep = ['index.html', 'callback', 'assets'];
for (const k of keep) if (existsSync(k)) rmSync(k, { recursive: true, force: true });
for (const k of keep) if (existsSync(`dist/${k}`)) cpSync(`dist/${k}`, k, { recursive: true });
writeFileSync('.nojekyll', '');
console.log('Site copied to the repository root for GitHub Pages.');
