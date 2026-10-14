---
name: cession-actifs-isoles
description: >
  Playbook côté candidat-repreneur pour construire et défendre une offre
  d'acquisition d'actifs isolés (mobiliers, incorporels, fonds de commerce, IP,
  stocks, créances) d'un débiteur en liquidation judiciaire, hors plan de cession
  (gré à gré ou enchères, L.642-19). Double gate : (1) qualification — actif isolé
  et non entreprise en going concern (sinon `reprise-a-la-barre`, ou
  `pre-pack-cession` si la cession peut se préparer en amont) ; (2) recevabilité —
  éligibilité de l'acquéreur (L.642-20 renvoyant à L.642-3) et ordonnance du
  juge-commissaire, sans laquelle l'offre ne vaut pas vente. Traite le sort des
  sûretés, les contrats non transférés, le transfert des salariés (L.1224-1) et
  les recours contre l'ordonnance. Côté repreneur uniquement ; immeubles
  (L.642-18) hors périmètre. Ne rédige pas l'acte de cession → `spa-review` /
  `gap-review` / `closing-checklist-fr`. Brouillon, validation humaine (avocat)
  OBLIGATOIRE.
version: "2.0.0"
argument-hint: "[note tactique (mode unique), actif isolé ou entreprise en going concern ?, débiteur en LJ ?, ordonnance du juge-commissaire ?, côté repreneur]"
authors: ["Hacienda"]
tags: [cession-actifs-isoles, actifs-isoles, l642-19, distressed-m&a, restructuring, liquidation-judiciaire, gre-a-gre, suretes, juge-commissaire]
---

# Skill — Cession d'actifs isolés en LJ (acquisition hors plan de cession)

> **BROUILLON, VALIDATION HUMAINE (AVOCAT) OBLIGATOIRE.**
>
> **🔴 Double gate.**
> - **Gate 1 — qualification** : ce skill ne joue que pour l'acquisition d'un
>   **actif isolé** (bien mobilier, incorporel, fonds de commerce, marque,
>   stock, créance) cédé par le liquidateur **hors plan de cession**. Si ce qui
>   est repris est en réalité une **entreprise / unité de production en going
>   concern** → ce n'est pas une cession d'actif isolé → **renvoi
>   `reprise-a-la-barre`** (plan de cession, L.642-1 s.). Si aucune procédure
>   n'est ouverte et que la cession peut être **préparée confidentiellement**
>   en amont (mandat ad hoc / conciliation) → **renvoi `pre-pack-cession`**.
>
> **Périmètre — biens mobiliers et incorporels (L.642-19).** Ce skill couvre la
> **cession de gré à gré ou aux enchères des biens autres que les immeubles**.
> La cession des **immeubles relève de L.642-18** (adjudication, surenchère,
> règles voisines de la saisie immobilière) → **hors périmètre v1**, signaler
> et renvoyer.
> - **Gate 2 — recevabilité** : (a) **éligibilité de l'acquéreur (L.642-20
>   renvoyant à L.642-3)** — dirigeants de droit ou de fait, parents et alliés
>   jusqu'au 2nd degré inclus, **contrôleurs**, et toute **interposition de
>   personne** sont **interdits d'acquérir** → acquisition **nulle** ; (b)
>   **autorisation du juge-commissaire (L.642-19)** — la cession de gré à gré
>   n'existe que par **ordonnance du juge-commissaire** ; une offre adressée au
>   liquidateur **ne vaut pas vente** tant que le JC n'a pas ordonné ou
>   autorisé la cession.
>
> **Point pivot.** Ici **ce n'est pas le tribunal qui arrête un plan** : c'est
> le **juge-commissaire** qui, au vu du **rapport du liquidateur**, **ordonne**
> la vente aux enchères ou **autorise** la vente de gré à gré au prix et aux
> conditions qu'il fixe. Tant que l'ordonnance n'est pas rendue (et le délai de
> recours purgé), rien n'est acquis.

## Examples

1. **Offre au liquidateur ≠ vente.** Le candidat a adressé une offre écrite au
   liquidateur et croit l'actif acquis. → Gate 2 (b) : **aucune ordonnance du
   juge-commissaire (L.642-19)** → rien n'est vendu. L'offre doit être reprise
   par le liquidateur dans son rapport et **autorisée par le JC** ; calibrer
   prix/conditions pour cette ordonnance.

