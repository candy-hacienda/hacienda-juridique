---
name: spa-review
description: >
  Revue d'un SPA / protocole de cession / acte de cession M&A de droit
  français. Analyse l'architecture du deal, prix, conditions suspensives,
  covenants d'interim, MAC, disclosure, garanties, indemnisation, renvois GAP,
  cohérence DD et readiness signing/closing. Side acquéreur ou cédant
  obligatoire. Brouillon soumis à validation avocat M&A.
version: "2.0.0"
argument-hint: "[SPA/protocole, side, data-room, points de négociation]"
authors: ["Hacienda"]
tags: [spa, ma, cession-titres, protocole-cession, signing, closing, gap]
---

# Skill — SPA review

> **BROUILLON, VALIDATION AVOCAT M&A OBLIGATOIRE.**
>
> Ce skill analyse un SPA / protocole de cession / acte de cession dans une
> opération M&A de droit français. Il produit une liste de points de négociation
> et un résumé partner-ready. Il ne signe pas le contrat, ne rédige pas un SPA
> complet à partir de zéro, et ne remplace pas une validation humaine par un
> avocat M&A inscrit au barreau.
>
> **Frontière avec les autres skills.** `spa-review` traite l'architecture du
> SPA et les points de cohérence. La GAP technique reste traitée par
> `/h-da:gap-review`. Le pilotage signing / closing /
> post-closing reste traité par `/h-da:closing-checklist-fr`.
> L'audit data-room reste traité par `/h-da:due-diligence-dataroom`.

---

## Examples

<example>
<user>/h-da:spa-review ./SPA-cible-X.pdf --side=acquereur --type=cession-titres --prix=12000000 --dd-findings=./rapport-dd.md</user>
<response>
1. Lecture profil cabinet, bloc M&A / Corporate.
2. Identification : SPA de cession de 100 % des titres d'une SAS, signing et closing différés, prix 12 M EUR.
3. Analyse des axes SPA : deal facts, pouvoirs, CP, interim covenants, MAC, prix, disclosure, GAP, DD, closing.
4. Findings principaux : disclosure letter absente 🔴 ; clause de changement de contrôle client clé non traitée 🔴 ; plafond GAP 8 % du prix 🟠 ; non-concurrence cédant 7 ans 🟠.
5. Renvoi `gap-review` pour la mécanique financière de garantie et `closing-checklist-fr` pour les CP / formalités.
6. Sortie partner-ready : résumé exécutif, red flags, liste de points, recommandation "ne pas signer en l'état".
</response>
</example>

<example>
<user>/h-da:spa-review ./SPA-sell-side.pdf --side=cedant --type=cession-titres --red-flags</user>
<response>
Mode `--red-flags`, côté cédant. La sortie se concentre sur les blocages : MAC trop large, garantie de la garantie non plafonnée, covenant d'interim empêchant l'exploitation normale, earn-out discrétionnaire. Les points mineurs sont reportés en annexe courte.
</response>
</example>

<example>
<user>/h-da:spa-review ./SPA.pdf --side=acquereur --signing-ready</user>
<response>
Gate signing-ready : le SPA n'est pas prêt à signer. Trois prérequis manquent : disclosure letter annexée, décisions sociales d'agrément, confirmation de levée d'une CP réglementaire. Le skill recommande de lancer `closing-checklist-fr` après correction.
</response>
</example>

<example>
<user>/h-da:spa-review ./SPA-portefeuille-PI.pdf --side=acquereur --type=cession-titres</user>
<response>
Détection d'un portefeuille PI structurant dans les actifs de la cible : marques, logiciel, open source, noms de domaine. `spa-review` traite l'architecture M&A et signale les protections SPA nécessaires, puis renvoie vers `/h-pi:audit-pi-ma` ou `/h-pi:contrats-pi` pour l'analyse PI approfondie.
</response>
</example>

---

## Chargement du profil

