Le but de ce projet est de créer une interface web sur laquelle l'utilisateur peut choisir chacun des éléments qui constituent un thème d'émulateur de terminal - L'utilisateur indique pour quel émulateur de terminal il constitue un thème. Une fois son choix arrêté, l'utilisateur reçoit un fichier ou les indications les plus exactes pour installer le thème qu'il vient de créer.


1. Couleurs de base — 16 couleurs ANSI (8 normales + 8 brillantes) + foreground + background = 18
2. Curseur — couleur curseur, couleur texte sous curseur, forme, clignotement, épaisseur = 5
3. Sélection — couleur fond, couleur texte = 2
4. Typographie — police normale, gras, italique, gras-italique, taille, letter-spacing, interligne, anti-aliasing/hinting, police de secours, ligatures = 10
5. Fenêtre et bordures — padding, épaisseur bordure, couleur bordure, opacité, flou, image/couleur de fond = 6
6. Barre de titre — style, icône = 2
7. Onglets — fond actif/inactif, texte actif/inactif, indicateur d'activité, bordure = 5
8. Splits — couleur séparation, mise en évidence panneau actif = 2
9. Barre de défilement — visibilité, couleur = 2
10. Indicateurs divers — couleur soulignement, style barré, texte atténué, cloche visuelle, surbrillance recherche = 5
11. Comportement de rendu — scrollback, bold-is-bright = 2

Total : 59 éléments.