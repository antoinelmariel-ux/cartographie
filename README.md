# cartographie

Application monopage de cartographie des risques de corruption. Elle fournit un tableau de bord interactif, un registre des risques et des contrôles ainsi qu'un moteur d'export/import autonome fonctionnant entièrement côté navigateur.

## Fonctionnalités principales

- **Tableau de bord temps réel** : synthèse des KPIs clés (risques critiques, contrôles actifs, score global) et graphiques alimentés par Chart.js pour suivre l'évolution des risques et leur répartition par processus.
- **Matrice des risques** : vue interactive des expositions brut, net et post-mitigation avec légende dynamique, filtres et édition visuelle des probabilités/impacts.
- **Registre des risques** : création, édition et suppression des risques avec liens vers les contrôles et plans d'actions associés, filtres texte/processus/statut et export CSV.
- **Gestion des contrôles & plans** : fiches détaillées, modales d'édition, suivi des responsabilités et de l'efficacité des mesures.
- **Historique & alertes** : timeline chronologique des actions, notifications utilisateur et badges d'alerte sur le tableau de bord.
- **Import / Export autonome** : export JSON/CSV (boutons 💾 Enregistrer / 📂 Charger dans l'en-tête), capture de la matrice, export PDF du tableau de bord (avec ou sans jsPDF) et import depuis fichiers CSV ou JSON sans dépendance serveur.
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

## Données & persistance

- Toutes les données sont stockées côté navigateur via `localStorage` (`rms_risks`, `rms_controls`, `rms_actionPlans`, `rms_history`, `rms_config`).
- Les modifications sont enregistrées immédiatement dans le navigateur et la date de dernière sauvegarde est affichée dans l'en-tête.
- Les exports sont effectués côté client : `exportRisks()` produit un CSV et `exportDashboard()` génère un PDF de synthèse du tableau de bord (avec un moteur jsPDF si présent, sinon via un générateur minimaliste intégré).
- L'import accepte des fichiers CSV (colonnes libres, mappées automatiquement) ou JSON (structure `{ risks, controls, history }`). Chaque import ajoute un événement dans l'historique.

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

## Tests manuels

### Export CSV avec un registre vide
1. Ouvrez `CartoModel.html` et accédez à l'onglet **📋 Liste des Risques**.
2. Supprimez tous les risques (icône corbeille sur chaque ligne) jusqu'à ce que le tableau soit vide.
3. Cliquez sur le bouton "📤 Exporter" du registre.
4. Vérifiez qu'une notification "Aucune donnée disponible pour l'export CSV." s'affiche, qu'aucun fichier n'est téléchargé et qu'aucune erreur n'apparaît dans la console du navigateur.

### Import JSON/CSV
1. Préparez un fichier `import_risks.json` contenant par exemple :
   ```json
   {
     "risks": [{
       "id": "demo-1",
       "description": "Test import",
       "processus": "Achats",
       "sousProcessus": "Appels d'offres",
       "typeCorruption": "favoritisme",
       "tiers": ["Acheteurs"],
       "probBrut": 2,
       "impactBrut": 3,
       "probNet": 2,
       "impactNet": 2,
       "probPost": 1,
       "impactPost": 1,
       "statut": "brouillon",
       "controls": [],
       "actionPlans": []
     }],
     "history": []
   }
   ```
2. Depuis l'onglet **📋 Liste des Risques**, cliquez sur "📥 Importer" et sélectionnez le fichier.
3. Contrôlez qu'un toast "Import réussi" apparaît, que le risque est ajouté au tableau, qu'une entrée "Import JSON" est visible dans l'onglet **📜 Historique** et qu'aucune erreur n'est levée dans la console.

## Ressources

- La matrice et les graphiques utilisent des bibliothèques embarquées pour rester fonctionnels hors connexion.
- Pour purger les données locales et revenir à l'état initial, videz le stockage local du navigateur pour le domaine courant (`localStorage.clear()` ou outils de développement).
