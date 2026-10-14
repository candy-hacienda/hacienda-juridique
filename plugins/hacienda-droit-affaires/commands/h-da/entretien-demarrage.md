---
description: >
  À lancer en premier : configure le profil du cabinet (activité dominante,
  posture) et vérifie la connexion aux sources (Légifrance, BODACC, Judilibre,
  Pappers). Relançable pour un simple diagnostic des connexions.
argument-hint: "[--redo ou --check-integrations]"
---

Point d'entrée `/h-da:entretien-demarrage` du plugin Hacienda Droit des Affaires.

Le déroulé complet de cette commande (étapes, vérification des sources, format de sortie, garde-fous) est défini dans le skill `hacienda-droit-affaires:entretien-demarrage` du même plugin. Pour traiter la demande, charge ce skill avec l'outil Skill en lui transmettant les éléments ci-dessous, puis suis ses instructions.

Éléments transmis par l'utilisateur :

$ARGUMENTS
