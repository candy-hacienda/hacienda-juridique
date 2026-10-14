---
name: responsabilite-dirigeant
description: >
  Côté dirigeant débiteur : évalue (qualifie, ne conclut pas) la responsabilité
  personnelle du dirigeant d'une entreprise en procédure collective, sur quatre
  axes avec triage interne : contribution à l'insuffisance d'actif (L.651-2,
  obligation aux dettes L.652-1), sanctions personnelles (interdiction de gérer
  L.653-8, faillite personnelle L.653-3 s.), banqueroute (L.654-1, NOMMÉE et
  renvoyée au pénaliste) et cautions personnelles du dirigeant (sort dans la
  procédure et recours du créancier). Échelle 🟢🟡🟠🔴 par axe, à tous les stades (CdP
  imminente, RJ/LJ ouverte, action engagée). Ne chiffre JAMAIS l'insuffisance ni
  la contribution ; ne rédige PAS de mémoire en défense (action engagée →
  `defense-dirigeant`) ; ne fabrique aucune date. Brouillon, validation humaine
  (avocat) OBLIGATOIRE.
version: "2.0.0"
argument-hint: "[forme sociale, qualité du dirigeant (droit/fait), stade procédure (pré-CdP / RJ-LJ ouverte / action engagée), faits saillants ; côté dirigeant]"
authors: ["Hacienda"]
tags: [procedures-collectives, responsabilite-dirigeant, faute-de-gestion, l651-2, l653-8, comblement-passif, debiteur]
---

# Skill — Responsabilité du dirigeant (L.651-2 / L.653-x / banqueroute / cautions)

> **BROUILLON, validation humaine (avocat) OBLIGATOIRE.**
>
> Ce skill **qualifie** une exposition, il ne **conclut** pas. La caractérisation
> d'une faute de gestion, le quantum d'une contribution à l'insuffisance d'actif
> et le prononcé d'une sanction relèvent du **tribunal** ; la défense relève d'un
> **avocat contentieuiste**. Le skill présente des **facteurs** (aggravants /
> atténuants), jamais une conclusion de responsabilité.
>
> **Quatre axes, triage interne.** Le dirigeant pose une question unique (« je
> risque quoi personnellement ? ») ; le skill évalue **systématiquement** les
> quatre axes (aucun skip silencieux) et remonte la criticité maximale en tête.
>
> **Banqueroute (L.654-1) : nommée, jamais évaluée.** L'infraction pénale et son
> élément intentionnel relèvent d'un **pénaliste** — le skill liste les cas
> légaux applicables aux faits et renvoie, comme `declaration-cessation-paiements`
> nomme L.651-2 sans l'évaluer.
>
> **Anti-fabrication strict.** Aucune date calendaire (semaines relatives), aucun
> chiffre d'insuffisance ou de contribution, aucune qualification de fait
> présentée comme acquise. `[à compléter]` et `[review]` partout où la donnée ou
> le jugement n'est pas établi.

---

## Examples

<example>
<user>/h-da:responsabilite-dirigeant — SAS en RJ ouverte (~3 mois), dépôt de bilan tardif d'environ 10 semaines, comptabilité tenue à jour, président de droit, caution bancaire perso</user>
<response>
1. Intake complet : forme SAS, qualité = dirigeant **de droit**, stade = **RJ ouverte**. Faits en semaines relatives (« ~10 semaines de retard », jamais de date calendaire).
2. **Synthèse en tête** : criticité max 🟠 (axe L.651-2, retard DCP) ; axes L.651-2 🟠 · L.653-8 🟡 · banqueroute (nommée, pas évaluée) · cautions 🟠.
3. **Axe 1 — L.651-2** : retard de déclaration = faute de gestion *possible* `[review]` (indice, pas conclusion) ; insuffisance d'actif **non chiffrée** (réclamer l'état du passif) ; comptabilité à jour = facteur **atténuant** ; aucune conciliation = facteur aggravant. Lien de causalité à établir.
4. **Axe 2 — L.653-8** : le retard DCP figure parmi les cas d'interdiction de gérer ; 🟡 conditionnel `[review]`.
5. **Axe 3 — banqueroute** : aucun signal de détournement/comptabilité fictive → nommée, rien à signaler, renvoi pénaliste si éléments apparaissent. Pas de note 🟢🟡🟠🔴 (non évaluée).
6. **Axe 4 — cautions** : la caution bancaire perso est **suspendue pendant l'observation** (L.631-14) mais **survit** ; recours possible du prêteur. Ne pas conclure « caution éteinte ». 🟠 `[review]`.
7. Sortie : synthèse + 4 axes + question hors-checklist + arbre 5 options. Action engagée ? non → recommander de documenter la chronologie.
</response>
</example>

