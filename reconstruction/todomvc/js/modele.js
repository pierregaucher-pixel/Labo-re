// Modèle de la liste : fonctions pures, sans DOM, testables sous Node.
// Une tâche = { title, completed, id }, l'ordre de clés observé à l'étape 2.

export const FILTRES = ['all', 'active', 'completed'];

export function nouvelId(maintenant = Date.now()) {
	return `id_${maintenant}`;
}

export function nettoyer(texte) {
	return String(texte ?? '').trim();
}

export function ajouter(taches, texte, maintenant) {
	const titre = nettoyer(texte);
	if (!titre) return taches;
	let id = nouvelId(maintenant);
	// Deux ajouts dans la même milliseconde ne doivent pas partager un id.
	while (taches.some((t) => t.id === id)) id += '_';
	return [...taches, { title: titre, completed: false, id }];
}

export function basculer(taches, id) {
	return taches.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
}

export function renommer(taches, id, texte) {
	const titre = nettoyer(texte);
	// Fiche, point 16 : un texte vide ne supprime pas la tâche et ne change rien.
	if (!titre) return taches;
	return taches.map((t) => (t.id === id ? { ...t, title: titre } : t));
}

export function retirer(taches, id) {
	return taches.filter((t) => t.id !== id);
}

export function toutBasculer(taches) {
	// Fiche, point 20 : s'il reste au moins une tâche active, tout passe à terminé ;
	// sinon tout repasse en actif.
	const cible = taches.some((t) => !t.completed);
	return taches.map((t) => ({ ...t, completed: cible }));
}

export function viderTerminees(taches) {
	return taches.filter((t) => !t.completed);
}

export function restantes(taches) {
	return taches.filter((t) => !t.completed).length;
}

export function visibles(taches, filtre) {
	if (filtre === 'active') return taches.filter((t) => !t.completed);
	if (filtre === 'completed') return taches.filter((t) => t.completed);
	return taches;
}

export function filtreDepuisHash(hash) {
	const nom = String(hash ?? '').replace(/^#\/?/, '');
	return FILTRES.includes(nom) ? nom : 'all';
}

export function libelleCompteur(n) {
	return `${n} ${n === 1 ? 'item' : 'items'} left`;
}

// Lecture tolérante : toute valeur illisible donne une liste vide.
export function decoder(brut) {
	try {
		const valeur = JSON.parse(brut ?? '[]');
		if (!Array.isArray(valeur)) return [];
		return valeur
			.filter((t) => t && typeof t === 'object' && typeof t.id === 'string')
			.map((t) => ({ title: nettoyer(t.title), completed: Boolean(t.completed), id: t.id }));
	} catch {
		return [];
	}
}

export function encoder(taches) {
	return JSON.stringify(taches.map(({ title, completed, id }) => ({ title, completed, id })));
}
