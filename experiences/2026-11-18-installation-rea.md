# Installation de REA (rea-agents) — 2026-11-18

## Contexte
- Source : registre npm officiel (`https://registry.npmjs.org/`), paquet `rea-agents`, dernière version publiée `6.9.0` (dépôt déclaré : github.com/morluto/rea).
- Environnement : conteneur Linux (Ubuntu 24.04), Node 22.23.5, npm 10.9.9.
- Commandes lancées :
  1. `npx rea-agents@latest setup`
  2. `npx -y rea-agents doctor`
  3. `npx -y rea-agents setup` (relance pour vérifier l'état après le premier passage)

## Résultat du setup
- Exit code 0, statut `ready`, mais `plannedActions: []` et `appliedActions: []` : **aucune action appliquée**.
- Aucun client MCP n'est détecté dans ce conteneur (Claude Code, Codex, Zcode, DeepSeek Harness, FreeBuff, Grok Build, etc. : `detected: false`). Le setup n'a donc rien à enregistrer.

## Résultat du doctor : `healthy: false`, `environment_healthy: false`

### Ce qui fonctionne
- Node 22.23.5 : OK.
- Hôte Ubuntu 24.04 : OK.
- Le CLI s'installe et s'exécute via npx (version du paquet 6.9.0, expected skill version 62, SDK 2.3.1).
- Catalogue MCP chargé : 196 commandes CLI, 255 outils MCP, 6 prompts.
- Une seule installation de `rea` détectée (pas de doublon).

### Ce qui ne fonctionne pas
| Vérification | Classification | Détail |
|---|---|---|
| hopper | missing_analysis_engine | Lancer `rea setup` ou définir `HOPPER_LAUNCHER_PATH` |
| ghidra | missing_analysis_engine | `GHIDRA_INSTALL_DIR` non défini (Ghidra 12.x >= 12.1 requis) |
| ida-registration | missing_analysis_engine | `REA_IDA_MCP_CONFIG` non défini |
| jadx | missing_analysis_engine | `REA_JADX_MCP_JAR` non défini (JAR jadx-headless-mcp 0.7.1 fourni par l'utilisateur) |
| kuna | missing_analysis_engine | `REA_KUNA_COMMAND` non défini (kuna 1.990 attendu) |
| skill:identity | config_drift | Skill REA installée absente (`installed_version: null`) |
| registration:claude_code | config_drift | Enregistrement absent dans `/root/.claude.json` |
| live_server | unknown | Non vérifiable tant qu'un client n'est pas enregistré |

## Interprétation
- Les 4 moteurs d'analyse (Hopper, Ghidra, IDA, JADX, Kuna) sont des outils d'analyse de binaires/rétro-ingénierie. Ils demandent des installations fournies par l'utilisateur : REA ne les télécharge pas. Ils n'ont pas été installés ici, ce qui explique leur échec. À confirmer si l'usage visé ne nécessite pas ces moteurs.
- Les deux `config_drift` (skill et enregistrement Claude Code) sont le vrai blocage pour l'usage normal de REA : **le setup n'a pas installé la skill ni enregistré le serveur MCP**, car il n'a détecté aucun client. Il faudrait lancer le setup depuis une machine où Claude Code (ou un autre client) est installé et actif, ou fournir les chemins de configuration du client.
- Le message « ready » du setup est trompeur dans ce contexte : il ne signifie pas que REA est opérationnel.

## Prochaines étapes suggérées
1. Installer REA sur la machine de l'utilisateur où le client MCP est présent, puis relancer `npx rea-agents@latest setup`.
2. Décider si les moteurs d'analyse sont nécessaires ; si oui, les installer et définir les variables d'environnement indiquées.
3. Relancer `npx -y rea-agents doctor` et vérifier que `skill:identity` et `registration:claude_code` passent au vert.

## Notes
- Un avertissement npm signale que `prebuild-install@7.1.3` est déprécié (dépendance transitive, sans impact sur le diagnostic).
- Journaux complets : `/tmp/rea-doctor.txt` et `/tmp/rea-setup.txt` (sortie brute, conservée hors dépôt).
