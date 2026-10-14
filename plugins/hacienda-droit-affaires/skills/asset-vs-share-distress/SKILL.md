---
name: asset-vs-share-distress
description: >
  Note d'orientation côté candidat-repreneur pour décider COMMENT acquérir une
  cible en difficulté — rachat de titres (share deal) ou d'actifs (asset deal) —
  et router vers le bon playbook d'exécution : il décide et oriente, il n'exécute
  pas. Double gate : (1) diagnostic du niveau de difficulté (in bonis / amiable /
  RJ / LJ) ; cessation des paiements > 45 j sans procédure →
  `prevention-difficultes` ; (2) responsabilité repreneur — un share deal ne purge
  AUCUN passif, et une acquisition pré-procédure peut tomber en période suspecte
  (L.632-1 / L.632-2). Cartographie transfert social, solidarité fiscale,
  confusion de patrimoine, insuffisance d'actif et passif environnemental. Route
  vers `prevention-difficultes` / `pre-pack-cession` / `reprise-a-la-barre` /
  `cession-actifs-isoles` / `spa-review`. Côté repreneur uniquement ; ni offre, ni
  SPA, ni acte de cession, AUCUN conseil fiscal. Brouillon, validation humaine
  (avocat) OBLIGATOIRE.
version: "2.0.0"
argument-hint: "[note d'orientation (mode unique), cible à quel stade de difficulté ?, titres ou actifs envisagés ?, acquisition avant ou après jugement ?, côté repreneur]"
authors: ["Hacienda"]
tags: [asset-vs-share-distress, structuration, distressed-m&a, restructuring, share-deal, asset-deal, periode-suspecte, responsabilite-repreneur, routeur]
---

# Skill — Asset vs share deal en distress (arbitrage de structuration amont)