> Lire `~/.claude/plugins/config/hacienda-juridique/hacienda-droit-affaires/CLAUDE.md`, bloc M&A / Corporate :
> - **Side habituel M&A** — cédant / acquéreur / conseil des deux.
> - **Posture SPA** — protecteur / équilibré / facilitateur.
> - **Taille de deals typique** — pour calibrer matérialité et niveau de détail.
> - **Matrice d'approbateurs** — ligne "Signature SPA".
> - **Posture GAP par défaut** — pour détecter les écarts grossiers avant renvoi `gap-review`.

Si le profil n'est pas encore peuplé (`[A CONFIGURER]` présent), stopper et
demander `/h-da:entretien-demarrage` avant toute revue SPA
substantielle.

---

## Intake

1. **Mode** — `--review` par défaut ; options de sortie `--red-flags`, `--issues-list`, `--signing-ready` ; **`--distressed`** (overlay « cible en difficulté » — charge `${CLAUDE_SKILL_DIR}/../../references/distressed-overlay-fr.md`). Hors `--distressed`, si des **signaux de difficulté** sont détectés (procédure collective, cessation des paiements, prix symbolique + reprise de passif, déclaration de créance, sûretés récentes pour dettes antérieures), **proposer** l'overlay sans l'imposer. **`--pe`** (overlay Private Equity, side sponsor — charge `${CLAUDE_SKILL_DIR}/../../references/pe-spa-gap-overlay-fr.md`) avec `--side=sponsor` (défaut) ou `--side=cedant` (`--side=sponsor` ≡ côté acquéreur ; `--side=cedant` ≡ côté cédant sponsor). Hors `--pe`, si des **signaux PE** (sponsor/BidCo/management package/rollover/ratchet/liquidation preference) sont détectés, **proposer** l'overlay sans l'imposer.
2. **Fichier SPA** — chemin du PDF / DOCX / Markdown.
3. **Side** — `--side=acquereur` | `--side=cedant` (**obligatoire**). Une analyse neutre d'un SPA n'a pas de sens praticien.
4. **Type d'opération** — `--type=cession-titres` | `--type=cession-fonds` | `--type=asset-deal` | `--type=fusion`. Si absent, auto-détecter puis demander confirmation.
5. **Prix** — `--prix=12000000` si disponible ; sert à calibrer seuils, escrow, plafonds et matérialité.
6. **Findings DD** — `--dd-findings=./rapport-dd.md` optionnel ; active la confrontation DD -> protections SPA.
7. **GAP séparée** — `--gap=./GAP-annexe.pdf` optionnel ; si fourni, renvoyer explicitement vers `gap-review` pour l'analyse technique.

---

## Gate non-juriste

- [ ] Side fourni ou confirmé.
- [ ] Type d'opération fourni ou confirmé.
- [ ] Profil M&A lu.
- [ ] Renvois GAP / closing / DD / PI / fiscal / social / réglementaire faits quand nécessaires.
- [ ] Liste de points triée par criticité, sans doublon.
- [ ] Citations vérifiées ou taguées `[à vérifier]`.
- [ ] Sortie contient note 5 champs + arbre 5 options.

## Outils MCP à privilégier

Appeler les outils par leur nom exact quand le serveur `Hacienda Droit des Affaires` est disponible. Ne pas inventer de tool hors périmètre ; si une source n'a pas été consultée directement, garder `[à vérifier]`.

- Socle sources officielles : `piste_status`, `legifrance_recherche`, `legifrance_get_article`, `judilibre_recherche`, `judilibre_get_decision`, `eurlex_recherche`, `eurlex_consulter`.
- Entreprises, BODACC et procédures collectives : `company_full_profile`, `bodacc_by_siren`, `bodacc_procedures`.
- Points sociaux de due diligence : `boss_recherche`, `boss_get_document`. Points fiscaux : `bofip_rechercher` / `bofip_consulter` ne donnent que des circulaires ministérielles (fonds CIRC), **pas la base BOFiP-Impôts** — toute doctrine fiscale reste `[à vérifier]` sur bofip.impots.gouv.fr, sans tag `[BOFiP]`.
- Tout résultat issu d'un corpus client ou d'un outil interne reste distingué des sources primaires officielles.

