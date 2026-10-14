---
name: declaration-creance
description: >
  Rédige une déclaration de créance art. L.622-24 C.com. dans le cadre d'une
  procédure collective (sauvegarde, redressement, liquidation). Calcule
  automatiquement la date de forclusion (2 mois post-publication BODACC,
  4 mois si créancier hors UE/EEE). Lookup BODACC via
  `bodacc_procedures` de `@hacienda/core` pour récupérer
  type de procédure, date jugement, date publication et mandataire désigné
  (lus sur l'avis d'ouverture désigné par l'outil, fallback `[à vérifier]`).
  Format conforme aux usages mandataire judiciaire. Brouillon, validation
  avocat/mandataire obligatoire.
version: "2.0.0"
argument-hint: "[SIREN débiteur, créance, jugement, publication BODACC ; --releve-forclusion pour la requête L.622-26]"
authors: ["Hacienda"]
tags: [procedures-collectives, declaration-creance, forclusion, bodacc, l622-24]
---

# Skill — Déclaration de créance L.622-24

> **BROUILLON, validation humaine (avocat)/MANDATAIRE OBLIGATOIRE.**
>
> Le délai de forclusion **2 mois** à compter de la publication BODACC du jugement d'ouverture (art. L.622-24 C.com.) est une **règle dure** : passé ce délai, la créance est éteinte sauf relevé de forclusion exceptionnel art. L.622-26 C.com. (démontrer que la défaillance n'est pas due au fait du créancier ou que la créance était inconnue du débiteur). Délai porté à **4 mois** pour le créancier domicilié hors France métropolitaine/UE/EEE. Vérification calendrier OBLIGATOIRE.
>
> **Deux versions, deux destinataires.** La réponse du skill s'adresse **d'abord à l'avocat** : c'est la **version interne**, avec note du relecteur et tags de provenance (`[Légifrance]`, `[BODACC]`, `[à vérifier]`) **obligatoires**. Le **courrier au mandataire** (livrable externe, sans en-tête de confidentialité ni tags, cf. CLAUDE.md plugin §2) n'est produit **que sur demande explicite** (option 1 « Rédiger ») — voir « Mode silencieux » à l'Étape 7.

---

## Examples

<example>
<user>/h-da:declaration-creance --siren=123456789 --montant=85000 --nature=facture</user>
<response>
1. Lookup BODACC via `bodacc_procedures`.
   → RJ ouvert 15 mars 2026, publication BODACC 22 mars 2026 `[BODACC]`.
   → Mandataire lu dans le complément du jugement d'ouverture : Maître X (cabinet Y) `[BODACC]` — ou `[à vérifier]` s'il n'y figure pas.
2. Calcul forclusion : 22 mars + 2 mois = 22 mai 2026 → 4 jours restants → 🔴 URGENT.
3. Rédaction déclaration projet (template mandataire) + récapitulatif + pièces à joindre.
4. Note du relecteur : forclusion serrée, envoi LRAR sous 24-48h recommandé.
</response>
</example>

<example>
<user>/h-da:declaration-creance --siren=987654321 --montant=12000 --nature=loyer-impayes</user>
<response>
Lookup BODACC : LJ publiée 1er février 2026 `[BODACC]`.
Forclusion : 1er février + 2 mois = 1er avril 2026.
Aujourd'hui : 18 mai 2026 → **FORCLUSION DÉPASSÉE de 47 jours** → 🔴🔴.

Options :
1. Requête en relevé de forclusion art. L.622-26 C.com. — recevabilité strictement exceptionnelle, charge de preuve élevée `[review]`.
2. Abandon de la créance (perte définitive).

Veux-tu que je prépare la trame de la requête en relevé ? (validation humaine (avocat) obligatoire avant dépôt, instruction par juge-commissaire.)
</response>
</example>

<example>
<user>/h-da:declaration-creance --siren=456789123 --montant=240000 --nature=prestation --etranger=true</user>
<response>
Créancier hors UE/EEE → délai 4 mois.
BODACC : sauvegarde publiée 10 avril 2026 `[BODACC]`.
Forclusion : 10 avril + 4 mois = 10 août 2026 → 84 jours restants → 🟢.
Mandataire : `[à vérifier]` (absent du complément du jugement d'ouverture — vérifier sur l'annonce BODACC publiée).
Montant > seuil approbateur 100 k€ → escalade recommandée.
</response>
</example>

---

## Chargement du profil