> **BROUILLON, VALIDATION HUMAINE (AVOCAT) OBLIGATOIRE.**
>
> **🔴 Double gate.**
> - **Gate 1 — diagnostic du niveau de difficulté + routage** : situer la cible —
>   *in bonis* avec difficultés / amiable (mandat ad hoc, conciliation) / RJ / LJ —
>   détermine les structures disponibles et **route**. Cas tranchant : si la
>   **cessation des paiements date de plus de 45 jours et qu'aucune procédure n'est
>   ouverte**, l'entreprise **doit la déclarer** : on ne structure pas librement une
>   acquisition → **renvoi `prevention-difficultes`**.
> - **Gate 2 — responsabilité repreneur** : (a) un **share deal d'une société en
>   difficulté ne purge AUCUN passif** — le repreneur hérite des dettes, des
>   procédures et des litiges ; « racheter les titres simplifie » est l'erreur qui
>   trompe le client ; (b) une **acquisition pré-procédure** (achat direct au
>   débiteur avant jugement) peut être **annulée au titre de la période suspecte**
>   (**L.632-1** nullités de droit / **L.632-2** nullités facultatives).
>
> **Point pivot.** Ce skill **décide et route**, il **n'exécute pas**. Il ne déroule
> pas la mécanique L.642-x (c'est le rôle des skills aval), il ne rédige ni offre ni
> SPA ni acte de cession, et il ne donne **aucun conseil fiscal** (flag + renvoi
> conseil fiscal).

## Examples

1. **Share deal « plus simple ».** Le client veut racheter les titres d'une société
   surendettée « pour aller vite ». → Gate 2 (a) : le share deal **ne purge rien** —
   il hérite de tout le passif et des procédures en cours. Comparer honnêtement avec
   un asset deal (qui laisse le passif) avant de trancher.

2. **Achat d'actifs avant la procédure.** Le client veut racheter le matériel
   directement au gérant tout de suite. → Gate 2 (b) : risque de **nullité de la
   période suspecte (L.632-1 / L.632-2)** si la cessation des paiements est
   caractérisée. La voie sûre passe par les organes **après jugement**.

3. **CP > 45 j non déclarée.** La cible est en cessation des paiements depuis des
   mois sans avoir rien déclaré. → Gate 1 : l'entreprise **doit déclarer** ; on ne
   structure pas une acquisition libre → **renvoi `prevention-difficultes`**.

## Chargement du profil

> Lire `~/.claude/plugins/config/hacienda-juridique/hacienda-droit-affaires/CLAUDE.md`, bloc M&A + bloc procédures collectives :
> - **Position dominante** — ce skill suppose le **côté repreneur** (le candidat acquéreur)
> - **Side M&A habituel** — acquéreur ; taille de deals typique

Si le bloc est `[A CONFIGURER]` : stopper et demander `/h-da:entretien-demarrage`.

---

## Intake

1. **Côté** — **repreneur** (le candidat acquéreur). Pas de mode neutre ; côté cédant/débiteur hors périmètre.
2. **Niveau de difficulté de la cible** — *in bonis* avec difficultés / amiable (mandat ad hoc, conciliation) / RJ / LJ ? **cessation des paiements** datée ? depuis plus de 45 jours ? (**déterminant** — voir Gate 1, lookup BODACC).
3. **Structure envisagée** — le client penche-t-il pour un **share deal** (titres) ou un **asset deal** (actifs) ? pourquoi ? (souvent « les titres c'est plus simple » → piège Gate 2 a).
4. **Calendrier de l'acquisition** — envisagée **avant** tout jugement (achat au débiteur) ou **dans** une procédure (via les organes) ? (**déterminant** — voir Gate 2 b, période suspecte).
5. **Périmètre & passif** — quel passif pèse sur la société (dettes fiscales/sociales/fournisseurs, litiges) ? un **fonds de commerce** dans le périmètre (solidarité fiscale) ? des **salariés** et **contrats clés** (bail, licence) ?
6. **Objectifs fiscaux** — le client veut-il conserver des **déficits reportables** ? (dimension fiscale → flag + renvoi conseil fiscal, pas d'avis).

---

## Gate non-juriste

- [ ] **Gate 1 — niveau de difficulté tranché** : cible située sur le spectre (in bonis / amiable / RJ / LJ) ; **CP > 45 j sans procédure → STOP + renvoi `prevention-difficultes`**
- [ ] **Routage identifié** : amiable préparable → `pre-pack-cession` ; RJ/LJ avec appel d'offres → `reprise-a-la-barre` ; actifs isolés en LJ → `cession-actifs-isoles` ; share deal → `spa-review` / `gap-review` / `closing-checklist-fr`
- [ ] **Gate 2 (a) — passif** : ne JAMAIS laisser entendre qu'un **share deal purge le passif** ; on hérite dettes + procédures + litiges
- [ ] **Gate 2 (b) — période suspecte (L.632-1 / L.632-2)** : acquisition pré-procédure signalée comme annulable ; voie sûre = via les organes après jugement
- [ ] **Responsabilité repreneur cartographiée** : L.1224-1 (social), solidarité fiscale L.1684 CGI `[review]`, extension/confusion de patrimoine, insuffisance d'actif L.651-2, environnement ICPE `[review]`
- [ ] **Aucun conseil fiscal** donné : déficits/droits d'enregistrement/solidarité → flag + renvoi conseil fiscal
- [ ] Côté repreneur déclaré ; le skill décide et route, **n'exécute pas**
- [ ] Citations vérifiées via `verifier-citations` ou taguées `[à vérifier]`

---

## Outils MCP à privilégier

- Identification entreprise + procédures publiées : `company_full_profile`, `bodacc_by_siren`, `bodacc_procedures` (situer le niveau de difficulté, détecter une procédure ouverte, le type, les dates).
- Socle sources officielles : `piste_status`, `legifrance_recherche`, `legifrance_get_article`, `judilibre_recherche`, `eurlex_recherche`, `eurlex_consulter`.

---

## Emplacement des sorties

```
outputs/asset-vs-share-distress-<entreprise-slug>-YYYY-MM-DD.md
```

---

## Sortie

### Format livrable

```
[En-tête de confidentialité selon le rôle]

> ⚠️ Note du relecteur
> - **Sources :** Légifrance ✓ / BODACC ✓ / Judilibre ✓ (cocher ✗ si non connectée) ; articles lus dans cette session : {liste} ; autres citations `[à vérifier]`
> - **Lecture :** situation décrite + {N} pièces
> - **Signalé pour ton jugement :** {N} éléments [review] (niveau de difficulté, choix de structure, responsabilité repreneur, dimension fiscale) | aucun
> - **Fraîcheur :** réforme du 15 septembre 2021 (ord. transposition directive restructuration) — vérifier seuils/délais en vigueur | recherche impossible
> - **Avant de t'appuyer dessus :** {action — ex. confirmer la date de cessation des paiements / faire chiffrer la dimension fiscale par un fiscaliste} | « prêt pour relecture »

# Asset vs share deal en distress — note d'orientation [CÔTÉ repreneur]

# 1. Diagnostic du niveau de difficulté (Gate 1)
- Cible située : {in bonis avec difficultés / amiable / RJ / LJ} (lookup BODACC). Cessation des paiements : {datée le … / > 45 j ? / non caractérisée}.
- {Si **CP > 45 j sans procédure** → l'entreprise doit la déclarer → on ne structure pas librement → renvoi `prevention-difficultes`.}

# 2. Arbitrage titres vs actifs
| Axe | Share deal (titres) | Asset deal (actifs) |
|---|---|---|
| Passif | **hérité en bloc, aucune purge** | laissé derrière (sauf exceptions) |
| Continuité (contrats / autorisations / agréments) | préservée | rupture — pas de transfert auto |
| Salariés | suivent la société | **L.1224-1** si entité économique autonome |
| Sûretés / purge | non purgées | purge selon la voie judiciaire (skills aval) |
| Véhicule | hors plan (négocié) | plan de cession / actifs isolés / pre-pack |
| Fiscalité | déficits reportables `[review]` fiscal | droits d'enregistrement, **solidarité L.1684 CGI** `[review]` fiscal |
- **Alerte Gate 2 (a)** : un share deal d'une société en difficulté **ne purge rien**.

# 3. Cartographie de la responsabilité repreneur
- **Période suspecte (L.632-1 nullités de droit / L.632-2 facultatives)** : acquisition pré-procédure annulable → voie sûre via les organes après jugement. {🟠/🔴 selon le calendrier}
- **L.1224-1** : transfert automatique des contrats de travail si entité économique autonome cédée.
- **Solidarité fiscale (L.1684 CGI)** : le cessionnaire d'un fonds peut être tenu solidairement de certains impôts du cédant → **conseil fiscal** `[review]`.
- **Extension de procédure / confusion de patrimoine** ; **insuffisance d'actif (L.651-2)** si le repreneur devient dirigeant ; **passif environnemental ICPE** `[review]`.

# 4. Recommandation & routage
- Structure recommandée : {titres / actifs / voie} — justification distress-aware (passif, continuité, calendrier, risque de nullité).
- **Renvois** :
  - `/h-da:prevention-difficultes` — si CP > 45 j / dispositif amiable à enclencher.
  - `/h-da:pre-pack-cession` — si cession préparable confidentiellement en amont.
  - `/h-da:reprise-a-la-barre` — si plan de cession (going concern) en RJ/LJ.
  - `/h-da:cession-actifs-isoles` — si actifs isolés en LJ.
  - `/h-da:spa-review` / `/h-da:gap-review` / `/h-da:closing-checklist-fr` — si share/asset deal négocié, projet d'acte.
  - **Conseil fiscal externe** — pour toute dimension fiscale (déficits, droits d'enregistrement, solidarité L.1684 CGI).

# Une question hors de ma checklist habituelle
{Observation transversale — ex. articulation prix / garantie de passif dans un share deal distress, intérêt d'une NEWCO repreneuse, clean team si repreneur concurrent. Omettre si rien d'honnête.}

# Que veux-tu faire ? Choisis une option :
1. **Rédiger** — je prépare une note de recommandation de structure (titres vs actifs) argumentée pour le client / le comité d'investissement.
2. **Escalader** — note vers {approbateur configuré} pour décision de structure / d'engagement.
3. **Compléter les faits** — questions (date exacte de cessation des paiements, état du passif, calendrier d'acquisition, périmètre).
4. **Surveiller et attendre** — suivi avec point de revisite (évolution de la procédure).
5. **Autre** — précise.
```

---

## Étape 1 — Gate 1 (diagnostic + routage)

1. Lire le profil cabinet (blocs M&A + procédures collectives) et confirmer le **côté repreneur**. Raisonner **à la date du jour** (dates absolues).
2. Vérifier via `bodacc_procedures` / `bodacc_by_siren` / `company_full_profile` où en est la cible : procédure ouverte ? type (amiable confidentiel non publié / RJ / LJ) ? dates ? **cessation des paiements** caractérisée et datée ?
3. **Trancher le niveau de difficulté + router.** Cas tranchant : si la **cessation des paiements date de plus de 45 jours et qu'aucune procédure collective n'est ouverte**, l'entreprise **doit la déclarer** (obligation du dirigeant) — on ne structure pas une acquisition libre → **renvoi `/h-da:prevention-difficultes`**. Sinon, orienter : amiable préparable → `pre-pack-cession` ; RJ/LJ avec appel d'offres → `reprise-a-la-barre` ; actifs isolés en LJ → `cession-actifs-isoles`.

## Étape 2 — Arbitrage titres vs actifs

Dérouler le comparatif **distress-aware** (cf. tableau du livrable) : passif (hérité en bloc dans un share deal vs laissé derrière dans un asset deal), continuité des contrats/autorisations/agréments, salariés (L.1224-1), sûretés/purge, véhicule procédural, fiscalité (flag). **Marteler le Gate 2 (a)** : un **share deal d'une société en difficulté ne purge AUCUN passif** — le repreneur hérite des dettes, des procédures en cours et des litiges. Ne jamais présenter le rachat de titres comme un moyen d'éviter le passif.

## Étape 3 — Cartographie de la responsabilité repreneur

- **Période suspecte (L.632-1 / L.632-2 C.com.)** — Gate 2 (b). Une acquisition conclue **avec le débiteur avant le jugement d'ouverture** peut être **annulée** si elle intervient en période suspecte : nullités **de droit** (L.632-1, ex. actes à titre gratuit, paiements anormaux) ou **facultatives** (L.632-2, actes à titre onéreux si le cocontractant connaissait la cessation des paiements). La voie sûre est l'acquisition **via les organes, après jugement**.
- **L.1224-1 C.trav.** : transfert automatique des contrats de travail si une **entité économique autonome conservant son identité** est cédée (vaut aussi en asset deal).
- **Solidarité fiscale (art. 1684 CGI `[connaissance modèle — à vérifier]`)** : le cessionnaire d'un fonds de commerce peut être tenu **solidairement** de certains impôts dus par le cédant pendant un délai → **conseil fiscal obligatoire**, le skill ne chiffre pas. `[review]`
- **Extension de procédure / confusion de patrimoine** ; **insuffisance d'actif (L.651-2 C.com.)** si le repreneur devient **dirigeant** de la cible reprise ; **passif environnemental ICPE** (sites pollués) `[review]`.

## Étape 4 — Recommandation de structure

Formuler une **recommandation distress-aware** (titres / actifs / voie) en pesant : ampleur du passif (en faveur de l'asset deal s'il est lourd), besoin de continuité (contrats/autorisations en faveur du share deal), calendrier et risque de nullité (période suspecte), dimension sociale (L.1224-1), dimension fiscale (flag, pas d'arbitrage chiffré). Préférer l'option la plus protectrice pour le repreneur et signaler explicitement les arbitrages `[review]`.

## Étape 5 — Routage

Orienter vers le skill aval adéquat (sans en dérouler la mécanique) : `prevention-difficultes` / `pre-pack-cession` / `reprise-a-la-barre` / `cession-actifs-isoles` / `spa-review` / `gap-review` / `closing-checklist-fr`, et **conseil fiscal externe** pour toute dimension fiscale.

## Étape 6 — Post-flight `verifier-citations`

Lancer `verifier-citations` sur tous les articles cités (L.632-1, L.632-2, L.642-1, L.642-19, L.1224-1, L.651-2, art. 1684 CGI). Tout article non confirmé reste `[à vérifier]`.

---

## Ce skill ne fait pas

- **Exécuter** : ni offre de reprise, ni SPA, ni acte de cession, ni déroulé détaillé de L.642-x → skills aval (`reprise-a-la-barre`, `cession-actifs-isoles`, `pre-pack-cession`, `spa-review`, `gap-review`, `closing-checklist-fr`).
- **Donner un conseil fiscal** (déficits reportables, droits d'enregistrement, solidarité L.1684 CGI) — flag + renvoi conseil fiscal.
- **Traiter le côté cédant / débiteur / organes de la procédure** — côté repreneur uniquement.
- **Enclencher un dispositif préventif** (mandat ad hoc / conciliation) → renvoi `/h-da:prevention-difficultes`.
- Tout seuil / délai (période suspecte, déclaration de CP) reste `[à vérifier]` si non confirmé en source primaire.

---

## Ton

Technique, prudent, **piloté par le double gate** : situer d'abord le niveau de difficulté (Gate 1) et router si la cible est au-delà du seuil amiable (CP > 45 j → `prevention-difficultes`) ; marteler le Gate 2 (a) (un **share deal ne purge pas le passif**) et le Gate 2 (b) (période suspecte L.632-1/632-2). Côté repreneur : éclairer l'arbitrage titres vs actifs sans le trancher à la place du client, cartographier la responsabilité (social, fiscal flag, extension/confusion, L.651-2, environnement), puis **router** vers le bon playbook. Ne jamais exécuter ni donner de conseil fiscal. Brouillon soumis à validation humaine (avocat) avant toute décision de structure.