## Emplacement des sorties

Écrire les livrables dans le dossier de pratique ou de dossier configuré : `~/.claude/plugins/config/hacienda-juridique/hacienda-droit-affaires/outputs/` ou `~/.claude/plugins/config/hacienda-juridique/hacienda-droit-affaires/matters/<slug-dossier>/outputs/`.

## Sortie

### Format livrable

```
[En-tête de confidentialité selon le rôle utilisateur]

> **⚠️ Note du relecteur**
> - **Sources :** Légifrance ✓ / Judilibre ✓ / Pappers ✓ / BODACC ✓ (cocher ✗ si non connectée) ; articles lus dans cette session : {liste} ; autres citations `[à vérifier]`
> - **Lecture :** intégrale ({N} pages SPA + {M} annexes) | partielle (pages X à Y)
> - **Signalé pour ton jugement :** {N} éléments marqués [review] | aucun
> - **Fraîcheur :** recherche juridique post-{date} — {N} mises à jour intégrées | rien trouvé
> - **Avant de t'appuyer dessus :** {action concrète : négocier / compléter / escalader / prêt pour relecture}

# SPA review — {cible} — {side}

## Étape 1 — Identification

1. Lire le profil cabinet et identifier le side.
2. Identifier le document : SPA / protocole de cession / acte de cession / asset purchase agreement.
3. Confirmer le type d'opération : cession de titres, cession de fonds, asset deal ou fusion.
4. Identifier parties, cible, prix, signing, closing, droit applicable, juridiction, annexes mentionnées.
5. Détecter SIREN cible si présent et tenter l'enrichissement `company_full_profile` via les outils core disponibles.

---

## Étape 2 — Deal facts et périmètre

Vérifier :

- titres ou actifs cédés ;
- pourcentage cédé ;
- prix fixe, prix ajustable, locked box, completion accounts, earn-out ;
- date d'effet économique ;
- signing / closing simultanés ou différés ;
- annexes nécessaires au périmètre : cap table, statuts, comptes, dette nette, BFR, liste des contrats clés.

Tout périmètre ambigu est au minimum 🟠, car il contamine le prix, la GAP et le closing.

---

## Étape 3 — Capacité, pouvoirs et restrictions sur titres

Vérifier :

- pouvoirs des signataires ;
- décisions sociales d'autorisation ;
- agrément, préemption, inaliénabilité, droit de sortie conjointe ou forcée ;
- nantissements ou sûretés sur titres ;
- restrictions statutaires ou pacte d'associés.

Si le sujet relève d'une revue de pacte ou statuts complexe, renvoyer vers
`pacte-associes-review` ou `gouvernance-ag` selon le besoin.

---

## Étape 4 — Conditions suspensives et consentements

Recenser chaque CP : objet, bénéficiaire, responsable, délai, preuve de levée,
faculté de renonciation. Vérifier notamment financement, agrément corporate,
autorisation réglementaire, contrôle des investissements étrangers, contrôle
des concentrations, consentements de cocontractants clés.

Une CP nécessaire mais absente est 🔴. Une CP rédigée de façon potestative ou
trop discrétionnaire est 🟠 avec tag `[review]`.

**Objectiver les CP sous contrôle de l'acquéreur.** Les CP que l'acquéreur
maîtrise — typiquement l'**obtention du financement** et la **satisfaction des
diligences** — doivent être encadrées par des **critères objectifs** et une
**obligation d'efforts** (reasonable best efforts, montant/type de financement,
documentation, date butoir, conséquences de l'échec). Une condition dont la
réalisation dépend de la **seule volonté de l'acquéreur** est **potestative** et
expose à la nullité (art. 1304 et 1304-3 C.civ : la condition
suspensive qui dépend de la seule volonté du débiteur est nulle ; rappeler que
la défaillance de la condition provoquée par la partie qui y avait intérêt est
réputée accomplie). Côté acquéreur, une CP financement « à sa libre
appréciation » est un faux confort : attaquable et source de contentieux. 🟠/🔴.

---

## Étape 5 — Période intercalaire, MAC et résiliation

Vérifier :

- covenants d'interim : ordinary course, dette, investissements, embauches, contrats clés ;
- information de l'acquéreur pendant l'interim period ;
- clause MAC : définition, exclusions, seuil, effet ;
- droit de résiliation pré-closing ;
- leakage interdit ou autorisé en locked box.

La MAC et les covenants sont side-dependent : côté acquéreur, rechercher une
protection réelle ; côté cédant, limiter les clauses trop discrétionnaires ou
paralysantes.

---

## Étape 6 — Prix, ajustements et paiement

Vérifier :

- mécanisme locked box ou completion accounts ;
- leakage autorisé / interdit ;
- earn-out : formule déterminable, durée, gouvernance post-closing, audit ;
- séquestre / escrow ;
- mécanisme d'expertise ;
- calendrier de paiement.

Un earn-out sans formule déterminable ou sans gouvernance post-closing est 🟠
ou 🔴 selon matérialité.

**Mécanique du leakage (locked box) — protection acquéreur.** En locked box,
exiger que **tout leakage non autorisé soit remboursé euro pour euro** par les
cédants, avec : définition précise du leakage (et liste limitative du *permitted
leakage*), **procédure de notification**, intérêts le cas échéant, et surtout
une indemnisation **hors plafond et hors franchise de la GAP** (la restitution
d'une sortie de valeur indue n'est pas un sinistre de garantie). Une clause qui
limite la protection au seul « leakage significatif » ou la soumet au plafond
GAP (souvent 8-15 % du prix) est 🔴 côté acquéreur : elle vide la locked box de
son effet. `[review]`.

**Ancrage doctrinal — déterminabilité du prix.** Un complément de prix dont le
montant dépend de la seule appréciation discrétionnaire ou « de bonne foi » d'une
partie (formule du type « si la performance est satisfaisante ») n'est pas un prix
**déterminé ou déterminable par des éléments objectifs** : il heurte les art. 1591
et 1163 C.civ et expose à un **risque de nullité** de la stipulation
de prix (voire de la vente). C'est le grief premier — pas seulement l'exécution de
bonne foi (1104) ni le contentieux post-closing. Exiger des **critères objectifs**
(EBITDA / CA / marge définis, retraitements, période) ; l'**expertise d'un tiers
art. 1592 C.civ** est une *solution* de détermination, pas une
justification du caractère discrétionnaire. Côté acquéreur, une rédaction
discrétionnaire en sa faveur est un faux confort : elle est attaquable.

---

## Étape 7 — Déclarations, garanties, indemnisation et disclosure

Analyser l'architecture générale :

- déclarations fondamentales ;
- déclarations business ;
- disclosure letter et annexes ;
- exclusions ;
- indemnisation ;
- articulation avec GAP.

Ne pas refaire `gap-review`. Si les clauses de garantie sont substantielles,
renvoyer vers `/h-da:gap-review` avec les paramètres déjà
extraits : side, prix, fichiers et findings DD.

---

## Étape 8 — Confrontation DD -> protections SPA

Si `--dd-findings` est fourni, créer un tableau :

| Finding DD | Gravité DD | Protection SPA attendue | Protection trouvée | Statut |
|---|---|---|---|---|

Pour chaque finding matériel, vérifier qu'il est traité par au moins une
protection : CP, déclaration spécifique, indemnité spécifique, escrow, réduction
de prix, engagement post-closing ou abandon documenté.

**Ancrage doctrinal — matérialité et consentement.** Un finding DD structurant
pour la valeur ou le consentement de l'acquéreur (dépendance client, clause de
changement de contrôle sur un contrat clé, litige majeur, perte d'un actif
essentiel) ne se traite pas seulement en risque commercial : il engage le
**devoir précontractuel d'information art. 1112-1 C.civ** à la
charge des cédants et, en cas de rétention d'une information déterminante, ouvre
le terrain des **vices du consentement (réticence dolosive, erreur — art. 1130 et
1137 C.civ)**. Conséquence pratique : exiger une **déclaration
spécifique** couvrant le point, une **indemnité dédiée** ou un ajustement de prix,
et qualifier explicitement la matérialité (ex. un client > 20-30 % du CA est
présumé structurant `[review]`). Minimiser un tel finding est une faute d'analyse,
pas un choix de négociation.

Si aucun finding DD n'est fourni, mentionner : "Confrontation DD non exécutée ;
un SPA ne peut pas être considéré signing-ready sans revue des findings DD."

---

## Étape 9 — Covenants restrictifs et post-closing

Vérifier non-concurrence cédant, non-sollicitation, confidentialité,
accompagnement post-closing, transition services, obligations de coopération.
Taguer `[review]` sur durée, territoire, activité et contrepartie.

**Formalités sociétaires (cession de titres SAS).** Signaler la vérification des
**statuts de la cible** (clauses d'agrément, préemption, inaliénabilité) et de la
**chaîne de propriété des titres** : une cession contraire à une clause statutaire
d'agrément est **nulle** (art. L.227-15 C.com.). Au closing, le
transfert s'opère par inscription au **registre de mouvements de titres** + mise à
jour des comptes d'associés — renvoyer `closing-checklist-fr` pour l'exécution.

**Formalités sociales.** Pour une cible d'un effectif significatif, vérifier les
obligations d'**information-consultation du CSE** (art. L.2312-8 / L.2312-37
C. trav.) et, si les conditions PME sont réunies, l'**information
des salariés** (art. L.23-10-7 C.com.) — leur omission peut
fragiliser l'opération. Renvoyer `hacienda-social`.

**Sanctions contractuelles.** Vérifier que le leakage, la violation des covenants
intercalaires et la non-concurrence sont assortis de **sanctions efficaces**
(indemnité, clause pénale, exécution forcée). Rappeler le pouvoir de **modération
judiciaire d'une clause pénale manifestement excessive ou dérisoire** (art.
1231-5 C.civ) : calibrer le montant, ni dérisoire ni confiscatoire.

---

## Étape 9bis — Overlay difficulté (si `--distressed` ou overlay accepté)

**N'exécuter que si le mode distressed est actif.** Charger `${CLAUDE_SKILL_DIR}/../../references/distressed-overlay-fr.md` et appliquer sa grille **side-aware** au SPA :

1. **Gate barre** : si la cible est **déjà en RJ/LJ avec appel d'offres ouvert**, STOP overlay → renvoi `/h-da:reprise-a-la-barre` / `/h-da:cession-actifs-isoles` (l'acte serait judiciaire, pas un SPA privé).
2. **D1 — période suspecte / nullités** (L.632-1 de droit / L.632-2 facultatives) : le timing du deal expose-t-il à une nullité ? clauses à risque (prix anormalement bas, paiement préférentiel, sûreté pour dette antérieure). **Ne pas dater** la cessation des paiements ; nullité = risque `[review]`.
3. **D2 — passif non purgé** (share deal) : la GAP couvre-t-elle l'antérieur non révélé + une procédure future ?
4. **D3 — garantie de la garantie** : séquestre / GAPD / caution exigés face à un cédant fragile ; sinon protection théorique → renvoi `/h-da:gap-review --distressed`.
5. **D4/D5** : transferts & solidarités (L.1224-1, L.1684 CGI/L.267 LPF, ICPE — cross-link, renvoi) ; MAC + CS « absence de procédure ».
6. **Exposition dirigeant cédant** : nommer et renvoyer `/h-da:responsabilite-dirigeant` ; ne pas évaluer.

Sortir les findings distressed dans la liste de points (sévérité 🟢🟡🟠🔴) et une ligne dédiée du résumé. **Ne pas chiffrer** le passif (`[à compléter]`).

---

## Étape 9ter — Overlay PE (si `--pe` ou overlay accepté)

**N'exécuter que si le mode PE est actif.** Charger `${CLAUDE_SKILL_DIR}/../../references/pe-spa-gap-overlay-fr.md`
et appliquer ses axes **side-aware sponsor** au SPA :
1. **S1 — mécanisme de prix PE** : locked box vs completion accounts ; leakage hors plafond GAP `[review]`.
2. **S2 — certain funds & financement** : CP financement, ECL/DCL, BidCo SPV ; condition de financement résiduelle = risque d'exécution `[review]`.
3. **S3 — MAC & période intercalaire** : MAC PE, interim covenants, antitrust/IEF/CSE en CP `[à vérifier]`.
4. **S4 — rollover & management package** : cohérence SPA↔pacte → renvoi `/h-da:pacte-associes-review --pe` ; instruments → `/h-da:financement-startup` ; **requalif fiscale/sociale nommée et renvoyée, jamais traitée**.
5. **S5 — garanties, W&I & funds flow** : articulation GAP/W&I → renvoi `/h-da:gap-review --pe` ; security for claims ; funds flow → `/h-da:closing-checklist-fr --pe`.

**Gate France/Lux** (cf. module partagé) : entité/docs fonds Lux → STOP overlay, renvoi conseil luxembourgeois ; l'overlay couvre la jambe FR. Sortir les findings PE dans la liste de points (sévérité 🟢🟡🟠🔴) et une ligne dédiée du résumé. **Ne pas chiffrer** le leakage / l'ajustement de prix (`[à compléter]`) ; **ne pas dater** le closing (semaines relatives). Si la cible est aussi en difficulté, **les overlays `--pe` et `--distressed` s'empilent** sans se dupliquer.

---

## Étape 10 — Renvois et liste de points

Produire les renvois actifs :

- `gap-review` pour la GAP technique ;
- `closing-checklist-fr` pour CP, signing, closing, post-closing ;
- `due-diligence-dataroom` si les findings DD manquent ;
- `/h-pi:contrats-pi` (ou `/h-pi:audit-pi-ma`) pour PI — toujours le namespace court `/h-pi:`, jamais la forme longue du nom de plugin ;
- `hacienda-fiscal` pour fiscalité ;
- `hacienda-social` pour social ;
- `hacienda-reglementaire` pour autorisations sectorielles.

Appeler mentalement le format `liste-de-points` : tableau trié par criticité
décroissante, sans doublon, avec position souhaitée et formulation proposée.

---

## Étape 11 — Post-flight `verifier-citations`

Vérifier les citations d'articles et de jurisprudence. Les points non vérifiés
restent `[à vérifier]`. N'est « vérifié » que ce qui a été lu par un appel outil
dans cette session (CLAUDE.md §2) : les articles cités dans ce skill sont des
pistes, à lire avant de les dire vérifiés. Les sujets fiscaux, sociaux, PI, AMF ou réglementaires
non traités par une source primaire consultée restent `[à vérifier]`.

---

## Résumé exécutif

{Trois phrases partner-ready : bottom-line, risque dominant, prochaine action.}

## Deal facts

| Champ | Lecture |
|---|---|
| Type d'opération | ... |
| Cible | ... |
| Prix | ... |
| Signing / closing | ... |
| Mécanisme de prix | locked box / completion accounts / earn-out / autre |

## Red flags

| # | Sujet | Statut | Pourquoi ça compte | Action |
|---|---|---|---|---|

## Overlay difficulté (si `--distressed`)
- Gate barre : {cible à la barre → renvoi reprise/cession-actifs | deal privé, overlay appliqué}
- Période suspecte / nullités (L.632-1/2) : {risque [review] | sans objet}
- Passif non purgé + garantie de la garantie : {état | à compléter}
- Renvois distressed : {gap-review --distressed / responsabilite-dirigeant / asset-vs-share-distress}

## Overlay PE (si `--pe`)
- Side : {sponsor | cedant}
- Findings par axe : {S1 prix · S2 certain funds · S3 MAC · S4 rollover · S5 W&I/funds flow}
- Renvois PE : {pacte-associes-review --pe / gap-review --pe / financement-startup / closing-checklist-fr --pe}

## Analyse par axes

1. Deal facts et périmètre
2. Capacité / pouvoirs / restrictions sur titres
3. Conditions suspensives
4. Interim covenants / MAC
5. Prix / ajustements / paiement
6. Garanties / indemnisation / disclosure
7. DD -> protections SPA
8. Covenants restrictifs / post-closing

## Liste de points

| # | Clause | Statut | Risque | Position souhaitée ({side}) | Formulation proposée |
|---|---|---|---|---|---|

## Renvois recommandés

| Sujet | Skill |
|---|---|

## Recommandation

{Signer / Négocier / Ne pas signer / Compléter} — justification 2-3 lignes.

## Une question hors de ma checklist habituelle

{Observation transversale, ou omission si rien d'honnête à dire.}

## Que veux-tu faire ? Choisis une option :

1. **Rédiger** — je prépare un courrier de négociation ou une liste de points prête à envoyer.
2. **Escalader** — je rédige une note vers {approbateur SPA configuré}.
3. **Compléter les faits** — je liste les questions à poser à l'équipe deal, au client ou à la contrepartie.
4. **Surveiller et attendre** — j'ajoute le sujet au tracker du dossier avec date de revisite.
5. **Autre** — précise.
```

