---
description: >
  Affiche le digest de veille juridique (nouveaux textes, arrêts de la chambre
  commerciale), filtrable par domaine, par date ou par impact. Lecture seule, sans
  nouvelle analyse.
argument-hint: "[domaine, période, criticité]"
---

Point d'entrée `/h-da:consulter-digest` du plugin Hacienda Droit des Affaires.

Le déroulé complet de cette commande (étapes, vérification des sources, format de sortie, garde-fous) est défini dans le skill `hacienda-droit-affaires:consulter-digest` du même plugin. Pour traiter la demande, charge ce skill avec l'outil Skill en lui transmettant les éléments ci-dessous, puis suis ses instructions.

Éléments transmis par l'utilisateur :

$ARGUMENTS