> Lire `~/.claude/plugins/config/hacienda-juridique/hacienda-droit-affaires/CLAUDE.md`, bloc procédures collectives :
> - **Position** — créancier (cas dominant ici, à confirmer)
> - **Tribunaux habituels** — pour repérage / cohérence
> - **Approbateur déclaration > 100 k€** — escalade automatique au-delà du seuil
> - **Politique PII** — `passive` / `active` (défaut) / `strict` + seuil B
> - **Qualité signataire** — service contentieux, DAF, dirigeant habilité

Si le bloc est `[A CONFIGURER]` : stopper et demander `/h-da:entretien-demarrage`. Sans seuil approbateur ni qualité signataire, la chaîne de validation interne n'est pas opposable.

---

## Intake

0. **Mode** — défaut : rédaction de la déclaration de créance. `--releve-forclusion` : rédige une **requête en relevé de forclusion** (art. L.622-26 C.com.) lorsque le délai L.622-24 est déjà acquis — voir la section dédiée plus bas.
1. **SIREN débiteur** — `--siren=123456789` (**obligatoire**)
2. **Montant créance** — `--montant=85000` (en euros, **obligatoire**)
3. **Nature créance** — `--nature=facture|loyer|prestation|salaire|pret|...`
4. **Justificatifs** (optionnel) — `--docs=./facture.pdf,./bon-livraison.pdf`
5. **Date naissance créance** (optionnel) — si omise et nécessaire au calcul intérêts, demander avant de poursuivre
6. **Privilège revendiqué** (optionnel) — `--privilege=conservateur|nantissement|hypotheque|vendeur|fiscal|social|...`
7. **Créancier étranger** (optionnel) — `--etranger=true` pour créancier domicilié hors France métropolitaine/UE/EEE (délai porté à 4 mois)

Si `--siren` ou `--montant` absent : stopper et demander explicitement. Pas de valeur par défaut.

---

## Gate non-juriste

- [ ] `--siren` et `--montant` fournis (refus du défaut)
- [ ] Profil cabinet bloc procédures collectives lu, seuil approbateur et qualité signataire identifiés
- [ ] Lookup `bodacc_procedures` exécuté (ou, si le SIREN du débiteur est inventé, saut documenté dans la note du relecteur) ; type procédure, date publication, mandataire renseignés ou flagués `[à vérifier]`
- [ ] Calcul forclusion vérifié (jours restants cohérents avec date du jour, délai 2 ou 4 mois selon `--etranger`)
- [ ] **Prorogation appliquée** : si la forclusion tombe un samedi / dimanche / jour férié, la date retenue **ET affichée** est le 1er jour ouvrable suivant (art. 642 CPC), pas la date brute
- [ ] **Certification** (créance sincère et exacte) présente dans le corps de la déclaration
- [ ] Si **réserve de propriété revendiquée** : la sortie explicite délai 3 mois (L.624-9), destinataire **administrateur**, ET l'escalade (défaut d'acquiescement 1 mois → saisine juge-commissaire) — pas seulement le principe
- [ ] Point de départ = date de parution de l'**avis d'ouverture** (`avis_ouverture`), jamais celle de l'avis le plus récent
- [ ] Mandataire lu dans `avis_ouverture.complement` ou flagué `[à vérifier]` — pas de valeur fabriquée
- [ ] Montant total cohérent avec composantes (principal + intérêts et frais L.622-28 + TVA)
- [ ] Sortie comprend : statut forclusion + récap procédure + projet déclaration + pièces + note du relecteur + question hors checklist + arbre 5 options
- [ ] (mode `--releve-forclusion`) Délai d'action **6 mois** depuis publication BODACC vérifié (gate de recevabilité) ; **cause** du relevé documentée (non-imputabilité OU omission débiteur L.622-6) ; requête adressée au **juge-commissaire** ; conséquence (concours aux seules répartitions postérieures) signalée

---

## Outils MCP à privilégier

Appeler les outils par leur nom exact quand le serveur `Hacienda Droit des Affaires` est disponible. Ne pas inventer de tool hors périmètre ; si une source n'a pas été consultée directement, garder `[à vérifier]`.

- Socle sources officielles : `piste_status`, `legifrance_recherche`, `legifrance_get_article`, `judilibre_recherche`, `judilibre_get_decision`, `eurlex_recherche`, `eurlex_consulter`.
- Entreprises, BODACC et procédures collectives : `company_full_profile`, `bodacc_by_siren`, `bodacc_procedures`.
- Tout résultat issu d'un corpus client ou d'un outil interne reste distingué des sources primaires officielles.

