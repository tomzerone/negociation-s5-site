// Construit le site :
//   dist/index.html + dist/app.js + dist/styles.css   → version multi-fichiers
//   dist/negociation-revision.html                     → version « un seul fichier » (hors ligne, artefact claude.ai)
//   docs/                                              → copie pour GitHub Pages (branche main, dossier /docs)
import { build } from 'esbuild';
import { mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';

mkdirSync('dist', { recursive: true });
await build({
  entryPoints: ['src/app/main.js'], bundle: true, format: 'iife', target: 'es2020',
  minify: true, outfile: 'dist/app.js', legalComments: 'none', charset: 'utf8',
});
copyFileSync('src/styles.css', 'dist/styles.css');
copyFileSync('src/index.html', 'dist/index.html');

const single = readFileSync('src/index.html', 'utf8')
  .replace('<link rel="stylesheet" href="styles.css">', () => `<style>${readFileSync('dist/styles.css', 'utf8')}</style>`)
  .replace('<script src="app.js"></script>', () => `<script>${readFileSync('dist/app.js', 'utf8').replace(/<\/script/gi, '<\\/script')}</script>`);
writeFileSync('dist/negociation-revision.html', single);

mkdirSync('docs', { recursive: true });
for (const f of ['index.html', 'app.js', 'styles.css']) copyFileSync('dist/' + f, 'docs/' + f);
writeFileSync('docs/.nojekyll', '');
const kb = (f) => Math.round(readFileSync(f).length / 1024);
console.log(`Build OK — app.js ${kb('dist/app.js')} Ko, styles.css ${kb('dist/styles.css')} Ko, fichier unique ${kb('dist/negociation-revision.html')} Ko`);
