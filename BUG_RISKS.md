# Risques de bug identifiés

## 1. Référence globale manquante dans `applyPatch`
La fonction `applyPatch` tente d'appeler `updateLastSaveTime` comme s'il s'agissait d'une fonction globale (`updateLastSaveTime && updateLastSaveTime();`). Or cette méthode n'est définie que sur l'instance `RiskManagementSystem` et n'est jamais exposée dans l'espace global. Cette ligne (voir `assets/js/rms.integrations.js`) va donc lever une `ReferenceError` dès que le bloc est exécuté, interrompant la sauvegarde via ce patch.

## 2. Absence de gestion d'erreur lors du chargement des données locales
Les méthodes `loadData` et `loadConfig` lisent le contenu de `localStorage` et l'analysent immédiatement via `JSON.parse`. Si les données sont corrompues (ou écrites par une version différente de l'application), `JSON.parse` lèvera une exception qui empêchera l'initialisation complète de l'application (`assets/js/rms.core.js`).

## 3. Insertion non échappée du contenu des notes d'interview
Lors du rendu des cartes d'interview, la variable `notesContent` est injectée directement dans le DOM sans échappement. Des notes contenant du HTML arbitraire peuvent ainsi introduire du code inattendu (ex. scripts, balises cassant la mise en page), ce qui représente un risque d'injection ou de plantage de rendu (`assets/js/rms.core.js`).