## Emplacement des sorties

```
outputs/declaration-creance-<siren>-<date-publication-bodacc>.md
```

Format date : `YYYY-MM-DD`. Si la déclaration porte sur plusieurs créances pour le même SIREN, suffixer `-<nature>` (ex. `-loyers`, `-prestations`).

---

## Sortie

Structurer la sortie avec : faits retenus, droit applicable, analyse, incertitudes, sources consultées, décisions proposées, prochaine action et validation humaine. Toute source non consultée directement reste `[à vérifier]`.

## Étape 1 — Lookup BODACC

1. Lire profil cabinet (bloc procédures collectives) et `~/.claude/plugins/config/hacienda-juridique/company-profile.md`.
2. Lookup procédure : `bodacc_procedures` (wrapper MCP : `bodacc_procedures`). Filtre côté API : `familleavis = "collective"` (libellé « Procédures collectives »), tri `dateparution DESC`.
3. Partir de **`avis_ouverture`** renvoyé par l'outil (l'avis dont `jugement.famille` = « Jugement d'ouverture »). **Ne jamais prendre la première annonce de la liste** : l'avis le plus récent est souvent une clôture, un plan ou un dépôt de l'état des créances, et sa date ne fait pas courir le délai. Si `avis_ouverture` est `null` : point de départ `[à vérifier]`, stopper le calcul et le dire. Relever sur l'avis d'ouverture :
   - **Type de procédure** — lu dans `avis_ouverture.nature` (ex. « Jugement d'ouverture d'une procédure de redressement judiciaire »). **Jamais** dans `typeavis`, qui ne vaut que « Avis initial » / « Avis rectificatif » / « Avis d'annulation ». **Fondement applicable selon la procédure** : le régime de déclaration des créances et de forclusion/relevé des art. **L.622-24 à L.622-27 C.com.** est propre à la **sauvegarde** ; en **redressement judiciaire** il s'applique par renvoi de l'art. **L.631-14 C.com.**, et en **liquidation judiciaire** par renvoi de l'art. **L.641-3 C.com.**. Toujours qualifier la procédure ET viser l'article-passerelle quand il ne s'agit pas d'une sauvegarde — la déclaration et la requête en relevé en LJ/RJ se fondent sur L.622-24/L.622-26 **via** L.641-3 / L.631-14, pas directement.
   - **Date publication BODACC** — `avis_ouverture.dateparution` (point de départ du délai L.622-24)
   - **Date jugement d'ouverture** — `avis_ouverture.date_jugement` ; `[à vérifier]` si absente
   - **Mandataire / liquidateur désigné (nom + adresse)** — dans `avis_ouverture.complement` (texte du jugement : « désignant mandataire judiciaire … », « désignant liquidateur … »). Recopier le nom et l'adresse tels qu'ils y figurent ; `[à vérifier]` seulement si le complément ne les contient pas.
   - **Tribunal** — `avis_ouverture.tribunal` ; **numéro RG** — rarement publié : `[à vérifier]` s'il n'est pas dans le complément.
   - Signaler toute note de l'outil (plusieurs avis d'ouverture, rectificatif) dans la note du relecteur.
4. Si aucune procédure trouvée pour ce SIREN : stopper et demander confirmation (le débiteur est-il bien en procédure ? Le SIREN est-il exact ?).
   Exception, SIREN du débiteur inventé (dossier fictif) : pas de lookup ni d'arrêt. Reprendre les données de procédure fournies, à confirmer sur l'avis, et poursuivre (lecture des articles comprise, étape 4 bis). Un SIREN réel s'interroge toujours, même si d'autres parties du dossier sont fictives.

Tags de provenance : `[BODACC]` pour tout champ extrait, `[à vérifier]` pour tout champ non parsable.

---

## Étape 2 — Calcul forclusion L.622-24 (règle dure)

```
date_publication_bodacc = avis_ouverture.dateparution (BODACC — avis du jugement d'ouverture)
delai_base = 2 mois
si creancier_etranger (hors France/UE/EEE) : delai_base = 4 mois (art. R.622-24 C.com.)

date_forclusion = date_publication_bodacc + delai_base
si date_forclusion tombe un samedi, dimanche ou jour férié : prorogée au premier jour ouvrable suivant (art. 642 CPC)
jours_restants  = date_forclusion - aujourd'hui
```

**Échelle d'alerte** (canonique cabinet) :

