#!/usr/bin/env node
/**
 * Contrôle en réel que les filtres, valeurs et champs codés dans `packages/core`
 * correspondent à ce que renvoient les vraies API (Légifrance/PISTE, Judilibre,
 * EUR-Lex). Complète `check-bodacc-live.mjs`.
 *
 * Contexte : un filtre ou un champ qui ne correspond pas à la valeur réelle ne
 * provoque en général aucune erreur — l'API répond 0 résultat, ignore le filtre ou
 * le champ lu est vide.
 * Les tests unitaires ne peuvent pas le voir : seul l'appel réel le montre.
 *
 * Prérequis : `npm run build`, identifiants PISTE dans ~/.config/Hacienda/credentials.json
 * (jamais affichés). Usage : node scripts/check-sources-live.mjs
 * Sortie : code 0 si tout est cohérent, 1 sinon. Les pannes passagères d'une API
 * (délai dépassé) sont signalées « INCONNU » et ne font pas échouer le contrôle.
 */
import { loadConfig } from "../packages/core/dist/config.js";
import { PisteClient } from "../packages/core/dist/piste-client.js";
import { PisteHttpClient } from "../packages/core/dist/http.js";
import { buildSearchRequest } from "../packages/core/dist/search-builder.js";
import { canonicalCodeName, COMMON_CODES_LEGITEXT } from "../packages/core/dist/codes-legitext.js";
import { loadJudilibreConfig } from "../packages/core/dist/judilibre/config.js";
import { JudilibreClient } from "../packages/core/dist/judilibre/client.js";
import { formatJudilibreDecision, formatJudilibreSearch } from "../packages/core/dist/judilibre/format.js";
import { EurlexClient } from "../packages/core/dist/eurlex/client.js";

let failures = 0;
let unknown = 0;
const check = (ok, message) => {
  console.log(`${ok ? "OK  " : "FAIL"} ${message}`);
  if (!ok) failures += 1;
};
const skip = (message, err) => {
  console.log(`INCONNU ${message} (${String(err?.message ?? err).slice(0, 80)})`);
  unknown += 1;
};
const attempt = async (label, fn) => {
  for (let i = 0; i < 2; i += 1) {
    try {
      return await fn();
    } catch (err) {
      if (i === 1) skip(label, err);
    }
  }
  return undefined;
};

const cfg = loadConfig();
const http = new PisteHttpClient(cfg, new PisteClient(cfg));
const search = (body) => http.post("/search", body, { bypassCache: true });

console.log("== Légifrance /search ==");
// Filtre de date : doit réduire le total sur les fonds où il est accepté ; refusé ailleurs.
for (const [fond, query] of [["JURI", "cessation des paiements"], ["JORF", "décret"], ["LODA_DATE", "redressement judiciaire"], ["CIRC", "TVA"]]) {
  const sans = await attempt(`${fond} sans dates`, () => search(buildSearchRequest({ query, fond, pageSize: 1 })));
  const avec = await attempt(`${fond} avec dates`, () => search(buildSearchRequest({ query, fond, pageSize: 1, dateDebut: "2026-01-01", dateFin: "2026-02-01" })));
  if (sans && avec) check(avec.totalResultNumber < sans.totalResultNumber, `${fond} : le filtre de dates réduit le total (${sans.totalResultNumber} → ${avec.totalResultNumber})`);
}
for (const fond of ["ALL", "LODA_ETAT", "CODE_ETAT"]) {
  let refused = false;
  try {
    buildSearchRequest({ query: "x", fond, code: "Code civil", dateDebut: "2026-01-01" });
  } catch {
    refused = true;
  }
  check(refused, `${fond} : le filtre de dates est refusé explicitement (l'API le rejette ou l'ignore)`);
}
// Nom de code : le filtre est sensible à la casse ; le plugin envoie le nom officiel.
let codesKo = 0;
for (const name of Object.keys(COMMON_CODES_LEGITEXT)) {
  const r = await attempt(`code ${name}`, () => search(buildSearchRequest({ query: "article", fond: "CODE_ETAT", code: canonicalCodeName(name), pageSize: 1 })));
  if (r && !(r.totalResultNumber > 0)) {
    codesKo += 1;
    console.log(`     0 résultat pour « ${name} » → « ${canonicalCodeName(name)} »`);
  }
}
check(codesKo === 0, `les ${Object.keys(COMMON_CODES_LEGITEXT).length} noms de codes connus (minuscules / alias) donnent des résultats`);

