# Reconstruction TodoMVC

Ma version de la liste de tâches de `1Marc/modern-todomvc-vanillajs`, écrite à partir des seules observations REA de la fiche [`experiences/2026-11-18-todomvc.md`](../../experiences/2026-11-18-todomvc.md) (étape 2), sans lire le code d'origine.

## Fichiers

- `index.html` : la page.
- `js/modele.js` : les règles (ajouter, cocher, renommer, filtrer, compter, encoder le stockage), en fonctions pures.
- `js/app.js` : le rendu DOM et les événements.
- `css/style.css` : une feuille de style écrite pour l'occasion.
- `tests/modele.test.mjs` : tests du modèle sous Node.
- `tests/parcours.mjs` : parcours navigateur des 22 points de la fiche (Playwright).

## Lancer

Servir le dossier avec n'importe quel serveur statique, par exemple :

```bash
python3 -m http.server 8000 --directory reconstruction/todomvc
```

puis ouvrir `http://127.0.0.1:8000/`.

## Tester

```bash
node --test reconstruction/todomvc/tests/modele.test.mjs
```

```bash
node reconstruction/todomvc/tests/parcours.mjs
```

Si Playwright est installé globalement, préfixer la seconde commande par `NODE_PATH=$(npm root -g)`.

## Choix volontaires

- Clé de stockage `reconstruction-todomvc` (et non celle de l'original) pour ne pas mélanger les données si les deux tournent sur la même origine. Le format de la valeur est le même : `[{"title":…,"completed":…,"id":"id_<ms>"}]`.
- Rendu par création de nœuds et `textContent` : pas d'échappement HTML à gérer à la main.
- Lecture du stockage tolérante : une valeur illisible donne une liste vide.
- Deux ajouts dans la même milliseconde reçoivent des identifiants distincts.