<example>
<user>/h-da:responsabilite-dirigeant — SARL en LJ, le dirigeant a tout fait correctement mais a perdu son client unique (~70 % du CA), gérant de droit, pas de caution</user>
<response>
Synthèse : criticité max 🟢 — la défaillance paraît d'origine **externe**, pas une faute de gestion.
Axe 1 — L.651-2 : la perte d'un client majeur n'est pas en soi une faute de gestion ; une **simple négligence** est expressément exclue (L.651-2 al. 2) `[review]`. Réclamer l'état du passif si une insuffisance est invoquée, mais **ne pas chiffrer**. 🟢.
Axe 2 — L.653-x : aucun cas apparent (pas de retard DCP signalé, pas de fraude). 🟢.
Axe 3 — banqueroute : aucun signal. Nommée, RAS.
Axe 4 — cautions : aucune caution déclarée → axe sans objet, le dire (pas de skip silencieux).
Mention : un dirigeant peut être 🟢 sur tous les axes ; ne pas fabriquer un risque pour « remplir ».
</response>
</example>

<example>
<user>/h-da:responsabilite-dirigeant — action L.651-2 du liquidateur reçue (assignation), SAS en LJ, comptes courants d'associé débiteurs importants, locaux partagés avec une autre société du dirigeant</user>
<response>
**Action engagée** → en tête : « Avocat **contentieuiste** recommandé — ce skill qualifie, il ne rédige pas le mémoire en défense. »
Axe 1 — L.651-2 (+ **sous-cas L.652-1**) : comptes courants débiteurs massifs + locaux confondus = signaux de **confusion de patrimoine** → qualifier L.652-1 séparément `[review]` (obligation aux dettes sociales, régime distinct). Insuffisance **non chiffrée**.
Axe 2 — L.653-x : confusion de patrimoine figure parmi les cas de faillite personnelle (L.653-4/5) ; 🟠 conditionnel `[review]`.
Axe 3 — banqueroute : la confusion de patrimoine **peut** recouvrir un détournement d'actif (L.654-1) — **nommer**, ne pas qualifier l'intention, **renvoi pénaliste**.
Axe 4 — cautions : selon dossier.
Ne pas esquisser la stratégie de défense ni le quantum : qualification + renvoi contentieuiste.
</response>
</example>

---

## Chargement du profil

> Lire `~/.claude/plugins/config/hacienda-juridique/hacienda-droit-affaires/CLAUDE.md`, bloc procédures collectives :
> - **Position** — créancier / débiteur / mandataire / mixte (oriente le ton : ici, côté dirigeant débiteur)
> - **Tribunaux habituels** — repérage du greffe / juridiction
> - **Rôle utilisateur** — avocat inscrit / juriste in-house / non-juriste (en-tête de confidentialité)
> - **Matrice d'approbateurs** — pour l'option « Escalader » (contentieuiste / pénaliste si banqueroute en jeu)

Si le bloc est `[A CONFIGURER]` : stopper et demander `/h-da:entretien-demarrage`.

---

## Intake

1. **Forme sociale + qualité du dirigeant** — SAS, SARL, SA… ET dirigeant **de droit** (gérant, président, DG) **ou de fait** (**obligatoire**). La qualification de dirigeant **de fait** est elle-même contestable → `[review]` si retenue.
2. **Stade de procédure** (**obligatoire**) — pré-CdP imminente (dépôt envisagé) / RJ ou LJ ouverte (préciser depuis combien de **semaines/mois**, jamais de date) / action L.651-2 ou L.653-8 engagée ou annoncée.
3. **Faits chronologiques** — en **semaines relatives** (« ~10 semaines », « ~8 mois »). Ne **jamais** demander ni produire de date calendaire.
4. **Données pertinentes** (optionnel, `[à compléter]` sinon) — conciliation/mandat ad hoc demandé ? comptabilité tenue ? comptes courants d'associé débiteurs ? confusion de patrimoine (locaux/personnel/flux) ? cautions personnelles données (banque, bailleur, fournisseur) ? prélèvements/rémunération récents ?
5. **Si action engagée** — assignation/convocation reçue, axe visé, demandeur (liquidateur / ministère public / créancier).

