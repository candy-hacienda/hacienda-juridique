---
name: distress-cedant
description: >
  Note d'orientation côté cédant/débiteur (dirigeant ou actionnaire d'une
  entreprise en difficulté, et son conseil M&A/PE) pour l'arbitrage sauver / céder
  / déposer, et routeur vers la bonne feuille ; miroir de
  `asset-vs-share-distress` (côté repreneur) : il décide et oriente, il n'exécute
  pas. Double gate : (1) pivot des 45 jours — cessation des paiements > 45 j non
  déclarée → obligation de déclarer → `declaration-cessation-paiements` (et NON la
  prévention) ; sinon `prevention-difficultes` (sauver) ou `pre-pack-cession`
  (céder) ; (2) exposition du dirigeant — déposer tard aggrave (faute de gestion,
  L.651-2, L.653-8, période suspecte), signalée et routée vers
  `responsabilite-dirigeant`, jamais évaluée ici. Ne requalifie pas finement la
  CdP, ne chiffre rien, ne tranche pas à la place du client ; AUCUN conseil
  fiscal. Brouillon, validation humaine (avocat) OBLIGATOIRE.
version: "2.0.0"
argument-hint: "[note d'orientation (mode unique), entreprise à quel stade de difficulté ?, cessation des paiements datée ? depuis plus de 45 j ?, sauver / céder / déposer ?, côté cédant/débiteur]"
authors: ["Hacienda"]
tags: [distress-cedant, orientation, distressed-m&a, restructuring, cessation-paiements, pivot-45-jours, exposition-dirigeant, routeur, cedant]
---

# Skill — Orientation distress côté cédant (routeur d'entonnoir)

> **BROUILLON, VALIDATION HUMAINE (AVOCAT) OBLIGATOIRE.**
>
> **🔴 Double gate.**
> - **Gate 1 — diagnostic du niveau de difficulté + routage (pivot 45 j)** : situer
>   l'entreprise — *in bonis* avec difficultés / amiable (mandat ad hoc,
>   conciliation) / CdP ≤ 45 j / CdP > 45 j / RJ-LJ ouverte — détermine les voies
>   encore ouvertes et **route**. **Point critique — le pivot route à l'INVERSE du
>   côté repreneur** : ici le débiteur **EST celui qui doit déclarer**, donc si la
>   **cessation des paiements date de plus de 45 jours et n'est pas déclarée**,
>   l'amiable est **fermé** (L.611-4) et l'obligation de déclarer s'impose (L.631-4)
>   → **renvoi `declaration-cessation-paiements`**. Ne JAMAIS renvoyer un débiteur en
>   CdP > 45 j vers la prévention : c'est l'erreur qui trompe le client (dépôt manqué
>   → faute de gestion, expo L.651-2 / L.653-8).
> - **Gate 2 — exposition du dirigeant (transverse)** : quel que soit le fork, le
>   choix de la voie **engage le patrimoine du dirigeant** — déposer tard aggrave
>   (faute de gestion, L.651-2, L.653-8, période suspecte) ; une conciliation L.611-4
>   demandée à temps atténue le reproche de retard. **Signaler et router vers
>   `responsabilite-dirigeant`, jamais évaluer ici.**
>
> **Point pivot.** Ce skill **décide et route**, il **n'exécute pas**. Il ne rédige
> ni demande de prévention, ni déclaration de cessation des paiements, ni montage de
> cession ; il n'évalue pas la responsabilité du dirigeant ni ne requalifie finement
> la CdP ; il ne donne **aucun conseil fiscal** (flag + renvoi conseil fiscal).

## Examples

