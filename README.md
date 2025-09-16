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

### Domaines fonctionnels du script `assets/js/rms.js`

Le fichier `assets/js/rms.js` concentre l'ensemble de la logique applicative. En vue d'un futur découpage, voici les blocs principaux à isoler :

1. **Utilitaires et constantes** : fonctions d'aide (`sanitizeId`, égalité d'identifiants, incréments séquentiels) et définitions des libellés probabilité/impact ou des états de risque.
2. **Données de référence** : jeux de données par défaut pour les risques et les contrôles ainsi que la configuration initiale (processus, sous-processus, listes de sélection).
3. **Persistance locale** : chargement/sauvegarde via `localStorage`, sauvegarde automatique et horodatage de la dernière sauvegarde.
4. **Configuration dynamique** : rendu des écrans d'administration des listes, gestion des sous-processus et synchronisation avec les formulaires.
5. **Rendu de l'interface** : orchestration globale via `renderAll`, génération de la matrice, des détails risques, des listes (risques, contrôles, plans d'action) et de la frise historique.
6. **Tableau de bord et analytics** : calcul des statistiques, alimentation des cartes KPI, mise à jour des graphiques et des alertes récentes.
7. **Gestion du registre des risques** : formulaires de création/édition, calcul des scores, interaction avec la matrice d'édition, filtres et sélection d'éléments liés.
8. **Contrôles et plans d'action** : rendu des cartes, modales d'édition, sélecteurs de risques/contrôles et synchronisation bidirectionnelle avec les risques.
9. **Historisation et notifications** : timeline des événements, enregistrement des actions significatives et système d'alertes utilisateur.
10. **Import/Export avancés** : conversion CSV, génération de blobs, exports (JSON, CSV, PNG, PDF) et import des risques depuis CSV/JSON.
11. **Événements globaux** : gestion des onglets, du changement de vue de la matrice, du binding d'événements clavier/souris et correctifs appliqués au chargement (`bindEvents`, `applyPatch`).
12. **Point d'entrée** : initialisation depuis `assets/js/main.js` avec instanciation de `RiskManagementSystem`, attachement global (`setRms`) et lancement des rendus.

Ces regroupements peuvent servir de base à un découpage en modules (`utils.js`, `data.js`, `storage.js`, `matrix.js`, `risks.js`, `controls.js`, etc.) pour alléger le fichier principal sans perdre la vue d'ensemble.

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
