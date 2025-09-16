# cartographie

Application de cartographie des risques corruption.

## Fonctionnalités

- **Tableau de bord** : indicateurs clés, graphiques d'évolution et alertes récentes.
- **Matrice des risques** : visualisation interactive des niveaux brut, net et post-mitigations.
- **Liste des risques** : création, édition, suppression et filtrage des risques.
- **Contrôles et mesures** : gestion des contrôles, association aux risques et suivi de l'efficacité.
- **Rapports** : génération et export des données en PDF ou CSV.
- **Historique** : suivi chronologique des actions effectuées.
- **Configuration** : administration des options des listes déroulantes.

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
