#!/usr/bin/env node
/**
 * Diagnostic prêt à lancer pour le défaut serveur (b) du handoff
 * (interne/docs/handoff/latest.md, « B — 01-spa-review FAIT ») :
 *
 *   legifrance_get_article({ code: "Code de commerce", num: "L441-10" })
 *   → « Article introuvable », observé deux fois, alors que l'article existe.
 *
 * La revue de code (packages/core/src/codes-legitext.ts,
 * packages/core/src/tools/get-article.ts) n'a pas trouvé de bug dans
 * normalizeArticleNum ni dans le mapping LEGITEXT pour ce cas précis :
 * "L441-10" ressort inchangé (déjà au format canonique), et le LEGITEXT du
 * Code de commerce (LEGITEXT000005634379) est confirmé correct par d'autres
 * lectures réussies sur le même code (ex. L622-24, cf. handoff).
 *
 * Hypothèse restante (non vérifiable sans appel réel) : hoquet transitoire
 * côté PISTE/DILA sur cet article précis, aggravé par la mise en cache 24h
 * d'une réponse 200 avec `article: null` — corrigée dans ce commit
 * (RequestOptions.cacheable). Ce script appelle l'API réelle plusieurs fois
 * de suite, sans passer par le cache, pour confirmer ou infirmer le
 * caractère transitoire.
 *
 * Prérequis : PISTE_CLIENT_ID / PISTE_CLIENT_SECRET (ou
 * ~/.config/hacienda/credentials.json), et `npm run build --workspace
 * @hacienda/core` au préalable (le script importe le paquet compilé).
 *
 * Usage :
 *   node scripts/diagnose-legifrance-article.mjs
 *   node scripts/diagnose-legifrance-article.mjs "Code de commerce" L441-10
 */

import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const corePkg = resolve(here, "../packages/core/dist/index.js");
const codesLegitextPkg = resolve(here, "../packages/core/dist/codes-legitext.js");

const [
  { loadConfig, PisteClient, PisteHttpClient },
  { resolveLegitext, normalizeArticleNum },
] = await Promise.all([import(corePkg), import(codesLegitextPkg)]);

const codeArg = process.argv[2] ?? "Code de commerce";
const numArg = process.argv[3] ?? "L441-10";

const MAX_ATTEMPTS = 10;
const attemptsRaw = Number(process.argv[4] ?? 3);
if (!Number.isFinite(attemptsRaw) || !Number.isInteger(attemptsRaw) || attemptsRaw < 1 || attemptsRaw > MAX_ATTEMPTS) {
  console.error(`❌ Nombre d'appels invalide (${JSON.stringify(process.argv[4])}) : entier entre 1 et ${MAX_ATTEMPTS}.`);
  process.exit(1);
}
const attempts = attemptsRaw;

const config = loadConfig();
if (!config.clientId || !config.clientSecret) {
  console.error(
    "❌ Pas d'identifiants PISTE (PISTE_CLIENT_ID / PISTE_CLIENT_SECRET ou " +
      "~/.config/hacienda/credentials.json). Ce script doit être relancé avec de vrais identifiants.",
  );
  process.exit(1);
}

const legitext = resolveLegitext(codeArg);
if (!legitext) {
  console.error(`❌ Code "${codeArg}" non reconnu par resolveLegitext.`);
  process.exit(1);
}
const num = normalizeArticleNum(numArg);

console.log(`Code: ${codeArg} → LEGITEXT ${legitext}`);
console.log(`Num brut: ${JSON.stringify(numArg)} → normalisé: ${JSON.stringify(num)}`);
console.log(`${attempts} appel(s) réel(s) à /consult/getArticleWithIdAndNum, cache désactivé…\n`);

const auth = new PisteClient(config);
const http = new PisteHttpClient(config, auth); // pas de cache : chaque appel retape le réseau

for (let i = 1; i <= attempts; i += 1) {
  const start = Date.now();
  try {
    const raw = await http.post("/consult/getArticleWithIdAndNum", { id: legitext, num });
    const ms = Date.now() - start;
    const found = Boolean(raw?.article);
    console.log(
      `[${i}/${attempts}] ${ms}ms — ${found ? "✅ trouvé" : "❌ article: null"}` +
        (found ? ` — num réel: ${raw.article?.num}, état: ${raw.article?.etat}` : ""),
    );
    if (!found) {
      console.log(`         réponse brute: ${JSON.stringify(raw).slice(0, 300)}`);
    }
  } catch (err) {
    const ms = Date.now() - start;
    console.log(`[${i}/${attempts}] ${ms}ms — 💥 erreur: ${err instanceof Error ? err.message : String(err)}`);
  }
}

console.log(
  "\nSi un ou plusieurs appels échouent puis qu'un appel suivant (même num, même LEGITEXT) réussit : " +
    "hoquet transitoire confirmé côté PISTE/DILA — le correctif de cache de ce commit empêche déjà " +
    "qu'un tel échec ne reste figé 24h. Si TOUS les appels échouent de façon identique et répétée : " +
    "creuser côté Légifrance web (légifrance.gouv.fr) si le numéro L441-10 est bien la version en vigueur " +
    "à la date du jour, ou si une re-numérotation plus récente a eu lieu — marquer `[à vérifier]` en attendant.",
);
