// Parcours navigateur des 22 points de la fiche sur la reconstruction.
// Lancer : node reconstruction/todomvc/tests/parcours.mjs
// (Playwright et Chromium doivent être disponibles.)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

// Playwright est résolu comme un paquet CommonJS (installation globale acceptée).
const { chromium } = createRequire(import.meta.url)('playwright');

const racine = fileURLToPath(new URL('..', import.meta.url));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const serveur = createServer(async (req, res) => {
	const chemin = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
	const fichier = join(racine, chemin === '/' ? 'index.html' : chemin);
	if (!fichier.startsWith(racine)) return res.writeHead(403).end();
	try {
		res.writeHead(200, { 'content-type': types[extname(fichier)] ?? 'text/plain' });
		res.end(await readFile(fichier));
	} catch {
		res.writeHead(404).end();
	}
});
await new Promise((ok) => serveur.listen(0, '127.0.0.1', ok));
const base = `http://127.0.0.1:${serveur.address().port}/`;

const navigateur = await chromium.launch({ args: ['--no-sandbox'] });
const page = await navigateur.newPage();
const erreurs = [];
page.on('pageerror', (e) => erreurs.push(e.message));

const titres = () => page.locator('.todo-list label').allTextContents();
const compteur = async () => (await page.locator('.todo-count').textContent()).trim();
const stockage = () => page.evaluate(() => localStorage.getItem('reconstruction-todomvc'));
const ajouter = async (texte) => {
	await page.fill('.new-todo', texte);
	await page.press('.new-todo', 'Enter');
};
// hashchange est asynchrone : on attend que le lien du filtre soit marqué.
const filtrer = async (hash) => {
	await page.click(`a[href="${hash}"]`);
	await page.waitForSelector(`a.selected[href="${hash}"]`);
};
const editer = async (n, texte, touche) => {
	await page.dblclick(`.todo-list li:nth-child(${n}) label`);
	await page.fill(`.todo-list li:nth-child(${n}) .edit`, texte);
	if (touche) await page.press(`.todo-list li:nth-child(${n}) .edit`, touche);
};

await page.goto(base);
// 1. état initial
assert.equal(await page.locator('.main').isHidden(), true);
assert.equal(await page.locator('.footer').isHidden(), true);
// 2-5. ajout
await ajouter('  Acheter du pain  ');
await ajouter('Lire <b>gras</b>');
await ajouter('   ');
assert.deepEqual(await titres(), ['Acheter du pain', 'Lire <b>gras</b>']);
assert.equal(await page.inputValue('.new-todo'), '');
assert.equal(await compteur(), '2 items left');
// 18. format du stockage
assert.match(await stockage(), /^\[\{"title":"Acheter du pain","completed":false,"id":"id_\d+"\},\{"title":"Lire <b>gras<\/b>","completed":false,"id":"id_\d+"\}\]$/);
// 8-9. cocher
await page.check('.todo-list li:nth-child(1) .toggle');
assert.equal(await page.locator('.todo-list li:nth-child(1)').getAttribute('class'), 'completed');
assert.equal(await compteur(), '1 item left');
assert.equal(await page.locator('.clear-completed').isVisible(), true);
// 10. filtres
await filtrer('#/active');
assert.deepEqual(await titres(), ['Lire <b>gras</b>']);
assert.equal(await page.locator('a.selected').textContent(), 'Active');
await filtrer('#/completed');
assert.deepEqual(await titres(), ['Acheter du pain']);
await filtrer('#/');
// 13. éditer + Entrée
await editer(2, '  Lire un livre  ', 'Enter');
assert.deepEqual(await titres(), ['Acheter du pain', 'Lire un livre']);
// 14. Échap
await editer(1, 'Annule-moi', 'Escape');
assert.deepEqual(await titres(), ['Acheter du pain', 'Lire un livre']);
// 15. perte du focus
await ajouter('Courir');
await editer(3, 'Courir vite');
await page.click('h1');
assert.deepEqual(await titres(), ['Acheter du pain', 'Lire un livre', 'Courir']);
// 16. édition vide
const avant = await stockage();
await editer(2, '   ', 'Enter');
assert.equal(await stockage(), avant);
assert.deepEqual(await titres(), ['Acheter du pain', 'Lire un livre', 'Courir']);
// 20. tout cocher (état mixte)
await page.click('label[for="toggle-all"]');
assert.equal(await compteur(), '0 items left');
await page.click('label[for="toggle-all"]');
assert.equal(await compteur(), '3 items left');
// 19. persistance
await page.reload();
assert.deepEqual(await titres(), ['Acheter du pain', 'Lire un livre', 'Courir']);
// 17. suppression au survol
await page.hover('.todo-list li:nth-child(2)');
await page.click('.todo-list li:nth-child(2) .destroy');
assert.deepEqual(await titres(), ['Acheter du pain', 'Courir']);
// 11-12. filtre lu au chargement, ajout pendant « Completed »
await page.goto(base + '#/completed');
await page.reload();
assert.deepEqual(await titres(), []);
await ajouter('Gamma');
assert.deepEqual(await titres(), []);
assert.equal(await compteur(), '3 items left');
// 21-22. vider
await filtrer('#/');
await page.click('label[for="toggle-all"]');
await page.click('.clear-completed');
assert.equal(await page.locator('.main').isHidden(), true);
assert.equal(await page.locator('.footer').isHidden(), true);
assert.equal(await stockage(), '[]');

assert.deepEqual(erreurs, []);
console.log('parcours : 22 points vérifiés');
await navigateur.close();
serveur.close();
