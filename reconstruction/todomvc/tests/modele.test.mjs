// Lancer : node --test reconstruction/todomvc/tests/modele.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import * as m from '../js/modele.js';

test('ajouter rogne, ignore le vide et ajoute à la fin', () => {
	let t = m.ajouter([], '  Pain  ', 1000);
	t = m.ajouter(t, '   ', 1001);
	t = m.ajouter(t, 'Lait', 1002);
	assert.deepEqual(t, [
		{ title: 'Pain', completed: false, id: 'id_1000' },
		{ title: 'Lait', completed: false, id: 'id_1002' },
	]);
});

test('deux ajouts dans la même milliseconde ont des id distincts', () => {
	const t = m.ajouter(m.ajouter([], 'a', 5), 'b', 5);
	assert.notEqual(t[0].id, t[1].id);
});

test('renommer rogne et ignore un texte vide', () => {
	const t = m.ajouter([], 'Lire', 1);
	assert.equal(m.renommer(t, 'id_1', '  Lire un livre ')[0].title, 'Lire un livre');
	assert.equal(m.renommer(t, 'id_1', '   '), t);
});

test('toutBasculer : état mixte → tout terminé, puis tout actif', () => {
	let t = m.ajouter(m.ajouter([], 'a', 1), 'b', 2);
	t = m.basculer(t, 'id_1');
	t = m.toutBasculer(t);
	assert.ok(t.every((x) => x.completed));
	t = m.toutBasculer(t);
	assert.ok(t.every((x) => !x.completed));
});

test('filtres, compteur et vidage', () => {
	let t = m.ajouter(m.ajouter([], 'a', 1), 'b', 2);
	t = m.basculer(t, 'id_2');
	assert.deepEqual(m.visibles(t, 'active').map((x) => x.id), ['id_1']);
	assert.deepEqual(m.visibles(t, 'completed').map((x) => x.id), ['id_2']);
	assert.equal(m.libelleCompteur(m.restantes(t)), '1 item left');
	assert.equal(m.libelleCompteur(0), '0 items left');
	assert.deepEqual(m.viderTerminees(t).map((x) => x.id), ['id_1']);
});

test('filtreDepuisHash', () => {
	assert.equal(m.filtreDepuisHash('#/active'), 'active');
	assert.equal(m.filtreDepuisHash('#/completed'), 'completed');
	assert.equal(m.filtreDepuisHash(''), 'all');
	assert.equal(m.filtreDepuisHash('#/nimporte'), 'all');
});

test('encoder produit le format observé, decoder tolère le reste', () => {
	const t = [{ title: 'Lire <b>gras</b>', completed: false, id: 'id_1' }];
	assert.equal(m.encoder(t), '[{"title":"Lire <b>gras</b>","completed":false,"id":"id_1"}]');
	assert.deepEqual(m.decoder(m.encoder(t)), t);
	assert.deepEqual(m.decoder('pas du json'), []);
	assert.deepEqual(m.decoder('{"a":1}'), []);
	assert.deepEqual(m.decoder(null), []);
});
