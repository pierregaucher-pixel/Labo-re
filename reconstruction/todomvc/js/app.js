// Liaison entre le modèle et la page. Rendu par création de nœuds DOM
// (textContent), donc aucun échappement HTML manuel n'est nécessaire.
import * as m from './modele.js';

const CLE = 'reconstruction-todomvc';

const $ = (sel) => document.querySelector(sel);
const champNouveau = $('[data-role="nouveau"]');
const zoneListe = $('[data-role="zone-liste"]');
const liste = $('[data-role="liste"]');
const toutCocher = $('[data-role="tout-cocher"]');
const pied = $('[data-role="pied"]');
const compteur = $('[data-role="compteur"]');
const boutonVider = $('[data-role="vider"]');
const liensFiltres = document.querySelectorAll('[data-role="filtres"] a');

const etat = {
	taches: m.decoder(lireStockage()),
	filtre: m.filtreDepuisHash(location.hash),
	enEdition: null,
};

function lireStockage() {
	try {
		return localStorage.getItem(CLE);
	} catch {
		return null;
	}
}

function ecrireStockage() {
	try {
		localStorage.setItem(CLE, m.encoder(etat.taches));
	} catch {
		// Stockage indisponible (navigation privée stricte) : on garde l'état en mémoire.
	}
}

function changer(nouvellesTaches) {
	if (nouvellesTaches === etat.taches) return;
	etat.taches = nouvellesTaches;
	ecrireStockage();
	afficher();
}

function ligne(tache) {
	const li = document.createElement('li');
	li.dataset.id = tache.id;
	if (tache.completed) li.classList.add('completed');
	if (etat.enEdition === tache.id) li.classList.add('editing');

	const vue = document.createElement('div');
	vue.className = 'view';

	const caseACocher = document.createElement('input');
	caseACocher.type = 'checkbox';
	caseACocher.className = 'toggle';
	caseACocher.checked = tache.completed;
	caseACocher.setAttribute('aria-label', `Terminer « ${tache.title} »`);

	const libelle = document.createElement('label');
	libelle.textContent = tache.title;

	const supprimer = document.createElement('button');
	supprimer.className = 'destroy';
	supprimer.type = 'button';
	supprimer.setAttribute('aria-label', `Supprimer « ${tache.title} »`);

	vue.append(caseACocher, libelle, supprimer);
	li.append(vue);

	if (etat.enEdition === tache.id) {
		const edition = document.createElement('input');
		edition.className = 'edit';
		edition.value = tache.title;
		li.append(edition);
	}
	return li;
}

function afficher() {
	const { taches, filtre } = etat;
	const aDesTaches = taches.length > 0;
	zoneListe.hidden = !aDesTaches;
	pied.hidden = !aDesTaches;

	liste.replaceChildren(...m.visibles(taches, filtre).map(ligne));

	const n = m.restantes(taches);
	compteur.textContent = m.libelleCompteur(n);
	toutCocher.checked = aDesTaches && n === 0;
	boutonVider.hidden = !taches.some((t) => t.completed);

	for (const lien of liensFiltres) {
		lien.classList.toggle('selected', lien.dataset.filtre === filtre);
	}

	const edition = liste.querySelector('.edit');
	if (edition) {
		edition.focus();
		edition.setSelectionRange(edition.value.length, edition.value.length);
	}
}

function idDe(element) {
	return element.closest('li')?.dataset.id ?? null;
}

function quitterEdition({ enregistrer }) {
	const id = etat.enEdition;
	if (!id) return;
	const champ = liste.querySelector('.edit');
	const texte = champ ? champ.value : '';
	etat.enEdition = null;
	if (enregistrer) {
		const suite = m.renommer(etat.taches, id, texte);
		if (suite !== etat.taches) return changer(suite);
	}
	afficher();
}

champNouveau.addEventListener('keydown', (e) => {
	if (e.key !== 'Enter' || e.isComposing) return;
	const suite = m.ajouter(etat.taches, champNouveau.value);
	champNouveau.value = '';
	changer(suite);
});

liste.addEventListener('change', (e) => {
	if (e.target.matches('.toggle')) changer(m.basculer(etat.taches, idDe(e.target)));
});

liste.addEventListener('click', (e) => {
	if (e.target.matches('.destroy')) changer(m.retirer(etat.taches, idDe(e.target)));
});

liste.addEventListener('dblclick', (e) => {
	if (!e.target.matches('label')) return;
	etat.enEdition = idDe(e.target);
	afficher();
});

liste.addEventListener('keydown', (e) => {
	if (!e.target.matches('.edit')) return;
	if (e.key === 'Enter') quitterEdition({ enregistrer: true });
	else if (e.key === 'Escape') quitterEdition({ enregistrer: false });
});

// Fiche, point 15 : perdre le focus abandonne la modification.
liste.addEventListener('focusout', (e) => {
	if (e.target.matches('.edit') && etat.enEdition) quitterEdition({ enregistrer: false });
});

toutCocher.addEventListener('change', () => changer(m.toutBasculer(etat.taches)));

boutonVider.addEventListener('click', () => changer(m.viderTerminees(etat.taches)));

window.addEventListener('hashchange', () => {
	etat.filtre = m.filtreDepuisHash(location.hash);
	etat.enEdition = null;
	afficher();
});

afficher();
