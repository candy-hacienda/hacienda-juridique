# Hacienda Droit des Affaires

Plugin Hacienda pour cabinets d'avocats d'affaires, juristes in-house en
direction juridique, notaires corporate et indépendants en procédures
collectives.

Chaque sortie reste un brouillon pour avocat ou juriste : source officielle
ou `[à vérifier]`, Note du relecteur, arbre de décision 5 options, validation
humaine obligatoire avant tout usage externe.

## Périmètre V2

| Bloc | Skills |
|---|---|
| Orientation / triage | `cas` |
| Contrats commerciaux | `reviser-contrat`, `reviser-nda`, `liste-de-points`, `revue-tabulaire` |
| M&A léger | `gap-review` |
| Procédures collectives | `declaration-creance`, `declaration-cessation-paiements`, `responsabilite-dirigeant`, `defense-dirigeant`, `distress-cedant` |
| Transversal | `entretien-demarrage`, `verifier-citations` |
| Agents (surveillance) | `bodacc-watcher`, `bodacc-procedures-watcher`, `echeances-societaires` |

## Hors périmètre V2

Volontairement non couverts (couverts par d'autres plugins Hacienda ou décisions produit) :
- RGPD et délégué à la protection des données — voir `hacienda-donnees-personnelles`
- Sapin II et devoir de vigilance — pas dans la roadmap v1
- Marchés publics — ouvert à la demande, v1.1+
- Droit boursier complet (cibles cotées) — limité v2, voir AMF
- Contrats PI (licence brevet, coexistence marques, transfert technologie) — voir `hacienda-propriete-intellectuelle` (le skill `reviser-contrat` renvoie automatiquement)

## Installation

```bash
claude plugins marketplace add /chemin/vers/hacienda-juridique
claude plugins install hacienda-droit-affaires
```

## Configuration des sources

Les sources externes sont configurées dans `~/.config/Hacienda/credentials.json`
(pattern unifié — mêmes clés partagées avec les autres plugins Hacienda) :

```bash
mkdir -p ~/.config/Hacienda
cat > ~/.config/Hacienda/credentials.json <<EOF
{
  "PISTE_CLIENT_ID": "...",
  "PISTE_CLIENT_SECRET": "...",
  "PAPPERS_API_KEY": "..."
}
EOF
chmod 600 ~/.config/Hacienda/credentials.json
```

| Clé | Source | Obtention | Optionnel ? |
|---|---|---|---|
| `PISTE_CLIENT_ID` + `_SECRET` | Légifrance / PISTE | piste.gouv.fr (gratuit) | Recommandé (sans : `verifier-citations` en mode dégradé) |
| `PAPPERS_API_KEY` | Pappers | www.pappers.fr/api (payant) | Optionnel (sans : fallback BODACC public gratuit) |

BODACC OpenDataSoft (procédures collectives, annonces) est public sans clé.

## Premier lancement

```
/h-da:entretien-demarrage
```

Configure votre profil cabinet (réutilisé par les autres plugins Hacienda via
`~/.claude/plugins/config/hacienda-juridique/company-profile.md`) et vérifie l'état des connexions.

## Commandes

Chaque skill Droit des affaires est invocable directement comme commande du plugin :

Conclusion mécanisme Claude Code / Cowork : les slash-commands de plugin sont
des fichiers Markdown découverts dans `commands/` (ou les chemins `commands`
déclarés dans `.claude-plugin/plugin.json`). Le frontmatter porte notamment
`description` et `argument-hint`, puis le corps de commande devient l'instruction
exécutée. Le nom du plugin reste `hacienda-droit-affaires` pour l'installation ;
le namespace court d'invocation est porté par le sous-dossier `commands/h-da/`,
qui expose les wrappers sous la forme `/h-da:<skill>` tout en conservant
l'auto-activation des skills.

| Commande | Usage |
| --- | --- |
| `/h-da:analyser-rupture-brutale` | Analyse du risque de rupture brutale. |
| `/h-da:asset-vs-share-distress` | Arbitrage de structuration côté repreneur pour une cible en difficulté : titres vs actifs, responsabilité repreneur (période suspecte, passif), routage vers le bon playbook. |
| `/h-da:cas` | Point de départ : décris ton dossier, je trie et je route vers le bon skill. |
| `/h-da:cession-actifs-isoles` | Playbook côté repreneur : construire et défendre une offre d'acquisition d'actifs isolés (fonds, marques, stocks) en LJ, hors plan de cession (L.642-19). |
| `/h-da:cgv-generator` | Génération assistée de CGV/CGU. |
| `/h-da:closing-checklist-fr` | Checklist signing, closing et post-closing. Mode `--pe` : lentille closing LBO côté sponsor (funds flow / sources & uses, CP financement & certain funds, mécanique de closing day-1, security package & assistance financière L.225-216 C.com., adhésion rollover & post-closing PE). |
| `/h-da:constitution-societe` | Constitution de société et choix de forme. |
| `/h-da:consulter-digest` | Lecture du digest de veille. |
| `/h-da:declaration-cessation-paiements` | Côté débiteur : déclaration de cessation des paiements (dépôt de bilan), délai 45 j, pièces R.631-1, orientation RJ/LJ. |
| `/h-da:declaration-creance` | Déclaration de créance et forclusion. Mode `--releve-forclusion` : requête L.622-26 lorsque le délai L.622-24 est dépassé. |
| `/h-da:defense-dirigeant` | Aval contentieux de `responsabilite-dirigeant` : arme la trame de défense du dirigeant **assigné** (L.651-2 / L.652-1 / sanctions L.653-x). Moyens ordonnés par force ; ne rédige pas le mémoire. |
| `/h-da:distress-cedant` | Note d'orientation côté cédant/débiteur : arbitrage sauver / céder / déposer, pivot 45 j, exposition dirigeant (Gate 1 + Gate 2), routage vers le bon skill. |
| `/h-da:due-diligence-dataroom` | Due diligence data-room M&A. Mode `--pe` (alias `--mode=pe-red-flags`) : red flags Private Equity convertis en traitements deal (CP / GAP / W&I / specific indemnity / price chips / Q&A), red flag report partner-ready. |
| `/h-da:entretien-demarrage` | Configuration initiale du profil Droit des affaires. |
| `/h-da:financement-startup` | Instruments de financement startup. |
| `/h-da:gap-review` | Revue de garantie d'actif et de passif. Mode `--distressed` : cible en difficulté (garantie de la garantie). Mode `--pe` : revue GAP sous l'angle W&I / disclosure (overlay Private Equity). |
| `/h-da:gouvernance-ag` | Convocations et PV d'assemblées. |
| `/h-da:liste-de-points` | Issues list de négociation. |
| `/h-da:loi-term-sheet` | LOI, NBO et term sheet M&A. |
| `/h-da:management-package-pe` | Cartographie management package PE (LBO) côté français : documents, instruments, economics (sweet equity, envy ratio, ratchet, vesting, leaver), signalement clauses confiscatoires, question-list fiscal/social. Side-aware sponsor \| manager. |
| `/h-da:mise-en-demeure-commerciale` | Mise en demeure commerciale B2B (payer / exécuter) avec garde-fou procédure collective. |
| `/h-da:pacte-associes-review` | Revue de pacte d'associés. Mode `--pe` : overlay Private Equity / pacte d'investissement (LBO, sponsor + management, axes P1-P5, gate France/Lux, side sponsor/management). |
| `/h-da:pre-pack-cession` | Cadrage du montage pre-pack cession (distressed-M&A). |
| `/h-da:prevention-difficultes` | Orientation prévention (mandat ad hoc / conciliation / sauvegarde accélérée). |
| `/h-da:reprise-a-la-barre` | Playbook côté repreneur : construire et défendre une offre de reprise gagnante sur une cible en RJ/LJ (plan de cession, L.642). |
| `/h-da:responsabilite-dirigeant` | Côté dirigeant : évalue l'exposition personnelle du dirigeant (insuffisance d'actif L.651-2, sanctions L.653-x, banqueroute nommée, cautions). Tous stades. |
| `/h-da:reviser-contrat` | Revue de contrat commercial. |
| `/h-da:reviser-nda` | Triage NDA et confidentialité. |
| `/h-da:revue-tabulaire` | Revue tabulaire multi-documents. |
| `/h-da:spa-review` | Revue de SPA / protocole de cession. Mode `--distressed` : cible en difficulté (période suspecte, passif non purgé). Mode `--pe --side=sponsor` : revue SPA côté sponsor (locked box, certain funds, rollover, MAC, W&I, overlay Private Equity). |
| `/h-da:verifier-citations` | Vérification post-flight des citations. |