| Jours restants | Statut | Action |
|---|---|---|
| > 30 j | 🟢 | Envoi normal — LRAR sous 1-2 semaines |
| 7-30 j | 🟠 | Envoi prioritaire — LRAR sous 3 jours |
| 0-6 j | 🔴 | URGENT — LRAR sous 24-48 h + double envoi email avec AR |
| < 0 j | 🔴🔴 | **FORCLUSION** — proposer requête en relevé art. L.622-26 C.com. ou abandon |

Cas particuliers à signaler (sans calculer automatiquement) :
- **Antérieure ou postérieure — critère = fait générateur, pas échéance.** Une créance est **antérieure** (et se déclare au passif) si son fait générateur — livraison effectuée, prestation exécutée — précède le jugement d'ouverture, **même si son échéance contractuelle est postérieure**. Ne **jamais** classer une créance en postérieure (art. L.622-17 C.com., régime distinct des créances postérieures privilégiées) au seul motif que sa date d'échéance suit le jugement. `[review]` si le fait générateur s'étale (prestations successives).
- Créance non échue à la date du jugement — le jugement d'ouverture ne la rend pas exigible (art. L.622-29 C.com.) ; déclarée à hauteur du capital restant dû `[review]`.
- Créance en monnaie étrangère — conversion taux jugement `[review]`.

---

## Étape 3 — Calcul créance (composantes)

| Composante | Règle | Tag |
|---|---|---|
| Principal | Montant en euros à la date du jugement d'ouverture | [utilisateur fourni] |
| Intérêts contractuels | Arrêtés à la date du jugement art. L.622-28 C.com. — sauf prêts ou délais de paiement >= 1 an (intérêts continuent à courir). **Taux : consulter Légifrance/PISTE** pour la valeur (donnée publiée, pas un jugement) et la fournir avec source ; `[à vérifier]` **uniquement** en mode dégradé si l'outil est indisponible ; **ne jamais inventer**, et bon concept (taux légal **professionnel**, pas consommateur) | calcul + `[Légifrance]` (ou `[à vérifier]` si dégradé) |
| Indemnité forfaitaire de recouvrement | 40 € par facture **en retard à la date du jugement** (art. L.441-10, D.441-5 C.com.) — non due pour une facture non encore échue au jugement | calcul |
| Clause pénale (de retard) | Déclenchée **seulement si la condition contractuelle est remplie** (typiquement mise en demeure restée infructueuse) ; calculée sur la **base stipulée par la clause** — expliciter si « principal » s'entend HT ou TTC `[review]` et **afficher la base retenue** ; arrêtée à la date du jugement art. L.622-28 C.com. ; **modérable par le juge** si manifestement excessive (art. 1231-5 C.civ.) | [review] |
| TVA | Si applicable selon nature créance et régime | calcul |
| **Total déclaré** | Somme des composantes | — |

Présenter un tableau détaillé : Nature / Base / Taux ou règle / Montant arrêté au [date jugement] / Total. Si la date du jugement est `[à vérifier]`, présenter le calcul à la date publication BODACC et flaguer l'écart possible en note du relecteur.

**Garde-fous chiffrage — auto-contrôle avant sortie :**
- **Taux légal** : jamais un chiffre inventé. Un taux affirmé sans source consultée est une erreur — écrire `[à vérifier]` + le concept (taux légal professionnel).
- **Base de la clause pénale** : afficher la base retenue (HT ou TTC du principal) et la taguer `[review]` ; ne pas changer de base d'une ligne à l'autre.
- **Cohérence du total** : le total déclaré doit être **arithmétiquement égal à la somme des composantes affichées**. Recalculer l'addition avant de sortir ; si une composante est `[à vérifier]`, le total l'est aussi.

---

## Étape 4 — Privilège revendiqué (le cas échéant)

| Type | Exemples | Justificatifs à joindre |
|---|---|---|
| Privilège général | Trésor (fisc), URSSAF, super-privilège salariés | Avis à tiers détenteur, état des cotisations, bulletins de paie |
| Privilège spécial mobilier | Vendeur de meubles, conservateur, créancier nanti, gagiste | Contrat de vente, facture, acte de nantissement / gage inscrit |
| Sûreté réelle immobilière | Hypothèque conventionnelle / légale / judiciaire | Copie acte notarié + bordereau d'inscription au Service de la publicité foncière |
| Réserve de propriété | Vente avec clause de réserve de propriété art. L.624-16 C.com. | CGV signées avec clause + facture + bon de livraison |