2. **Acquéreur possiblement inéligible.** Le candidat est contrôlé par le
   beau-frère de l'ancien gérant via une holding. → Gate 2 (a) : risque
   d'**interdiction d'acquérir (L.642-20 renvoyant à L.642-3)** → acquisition
   **nulle** *si* l'interdiction est établie. Avant de conclure, établir les
   faits (qualité exacte de l'ancien gérant à l'ouverture, dirigeance de fait,
   bénéficiaire effectif de la holding) ; signaler le **risque** `[review]`
   avant tout travail sur l'offre.

3. **Going concern déguisé.** Le candidat veut « racheter les actifs » mais le
   périmètre couvre en réalité toute l'activité avec ses salariés et ses
   contrats. → Gate 1 : ce n'est pas un actif isolé mais une **reprise
   d'entreprise** → **renvoi `reprise-a-la-barre`** (plan de cession). Acheter
   en gré à gré ce qui est une activité autonome expose à la requalification.

## Chargement du profil

> Lire `~/.claude/plugins/config/hacienda-juridique/hacienda-droit-affaires/CLAUDE.md`, bloc procédures collectives + bloc M&A :
> - **Position dominante** — ce skill suppose le **côté repreneur** (le candidat acquéreur)
> - **Tribunaux habituels** — tribunal compétent (commerce / judiciaire selon l'activité) et juge-commissaire de la procédure
> - **Politique PII** — `passive` / `active` (défaut) / `strict` + seuil B

Si le bloc est `[A CONFIGURER]` : stopper et demander `/h-da:entretien-demarrage`.

---

## Intake

1. **Côté** — **repreneur** (le candidat acquéreur). Pas de mode neutre ; si l'utilisateur est côté débiteur/liquidateur, ce skill ne s'applique pas.
2. **Nature de l'objet** — **actif isolé** (fonds, marque, stock, matériel, créance) ou **entreprise / unité de production en going concern** ? (**déterminant** — voir Gate 1). Si going concern → renvoi `reprise-a-la-barre`.
3. **État de la procédure** — le débiteur est-il **en LJ** ? liquidateur désigné ? juge-commissaire saisi ? (lookup BODACC). Si aucune procédure ouverte et cession préparable en amont → renvoi `pre-pack-cession`.
4. **Voie & autorisation** — la cession est-elle envisagée **de gré à gré** ou **aux enchères** ? une **ordonnance du juge-commissaire** est-elle intervenue, ou seulement une offre au liquidateur ? (**déterminant** — voir Gate 2 (b)).
5. **Éligibilité** — le candidat a-t-il un lien avec le dirigeant / un parent ou allié jusqu'au 2nd degré / un contrôleur / une société interposée ? (**déterminant** — voir Gate 2 (a), L.642-20→L.642-3).
6. **Sûretés & rétention** — les actifs visés sont-ils **nantis / gagés** ? un tiers invoque-t-il un **droit de rétention** (dépositaire, gagiste avec dépossession) ?
7. **Contrats & salariés** — des **contrats clés** sont-ils rattachés à l'actif (bail, licence, fournisseur) ? des **salariés** sont-ils affectés à l'actif (risque L.1224-1) ?
8. **Antériorité** — le candidat a-t-il acquis des biens du débiteur **avant le jugement d'ouverture** (risque période suspecte L.632-1) ?

---

## Gate non-juriste

- [ ] **Gate 1 — qualification tranchée** : actif **isolé** (mobilier/incorporel) → ce skill ; entreprise / unité de production en **going concern** → STOP + renvoi `reprise-a-la-barre` ; cession préparable confidentiellement en amont → STOP + renvoi `pre-pack-cession`
- [ ] **Périmètre confirmé** : biens mobiliers / incorporels (L.642-19) ; un **immeuble** relève de **L.642-18** → hors périmètre v1, signaler
- [ ] **Gate 2 (a) — éligibilité (L.642-20 → L.642-3)** : pas de dirigeant / parent ou allié jusqu'au 2nd degré / contrôleur / interposition ; si lien suspect → **établir les faits** (qualité exacte à l'ouverture, dirigeance de fait, interposition, bénéficiaire effectif) **avant de conclure** ; qualifier le **risque** (pas une nullité acquise), `[review]`
- [ ] **Gate 2 (b) — autorisation du juge-commissaire (L.642-19)** : existe-t-il une **ordonnance** du JC (vente aux enchères ou autorisation de gré à gré) ? une simple offre au liquidateur ne vaut pas vente
- [ ] **Point pivot rappelé** : c'est le **juge-commissaire** qui ordonne/autorise (pas le tribunal arrêtant un plan)
- [ ] **Sort des sûretés** vérifié : report du droit de préférence sur le prix, **droit de rétention non purgé**, purge des inscriptions au paiement du prix
- [ ] **Pièges actif isolé** signalés : **pas de transfert automatique des contrats** (L.642-7 ne joue pas) ; **transfert automatique des salariés** possible (L.1224-1) si entité économique autonome
- [ ] **Consistance & valeur des actifs** vérifiées (inventaire, conservation/péremption, propriété réelle, assurance, valeur réelle vs déclarée) — valeurs déclarées **non reprises comme certaines**
- [ ] Côté repreneur déclaré ; focale = recevabilité + exposition de l'acquisition
- [ ] Durées / délais procéduraux (recours contre l'ordonnance) tagués `[à vérifier]`
- [ ] Citations vérifiées via `verifier-citations` ou taguées `[à vérifier]`

---

## Outils MCP à privilégier

- Identification entreprise + procédures publiées : `company_full_profile`, `bodacc_by_siren`, `bodacc_procedures` (confirmer la LJ ouverte sur le débiteur, le liquidateur, les dates).
- Socle sources officielles : `piste_status`, `legifrance_recherche`, `legifrance_get_article`, `judilibre_recherche`, `eurlex_recherche`, `eurlex_consulter`.

---

## Emplacement des sorties

```
outputs/cession-actifs-isoles-<entreprise-slug>-YYYY-MM-DD.md
```

---

## Sortie

### Format livrable

```
[En-tête de confidentialité selon le rôle]

> ⚠️ Note du relecteur
> - **Sources :** Légifrance ✓ / BODACC ✓ / Judilibre ✓ (cocher ✗ si non connectée) ; articles lus dans cette session : {liste} ; autres citations `[à vérifier]`
> - **Lecture :** situation décrite + {N} pièces
> - **Signalé pour ton jugement :** {N} éléments [review] (éligibilité de l'acquéreur, qualification actif isolé, sort des sûretés, contrats, salariés) | aucun
> - **Fraîcheur :** réforme du 15 septembre 2021 (ord. transposition directive restructuration) — vérifier délais de recours en vigueur | recherche impossible
> - **Avant de t'appuyer dessus :** {action — ex. confirmer l'absence de lien d'interposition / l'existence d'une ordonnance du JC} | « prêt pour relecture »

# Cession d'actifs isolés — note tactique [CÔTÉ repreneur]

# 1. Diagnostic & recevabilité
- **Gate 1 — qualification** : objet visé = {actif isolé : fonds / marque / stock / créance} ✅, débiteur en **LJ** {date jugement}, liquidateur {nom}. {Si going concern → renvoi reprise-a-la-barre ; si amont confidentiel → renvoi pre-pack-cession.}
- **Périmètre** : biens mobiliers / incorporels (**L.642-19**). {Si un immeuble est visé → relève de **L.642-18**, hors périmètre, signaler.}
- **Gate 2 (a) — éligibilité (L.642-20 → L.642-3)** : {OK / 🔴 lien dirigeant-parent-contrôleur-interposition → acquisition nulle}.
- **Gate 2 (b) — ordonnance du juge-commissaire (L.642-19)** : {ordonnance rendue ✅ / 🔴 simple offre au liquidateur, pas d'ordonnance → rien n'est vendu}.

# 2. Construction & dépôt de l'offre
- **Voie de cession** : gré à gré (autorisation du JC) vs enchères publiques (ordonnance du JC) — **L.642-19**. L'offre est portée par le **liquidateur** dans son **rapport au juge-commissaire** ; calibrer **prix, périmètre précis des actifs, conditions, financement, délai de réalisation** pour cette ordonnance.
- **Contrats — pas de transfert automatique (L.642-7 a contrario)** : hors plan de cession, **aucune cession forcée des contrats**. Identifier les contrats clés rattachés à l'actif (**bail, licence, fournisseurs**) et prévoir leur **renégociation / accord du cocontractant** (clause d'agrément, intuitu personae, changement de contrôle). Ne pas présumer la reprise du contrat.
- **Salariés — L.1224-1** : si l'actif cédé constitue une **entité économique autonome conservant son identité**, les **contrats de travail attachés sont transférés de plein droit** au repreneur (ordre public social), **même en liquidation et même pour une cession d'actif isolé**. Chiffrer ce passif social potentiel ; ne pas le découvrir après coup. `[review]`
- **Consistance & valeur des actifs** : conditionner l'offre à la vérification (inventaire, conservation/péremption du stock, propriété réelle — biens loués / en dépôt / sous réserve de propriété / crédit-bail exclus —, assurance, valeur réelle vs déclarée) ; ne pas reprendre les valeurs annoncées comme certaines. `[review]`

# 3. Sort des sûretés & purge (point tranchant)
- **Report du droit de préférence sur le prix** : les créanciers titulaires de sûretés sur l'actif (nantissement de marque, gage) **ne perdent pas leur droit** ; il se **reporte sur le prix de cession**, sur lequel ils sont payés **selon leur rang**.
- **Purge des inscriptions au paiement du prix** : le **paiement complet du prix** emporte **purge des inscriptions** grevant les biens cédés `[connaissance modèle — à vérifier]` — l'acquéreur prend **quitte et libre** une fois le prix payé/consigné et distribué.
- **Droit de rétention NON purgé** : le créancier qui détient l'actif (dépositaire, gagiste avec dépossession sur le stock) **conserve son droit de rétention** : il peut **refuser de remettre l'actif** tant qu'il n'est pas payé. → il faut le **désintéresser pour récupérer le bien**. `[review]`
- → **Ventiler le prix par actif grevé** et **chiffrer la charge** (rétention) dès l'offre.

# 4. Risques & suites
- **Période suspecte (L.632-1)** : un bien acquis du débiteur **avant le jugement d'ouverture** (et non du liquidateur) peut tomber sous les **nullités de la période suspecte** → risque de restitution. Acheter **du liquidateur, après jugement** est la voie sûre. `[review]`
- **Recours contre l'ordonnance (L.642-19 / L.661-x)** : l'ordonnance du juge-commissaire est **susceptible de recours** (devant le tribunal, puis appel) dans des **délais courts** `[à vérifier]` — purger ce délai avant de se croire propriétaire ; un tiers/créancier peut contester.
- **Renvois** : `reprise-a-la-barre` (si going concern) ; `pre-pack-cession` (si amont) ; `spa-review` / `gap-review` / `closing-checklist-fr` (acte de cession).

# Renvois & prochaines étapes
- **Latéral** : `/h-da:reprise-a-la-barre` si l'objet est une entreprise / unité de production en going concern.
- **Amont** : `/h-da:pre-pack-cession` si la cession peut être préparée confidentiellement en amont.
- **Aval** : `/h-da:spa-review` / `/h-da:gap-review` / `/h-da:closing-checklist-fr` (l'acte de cession et son closing).
- **Latéral** : `/h-pi:contrats-pi` si actifs PI substantiels (marques, brevets) dans le périmètre.

# Une question hors de ma checklist habituelle
{Observation transversale — ex. articulation cession d'actif isolé / plan de cession concurrent sur le même périmètre, sort d'un contrat de location-gérance, clean team si repreneur concurrent. Omettre si rien d'honnête.}

# Que veux-tu faire ? Choisis une option :
1. **Rédiger** — je prépare la trame de l'offre d'acquisition (périmètre, prix, conditions) à porter par le liquidateur, ou la note d'analyse des sûretés/contrats.
2. **Escalader** — note vers {approbateur configuré} pour décision d'engager / d'enchérir.
3. **Compléter les faits** — questions (lien éventuel avec le dirigeant, existence d'une ordonnance du JC, état des sûretés et du droit de rétention, salariés rattachés).
4. **Surveiller et attendre** — suivi avec point de revisite (avant l'ordonnance du JC / la fin du délai de recours).
5. **Autre** — précise.
```

---

## Étape 1 — Gate 1 (qualification)

1. Lire le profil cabinet (blocs procédures collectives + M&A) et confirmer le **côté repreneur**. Raisonner **à la date du jour** (dates absolues).
2. Vérifier via `bodacc_procedures` / `bodacc_by_siren` que le débiteur est **bien en LJ** : date du jugement, liquidateur désigné.
3. **Trancher la qualification** : l'objet est-il un **actif isolé** (bien mobilier / incorporel / fonds / marque / stock / créance) ou une **entreprise / unité de production en going concern** ? Si going concern → ce n'est pas une cession d'actif isolé → **renvoi `/h-da:reprise-a-la-barre`** (plan de cession). Si aucune procédure ouverte et cession préparable confidentiellement → **renvoi `/h-da:pre-pack-cession`**. Ne pas avancer sans avoir tranché.
4. **Vérifier le périmètre (L.642-19 vs L.642-18)** : la cession des **biens mobiliers et incorporels** relève de **L.642-19** (de gré à gré ou enchères, sur autorisation du juge-commissaire) ; la cession d'un **immeuble** relève de **L.642-18** (adjudication, surenchère) → **hors périmètre v1**, signaler et renvoyer.

## Étape 2 — Gate 2 (recevabilité)

Trancher les **deux** verrous. Si l'un tombe → STOP + signalement motivé.
1. **Éligibilité (L.642-20 renvoyant à L.642-3 C.com.)** — L.642-20 rend applicable aux cessions d'actifs isolés l'interdiction de L.642-3 : dirigeants de droit ou de fait, parents et alliés jusqu'au 2nd degré inclus, **contrôleurs**, et toute **interposition de personne** sont **interdits de se porter acquéreurs** ; une acquisition par une telle personne est **nulle**. **Ne pas conclure à l'(in)éligibilité avant d'avoir établi les faits structurants** : (i) la **qualité exacte** de la personne liée **à la date d'ouverture** (dirigeant de droit ? associé ? ancien dirigeant déjà parti ?), (ii) une éventuelle **dirigeance de fait**, (iii) l'**interposition** réelle (qui contrôle effectivement l'acquéreur ?), (iv) le **bénéficiaire effectif** de la société candidate. Tant que ces faits ne sont pas vérifiés, qualifier un **risque** d'inéligibilité (et non une nullité acquise) et le signaler `[review]` ; repérer toute holding interposée, prête-nom, lien familial.
2. **Autorisation du juge-commissaire (L.642-19 C.com.)** — le juge-commissaire **ordonne la vente aux enchères** ou **autorise la vente de gré à gré** des biens autres que les immeubles, au vu du **rapport du liquidateur**, au **prix et conditions qu'il fixe**. Une **offre adressée au liquidateur ne vaut pas vente** tant que l'ordonnance n'est pas rendue. Ne pas confondre offre et acquisition.

