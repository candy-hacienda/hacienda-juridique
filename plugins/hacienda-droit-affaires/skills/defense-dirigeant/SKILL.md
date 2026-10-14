---
name: defense-dirigeant
description: >
  Aval contentieux de `responsabilite-dirigeant` : arme la DÉFENSE du dirigeant
  assigné en responsabilité dans une procédure collective. S'active uniquement
  quand une action est ENGAGÉE (assignation ou conclusions du liquidateur, du
  ministère public ou des contrôleurs reçues) ; sinon, renvoi
  `responsabilite-dirigeant`. Produit une TRAME de défense — moyens ordonnés par
  force, confrontés aux faits, pièces à produire, expertise à demander — sur
  l'insuffisance d'actif (L.651-2, obligation aux dettes L.652-1) et les sanctions
  personnelles (L.653-8, L.653-3 s.). Banqueroute (L.654) renvoyée au pénaliste ;
  articulation pénal/civil nommée seulement. NE RÉDIGE PAS le mémoire, ne chiffre
  aucun quantum, ne pronostique aucune issue, ne fabrique ni date ni pièce.
  Brouillon, validation humaine (avocat) OBLIGATOIRE.
version: "2.0.0"
argument-hint: "[axe(s) visé(s) par l'action (L.651-2 / L.652-1 / L.653-x), demandeur (liquidateur / MP / contrôleurs), forme sociale, qualité du dirigeant (droit/fait), faits saillants en semaines relatives ; côté dirigeant assigné]"
authors: ["Hacienda"]
tags: [procedures-collectives, defense-dirigeant, contentieux, l651-2, l653-8, comblement-passif, faute-de-gestion, debiteur]
---

# Skill — Défense du dirigeant (trame de moyens — L.651-2 / L.652-1 / L.653-x)

> **BROUILLON, validation humaine (avocat) OBLIGATOIRE.**
>
> **Trame, pas mémoire.** Ce skill **marshalle** les moyens de défense — il les
> ordonne par force, les confronte aux faits, liste les pièces à produire et
> l'expertise à demander. Il **ne rédige pas** le mémoire en défense : la mise en
> forme de l'acte de procédure relève de l'**avocat** (plaidant / contentieuiste).
>
> **S'active uniquement sur action engagée.** Assignation ou conclusions du
> liquidateur, du ministère public ou des créanciers-contrôleurs (sur carence)
> **reçues**. Hors contentieux (exposition seulement) → renvoi
> `responsabilite-dirigeant` (qualifier l'expo, documenter la chronologie). Aval
> exact de `responsabilite-dirigeant` qui **nomme** ce skill à sa frontière.
>
> **Banqueroute (L.654) : hors plaidoirie.** Instance **pénale** distincte →
> **pénaliste**. Si une banqueroute est poursuivie en parallèle, **nommer**
> l'articulation pénal/civil (sursis à statuer possible, autorité de la chose
> jugée du pénal sur le civil) — jamais la plaider.
>
> **Anti-fabrication strict.** Aucune date calendaire (semaines relatives), aucun
> chiffre de contribution ou de minoration, **aucun pronostic d'issue** (« vous
> serez écarté »), aucune pièce supposée. `[à compléter]` et `[review]` partout où
> la donnée ou le jugement n'est pas établi.

---

## Examples

<example>
<user>/h-da:defense-dirigeant — action L.651-2 du liquidateur reçue (assignation), SAS en LJ, dépôt de bilan tardif d'environ 10 semaines, mais comptabilité tenue à jour et défaillance liée à la perte du client unique (~70 % du CA), gérant de droit, pas de pluralité de dirigeants</user>
<response>
1. Gate : **action engagée** confirmée (assignation L.651-2 du liquidateur) → le skill s'applique.
2. **En tête** : « Ce skill arme la trame de défense ; l'avocat rédige le mémoire. »
3. **Synthèse** : action visée = L.651-2 (comblement) · demandeur = liquidateur · moyens prime (par force) = (1) prescription/recevabilité, (2) rupture de causalité (cause externe), (3) absence de faute / négligence exclue.
4. **Trame — Axe L.651-2** (moyens ordonnés) :
   - **Recevabilité / prescription** : vérifier la **prescription 3 ans** à compter du jugement de LJ `[review]` ; qualité pour agir du liquidateur OK.
   - **Rupture du lien de causalité** : l'insuffisance procède d'une cause **externe** (perte du client unique ~70 % du CA) → moyen fort `[review]` ; réclamer les pièces établissant la cause externe `[à compléter]`.
   - **Absence de faute de gestion** : retard DCP ~10 semaines = grief probable, mais **simple négligence exclue** (L.651-2 al. 2, loi Sapin II 2016) ; comptabilité à jour = élément à verser.
   - **Minoration de la contribution** : pouvoir modérateur du juge ; **ne pas chiffrer** — réclamer l'état du passif et une expertise contradictoire `[à compléter]`.
