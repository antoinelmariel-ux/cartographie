# Module de mindmapping — UX/UI et fonctionnalités

## Vue d'ensemble de l'expérience
- **Modal plein écran** : ouverture via `openMindMapModal` qui réinitialise l’état local (zoom, mini-carte, barre d’actions) puis affiche la carte dans `#mindmapModal`. La fermeture retire simplement la classe `show` pour revenir au contexte principal.
- **Zone de travail** : chaque colonne provient du thème actif et affiche un en-tête (titre, sous-titre, compteur), un corps pour les idées et un bouton “+ Ajouter une idée”. Les contrôles d’accessibilité incluent le glisser-déposer sur les colonnes pour déplacer des nœuds.
- **Réglages persistants** : le zoom est borné entre 70 % et 150 %, le style de lien et le mode de disposition sont synchronisés avec les sélecteurs, et les préférences d’affichage (mini-carte, barre d’actions) sont reflétées dans la classe du conteneur et les libellés des toggles.

## Colonnes par défaut du thème « Impact mapping »
Le thème par défaut expose sept colonnes, chacune avec un code clé, un titre, un sous-titre et une couleur d’accent :
1. **Tiers** — « Quels tiers impactent vos activités ? » (`#34d399`)
2. **Objectifs** — « Quels sont vos objectifs ? Qui les portent ? » (`#22c55e`)
3. **Comportements attendus** — « Quels sont les comportements des tiers que l'on espère ? » (`#0ea5e9`)
4. **Moyens de corruption** — « Quels moyens frauduleux pourraient faciliter ces comportements ? » (`#1d4ed8`)
5. **Contrôle** — « Qu'est-ce qui permet prévenir ce comportement ? » (`#eab308`)
6. **Contournement** — « Existe-t-il des moyens de contournement ? » (`#f97316`)
7. **Probabilité** — « Ce scénario est-il probable ? » (`#ef4444`)

Les thèmes personnalisés peuvent réordonner, renommer ou recolorer ces colonnes, avec une normalisation automatique des clés et des couleurs par défaut si elles manquent.

## Interactions clés
- **Création et normalisation des idées** : chaque idée a un identifiant unique, un texte, des enfants, un état replié, un tag et un lien optionnel vers un autre nœud. Les valeurs manquantes sont comblées lors de la normalisation.
- **Ajout/déplacement** : le bouton d’ajout crée une idée dans la colonne courante puis recentre la carte sur le nouveau nœud ; le glisser-déposer permet de repositionner les nœuds entre colonnes.
- **Zoom et style** : le curseur de zoom met à l’échelle la grille et la couche SVG ; le style de lien s’appuie sur les presets natifs (courbes lissées, orthogonaux, fluides), avec synchronisation des sélecteurs et recalcul immédiat des liens.
- **Disposition** : trois modes (compact, équilibré, radial) pilotent l’espacement des colonnes, la largeur des cartes et l’algorithme de placement automatique. Le recalcul intervient dès que le mode change ou qu’un nœud est modifié.
- **Mini-carte** : l’affichage est optionnel et se rafraîchit uniquement lorsqu’il est visible, réduisant le coût de rendu inutile.

## User stories
1. **En tant qu’analyste, je veux démarrer une session de mindmapping dans une modale plein écran**, pour travailler sur la carte sans quitter le compte-rendu principal et retrouver mes réglages de zoom/affichage à chaque ouverture.
2. **En tant qu’analyste, je veux disposer d’une grille de colonnes thématiques avec compteur et bouton d’ajout**, afin d’organiser mes idées par étape (tiers → objectifs → comportements → moyens → contrôle → contournement → probabilité) et d’ajouter rapidement de nouveaux points.
3. **En tant qu’analyste, je veux pouvoir réordonner/adapter les colonnes via les thèmes de mindmap**, afin d’aligner la carte sur les méthodologies spécifiques de mon organisation tout en conservant des clés uniques et des couleurs harmonisées.
4. **En tant qu’analyste, je veux contrôler le zoom, le style de liens et le mode de disposition**, pour ajuster la lisibilité selon la densité de nœuds et choisir des tracés adaptés (courbes lissées, orthogonaux, fluides) et une mise en page compacte, équilibrée ou radiale.
5. **En tant qu’analyste, je veux utiliser le glisser-déposer et la mini-carte** pour déplacer des idées entre colonnes, visualiser les liens hiérarchiques ou transverses, et naviguer efficacement dans des cartes volumineuses.
6. **En tant que responsable, je veux voir les préférences appliquées (barre d’actions, mini-carte) et les modifications marquées comme non enregistrées**, pour garantir que les ajustements d’interface ou de contenu ne soient pas perdus avant la sauvegarde.