## Plugin compagnon (à venir)

`hacienda-ghost` — anonymisera les données personnelles avant envoi à Claude. D'ici là, le plugin n'anonymise rien : retirer soi-même les données qui identifient le client.

## Parcours cabinet M&A

| Moment du deal | Skill |
|---|---|
| NDA / confidentialité data-room | `reviser-nda` |
| NBO / LOI / Term Sheet | `loi-term-sheet` |
| Due diligence data-room | `due-diligence-dataroom` |
| SPA / protocole de cession | `spa-review` |
| Garantie d'Actif et de Passif | `gap-review` |
| Management package / MEP (instruments, leaver, vesting, fiscal-social) | `management-package-pe` |
| Signing / closing / post-closing | `closing-checklist-fr` |

`spa-review` est l'entrée naturelle pour un SPA complet. Il orchestre les
renvois vers `gap-review` pour la GAP, `due-diligence-dataroom` pour les
findings DD et `closing-checklist-fr` pour le pilotage du closing.

## Plugins liés

- `hacienda-propriete-intellectuelle` — pour les contrats PI (licence brevet,
  accord de coexistence marques, NDA partenariat R&D). Le skill `reviser-contrat`
  renvoie automatiquement vers PI quand pertinent.
- `hacienda-sources-officielles` — si installé, ses outils sont accessibles à
  ce plugin (mécanisme MCP standard).