5. Banqueroute : aucun signal → pas d'articulation pénal/civil à nommer.
6. Sortie : synthèse + trame L.651-2 + pièces à produire + question hors-checklist + arbre 5 options. **Aucun pronostic** d'issue.
</response>
</example>

<example>
<user>/h-da:defense-dirigeant — action combinée du liquidateur : comblement L.651-2 ET interdiction de gérer L.653-8 ; SAS en LJ ; comptes courants d'associé débiteurs importants + locaux partagés avec une autre société du dirigeant ; une plainte pour banqueroute aurait été déposée en parallèle</user>
<response>
**Trame par axe visé** (ne traiter que les axes attaqués) :
- **Axe L.651-2 (+ sous-cas L.652-1)** : les comptes courants débiteurs + locaux confondus fondent vraisemblablement aussi une demande **L.652-1** (obligation aux dettes sociales — confusion de patrimoine), **régime distinct** → défense propre : contester la **confusion** (flux régularisés ? conventions de compte courant ? cloisonnement effectif ?) `[review]` `[à compléter]`. Sur L.651-2 : faute / causalité / minoration ; quantum **non chiffré**.
- **Axe L.653-8 (interdiction de gérer)** : moyens = **cas limitatifs d'interprétation stricte** (le grief allégué entre-t-il exactement dans un cas légal ?) ; caractère **facultatif** (« le tribunal *peut* ») ; **proportionnalité de la durée** (≤ 15 ans, L.653-11) `[review]`.
- **Articulation pénal/civil** : une **banqueroute** (L.654) est poursuivie au pénal → **nommer** le **sursis à statuer** possible devant le juge civil et l'**autorité de la chose jugée** du pénal sur le civil ; **renvoi pénaliste**. Ne PAS plaider la banqueroute ici.
Ne pas pronostiquer l'issue ; chaque moyen en indice `[review]`.
</response>
</example>