### Modes courts

- `--red-flags` : ne produire que Note du relecteur, Résumé exécutif, Red flags, Recommandation, Arbre 5 options.
- `--issues-list` : ne produire que Note du relecteur, Deal facts, Liste de points, Renvois, Arbre 5 options.
- `--signing-ready` : produire un verdict `Prêt à signer` / `Pas prêt à signer` / `Prêt sous conditions`, avec conditions manquantes.

## Ce skill ne fait pas

- Rédiger un SPA complet à partir de zéro.
- Signer ou valider définitivement le SPA.
- Refaire l'analyse technique de la GAP : utiliser `gap-review`.
- Piloter le closing : utiliser `closing-checklist-fr`.
- Auditer une data-room complète : utiliser `due-diligence-dataroom`.
- Donner un avis fiscal, social, PI, réglementaire ou AMF détaillé.
- **Dater** la cessation des paiements ou la période suspecte en mode `--distressed` — semaines relatives ; la date est fixée par le tribunal (`[à compléter]`).
- **Couvrir une cession judiciaire à la barre** — dès que la cible est en RJ/LJ avec appel d'offres ouvert, renvoi `/h-da:reprise-a-la-barre` / `/h-da:cession-actifs-isoles`.
- **Traiter au fond** la requalification fiscale/sociale du management package en mode `--pe` (nommée et renvoyée).
- **Structurer/rédiger** les instruments du management package (→ `/h-da:financement-startup`).
- **Chiffrer** le leakage / l'ajustement de prix (`[à compléter]`).

## Ton

Technique, direct, partner-ready. Toujours rappeler le side. Prioriser les
points qui changent la négociation, le signing ou le prix. Ne pas fabriquer de
findings de remplissage.