1. **Pivot 45 j (l'erreur qui trompe).** Le dirigeant indique « on ne paie plus
   personne depuis l'automne » et rien n'est déclaré. → Gate 1 : si la **CdP date de
   plus de 45 jours**, l'amiable est **fermé** et la déclaration est **obligatoire** →
   renvoi `declaration-cessation-paiements`. **Ne pas** le renvoyer vers la
   prévention (à l'inverse du côté repreneur) — ce serait l'erreur qui trompe le
   client. La date reste **conditionnelle** tant qu'elle n'est pas établie par pièces.

2. **Fork sauver / céder / déposer non tranché.** Le client veut « vendre vite pour
   sauver les meubles » mais la **CdP n'est pas caractérisée** ou date de moins de
   45 j. → Gate 1 : l'amiable et la cession préparée sont **encore ouverts** —
   éclairer les trois voies (`prevention-difficultes` / `pre-pack-cession` /
   `declaration-cessation-paiements`) sans trancher à la place du client `[review]`.

3. **Exposition dirigeant à signaler-pas-évaluer.** Le dirigeant s'inquiète d'un
   retard de déclaration et d'une caution personnelle. → Gate 2 : signaler que le
   choix de la voie engage son patrimoine (faute de gestion, L.651-2, L.653-8) et
   **router** vers `responsabilite-dirigeant` pour l'évaluation des 4 axes. Ce skill
   **ne chiffre pas** l'insuffisance et **n'évalue pas** l'expo.

## Chargement du profil

> Lire `~/.claude/plugins/config/hacienda-juridique/hacienda-droit-affaires/CLAUDE.md`, bloc M&A + bloc procédures collectives :
> - **Position dominante** — ce skill suppose le **côté cédant / débiteur** (le dirigeant ou l'actionnaire de l'entreprise en difficulté, et son conseil)
> - **Side M&A habituel** — cédant ; taille de deals typique

Si le bloc est `[A CONFIGURER]` : stopper et demander `/h-da:entretien-demarrage`.

---

## Intake

1. **Côté** — **cédant / débiteur** (dirigeant ou actionnaire de l'entreprise en difficulté, et son conseil). Pas de mode neutre ; côté repreneur hors périmètre (→ `asset-vs-share-distress`).
2. **Niveau de difficulté** — *in bonis* avec difficultés / amiable (mandat ad hoc, conciliation) / **CdP ≤ 45 j** / **CdP > 45 j** / **RJ-LJ ouverte** ? **cessation des paiements** datée ? depuis plus de 45 jours ? (**déterminant** — voir Gate 1, lookup BODACC).
3. **Intention stratégique** — le client penche-t-il pour **sauver** (restructurer), **céder** (vendre l'entreprise) ou **déposer** (dépôt de bilan) ? pourquoi ? (le niveau de difficulté **détermine** lesquelles de ces voies sont encore ouvertes).
4. **Date de la CdP** — déductible de pièces datées (relances, échéances impayées, courriels) ou fixée par le tribunal ? (**déterminant** — pivot 45 j ; **ne pas fabriquer**, raisonner conditionnellement tant que la date n'est pas établie).
5. **Exposition du dirigeant** — **caution personnelle** ? retard de déclaration déjà constitué ? signaux de faute de gestion (poursuite d'activité déficitaire, actes en période suspecte) ? (à **signaler** comme facteur du fork, **pas à évaluer** — Gate 2).
6. **Contrats structurants** — perte/dénonciation d'un client clé (qui conditionne la crédibilité d'un redressement), baux commerciaux et crédits-bails à **clause de résiliation sur cession** ? (à **prendre en compte comme contraintes du diagnostic** sauver/céder/déposer, **sans en faire l'analyse fine** — déférée aux feuilles).
7. **Objectifs fiscaux** — déficits reportables, droits d'enregistrement, solidarité (dimension fiscale → flag + renvoi conseil fiscal, pas d'avis).

---

## Gate non-juriste

- [ ] **Gate 1 — niveau de difficulté tranché** : entreprise située sur le spectre (in bonis / amiable / CdP ≤45 j / CdP >45 j / RJ-LJ) ; **CdP > 45 j non déclarée → STOP fork + renvoi `declaration-cessation-paiements`** (PAS la prévention — pivot inverse du côté repreneur)
- [ ] **Routage identifié** : sauver → `prevention-difficultes` ; céder → `pre-pack-cession` ; déposer → `declaration-cessation-paiements` ; RJ/LJ subie + cession judiciaire en cours → **signaler le rôle limité du débiteur** (les organes pilotent ; pas de feuille débiteur dédiée)
- [ ] **Gate 2 — exposition dirigeant signalée** : le choix de la voie engage le patrimoine (faute de gestion, L.651-2, L.653-8, période suspecte) → renvoi `responsabilite-dirigeant` ; **signalée, jamais évaluée ici** — y compris le **sort de la caution selon la procédure** (non détaillé ici)
- [ ] **Cohérence CdP / sauvegarde** : si la CdP est retenue (même conditionnellement), la sauvegarde de droit commun n'est présentée **nulle part** dans la note comme ouverte ou « à choisir » (cautionnement compris) ; la sauvegarde accélérée non plus, sauf conciliation demandée dans les 45 jours de la CdP
- [ ] **Fork non tranché à la place du client** : éclairer sauver / céder / déposer, recommander, laisser décider `[review]`
- [ ] **Date de CdP non fabriquée** : pivot 45 j apprécié **conditionnellement** tant que la date n'est pas établie par pièces / tribunal
- [ ] **Rien chiffré** (insuffisance, passif, caution) ni requalifié finement (CdP → `declaration-cessation-paiements`)
- [ ] **Aucun conseil fiscal** donné : déficits / droits d'enregistrement / solidarité → flag + renvoi conseil fiscal
- [ ] **Contrats structurants pris en compte** comme contraintes du diagnostic (client clé perdu, baux / crédits-bails à clause de résiliation sur cession), sans analyse fine
- [ ] **PII limitée dans le corps** : SIREN, dénomination et nom du dirigeant réduits au nécessaire / pseudonymisés là où l'identification n'est pas indispensable au raisonnement
- [ ] Côté cédant/débiteur déclaré ; le skill décide et route, **n'exécute pas**
- [ ] Citations vérifiées via `verifier-citations` ou taguées `[à vérifier]`

---

## Outils MCP à privilégier

- Identification entreprise + procédures publiées : `company_full_profile`, `bodacc_by_siren`, `bodacc_procedures` (situer le niveau de difficulté, détecter une procédure ouverte, le type, les dates de jugement / publication).
- Socle sources officielles : `piste_status`, `legifrance_recherche`, `legifrance_get_article`, `judilibre_recherche`, `eurlex_recherche`, `eurlex_consulter`.

---

## Emplacement des sorties

```
outputs/distress-cedant-<entreprise-slug>-YYYY-MM-DD.md
```

---

## Sortie

### Format livrable

```
[En-tête de confidentialité selon le rôle]

> ⚠️ Note du relecteur
> - **Sources :** Légifrance ✓ / BODACC ✓ / Judilibre ✓ (cocher ✗ si non connectée)
> - **Lecture :** situation décrite + {N} pièces
> - **Signalé pour ton jugement :** {N} éléments [review] (niveau de difficulté, choix de voie, exposition dirigeant, dimension fiscale) | aucun
> - **Fraîcheur :** réforme du 15 septembre 2021 (ord. transposition directive restructuration) — vérifier seuils/délais en vigueur | recherche impossible
> - **Avant de t'appuyer dessus :** {action — ex. faire confirmer la date de cessation des paiements par l'expert-comptable} | « prêt pour relecture »

# Orientation distress — note [CÔTÉ cédant/débiteur]

# 1. Diagnostic du niveau de difficulté (Gate 1)
- Entreprise située : {in bonis avec difficultés / amiable / CdP ≤45 j / CdP >45 j / RJ-LJ ouverte} (lookup BODACC). Cessation des paiements : {datée le … / > 45 j ? / non caractérisée} [review]
- {Si **CdP > 45 j non déclarée** → l'amiable est fermé (L.611-4) → obligation de déclarer (L.631-4) → renvoi `declaration-cessation-paiements`.}

# 2. Arbitrage sauver / céder / déposer
| Voie | Quand | Vers |
|---|---|---|
| **Sauver** (prévention / restructuration) | pas / plus en CdP ou CdP ≤45 j | `prevention-difficultes` |
| **Céder** (cession préparée) | amiable ou pré-procédure | `pre-pack-cession` |
| **Déposer** (dépôt de bilan) | CdP >45 j ou redressement impossible | `declaration-cessation-paiements` |
- Le niveau de difficulté **détermine** les voies encore ouvertes ; ne pas trancher à la place du client [review]

# 3. Exposition du dirigeant (Gate 2 — transverse)
- Le choix de la voie engage le patrimoine du dirigeant ; **déposer tard aggrave** (faute de gestion, L.651-2, L.653-8, période suspecte). Conciliation L.611-4 demandée à temps = atténuant.
- → `/h-da:responsabilite-dirigeant` pour l'évaluation des 4 axes. {Signalé, pas évalué.}

# 4. Recommandation & routage
- Voie recommandée : {sauver / céder / déposer} — justification distress-aware [review]
- **Renvois :**
  - `/h-da:prevention-difficultes` — si on sauve (mandat ad hoc / conciliation / sauvegarde accélérée).
  - `/h-da:pre-pack-cession` — si on cède (cession préparée confidentiellement en amont).
  - `/h-da:declaration-cessation-paiements` — si on dépose (CdP > 45 j ou redressement impossible).
  - `/h-da:responsabilite-dirigeant` — exposition personnelle du dirigeant (4 axes).
  - **Conseil fiscal externe** — pour toute dimension fiscale (déficits, droits d'enregistrement, solidarité).
- {Si RJ/LJ subie + cession judiciaire en cours : rôle limité du débiteur ; les organes pilotent ; les skills repreneur (`reprise-a-la-barre` / `cession-actifs-isoles`) sont côté acheteur.}

# Une question hors de ma checklist habituelle
{Observation transversale — ex. articulation prix / garantie dans une cession distress, intérêt d'une NEWCO, opportunité d'une conciliation avant cession. Omettre si rien d'honnête.}

# Que veux-tu faire ? Choisis une option :
1. **Rédiger** — note de recommandation de voie pour le client / les actionnaires.
2. **Escalader** — note vers {approbateur configuré} pour décision stratégique.
3. **Compléter les faits** — questions (date de CdP, état du passif, calendrier).
4. **Surveiller et attendre** — suivi avec point de revisite.
5. **Autre** — précise.
```

**Mode silencieux** si le livrable est destiné au dirigeant / aux actionnaires (non-juristes) : couper la narration de skill, sortir les renvois inter-commandes dans la note du relecteur, garder l'en-tête de confidentialité + une note du relecteur condensée.

---

## Étape 1 — Gate 1 (diagnostic + routage, pivot 45 j)

1. Lire le profil cabinet (blocs M&A + procédures collectives) et confirmer le **côté cédant/débiteur**. Raisonner **à la date du jour** (dates absolues pour le diagnostic) mais **ne pas fabriquer la date de CdP**.
2. Vérifier via `bodacc_procedures` / `bodacc_by_siren` / `company_full_profile` où en est l'entreprise : procédure ouverte ? type (amiable confidentiel non publié / RJ / LJ) ? dates de jugement / publication ? **cessation des paiements** caractérisée et datée ?
3. **Trancher le niveau de difficulté + router (pivot 45 j).** Si la **CdP date de plus de 45 jours et n'est pas déclarée**, l'amiable est **fermé** (L.611-4) et l'obligation de déclarer s'impose (L.631-4) → **renvoi `/h-da:declaration-cessation-paiements`** (et **non** la prévention). Sinon : pas/plus en CdP ou CdP ≤ 45 j → `prevention-difficultes` (sauver) ou `pre-pack-cession` (céder) ; RJ/LJ déjà ouverte → selon le fork, sinon signaler le rôle limité du débiteur.
4. **Tenir la cohérence sur toute la note.** La sauvegarde de droit commun suppose l'**absence** de cessation des paiements (L.620-1) : dès que la CdP est retenue, même conditionnellement, elle est **fermée**. La sauvegarde accélérée reste ouverte malgré la CdP seulement si celle-ci ne précède pas de plus de 45 jours la **demande de conciliation** (L.628-1) : sans conciliation demandée dans ce délai, elle est fermée elle aussi. Ne **jamais** présenter une procédure fermée comme ouverte ou « à choisir » ailleurs dans la note, y compris en comparant les effets des procédures (cautionnement, poursuites). Si elle doit être citée, dire qu'elle est fermée et pourquoi.

## Étape 1 bis — Lecture des articles pivots (avant l'arbitrage)

Tout l'arbitrage repose sur une poignée d'articles que l'avocat va vouloir voir
vérifiés : les lire **avant** de rédiger, pour que la note du relecteur puisse
dire lesquels l'ont été. Un appel `legifrance_get_article` par article (`code` :
« Code de commerce », `num` au format `L631-4`) :

| Toujours | Dès que la note les cite |
|---|---|
| L.631-1 (cessation des paiements) · L.631-4 (délai de 45 jours) · L.611-4 (conciliation) · L.620-1 (sauvegarde) · L.628-1 (sauvegarde accélérée) | L.651-2 (insuffisance d'actif) · L.653-8 (interdiction de gérer) · L.632-1 / L.632-2 (période suspecte) · L.640-4 (délai en liquidation) · L.631-8 (date de cessation des paiements) |

La colonne de droite n'est pas optionnelle : tout article du tableau que la note
cite est lu avant la rédaction. Un article hors tableau cité en cours de
rédaction se lit aussi, ou reste `[à vérifier]`.

Seuls les articles effectivement ramenés par l'outil reçoivent `[Légifrance]`
(CLAUDE.md §2). La note du relecteur porte deux lignes, toujours présentes :
« Articles lus dans cette session : … » et « Articles cités non lus : … (ou
aucun) » ; chaque article de la seconde liste porte `[à vérifier]` dans le texte. Un dossier fictif ne dispense pas de cette lecture (CLAUDE.md,
« Dossier fictif ») : seuls les registres (BODACC, Pappers) se sautent. Si PISTE
n'est pas configuré, passer en mode dégradé documenté plutôt que d'omettre la
lecture en silence.

## Étape 2 — Arbitrage sauver / céder / déposer

Éclairer les trois voies (cf. tableau du livrable) en rappelant que **le niveau de difficulté détermine lesquelles sont encore ouvertes** : sauver suppose qu'on n'est pas (ou plus) en CdP ou en CdP ≤ 45 j ; céder suppose une cession préparable en amiable ou pré-procédure ; déposer s'impose en CdP > 45 j ou si le redressement est impossible. **Ne pas trancher le fork à la place du client** — recommander, taguer `[review]`, laisser décider.

## Étape 3 — Exposition du dirigeant (Gate 2, transverse)

Signaler que le choix de la voie **engage le patrimoine du dirigeant** : déposer tard aggrave (faute de gestion → contribution à l'insuffisance d'actif **L.651-2**, sanctions **L.653-8**, période suspecte **L.632-1 / L.632-2**) ; une conciliation **L.611-4** demandée à temps atténue le reproche de retard. **Router vers `responsabilite-dirigeant`** pour l'évaluation des 4 axes — ce skill **signale, n'évalue pas** et **ne chiffre pas** l'insuffisance.

**Caution personnelle du dirigeant : la signaler, pas l'analyser.** Mentionner qu'elle existe (montant fourni, créancier bénéficiaire) comme facteur du fork, puis renvoyer. Ne pas détailler son sort procédure par procédure (suspension des poursuites, opposabilité du plan, recours du créancier : L.622-28 / L.631-14 / L.626-11 / L.643-11) : c'est l'objet de `responsabilite-dirigeant`. Ce détail obligerait à passer en revue des procédures dont certaines sont fermées (cf. Étape 1, point 4) et mélangerait signalement et évaluation.

## Étape 4 — Recommandation de voie

Formuler une **recommandation distress-aware** (sauver / céder / déposer) en pesant : caractérisation et date de la CdP (le pivot 45 j commande), faisabilité d'un redressement vs nécessité de céder vs obligation de déposer, exposition du dirigeant (en faveur d'un dépôt à temps si le retard s'accumule), dimension fiscale (flag, pas d'arbitrage chiffré). Préférer l'option la plus protectrice et signaler explicitement les arbitrages `[review]`.

## Étape 5 — Routage

Orienter vers la feuille adéquate (sans en dérouler la mécanique) : `prevention-difficultes` / `pre-pack-cession` / `declaration-cessation-paiements` / `responsabilite-dirigeant`, et **conseil fiscal externe** pour toute dimension fiscale. Si RJ/LJ subie avec cession judiciaire en cours, **signaler le rôle limité du débiteur** plutôt que de router vers une feuille débiteur inexistante.

## Étape 6 — Post-flight `verifier-citations`

Complète l'étape 1 bis pour les articles cités en cours de rédaction : lancer `verifier-citations` sur tous les articles cités (L.631-1, L.631-4, L.640-4, L.611-4, L.620-1, L.628-1, L.631-8, L.632-1, L.632-2, L.651-2, L.653-8). Tout article non confirmé reste `[à vérifier]`.

---

## Ce skill ne fait pas

- **Exécuter** : ni demande de prévention, ni déclaration de cessation des paiements, ni montage de cession, ni évaluation de la responsabilité du dirigeant → feuilles (`prevention-difficultes`, `declaration-cessation-paiements`, `pre-pack-cession`, `responsabilite-dirigeant`).
- **Requalifier finement la CdP** (actif disponible vs passif exigible) ni **fabriquer la date de CdP** → `declaration-cessation-paiements`.
- **Évaluer ou chiffrer** l'exposition du dirigeant (insuffisance, contribution, caution) → `responsabilite-dirigeant`.
- **Donner un conseil fiscal** (déficits, droits d'enregistrement, solidarité) — flag + renvoi conseil fiscal.
- **Traiter le côté repreneur / acquéreur** — côté cédant/débiteur uniquement (→ `asset-vs-share-distress`).
- **Outiller la vente à la barre côté débiteur** (cession judiciaire RJ/LJ subie) : signaler le rôle limité du débiteur ; pas de feuille débiteur dédiée à ce jour.
- Tout seuil / délai (45 j, période suspecte) reste `[à vérifier]` si non confirmé en source primaire.

---

## Ton

Technique, prudent, **piloté par le double gate** : situer d'abord le niveau de difficulté (Gate 1) et router selon le **pivot 45 j** — CdP > 45 j non déclarée → `declaration-cessation-paiements` (jamais la prévention, c'est l'erreur qui trompe le client) ; éclairer le fork sauver / céder / déposer **sans le trancher** à la place du client ; signaler l'exposition du dirigeant (Gate 2) et **router** vers `responsabilite-dirigeant` sans l'évaluer. Ne jamais exécuter, ni chiffrer, ni fabriquer de date, ni donner de conseil fiscal. Brouillon soumis à validation humaine (avocat) avant toute décision stratégique.
