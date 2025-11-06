# cartographie

Application monopage de cartographie des risques de corruption. Elle fournit un tableau de bord interactif, un registre des risques et des contrôles ainsi qu'un moteur d'export autonome fonctionnant entièrement côté navigateur.

## Table des matières

- [Fonctionnalités principales](#fonctionnalités-principales)
- [Structure du projet](#structure-du-projet)
  - [Fichiers clés](#fichiers-clés)
  - [Modules JavaScript](#modules-javascript)
- [Technologies utilisées](#technologies-utilisées)
- [Données & persistance](#données--persistance)
- [Démarrage rapide](#démarrage-rapide)
  - [Utilisation hors-ligne](#utilisation-hors-ligne)
  - [Via un serveur local (optionnel)](#via-un-serveur-local-optionnel)
- [Configuration fonctionnelle](#configuration-fonctionnelle)
- [Développement & bonnes pratiques](#développement--bonnes-pratiques)
  - [Workflow recommandé](#workflow-recommandé)
  - [Qualité du code](#qualité-du-code)
- [Tests manuels](#tests-manuels)
  - [Export CSV avec un registre vide](#export-csv-avec-un-registre-vide)
- [Limitations connues & pistes d'amélioration](#limitations-connues--pistes-damélioration)
- [Support & contributions](#support--contributions)
- [Ressources](#ressources)

## Fonctionnalités principales

- **Tableau de bord temps réel** : synthèse des KPIs clés (risques critiques, contrôles actifs, score global) et graphiques alimentés par Chart.js pour suivre l'évolution des risques et leur répartition par processus.
- **Matrice des risques** : vue interactive des expositions brut et net avec légende dynamique, filtres et édition visuelle des probabilités/impacts.
- **Registre des risques** : création, édition et suppression des risques avec liens vers les contrôles et plans d'actions associés, filtres texte/processus/statut et export CSV.
- **Gestion des contrôles & plans** : fiches détaillées, modales d'édition, suivi des responsabilités et de l'efficacité des mesures.
- **Historique & alertes** : timeline chronologique des actions, notifications utilisateur et badges d'alerte sur le tableau de bord.
- **Export autonome** : export JSON/CSV (bouton 💾 Enregistrer dans l'en-tête et exports dédiés dans la configuration), capture de la matrice, export PDF du tableau de bord (avec ou sans jsPDF).
- **Configuration fonctionnelle** : administration des listes déroulantes (processus, types, statuts, tiers, etc.) avec persistance automatique dans le navigateur.

## Structure du projet

### Fichiers clés
- `CartoModel.html` : point d'entrée de l'application, intègre la mise en page, les onglets et charge les modules JavaScript/CSS.
- `assets/css/main.css` : styles de l'interface (tableau de bord, matrice, modales, formulaires).
- `assets/libs/` : placez-y les bibliothèques tierces nécessaires en mode hors-ligne (`chart.umd.min.js`, `html2canvas.min.js`, `jspdf.umd.min.js`).

### Modules JavaScript

| Fichier | Responsabilités principales |
| --- | --- |
| `assets/js/main.js` | Initialisation : instancie `RiskManagementSystem`, attache les événements globaux et déclenche le rendu initial. |
| `assets/js/rms.constants.js` | Définitions communes (libellés de probabilité/impact, configuration des états de risque). Exposées sur `window`. |
| `assets/js/rms.utils.js` | Fonctions utilitaires partagées (sanitisation des identifiants, comparaison, incréments séquentiels). |
| `assets/js/rms.core.js` | Cœur applicatif : jeux de données par défaut, persistance `localStorage`, calculs, rendus du tableau de bord, du registre, des plans et de l'historique, gestion de la configuration dynamique. |
| `assets/js/rms.matrix.js` | Logique de la matrice : changement de vue, calculs de score, positionnement des points, interactions drag & drop et synchronisation avec les formulaires. |
| `assets/js/rms.ui.js` | Interactions UI : navigation entre onglets, filtres, recherche, modales d'édition des risques/contrôles/plans, notifications et synchronisation avec la matrice. |
| `assets/js/rms.integrations.js` | Fonctions d'import/export, correctifs de compatibilité, génération de fichiers, parsing CSV/JSON, timeline de sauvegarde et helpers toast. |

## Technologies utilisées

- **HTML/CSS/JavaScript vanilla** pour garantir une compatibilité maximale et éviter la dépendance à un framework front-end.
- **Chart.js** pour la visualisation des indicateurs du tableau de bord.
- **html2canvas** pour la capture de la matrice et la génération de visuels hors ligne.
- **jsPDF** (optionnel) pour enrichir l'export PDF avec un moteur éprouvé lorsque la librairie est disponible.
- **LocalStorage** comme couche de persistance, assurant le fonctionnement hors connexion.

## Données & persistance

- Toutes les données sont stockées côté navigateur via `localStorage` (`rms_risks`, `rms_controls`, `rms_actionPlans`, `rms_history`, `rms_config`).
- Les modifications sont enregistrées immédiatement dans le navigateur et la date de dernière sauvegarde est affichée dans l'en-tête.
- Les exports sont effectués côté client : `exportRisks()` produit un CSV et `exportDashboard()` génère un PDF de synthèse du tableau de bord (avec un moteur jsPDF si présent, sinon via un générateur minimaliste intégré).

## Démarrage rapide

### Utilisation hors-ligne
1. Téléchargez les bibliothèques suivantes et placez-les dans `assets/libs/` :
   - `chart.umd.min.js` (Chart.js)
   - `html2canvas.min.js`
   - `jspdf.umd.min.js` *(optionnel : sans ce fichier, l'export PDF utilise un moteur simplifié intégré)*
2. Ouvrez le fichier `CartoModel.html` dans votre navigateur (double-clic ou `Ctrl+O`).
3. Les dépendances étant locales, l'application fonctionne entièrement via `file://` sans serveur.

### Via un serveur local (optionnel)
1. Dans un terminal, placez-vous à la racine du projet : `cd cartographie`.
2. Lancez un serveur statique, par exemple : `python -m http.server 8000`.
3. Ouvrez `http://localhost:8000/CartoModel.html` dans votre navigateur pour bénéficier d'un rechargement plus fluide lors du développement.

## Configuration fonctionnelle

- L'onglet **Configuration** permet d'ajouter, modifier ou supprimer les valeurs utilisées dans les listes déroulantes (processus, statuts, types de corruption, tiers, etc.).
- Les sous-processus sont rattachés à chaque processus ; le module met automatiquement à jour les formulaires et filtres lorsque la structure évolue.
- Les modifications sont persistées via `saveConfig()` et répercutées dans toute l'interface grâce à `populateSelects()`.

## Développement & bonnes pratiques

### Workflow recommandé
1. Cloner ou télécharger le dépôt puis créer une copie locale des fichiers HTML/CSS/JS.
2. Démarrer un serveur local (voir section précédente) pour profiter du rechargement automatique du navigateur.
3. Modifier les modules JavaScript ciblés en respectant la structure existante (pas d'imports circulaires, privilégier les fonctions pures).
4. Tester chaque fonctionnalité métier (création de risque, modification d'un contrôle, exports) avant de valider les modifications.
5. Versionner les changements significatifs afin de faciliter le suivi et le retour arrière.

### Qualité du code
- Respecter la séparation des responsabilités décrite dans la section [Modules JavaScript](#modules-javascript).
- Éviter l'utilisation de bibliothèques supplémentaires non nécessaires pour conserver la légèreté de l'application.
- Privilégier les messages d'erreur utilisateur explicites et l'utilisation du module de notifications déjà présent.
- Penser aux scénarios hors-ligne : les appels réseau doivent toujours être optionnels ou disposer d'une alternative locale.

## Tests manuels

### Export CSV avec un registre vide
1. Ouvrez `CartoModel.html` et accédez à l'onglet **📋 Liste des Risques**.
2. Supprimez tous les risques (icône corbeille sur chaque ligne) jusqu'à ce que le tableau soit vide.
3. Cliquez sur le bouton "📤 Exporter" du registre.
4. Vérifiez qu'une notification "Aucune donnée disponible pour l'export CSV." s'affiche, qu'aucun fichier n'est téléchargé et qu'aucune erreur n'apparaît dans la console du navigateur.

## Limitations connues & pistes d'amélioration

- Le moteur repose sur `localStorage`; un changement de navigateur ou de poste entraîne la perte des données si aucun export n'a été réalisé.
- Les exports volumineux peuvent être limités par les capacités mémoire du navigateur. Prévoir une segmentation des exports si nécessaire.
- L'application n'intègre pas de mécanisme d'authentification : elle doit être servie dans un environnement sécurisé si des données sensibles sont manipulées.
- Les tests automatisés ne sont pas fournis. La mise en place d'une suite de tests end-to-end (ex. Playwright) faciliterait la non-régression.

## Support & contributions

Les issues et suggestions d'amélioration peuvent être déposées via le gestionnaire de tickets du dépôt. Pour proposer un correctif :
1. Créez une branche dédiée ou un fork.
2. Implémentez et testez votre modification.
3. Documentez brièvement vos changements dans la description de la demande de fusion.

## Ressources

- La matrice et les graphiques utilisent des bibliothèques embarquées pour rester fonctionnels hors connexion.
- Pour purger les données locales et revenir à l'état initial, videz le stockage local du navigateur pour le domaine courant (`localStorage.clear()` ou outils de développement).