Tag `[review]` sur la recevabilité du privilège si l'inscription est tardive, mal libellée, ou si le rang est contestable. Ne **jamais** présenter un privilège comme acquis sans vérification de l'inscription / publication.

**Rang par défaut — chirographaire.** En l'absence d'un privilège ou d'une sûreté valablement inscrit, une créance de prix (fournisseur, prestataire) est **chirographaire**. Ne pas la qualifier de privilégiée, fiscale, sociale, superprivilégiée, ni de créance postérieure L.622-17, sans fondement vérifié. Sur-revendiquer un rang fragilise la déclaration `[review]`.

### Réserve de propriété — déclaration ET action en revendication (deux procédures distinctes)

La clause de réserve de propriété (art. L.624-16 C.com.) ne se fait **pas** valoir par la seule déclaration de créance : elle suppose une **action en revendication distincte**.

| Point | Règle |
|---|---|
| Délai | **3 mois** à compter de la publication BODACC du jugement (art. L.624-9 C.com.) — délai propre, **distinct** des 2 mois de la déclaration de créance |
| Destinataire | demande amiable par LRAR à l'**administrateur judiciaire** (à défaut, au mandataire/débiteur selon la procédure) ; à défaut d'acquiescement dans **1 mois**, saisine du **juge-commissaire** dans le mois suivant (art. L.624-17, R.624-13 C.com. `[à vérifier]`) |
| Assiette | uniquement les biens **non incorporés**, **individualisables** et retrouvés en nature chez le débiteur ; les biens déjà incorporés ou transformés échappent à la revendication `[review]` |
| Forme | clause convenue **par écrit au plus tard à la livraison** — des CGV acceptées à l'ouverture du compte peuvent constituer cet écrit pour les opérations suivantes `[review]` |
| Articulation | déclarer la créance monétaire pour son **montant total** et signaler la revendication en parallèle ; ne **pas** déduire d'office la valeur des biens revendiqués du montant déclaré (ajustement seulement en cas de restitution effective ou de paiement du prix) |

---

## Étape 4 bis — Lecture des articles clés (avant rédaction)

Une déclaration de créance repose sur une poignée d'articles dont l'avocat va
s'assurer qu'ils sont en vigueur : les lire **avant** de rédiger, pour que la
note du relecteur puisse dire lesquels ont été vérifiés. Un appel
`legifrance_get_article` par article (`code` : « Code de commerce », `num` au
format `L622-24`) :

| Toujours | Dès que la note les cite |
|---|---|
| L.622-24 (déclaration, délai) · L.622-28 (arrêt du cours des intérêts) | L.622-29 (créance non échue) · L.624-9 et L.624-16 (revendication, réserve de propriété) · L.622-26 (relevé de forclusion) · L.622-17 (créance postérieure) · 1231-5 C.civ. (clause pénale, `code` : « Code civil ») |

La colonne de droite n'est pas optionnelle : tout article du tableau que la note
cite est lu avant la rédaction. Un article hors tableau cité en cours de
rédaction se lit aussi, ou reste `[à vérifier]`.

**Dossier fictif (formation, test, persona) : la lecture a lieu quand même.**
Les parties sont inventées, le droit ne l'est pas. Ce qui se saute, c'est le
registre sur un **SIREN inventé** (marqué comme tel, ex. `SIREN-FICTIF-…`, ou
sans ses 9 chiffres), pas le dossier entier : un débiteur au SIREN réel s'interroge sur
BODACC même si le créancier est fictif. Dire dans la note du relecteur ce qui
a été sauté et pourquoi ; lire les articles ci-dessus comme pour un dossier
client. « Le dossier est fictif » ne justifie jamais de laisser un article en
`[à vérifier]` quand Légifrance répond.

Seuls les articles effectivement ramenés par l'outil reçoivent `[Légifrance]`
(CLAUDE.md §2). La note du relecteur porte deux lignes, toujours présentes :
« Articles lus dans cette session : … » et « Articles cités non lus : … (ou
aucun) » ; chaque article de la seconde liste porte `[à vérifier]` dans le texte. Si PISTE n'est pas configuré, passer en mode dégradé documenté
plutôt que d'omettre la lecture en silence.

---

## Étape 5 — Rédaction de la déclaration (format mandataire)

Template :

