# cartographie

Application de cartographie des risques corruption.

## Fonctionnalités

- **Tableau de bord** : indicateurs clés, graphiques d'évolution et alertes récentes.
- **Matrice des risques** : visualisation interactive des niveaux brut, net et post-mitigations.
- **Liste des risques** : création, édition, suppression et filtrage des risques.
- **Contrôles et mesures** : gestion des contrôles, association aux risques et suivi de l'efficacité.
- **Plans d'actions** : suivi des plans associés aux risques et rappels sur les échéances.
- **Import/Export** : export JSON/CSV, capture de la matrice, export PDF du tableau de bord et import depuis des fichiers externes.
- **Historique** : suivi chronologique des actions effectuées.
- **Configuration** : administration des options des listes déroulantes.

### Répartition des modules JavaScript

Le précédent fichier monolithique `assets/js/rms.js` a été découpé en modules plus ciblés :

- `assets/js/rms.utils.js` : fonctions d'aide génériques (sanitisation d'identifiants, comparaison normalisée, incréments séquentiels).
- `assets/js/rms.constants.js` : définitions partagées des libellés de probabilité/impact et de la configuration des états de risque.
- `assets/js/rms.core.js` : classe `RiskManagementSystem`, jeux de données par défaut, persistance locale, rendu des écrans et logique métier centrale.
- `assets/js/rms.ui.js` : interactions DOM, gestion des formulaires risques/contrôles/plans d'action, filtres et notifications utilisateur.
- `assets/js/rms.matrix.js` : comportement de la matrice d'édition (drag & drop, calculs de score, mise en forme contextuelle).
- `assets/js/rms.integrations.js` : fonctionnalités avancées (import/export JSON/CSV/PNG/PDF, correctifs hérités et gestion enrichie des contrôles).

`assets/js/main.js` reste le point d'entrée : il instancie `RiskManagementSystem`, expose l'instance via `setRms`, lie les événements globaux et déclenche le rendu initial.

## Utilisation hors-ligne

Pour ouvrir l'application sans serveur local ni connexion Internet :

1. Téléchargez les bibliothèques suivantes et placez-les dans `assets/libs/` :
   - `chart.umd.min.js` (Chart.js)
   - `html2canvas.min.js`
   - `jspdf.umd.min.js`
2. Ouvrez directement le fichier `CartoModel.html` dans votre navigateur.

Toutes les dépendances sont chargées localement, l'application peut donc fonctionner via `file://`.

## Configuration

L'onglet **Configuration** permet d'ajouter ou de supprimer les valeurs utilisées dans les listes déroulantes des formulaires (processus, types de risque, statuts, etc.). Les modifications sont conservées dans le navigateur grâce au stockage local.

## Tests manuels

### Export CSV avec un registre vide

1. Ouvrez `CartoModel.html` dans votre navigateur.
2. Accédez à l'onglet **Registre des Risques** et supprimez tous les risques afin que la table soit vide.
3. Cliquez sur le bouton "📤 Exporter" du registre.
4. Vérifiez qu'une notification "Aucune donnée disponible pour l'export CSV." s'affiche, qu'aucun fichier n'est téléchargé et qu'aucune erreur n'apparaît dans la console du navigateur.