## Étape 3 — Construction & dépôt de l'offre (L.642-19 / L.642-7 a contrario / L.1224-1)

Calibrer l'offre pour l'**ordonnance du juge-commissaire** : périmètre **précis** des actifs visés (désignation des biens), **prix**, **financement**, **conditions**, **délai de réalisation**. L'offre est portée par le **liquidateur** dans son rapport au JC.
- **Contrats — pas de transfert automatique (L.642-7 a contrario)** : la cession forcée des contrats désignés (L.642-7) **ne joue que dans le plan de cession**, **pas** dans la cession d'actif isolé. Identifier les contrats clés rattachés à l'actif (**bail, licence, fournisseurs**) et prévoir leur **renégociation** / l'**accord du cocontractant** (clause d'agrément, intuitu personae, changement de contrôle). Ne pas présumer la reprise.
- **Salariés — L.1224-1** : si l'actif cédé constitue une **entité économique autonome conservant son identité**, les **contrats de travail attachés sont transférés de plein droit** (ordre public social), **même en liquidation**. Chiffrer ce passif social ; le signaler `[review]`.
- **Diligence sur la consistance et la valeur des actifs (DD repreneur)** : ne **pas reprendre les valeurs déclarées comme certaines**. Contrôler, actif par actif, l'**inventaire physique**, l'état de **conservation / péremption** (stock), la **propriété réelle** du débiteur — écarter les biens **loués, en dépôt, sous réserve de propriété ou en crédit-bail**, non cessibles par le liquidateur —, l'**assurance** et la **valeur réelle** au regard du prix annoncé. **Conditionner l'offre** à cette vérification (inventaire contradictoire, expertise si besoin). `[review]`