```
[En-tête créancier : dénomination, forme sociale, SIREN, siège, représentant légal, coordonnées]

À : [Mandataire judiciaire — nom, cabinet, adresse — extrait BODACC ou [à vérifier]]

Référence procédure :
- Tribunal de commerce de [ville]
- N° RG : [...]
- Type : [sauvegarde / redressement judiciaire / liquidation judiciaire]
- Fondement du régime de déclaration/relevé : [sauvegarde → L.622-24 et s. directement | redressement judiciaire → L.622-24 et s. par renvoi de L.631-14 C.com. | liquidation judiciaire → L.622-24 et s. par renvoi de L.641-3 C.com.] — **viser l'article-passerelle dans le livrable quand ce n'est pas une sauvegarde**
- Date jugement d'ouverture : [date]
- Date publication BODACC : [date]

OBJET : DÉCLARATION DE CRÉANCE — [Débiteur, SIREN]

Conformément à l'art. L.622-24 C.com., le créancier soussigné déclare au passif de [débiteur, SIREN] la créance suivante :

| Nature | Principal | Intérêts arrêtés au [date jugement] | Frais / clause pénale | TVA | Total |
|---|---|---|---|---|---|
| [facture / loyer / prestation / ...] | [€] | [€] arrêtés au [date jugement] — art. L.622-28 C.com. | [€] arrêtés au [date jugement] — art. L.622-28 C.com. | [€] | [€] |

**Total déclaré : [€]**

Privilège revendiqué (le cas échéant) : [type + fondement légal + référence inscription] [review]

Justificatifs joints : [liste numérotée — facture(s), bon(s) de livraison, contrat, mise en demeure, acte de nantissement, etc.]

Le créancier certifie que la présente créance est sincère et exacte, qu'elle subsiste en son entier à la date du jugement d'ouverture et qu'elle n'a fait l'objet d'aucun paiement, novation ni compensation à ce jour.

Fait à [ville], le [date].
Signature, qualité du signataire ([service contentieux / DAF / dirigeant habilité, conformément au profil cabinet]).
```

L'art. L.622-21 C.com. (arrêt des poursuites individuelles) interdit toute mention d'action individuelle parallèle — vérifier qu'aucune phrase ne laisse entendre un recouvrement direct hors procédure.

---

## Étape 6 — Post-flight `verifier-citations`

Complète l'étape 4 bis pour les articles cités en cours de rédaction. Articles à vérifier : L.622-17, L.622-21, L.622-24, L.622-26, L.622-28, L.622-29 (identifiants dans `${CLAUDE_SKILL_DIR}/../../references/articles-c-civ-c-com-index.md` : les lire via `legifrance_get_article` ; `[Légifrance]` seulement après lecture dans la session, sinon `[à vérifier]`). R.622-24 (réglementaire, délais) : même règle si cité. Articles mobilisés par la réserve de propriété / revendication et les accessoires — **L.624-9, L.624-16, L.624-17, R.624-13 C.com., L.441-10, D.441-5 C.com., art. 642 CPC, art. 1231-5 C.civ.** — à vérifier sur Légifrance ; non lus dans la session : `[à vérifier]`. Si PISTE non configuré : mode dégradé documenté.

---

## Étape 7 — Sortie

### Format livrable