## Sources prioritaires

| Sujet | Source primaire | Intégré core |
|---|---|---|
| Code civil, Code de commerce | Légifrance | ✓ |
| Jurisprudence ch. com. Cour de cass. | Judilibre | ✓ |
| Identification entreprise enrichie | Pappers (si configuré) | ✓ |
| Identification entreprise basique | BODACC OpenDataSoft + Annuaire DINUM | ✓ |
| Procédures collectives (annonces) | BODACC (familleavis = collective) | ✓ |
| Doctrine fiscale (DD M&A) | BOFiP-Impôts | ✗ non intégré (circulaires ministérielles seulement) — à vérifier sur bofip.impots.gouv.fr |
| Droit social (clauses non-concurrence salariées) | BOSS | ✓ |
| Droit UE (Rome I, Bruxelles I bis) | Eurlex | ✓ |
| AMF (cibles cotées — anticipation v2) | AMF Décisions | ✗ (hors core v1) |

## Installation Et Packaging

Le plugin Droit des affaires existe sous deux formes complémentaires :

| Surface | Format | Usage |
| --- | --- | --- |
| Plugin Cowork / Claude Code | Dossier plugin dans la marketplace Hacienda | Skills, agents, hooks, profil de pratique, déclarations MCP |
| Connector Claude Desktop | `plugins/hacienda-droit-affaires.mcpb` | Serveur MCP local bundled, installable depuis Connectors / Extensions |

Le plugin Cowork est le format principal. Le bundle `.mcpb` est uniquement la
version Connector du serveur MCP local et ne remplace pas la marketplace
Hacienda.

## Statut

V2 — aligné sur la structure factory Hacienda et la distribution PI.

Brouillons soumis à validation humaine systématique. Les skills juridiques
lourds (`gap-review`, `declaration-creance`) signalent explicitement leur statut
"BROUILLON, VALIDATION AVOCAT OBLIGATOIRE" et appellent la matrice d'approbateurs
configurée dans CLAUDE.md.

## Licence

AGPL-3.0-or-later