console.log("\n== Légifrance /consult ==");
const loi = await attempt("lawDecree", () => http.post("/consult/lawDecree", { textId: "JORFTEXT000000886460", date: new Date().toISOString().slice(0, 10) }, { bypassCache: true }));
if (loi) {
  check(Boolean(loi.jurisState), `lawDecree renvoie jurisState (« ${loi.jurisState} »), le champ lu par le plugin`);
  check(Boolean(loi.dateDebutVersion), `lawDecree renvoie dateDebutVersion (« ${loi.dateDebutVersion} »)`);
  const { describeVigueur } = await import("../packages/core/dist/format.js");
  check(describeVigueur(loi).length > 0, `describeVigueur affiche l'état : ${JSON.stringify(describeVigueur(loi))}`);
}

console.log("\n== Judilibre ==");
const jcfg = loadJudilibreConfig();
if (!jcfg.keyId) {
  skip("Judilibre : clé absente", "aucun identifiant");
} else {
  const j = new JudilibreClient(jcfg);
  const tax = async (id) => {
    const r = await fetch(`${jcfg.baseUrl}/taxonomy?id=${id}`, {
      headers: { accept: "application/json", KeyId: jcfg.keyId },
      signal: AbortSignal.timeout(15_000),
    });
    // Une panne ou une clé expirée doit donner « INCONNU » via attempt(), pas une liste vide
    // qui ferait échouer à tort le contrôle des valeurs.
    if (!r.ok) throw new Error(`HTTP ${r.status} sur /taxonomy?id=${id}`);
    return Object.keys((await r.json()).result ?? {});
  };
  const chambers = await attempt("taxonomie chamber", () => tax("chamber"));
  if (chambers) check(["comm", "soc", "civ1"].every((c) => chambers.includes(c)), `valeurs de chambre attendues présentes dans la taxonomie (${chambers.length})`);
  const res = await attempt("recherche chambre commerciale", () => j.search({ query: "cessation des paiements", chamber: "comm", dateStart: "2026-01-01", pageSize: 5 }));
  if (res) {
    check(res.total > 0 && res.results.every((r) => r.chamber === "comm"), `chamber=comm + dateStart : ${res.total} décisions, toutes en chambre commerciale`);
    const md = formatJudilibreSearch(res, "x");
    check(/Date : \d{4}-\d{2}-\d{2}/.test(md), "la recherche affiche la date de chaque décision");
    const d = await attempt("décision", () => j.getDecision(res.results[0].id));
    if (d?.decision_date) {
      const dmd = formatJudilibreDecision(d, d.id);
      check(dmd.includes(`Date : ${d.decision_date}`), `la consultation affiche decision_date (${d.decision_date}), pas le horodatage UTC (${d.decision_datetime})`);
    }
  }
}

console.log("\n== EUR-Lex ==");
const eu = new EurlexClient();
let crashed = 0;
let total = 0;
for (const query of ["restructuration préventive", "protection des données", "délais de paiement", "insolvabilité"]) {
  for (const resourceType of ["any", "directive", "case-law"]) {
    total += 1;
    try {
      await eu.search({ query, resourceType, limit: 10 });
    } catch (err) {
      if (/CELEX invalide/.test(err.message)) crashed += 1;
      else skip(`recherche « ${query} » (${resourceType})`, err);
    }
  }
}
check(crashed === 0, `recherche : aucun plantage « CELEX invalide » sur ${total} requêtes`);
const meta = await attempt("métadonnées RGPD", () => eu.metadata("32016R0679"));
if (meta) {
  check(meta.resourceType === "regulation", `type d'acte du RGPD = ${meta.resourceType}`);
  check(meta.eurovoc.length > 0, `EuroVoc du RGPD : ${meta.eurovoc.length} concept(s) en métadonnées`);
}
const ev = await attempt("EuroVoc RGPD", () => eu.eurovoc({ celexId: "32016R0679", limit: 5 }));
if (ev) check(ev.length > 0, `eurlex_eurovoc renvoie des concepts (${ev.map((c) => c.label).slice(0, 2).join(", ")}…)`);
const amend = await attempt("relations amended_by", () => eu.relations({ celexId: "32017L1132", relation: "amended_by", limit: 10 }));
if (amend) check(amend.some((r) => r.sourceCelexId === "32019L1023"), "amended_by 32017L1132 contient la directive 2019/1023 (acte modificatif réel)");
const cons = await attempt("versions consolidées", () => eu.consolidatedVersions("32017L1132"));
if (cons) check(cons.length > 0 && cons.every((v) => v.celexId.startsWith("02017L1132-")), `versions consolidées : ${cons.length}, toutes de l'acte demandé`);

console.log(
  failures === 0
    ? `\nSources : cohérent${unknown ? ` (${unknown} contrôle(s) inconnu(s) : panne passagère d'une API)` : ""}.`
    : `\nSources : ${failures} contrôle(s) en échec.`,
);
process.exit(failures === 0 ? 0 : 1);