```
[En-tête de confidentialité selon le rôle utilisateur — voir les 4 variantes dans CLAUDE.md du plugin]

> ⚠️ Note du relecteur
> - **Sources :** Légifrance ✓ / BODACC ✓ / Pappers ✓ (cocher ✗ si non connectée) ; articles lus dans cette session : {liste} ; autres citations `[à vérifier]`
> - **Lecture :** annonce BODACC d'ouverture + {N} justificatifs fournis
> - **Signalé pour ton jugement :** {N} éléments marqués [review] (privilège, qualification créance non échue, conversion devise) | aucun
> - **Fraîcheur :** vérification jurisprudence post-{date} sur L.622-24 / L.622-26 — {N} arrêts intégrés [Judilibre] | recherche impossible, vérifier manuellement Cass. com. récente
> - **Avant de t'appuyer dessus :** {action concrète — ex. confirmer l'extraction mandataire sur le PDF BODACC source si flagué [à vérifier]} | « prêt pour envoi LRAR »

# 🟢/🟠/🔴/🔴🔴 Statut forclusion
- Date publication BODACC : [date]
- Délai applicable : 2 mois (ou 4 mois si créancier étranger)
- Date forclusion : [date **prorogée au 1er jour ouvrable suivant si elle tombe un week-end / jour férié — art. 642 CPC** ; indiquer la date brute entre parenthèses si prorogation appliquée]
- Jours restants : [N]
- Action recommandée : [envoi normal / prioritaire / URGENT / requête en relevé L.622-26]

# Récapitulatif procédure
- Tribunal : [TC X]
- N° RG : [...] [BODACC] ou [à vérifier]
- Type : [sauvegarde / RJ / LJ]
- Date jugement d'ouverture : [date]
- Mandataire désigné : [nom + adresse] [BODACC] ou [à vérifier] (absent du complément du jugement — vérifier sur l'annonce publiée)

# Déclaration de créance — projet
[texte complet du template Étape 5]

# Pièces à joindre
1. [...]
2. [...]
...

# Une question hors de ma checklist habituelle
{Observation transversale qu'un relecteur attentif ferait — ex. nature de créance susceptible de basculer en post art. L.622-17, articulation avec une action en responsabilité dirigeant, soupçon de compensation possible. Omettre si rien d'honnête.}

# Que veux-tu faire ? Choisis une option et je la déroule :

1. **Rédiger** — je produis le courrier recommandé LRAR au mandataire avec déclaration + bordereau pièces, prêt à signer.
2. **Escalader** — note d'escalade vers {approbateur déclaration > 100 k€ configuré} si montant au-dessus du seuil, avec faits-clés, forclusion et décision attendue.
3. **Compléter les faits** — questions ouvertes à poser à {compta / service contentieux / conseil} avant envoi (intérêts contractuels exacts, justificatifs manquants, privilège à vérifier).
4. **Surveiller et attendre** — j'ajoute la déclaration au tracker procédures collectives avec date d'envoi, accusé mandataire attendu, échéance vérification état des créances (admission / contestation).
5. **Autre** — précise.
```

### Mode silencieux (livrable externe — déclaration adressée au mandataire)

La déclaration de créance est un livrable externe au sens de CLAUDE.md plugin §2.

**Quand l'appliquer.** Par défaut — y compris quand on te demande de « préparer la déclaration » — produis le **format livrable ci-dessus** (version interne pour l'avocat, note du relecteur et tags compris, projet de déclaration inclus). Le mode silencieux ne s'applique **que** lorsque l'utilisateur demande explicitement la version à envoyer au mandataire (option 1 « Rédiger », courrier LRAR prêt à signer). Même alors, la **note du relecteur** et le **statut de vérification des citations** sont livrés dans un message d'accompagnement séparé : épurer le courrier ne dispense jamais de dire à l'avocat ce qui a été vérifié et ce qui ne l'a pas été.

- **Retirer l'en-tête de confidentialité avocat** (le destinataire mandataire n'est pas couvert par le secret professionnel du créancier). Conserver l'en-tête uniquement si la note interne reste dans le périmètre cabinet.
- Conserver la note du relecteur dans le message accompagnement, **pas dans le courrier au mandataire**.
- Couper toute narration de skill, renvois inter-commandes, mentions « j'ai lu les fichiers… ». Le courrier au mandataire doit se lire comme s'il avait été rédigé par le service contentieux.
- Tags `[BODACC]` / `[Légifrance]` : conserver en ligne dans la version interne, **retirer** dans la version envoyée au mandataire (consolidés en pied de courrier si nécessaire).

---

## Mode `--releve-forclusion` — Requête en relevé de forclusion (L.622-26)

Déclenché quand la forclusion L.622-24 est **déjà acquise** (Étape 2 → 🔴🔴) ou demandé explicitement. Produit une **requête motivée adressée au juge-commissaire** (et non au mandataire). La requête ne dispense pas de la déclaration : si le relevé est accordé, enchaîner sur la déclaration dans le délai fixé par le juge-commissaire.

### Étape R1 — Recevabilité de l'action en relevé (gate)