## Étape 4 — Sort des sûretés & purge (point tranchant)

Ne jamais dire que les sûretés disparaissent ni que l'acquéreur prend automatiquement libre. Mécanique :
- **Report du droit de préférence sur le prix** : la sûreté grevant l'actif (nantissement de marque, gage) **se reporte sur le prix de cession** ; le créancier inscrit est payé **selon son rang** sur ce prix.
- **Purge des inscriptions au paiement du prix** : le **paiement complet du prix** emporte **purge des inscriptions** grevant le bien cédé `[connaissance modèle — à vérifier]` ; l'acquéreur prend **quitte et libre** une fois le prix payé/consigné.
- **Droit de rétention NON affecté** : le créancier qui **détient** l'actif (dépositaire, gagiste avec dépossession) **conserve son droit de rétention** et peut **refuser la remise** tant qu'il n'est pas payé → il faut le **désintéresser pour récupérer le bien**.
- → **Ventiler le prix par actif grevé** et **chiffrer la charge** (rétention) dès l'offre. `[review]`

## Étape 5 — Risques & recours (L.632-1 / L.642-19 / L.661-x)

- **Période suspecte (L.632-1 C.com.)** : un bien acquis **du débiteur avant le jugement d'ouverture** (et non du liquidateur) peut tomber sous les **nullités de la période suspecte** (de droit ou facultatives) → risque de restitution. La voie sûre est l'acquisition **du liquidateur, après jugement**, sur ordonnance du JC.
- **Recours contre l'ordonnance (L.642-19 / L.661-x C.com.)** : l'ordonnance du juge-commissaire autorisant/ordonnant la cession est **susceptible de recours** (devant le tribunal, puis voie d'appel) dans des **délais courts** `[à vérifier]`. Purger ce délai avant de se croire propriétaire ; anticiper la contestation d'un tiers/créancier.

## Étape 6 — Post-flight `verifier-citations`

Lancer `verifier-citations` sur tous les articles cités (L.642-7, L.642-18, L.642-19, L.642-20, L.642-3, L.632-1, L.661-6, L.1224-1). Tout article non confirmé reste `[à vérifier]`.

---

## Ce skill ne fait pas

- **Rédiger l'acte de cession / le SPA** → renvoi `/h-da:spa-review`, `/h-da:gap-review`, `/h-da:closing-checklist-fr`.
- **Traiter la reprise d'une entreprise / unité de production en going concern** (plan de cession) → renvoi `/h-da:reprise-a-la-barre`.
- **Cadrer le montage amont confidentiel** (mandat ad hoc / conciliation) → renvoi `/h-da:pre-pack-cession`.
- **Traiter la cession des immeubles (L.642-18)** — adjudication, surenchère — hors périmètre v1, signaler et renvoyer.
- **Traiter le côté débiteur / liquidateur** — ce skill est côté repreneur uniquement.
- Tout seuil / délai procédural (recours contre l'ordonnance) reste `[à vérifier]` si non confirmé en source primaire.

---

## Ton

Technique, prudent, **piloté par le double gate** : tant que le Gate 1 (qualification actif isolé vs going concern) et le Gate 2 (éligibilité L.642-20→L.642-3 + ordonnance du juge-commissaire L.642-19) ne sont pas tranchés, ne pas travailler l'offre. Marteler le **point pivot** (c'est le **juge-commissaire** qui ordonne/autorise, pas le tribunal qui arrête un plan) et le fait qu'une **offre au liquidateur ne vaut pas vente**. Côté repreneur : mesurer l'exposition (sort réel des sûretés et **droit de rétention**, **absence** de transfert automatique des contrats, **transfert automatique** des salariés si entité autonome, période suspecte, recours). Si l'objet est un going concern, renvoyer `reprise-a-la-barre` ; si la cession est préparable en amont, renvoyer `pre-pack-cession`. Brouillon soumis à validation humaine (avocat) avant tout engagement.
