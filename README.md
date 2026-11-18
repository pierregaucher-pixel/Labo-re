# Labo-re

Laboratoire d'apprentissage du reverse engineering d'applications et de pages web, avec Claude et [REA](https://github.com/morluto/rea) (Reverse Engineer Anything).

## Objectif

Comprendre comment fonctionne un logiciel dont on n'a pas le code source, puis reconstruire soi-même une version qui reproduit son comportement.

## Cibles autorisées

On ne travaille que sur :

- ses propres sites et applications ;
- des projets open source ;
- des pages ou applications dont l'auteur a donné son accord ;
- des exercices d'entraînement (crackmes, CTF).

## Règles de travail

1. **On reconstruit le comportement, on ne copie pas.** Pas de reprise du code, des textes, des images ni de la marque d'un tiers.
2. **On reste côté client.** On observe ce que l'application envoie et reçoit avec notre propre compte, sans toucher aux données d'autres utilisateurs ni contourner une authentification.
3. **On respecte les licences et conditions d'utilisation** des logiciels analysés.
4. **Pas de contournement de DRM, de licences ou de triche** dans les jeux.
5. **REA vient uniquement de sources officielles** : `github.com/morluto/rea`, `rea.tools` ou le paquet npm `rea-agents`. Des copies imitatrices circulent.

## Journal des expériences

Pour chaque expérience, créer un fichier dans `experiences/` nommé `AAAA-MM-JJ-sujet.md` avec :

- la cible et pourquoi elle est autorisée ;
- l'objectif ;
- les outils utilisés ;
- ce qui a été trouvé, avec les preuves ;
- ce qui a échoué ou reste incertain.

## Glossaire rapide

- **MCP** : prise standard qui permet à Claude d'utiliser des outils externes, ici REA.
- **Décompiler** : retrouver du code lisible à partir d'un programme compilé.
- **Binaire « stripped »** : programme dont les noms de fonctions ont été retirés.
- **API / backend** : le serveur auquel une application envoie ses requêtes.
- **HAR** : fichier qui enregistre les échanges entre un navigateur et un site.
- **Crackme** : petit programme conçu pour s'entraîner légalement.

*Ce document n'est pas un conseil juridique.*