**Routage à l'intake :**
- **Pré-CdP serein** (pas de procédure annoncée, pas de dépôt imminent) → renvoi `/h-da:prevention-difficultes` ; C n'apporte rien hors funnel procédure.
- **Pré-CdP avec dépôt imminent** → C s'applique (anticipation expo perso) ; recommander en sortie de déposer la DCP (`/h-da:declaration-cessation-paiements`) et, si la fenêtre reste ouverte, une conciliation L.611-4 (neutralise le délai 45 j → atténue le reproche de retard).

Si forme sociale, qualité du dirigeant ou stade absents : stopper et demander. Pas de valeur par défaut.

---

## Gate non-juriste

- [ ] Forme sociale + qualité du dirigeant + stade de procédure fournis (refus du défaut)
- [ ] Profil cabinet bloc procédures collectives lu ; rôle utilisateur (en-tête) et matrice d'approbateurs identifiés
- [ ] **Qualité dirigeant** explicite (droit / fait) ; si « fait » : qualification taguée `[review]` (elle-même contestable)
- [ ] **Les 4 axes sont évalués** — aucun skip silencieux ; un axe sans signal est explicitement marqué (« 🟢 — aucun signal sur ce stade » ou « sans objet »), jamais omis
- [ ] **G4 — banqueroute** : (axe 3) NOMMÉE, jamais évaluée : cas légaux listés + renvoi pénaliste ; pas de note 🟢🟡🟠🔴, pas de qualification d'intention (dol/détournement/dissimulation)
- [ ] **G1 — dates** : semaines relatives uniquement ; aucune date calendaire ; aucun nombre de jours de retard précis ; le 1er impayé est un indice, pas la date (vise les dates du **dossier** ; les dates d'entrée en vigueur des textes, ex. 1er octobre 2021, ne sont pas concernées)
- [ ] **G2 — quantum** : aucun chiffre d'insuffisance d'actif ni de contribution ; réclamer un état du passif si des chiffres sont demandés ; `[à compléter]`
- [ ] **G3 — qualification de fait** : facteurs aggravants/atténuants présentés en **indices** ; jamais « faute caractérisée » / « manifestement » ; conclusion réservée au tribunal `[review]`
- [ ] **G5 — cautions** : distinguer le **sort dans la procédure** (suspension L.622-28/L.631-14 ; bénéfice des dispositions du plan L.626-11, en redressement seulement si la procédure est ouverte depuis le 1er octobre 2021) du **recours créancier hors procédure** ; jamais « caution éteinte » sans acte + plan
- [ ] **Stade procédure** module les **recommandations finales** (documenter la chrono vs préparer la défense), pas la qualification
- [ ] **Action engagée** → renvoi avocat **contentieuiste** en tête du livrable, qualification quand même produite
- [ ] Aucune **fabrication** : ni date, ni chiffre, ni créancier, ni acte de caution non fourni — `[à compléter]` partout où la donnée manque
- [ ] Sortie : synthèse en tête + 4 axes détaillés + question hors-checklist + arbre 5 options ; en-tête de confidentialité selon rôle ; note du relecteur en bloc unique

---

## Outils MCP à privilégier

Appeler les outils par leur nom exact quand le serveur `Hacienda Droit des Affaires` est disponible. Ne pas inventer de tool hors périmètre ; si une source n'a pas été consultée directement, garder `[à vérifier]`.

- Socle sources officielles : `piste_status`, `legifrance_recherche`, `legifrance_get_article`, `judilibre_recherche`, `judilibre_get_decision`, `eurlex_recherche`, `eurlex_consulter`.
- Identité entreprise (forme sociale, dirigeants, mandats) : `company_full_profile`, `bodacc_by_siren`.
- **`bodacc_procedures` autorisé** (≠ DCP qui était pré-procédure) : si la procédure est ouverte, l'annonce existe → confirme le stade et le mandataire désigné.
- Jurisprudence à privilégier : faute de gestion (L.651-2), interdiction de gérer (L.653-8), cautionnement personne physique du dirigeant.
- Tout résultat issu d'un corpus client ou d'un outil interne reste distingué des sources primaires officielles.

## Emplacement des sorties

```
outputs/responsabilite-dirigeant-<denomination-ou-siren>-<stade>.md
```
`<stade>` : `pre-cdp` / `rj` / `lj` / `action`. Format date des noms : `YYYY-MM-DD` si une date de génération est ajoutée.

---

## Sortie

Structurer la sortie avec : faits retenus, droit applicable par axe, qualification motivée, incertitudes, sources consultées, décisions proposées, prochaine action et validation humaine. Toute source non consultée directement reste `[à vérifier]`.

### Étape 1 — Cadrage

1. Lire profil cabinet (bloc procédures collectives) et `~/.claude/plugins/config/hacienda-juridique/company-profile.md`.
2. Confirmer **qualité dirigeant** (droit/fait) et **stade procédure**. Router selon la section Intake si pré-CdP serein.

### Étape 2 — Évaluation des 4 axes (systématique, pas de skip silencieux)

**Axe 1 — Contribution à l'insuffisance d'actif (L.651-2) + sous-cas L.652-1.**
- Conditions cumulatives (L.651-2 `[à vérifier]`) : (a) RJ ou LJ ouverte (L.651-1) ; (b) insuffisance d'actif — **non chiffrée**, réclamer l'état du passif si demandé ; (c) faute de gestion ; (d) lien de causalité.
- Faute de gestion — **indices** (jamais conclusion) : retard DCP, poursuite d'activité déficitaire, prélèvements/rémunération anormaux, comptabilité défaillante, absence de réaction. Tague `[review]`.
- **Simple négligence exclue** (L.651-2 al. 2 `[à vérifier]`) : le rappeler comme facteur atténuant possible.
- Facteurs atténuants : conciliation L.611-4 demandée, chronologie documentée, expert-comptable consulté.
- **Sous-cas L.652-1** (obligation aux dettes sociales — confusion de patrimoine ou fictivité de la personne morale `[à vérifier]`) : régime distinct ; qualifier séparément `[review]` si signaux (comptes courants débiteurs massifs, locaux/flux confondus, absence de gouvernance) ; sinon, mentionner en risque dormant.
- Qualification : 🟢🟡🟠🔴 `[review]`.

**Axe 2 — Sanctions personnelles (L.653-x).**
- Interdiction de gérer (L.653-8 `[à vérifier]`) : cas limitatifs (omission/retard DCP, défaut de coopération, fraude…). Qualification + facteurs `[review]`.
- Faillite personnelle (L.653-3 à L.653-5 `[à vérifier]`) : cas plus graves (détournement d'actif, poursuite abusive d'exploitation déficitaire à des fins personnelles, comptabilité fictive/disparue). Qualification + facteurs `[review]`.
- Durée max **15 ans** (L.653-11 `[à vérifier]`).

**Axe 3 — Banqueroute (L.654-1) — NOMMÉE, pas évaluée.**
- Lister les **cas légaux** applicables aux faits (L.654-2 `[à vérifier]`) : achats en vue de revente au-dessous du cours / emploi de moyens ruineux pour se procurer des fonds ; détournement ou dissimulation d'actif ; augmentation frauduleuse du passif ; comptabilité fictive, disparue ou manifestement incomplète/irrégulière.
- **Ne pas qualifier l'élément intentionnel.** Si des signaux concrets existent → **renvoi pénaliste**.
- Sanctions max : **5 ans d'emprisonnement et 75 000 € d'amende** (L.654-3 `[à vérifier]`).
- Pas de note 🟢🟡🟠🔴 (axe non évalué).

**Axe 4 — Cautions personnelles du dirigeant.**
- Existence : acte de caution (étendue, durée, montant) — `[à compléter]` si non fourni.
- Sort **dans la procédure** :
  - Période d'observation : **suspension** des poursuites contre la caution personne physique (L.622-28 sauvegarde / L.631-14 RJ `[à vérifier]`).
    - **En redressement**, la caution **ne peut pas** invoquer l'**arrêt du cours des intérêts** (L.622-28 al. 1, écarté par L.631-14 `[à vérifier]`) : les intérêts continuent de courir à son égard. Ne pas confondre avec la suspension des poursuites, dont elle bénéficie.
  - Plan de continuation : la caution personne physique **peut se prévaloir des dispositions du plan** (délais, remises), les personnes morales en étant exclues (L.626-11 al. 2 `[à vérifier]`) — ce n'est pas un « arrêt définitif » des poursuites ; mais la dette principale survit pour le surplus.
    - **En sauvegarde comme en redressement** pour les procédures ouvertes **depuis le 1er octobre 2021** : L.631-19 I rend le régime du plan de sauvegarde, donc L.626-11, applicable au plan de redressement (ord. n° 2021-1193 du 15 sept. 2021, `[à vérifier]`).
    - **Procédure de redressement ouverte avant le 1er octobre 2021** : ancien régime, la caution **ne peut pas** se prévaloir du plan de redressement (ancien L.631-20). **Vérifier la date du jugement d'ouverture** avant de qualifier ; `[à compléter]` si elle n'est pas fournie.
  - Clôture LJ pour insuffisance d'actif : non-reprise des poursuites individuelles **sauf** contre la caution (L.643-11 `[à vérifier]`) — la caution **reste actionnable**.
- **Recours créancier hors procédure** : à anticiper (prêteur bancaire, bailleur, fournisseur garanti). `[review]`.
- **Ne jamais conclure « caution éteinte »** sans l'acte et l'état du plan. Qualification : 🟢🟡🟠🔴 `[review]`.

### Étape 3 — Synthèse, fraîcheur, post-flight

- **Synthèse en tête** : criticité maximale + axe(s) prime + stade procédure + (si action engagée) renvoi contentieuiste.
- Vérifier la **fraîcheur** de la jurisprudence (ch. com. < 3 ans) sur faute de gestion / interdiction de gérer / cautions via `judilibre_recherche` ; mode dégradé documenté si PISTE indisponible.
- Post-flight `verifier-citations` sur la sortie complète. Articles à vérifier : **L.651-1, L.651-2, L.651-3, L.652-1, L.653-1, L.653-3, L.653-4, L.653-5, L.653-6, L.653-8, L.653-11, L.654-1, L.654-2, L.654-3, L.622-28, L.631-14, L.626-11, L.643-11, L.632-1, L.632-2 C.com.**, **art. 2288 et s. C.civ.** Tag `[Légifrance]` uniquement si l'article a été lu via `legifrance_get_article` dans la session (l'index `${CLAUDE_SKILL_DIR}/../../references/articles-c-civ-c-com-index.md` donne les identifiants, ce n'est pas une vérification) ; sinon `[à vérifier]`.

### Format livrable

```
[En-tête de confidentialité selon le rôle utilisateur — voir CLAUDE.md du plugin]

> ⚠️ Note du relecteur
> - **Sources :** Légifrance ✓ / Judilibre ✓ / Pappers ✓ / BODACC ✓ (cocher ✗ si non connectée) ; articles lus dans cette session : {liste} ; autres citations `[à vérifier]`
> - **Lecture :** faits fournis : {liste} | aucun
> - **Signalé pour ton jugement :** {N éléments [review] en ligne}
> - **Fraîcheur :** jurisprudence post-{date} sur faute de gestion / interdiction de gérer / cautions — {N} arrêts [Judilibre] | recherche impossible
> - **Avant de t'appuyer dessus :** {action concrète — ex. faire reconstituer la chronologie avec l'expert-comptable ; obtenir l'acte de caution et l'état du plan}

# Synthèse — Exposition globale du dirigeant
- Criticité maximale : {🟠} sur axe prime : {L.651-2 — retard DCP}
- Axes en jeu : L.651-2 {🟠} · L.653-8 {🟡} · Banqueroute {nommée, pas évaluée} · Cautions {🟠}
- Stade : {RJ ouverte / LJ / action engagée / pré-CdP imminente}
- {Si action engagée : « Avocat contentieuiste recommandé ; `/h-da:defense-dirigeant` arme la trame de défense — ce skill qualifie, ne rédige pas la défense. »}

# Faits retenus
{chronologie sobre, en semaines relatives, sans dates calendaires}

# Axe 1 — Contribution à l'insuffisance d'actif (L.651-2) + sous-cas L.652-1
- Qualification : {🟢🟡🟠🔴} [review]
- Conditions L.651-2 : {procédure ouverte · insuffisance non chiffrée · faute de gestion (indices) · causalité}
- Facteurs aggravants / atténuants : {…} ; simple négligence exclue (al. 2) [review]
- Sous-cas L.652-1 (confusion de patrimoine / fictivité) : {qualif si signaux | risque dormant}

# Axe 2 — Sanctions personnelles (L.653-x)
- Interdiction de gérer (L.653-8) : {qualif} [review]
- Faillite personnelle (L.653-3 à L.653-5) : {qualif} [review]
- Durée max 15 ans (L.653-11)

# Axe 3 — Banqueroute (L.654-1) — NOMMÉE, pas évaluée
- Cas légaux applicables aux faits : {…}
- {Si signaux : renvoi pénaliste — l'intention n'est pas qualifiée ici}
- Sanctions max : 5 ans + 75 000 € (L.654-3)

# Axe 4 — Cautions personnelles
- Existence : {acte | à compléter}
- Sort dans la procédure : observation (L.622-28/L.631-14) · plan (L.626-11) · clôture LJ (L.643-11)
- Recours créancier hors procédure : {prêteur / bailleur / fournisseur} [review]

# Une question hors de ma checklist
{observation honnête — ex. compte courant d'associé débiteur, rémunération récente, garantie à première demande déguisée en caution. Omettre si rien d'honnête.}

# Que veux-tu faire ? Choisis une option et je la déroule :
1. **Rédiger** — note de synthèse au dirigeant (mode silencieux client) reprenant l'évaluation des 4 axes.
2. **Escalader** — note vers {avocat référent / contentieuiste / pénaliste si banqueroute en jeu} : faits-clés, axe prime, décision attendue.
3. **Compléter les faits** — questions à l'expert-comptable / dirigeant (chronologie, comptabilité, comptes courants, actes de caution, état du plan).
4. **Surveiller et attendre** — j'ajoute le dossier au tracker avec critères et date de revisite (ex. ouverture d'une action du mandataire).
5. **Autre** — précise.
```

### Mode silencieux (note destinée au dirigeant non-juriste)

Si le livrable est adressé directement au dirigeant : couper la narration de skill, sortir les renvois inter-commandes dans une note séparée, conserver l'en-tête de confidentialité adapté au rôle et une note du relecteur condensée. **Pas de mode externe** vers le tribunal/mandataire : un mémoire en défense est un autre livrable (avocat contentieuiste).

### Log de vérification

```
Sources consultées : [tags utilisés]
Citations vérifiées : [oui / non / partiel — état PISTE]
Date d'analyse : YYYY-MM-DD
```

---

## Ce skill ne fait pas

- **Conclure** à une faute de gestion, une sanction ou une responsabilité — le tribunal qualifie ; le skill présente des facteurs `[review]`.
- **Chiffrer** l'insuffisance d'actif, la contribution ou les amendes (piège fabrication) — `[à compléter]`, réclamer l'état du passif.
- **Évaluer** la banqueroute (L.654-1) — pénal : nommée et renvoyée au pénaliste.
- **Rédiger un mémoire en défense** quand une action L.651-2 / L.653-8 est engagée → `/h-da:defense-dirigeant` arme la **trame** de défense (moyens), puis l'avocat rédige l'acte.
- **Trancher** la qualification de dirigeant **de fait** — la nommer `[review]`.
- **Stratégier** la défense (ordonner les moyens, constituer les preuves, choisir l'expert) → `/h-da:defense-dirigeant` (si action engagée).
- Le conseil **fiscal** (solidarité fiscale du dirigeant, L.267 LPF) — nommé si signaux, sinon hors scope ; renvoi.
- **Fabriquer** des dates (semaines relatives uniquement).

---

## Ton

Technique, factuel, **mesuré**. Sur l'exposition : honnêteté directe (elle est réelle et personnelle) sans dramatiser ni conclure — qualifier, nommer les facteurs, renvoyer l'évaluation finale à l'avocat. Ne jamais fabriquer un risque pour « remplir » un axe : un dirigeant peut être 🟢 partout. La responsabilité personnelle engage le patrimoine du dirigeant : le brouillon est soumis à validation humaine (avocat), contentieuiste si une action est engagée.
