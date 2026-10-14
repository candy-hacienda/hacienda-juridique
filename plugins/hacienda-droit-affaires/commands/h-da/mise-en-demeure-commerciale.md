---
description: >
  Rédige, relit ou gradue une mise en demeure commerciale B2B (payer ou exécuter)
  : sommes dues, délai, fermeté. Si le débiteur est en procédure collective,
  renvoie à la déclaration de créance. Brouillon soumis à validation de l'avocat.
argument-hint: "[--draft (défaut) | --relance | --sommation, --type=payer|executer, créance/obligation, contrat, side créancier]"
---

Point d'entrée `/h-da:mise-en-demeure-commerciale` du plugin Hacienda Droit des Affaires.

Le déroulé complet de cette commande (étapes, vérification des sources, format de sortie, garde-fous) est défini dans le skill `hacienda-droit-affaires:mise-en-demeure-commerciale` du même plugin. Pour traiter la demande, charge ce skill avec l'outil Skill en lui transmettant les éléments ci-dessous, puis suis ses instructions.

Éléments transmis par l'utilisateur :

$ARGUMENTS
