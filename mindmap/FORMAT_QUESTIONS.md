# Format des questions par badge

Vous pouvez saisir les questions en texte simple ou en Markdown léger.

## Règles

- Chaque **ligne** est interprétée comme un item de liste.
- Les listes Markdown sont reconnues avec `-`, `*` ou `+`.
- Les **sous-listes** sont créées avec une indentation de **2 espaces** (ou plus).
- Le **gras** (`**texte**`) et l’*italique* (`*texte*`) sont pris en charge.

## Exemple recommandé

```
Question principale
- Sous-question A
  - Détail A1
  - Détail A2
- Sous-question B
```

## Exemple alternatif (texte simple)

```
Question 1
Question 2
Question 3
```

## Notes

- Les lignes vides sont ignorées.
- Si une sous-liste est détectée sans parent, elle est ramenée au niveau principal.