<example>
<user>/h-da:defense-dirigeant — SARL en RJ ouverte depuis ~3 mois, le gérant s'inquiète d'une éventuelle action en comblement mais rien n'a encore été engagé</user>
<response>
**Gate non franchi** : **aucune action engagée** (pas d'assignation ni de conclusions). Ce skill arme la défense d'une action **en cours** ; il n'a rien à armer ici.
→ Renvoi `/h-da:responsabilite-dirigeant` : qualifier l'exposition (4 axes), documenter la chronologie en semaines relatives, et préparer les pièces — de sorte que si une action est engagée, la trame de défense parte d'un dossier déjà tenu.
(Ne pas fabriquer une défense préventive sur une action hypothétique.)
</response>
</example>

---

## Chargement du profil

> Lire `~/.claude/plugins/config/hacienda-juridique/hacienda-droit-affaires/CLAUDE.md`, bloc procédures collectives :
> - **Position** — créancier / débiteur / mandataire / mixte (oriente le ton : ici, côté dirigeant **assigné**)
> - **Tribunaux habituels** — repérage du greffe / juridiction saisie
> - **Rôle utilisateur** — avocat inscrit / juriste in-house / non-juriste (en-tête de confidentialité)
> - **Matrice d'approbateurs** — pour l'option « Escalader » (avocat plaidant / pénaliste si banqueroute en jeu)

Si le bloc est `[A CONFIGURER]` : stopper et demander `/h-da:entretien-demarrage`.

---

## Intake

1. **Action engagée** (**obligatoire — gate**) — assignation / conclusions **reçues** ? **axe(s) visé(s)** (L.651-2 / L.652-1 / L.653-8 / faillite personnelle) ? **demandeur** (liquidateur / ministère public / créanciers-contrôleurs sur carence) ? juridiction saisie ? Si **aucune action engagée** → **stopper** et renvoyer `/h-da:responsabilite-dirigeant`.
2. **Forme sociale + qualité du dirigeant** — SAS, SARL, SA… ET dirigeant **de droit** ou **de fait**. Une demande fondée sur la **direction de fait** se conteste aussi sur ce terrain → `[review]`.
3. **Faits chronologiques** — en **semaines relatives** (« ~10 semaines », « ~3 mois »). Ne **jamais** demander ni produire de date calendaire.
4. **Sortie de `responsabilite-dirigeant`** (si disponible) — réutiliser l'évaluation des axes (criticité, facteurs) pour prioriser les moyens. Sinon, le proposer.
5. **Données de défense** (optionnel, `[à compléter]` sinon) — pièces disponibles (comptabilité, PV d'organes, courriels, rapports expert-comptable) ; cause **externe** documentée de la défaillance ; **pluralité de dirigeants** (contribution partageable) ; état du passif communiqué ? ; **banqueroute poursuivie en parallèle** ?

**Routage à l'intake :**
- **Pas d'action engagée** → `/h-da:responsabilite-dirigeant` (le skill ne construit pas de défense sur une action hypothétique).
- **Banqueroute (L.654) au cœur de la poursuite** → renvoi **pénaliste** ; ici, seule l'**articulation** pénal/civil est nommée.

Si l'existence d'une action engagée, la forme sociale ou la qualité du dirigeant sont absentes : stopper et demander. Pas de valeur par défaut.

---

## Gate non-juriste

- [ ] **Action engagée confirmée** (assignation/conclusions reçues) — sinon renvoi `responsabilite-dirigeant` ; le skill ne s'active pas sur une action hypothétique
- [ ] Forme sociale + qualité du dirigeant + axe(s) visé(s) + demandeur fournis (refus du défaut)
- [ ] Profil cabinet bloc procédures collectives lu ; rôle utilisateur (en-tête) et matrice d'approbateurs identifiés
- [ ] **Trame par axe RÉELLEMENT visé** par l'action — ne pas inventer un axe non attaqué ; un axe attaqué non traité est une faute (pas de skip silencieux sur les axes visés)
- [ ] **G4 — ne rédige pas le mémoire** : la sortie est une **trame** (moyens ordonnés + pièces + expertise), jamais un acte de procédure rédigé ; mention en tête « l'avocat rédige le mémoire »
- [ ] **G3 — moyens en indices** `[review]` : aucun **pronostic d'issue** (« vous serez écarté / relaxé ») ; l'issue appartient au tribunal
- [ ] **G2 — quantum** : ne chiffre ni la contribution ni sa minoration ; réclamer l'état du passif / l'expertise contradictoire ; `[à compléter]`
- [ ] **G1 — dates** : semaines relatives uniquement ; aucune date calendaire ni nombre de jours de retard précis
- [ ] **G5 — banqueroute hors plaidoirie** : si poursuivie en parallèle, articulation pénal/civil (sursis à statuer, autorité du pénal sur le civil) **nommée** + renvoi pénaliste ; jamais plaidée
- [ ] **G6 — pas de pièce fabriquée** : lister les pièces à **produire** (`[à compléter]`) ; ne présupposer l'existence d'aucune pièce ni d'aucune cause externe non établie
- [ ] **Prescription / recevabilité testées en premier** sur chaque axe (L.651-2 : 3 ans à compter du jugement de LJ ; qualité pour agir)
- [ ] Aucune **fabrication** : ni date, ni chiffre, ni pièce, ni demandeur non fourni — `[à compléter]` partout où la donnée manque
- [ ] Sortie : synthèse stratégie en tête + trame par axe visé + pièces/expertise + question hors-checklist + arbre 5 options ; en-tête de confidentialité selon rôle ; note du relecteur en bloc unique

---

## Outils MCP à privilégier

Appeler les outils par leur nom exact quand le serveur `Hacienda Droit des Affaires` est disponible. Ne pas inventer de tool hors périmètre ; si une source n'a pas été consultée directement, garder `[à vérifier]`.

- Socle sources officielles : `piste_status`, `legifrance_recherche`, `legifrance_get_article`, `judilibre_recherche`, `judilibre_get_decision`, `eurlex_recherche`, `eurlex_consulter`.
- Identité entreprise (forme sociale, dirigeants, mandats) : `company_full_profile`, `bodacc_by_siren`.
- **`bodacc_procedures` autorisé** : confirme l'ouverture de la procédure, le mandataire désigné et le stade — utile pour situer l'action et le point de départ de la prescription.
- Jurisprudence à privilégier : faute de gestion / simple négligence (L.651-2 al. 2), rupture de causalité avec l'insuffisance d'actif, cas limitatifs L.653-8, proportionnalité des sanctions, prescription triennale de l'action en comblement.
- Tout résultat issu d'un corpus client ou d'un outil interne reste distingué des sources primaires officielles.

## Emplacement des sorties

```
outputs/defense-dirigeant-<denomination-ou-siren>-<axe>.md
```
`<axe>` : `l651-2` / `l652-1` / `l653-8` / `faillite-perso` / `combine`. Format date des noms : `YYYY-MM-DD` si une date de génération est ajoutée.

---

## Sortie

Structurer la sortie avec : faits retenus, axe(s) visé(s), moyens de défense ordonnés par force, pièces à produire, incertitudes, sources consultées, décisions proposées, prochaine action et validation humaine. Toute source non consultée directement reste `[à vérifier]`.

### Étape 1 — Cadrage

1. **Vérifier le gate** : action engagée ? Si non → renvoi `responsabilite-dirigeant`, stop.
2. Lire profil cabinet (bloc procédures collectives) et `~/.claude/plugins/config/hacienda-juridique/company-profile.md`.
3. Confirmer **axe(s) visé(s)**, **demandeur**, **qualité dirigeant** (droit/fait). Réutiliser la sortie de `responsabilite-dirigeant` si fournie.

### Étape 2 — Trame de défense par axe visé (ne traiter que les axes attaqués)

**Axe L.651-2 (contribution à l'insuffisance d'actif) — moyens ordonnés par force.**
1. **Recevabilité / prescription** : **prescription 3 ans** à compter du jugement de LJ (ou de résolution du plan) ; **qualité pour agir** limitée (liquidateur / MP / contrôleurs sur carence). `[review]`.
2. **Absence de faute de gestion** : distinguer faute / **simple négligence expressément exclue** (L.651-2 al. 2, loi Sapin II du 9 déc. 2016) ; une décision de gestion à risque n'est pas une faute caractérisée. Verser les pièces (comptabilité, PV) `[à compléter]`.
3. **Rupture du lien de causalité** : l'insuffisance procède de causes **externes** (marché, perte d'un client majeur, conjoncture) ou d'une faute **sans lien** avec l'insuffisance invoquée ; pluralité de causes. `[review]`.
4. **Contestation / minoration de la contribution** : pouvoir **modérateur** du juge ; proportionnalité faute / contribution ; contribution **partagée** si pluralité de dirigeants (pas de solidarité sauf décision motivée). **Ne pas chiffrer** — réclamer l'état du passif + expertise contradictoire `[à compléter]`.
5. **Moyens procéduraux** : nullités, expertise contradictoire, communication forcée de pièces.

**Axe L.652-1 (obligation aux dettes sociales — sous-cas).**
- Régime **distinct** de L.651-2. Défense : contester la **confusion de patrimoine** (flux régularisés, conventions de compte courant, cloisonnement effectif des locaux/personnel) ou la **fictivité** de la personne morale `[review]` `[à compléter]`.

**Axe L.653-x (sanctions personnelles).**
- Interdiction de gérer (L.653-8) / faillite personnelle (L.653-3 à L.653-5) : moyens =
  - **cas limitatifs d'interprétation stricte** — le grief allégué entre-t-il exactement dans un cas légal ? ;
  - caractère **facultatif** (« le tribunal *peut* ») ;
  - **proportionnalité** de la sanction **et de la durée** (≤ 15 ans, L.653-11).

> Chaque moyen est présenté en **argument mobilisable `[review]`**, jamais « moyen gagnant » ni pronostic d'issue.

### Étape 3 — Articulation pénal/civil, fraîcheur, post-flight

- **Articulation pénal/civil** (si banqueroute L.654 poursuivie en parallèle) : **nommer** le **sursis à statuer** possible et l'**autorité de la chose jugée** du pénal sur le civil ; **renvoi pénaliste**. Ne pas plaider la banqueroute.
- Vérifier la **fraîcheur** de la jurisprudence (ch. com. < 3 ans) sur simple négligence / causalité / cas L.653-8 / prescription via `judilibre_recherche` ; mode dégradé documenté si PISTE indisponible.
- Post-flight `verifier-citations` sur la sortie complète. Articles à vérifier : **L.651-1, L.651-2, L.651-3, L.652-1, L.653-1, L.653-3, L.653-4, L.653-5, L.653-8, L.653-11, L.654-1, L.654-2 C.com.** Tag `[Légifrance]` uniquement si l'article a été lu via `legifrance_get_article` dans la session (l'index `${CLAUDE_SKILL_DIR}/../../references/articles-c-civ-c-com-index.md` donne les identifiants, ce n'est pas une vérification) ; sinon `[à vérifier]`.

### Format livrable

```
[En-tête de confidentialité selon le rôle utilisateur — voir CLAUDE.md du plugin]

> ⚠️ Note du relecteur
> - **Sources :** Légifrance ✓ / Judilibre ✓ / Pappers ✓ / BODACC ✓ (cocher ✗ si non connectée) ; articles lus dans cette session : {liste} ; autres citations `[à vérifier]`
> - **Lecture :** pièces fournies : {liste} | sortie responsabilite-dirigeant | aucune
> - **Signalé pour ton jugement :** {N éléments [review] en ligne}
> - **Fraîcheur :** jurisprudence post-{date} sur simple négligence / causalité / L.653-8 — {N} arrêts [Judilibre] | recherche impossible
> - **Avant de t'appuyer dessus :** {action concrète — ex. vérifier le point de départ de la prescription au jugement de LJ ; réunir les pièces établissant la cause externe ; obtenir l'état du passif}

# Synthèse — Stratégie de défense
- Action visée : {L.651-2 / L.652-1 / L.653-8 / faillite personnelle} · demandeur : {liquidateur / MP / contrôleurs}
- Moyens prime (par force) : {1. … · 2. … · 3. …} [review]
- Banqueroute parallèle ? {oui → articulation pénal/civil nommée + renvoi pénaliste | non}
- **Ce skill arme la trame ; l'avocat rédige le mémoire (acte de procédure).**

# Faits retenus
{chronologie sobre, en semaines relatives, sans dates calendaires}

# Trame de défense — Axe {L.651-2 / L.652-1 / L.653-x}
- Moyens mobilisables, ordonnés par force [review]
- Confrontation aux faits du dossier
- Pièces à produire [à compléter] · expertise à demander
- Quantum : non chiffré — réclamer l'état du passif

# Articulation pénal/civil (si banqueroute parallèle)
- Sursis à statuer possible · autorité de la chose jugée du pénal sur le civil · renvoi pénaliste

# Une question hors de ma checklist
{observation honnête — ex. point de départ exact de la prescription, qualité pour agir des contrôleurs, pluralité de dirigeants ouvrant un partage de contribution. Omettre si rien d'honnête.}

# Que veux-tu faire ? Choisis une option et je la déroule :
1. **Rédiger** — note stratégique de défense (trame des moyens, pièces, expertise) pour l'avocat plaidant.
2. **Escalader** — note vers {avocat plaidant / contentieuiste / pénaliste si banqueroute en jeu} : axe(s) visé(s), moyens prime, pièces manquantes, décision attendue.
3. **Compléter les pièces** — questions à l'expert-comptable / dirigeant (état du passif, pièces de la cause externe, conventions de compte courant, jugement de LJ pour la prescription).
4. **Surveiller et attendre** — j'ajoute le dossier au tracker (échéance de conclusions, date d'audience exprimée en délai relatif).
5. **Autre** — précise.
```

### Mode silencieux (note destinée au dirigeant non-juriste)

Si le livrable est adressé directement au dirigeant : couper la narration de skill, sortir les renvois inter-commandes dans une note séparée, conserver l'en-tête de confidentialité adapté au rôle et une note du relecteur condensée. **Pas de mode externe** vers le tribunal : le mémoire en défense est un autre livrable (avocat). La trame reste un document de travail interne.

### Log de vérification

```
Sources consultées : [tags utilisés]
Citations vérifiées : [oui / non / partiel — état PISTE]
Date d'analyse : YYYY-MM-DD
```

---

## Ce skill ne fait pas

- **Rédiger le mémoire / les conclusions** en défense (l'acte de procédure = avocat) — il fournit la **trame** de moyens.
- **Pronostiquer l'issue** (« vous serez écarté / relaxé ») — moyens en indices `[review]` ; l'issue relève du tribunal.
- **Chiffrer** la contribution ou sa minoration (piège fabrication) — `[à compléter]`, réclamer l'état du passif.
- **Plaider la banqueroute** (L.654) — pénal : renvoi pénaliste ; seule l'articulation pénal/civil est nommée.
- **Inventer un axe non visé** par l'action — ne traiter que les axes réellement attaqués.
- **S'activer hors contentieux** (action non engagée) — renvoi `responsabilite-dirigeant`.
- Le conseil **fiscal** (solidarité fiscale du dirigeant, L.267 LPF) — nommé si signaux, sinon hors scope ; renvoi.
- **Fabriquer** des dates (semaines relatives uniquement) ou des **pièces** (`[à compléter]`).

---

## Ton

Technique, factuel, **combatif mais mesuré**. La défense s'arme par des moyens de droit ordonnés, pas par des promesses : nommer les moyens, les hiérarchiser, dire honnêtement lesquels sont fragiles, et renvoyer la rédaction de l'acte et le pronostic à l'avocat. Ne jamais survendre un moyen ni pronostiquer une relaxe. Le dirigeant est exposé sur son patrimoine personnel : le brouillon est soumis à validation humaine (avocat), pénaliste si une banqueroute est poursuivie.