- **Fondement selon la procédure.** Qualifier d'abord la procédure et viser l'article-passerelle : le relevé de forclusion L.622-26 s'applique directement en **sauvegarde**, par renvoi de **L.631-14 C.com.** en **redressement judiciaire**, et par renvoi de **L.641-3 C.com.** en **liquidation judiciaire**. La requête doit l'énoncer (ex. « art. L.622-24 et L.622-26, applicables à la liquidation judiciaire par renvoi de l'art. L.641-3 C.com. »).
- **Délai d'action : 6 mois** à compter de la publication du jugement d'ouverture au BODACC (art. L.622-26 al. 2 C.com.). Ce délai est lui-même un délai de forclusion.
- Cas d'allongement / report du point de départ (créancier qui ne pouvait connaître l'obligation au moment de l'ouverture, créance révélée tardivement, délai porté à un an dans certains cas) → `[à vérifier]`, ne pas trancher sans consultation de l'article en vigueur.
- Si le délai de 6 mois est lui-même expiré → la voie du relevé est fermée `[review]` : **le signaler** et ne pas rédiger une requête vouée à l'irrecevabilité. Calcul obligatoire :

```
date_limite_action_releve = date_publication_bodacc + 6 mois
(prorogée au 1er jour ouvrable suivant si week-end/jour férié — art. 642 CPC)
```

### Étape R2 — Cause du relevé (l'une des deux, art. L.622-26 al. 1)

| Cause | Critère | Charge de preuve |
|---|---|---|
| (a) Défaillance **non due au fait du créancier** | absence d'information, créance née/révélée tardivement, impossibilité de connaître la procédure | sur le créancier — appréciation stricte `[review]` |
| (b) Créance **omise par le débiteur** lors de l'établissement de la liste art. L.622-6 C.com. | le débiteur devait porter le créancier sur la liste remise au mandataire ; l'omission ouvre le relevé | plus favorable au créancier — établir l'omission |

Documenter précisément les faits à l'appui de la cause invoquée. Ne pas présenter le relevé comme acquis : il relève de l'appréciation du juge-commissaire `[review]`.

### Étape R3 — Rédaction de la requête (au juge-commissaire)

```
[Identification créancier] — [Procédure : TC, n° RG, type, date jugement, date publication BODACC]

À Monsieur/Madame le Juge-commissaire

OBJET : REQUÊTE EN RELEVÉ DE FORCLUSION (art. L.622-26 C.com.) — créance [débiteur, SIREN]

1. Rappel de la procédure et de la forclusion encourue (date publication BODACC + 2 mois = [date], dépassée).
2. Recevabilité : la présente demande est formée dans le délai de 6 mois de la publication (échéance [date]).
3. Cause du relevé : [(a) défaillance non imputable au créancier OU (b) omission du débiteur dans la liste L.622-6], exposée en fait et étayée par les pièces.
4. Créance à déclarer : montant et nature (renvoi au détail de la déclaration projetée).
PAR CES MOTIFS, plaise au juge-commissaire de relever le créancier de la forclusion et de l'autoriser à déclarer sa créance dans le délai qu'il fixera.
[Pièces : justificatifs de la cause + justificatifs de la créance]
```

### Étape R4 — Conséquences à signaler

- Le créancier relevé **ne concourt qu'aux répartitions postérieures à sa demande** (art. L.622-26 C.com. `[à vérifier]`) — il ne participe pas aux distributions déjà intervenues.
- Le relevé obtenu, **déclarer la créance** dans le délai fixé (enchaîner sur le mode déclaration standard).

---

## Ce skill ne fait pas

- L'envoi physique du courrier recommandé (acte du créancier / cabinet).
- Le suivi de l'état des créances (admission / contestation par le mandataire ou le juge-commissaire) → `v1.1+`.
- Le **dépôt** de la requête en relevé de forclusion au greffe et sa plaidoirie devant le juge-commissaire (acte de l'avocat) — le mode `--releve-forclusion` produit la requête motivée, pas son dépôt ni l'audience.
- La revue d'un acte de cession en cours de procédure collective (plan de cession art. L.642-1 C.com.) → renvoyer vers un avocat spécialisé restructuring.
- Le conseil sur une poursuite individuelle suspendue par art. L.622-21 C.com. (arrêt des poursuites) — signalement uniquement.
- La contestation d'une créance déjà admise (recours devant juge-commissaire) → `v1.1+`.

---

## Ton

Technique, factuel, **urgence calibrée par les jours restants** : 🟢 ton standard, 🟠 prioritaire et concis, 🔴 urgence explicite (« envoi sous 24-48 h, voici la trame prête à signer »), 🔴🔴 honnêteté sur la forclusion dépassée et options réalistes (relevé strictement exceptionnel `[review]`, abandon). Ne jamais minimiser un dépassement de délai. Les fourchettes d'alerte (30 / 7 / 0 jours) sont des conventions cabinet, pas une norme codifiée — taguer en interne si besoin. La déclaration au mandataire engage le rang et le quantum dans la procédure : l'erreur de calcul est coûteuse, le brouillon est soumis à validation humaine (avocat)/service contentieux avant signature.
