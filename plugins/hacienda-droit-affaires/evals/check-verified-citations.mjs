#!/usr/bin/env node
// Contrôle « faux vérifié » : compare les citations que la réponse finale dit
// vérifiées aux articles réellement ramenés par legifrance_get_article dans la trace.
// Usage : node evals/check-verified-citations.mjs <kept-temp>/out/trace.jsonl [...]
// Heuristique ligne à ligne : relire à la main chaque écart signalé avant de conclure.
// Non signalés : articles couverts par une dénégation (« non lus », « à vérifier »,
// « introuvable »… juste après, ou avant faute d'affirmation qui suive), bornes de
// plage (« L.622-24 à L.622-33 ») et numéros de facture (« F-2025-1142 »). Tests : packages/core/test/check-verified-citations.test.ts.
// Code de sortie 1 si au moins une citation est dite vérifiée sans avoir été lue.

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const CLAIM = /vérifiée?s?(?! *\?)|en vigueur|Légifrance ✓|\[Légifrance\]/i;
const DENIAL = /à vérifier|non vérifi|non interrog|non consult|pas vérifi|non lus?\b|introuvable/i;
// Bornes d'une plage (« L.622-24 à L.622-33 ») : désignent une série, pas des articles cités.
const ART = '(?:[LRD]\\.?\\s?\\d+(?:-\\d+)+|\\b\\d{4}(?:-\\d+)*)';
const RANGE_END = new RegExp(`${ART}\\s+à\\s+$`);
const RANGE_START = new RegExp(`^${ART}\\s+à\\s+${ART}`);
// Numéro collé à un identifiant (« F-1142 », « F-2025-1198 ») : facture, pas article.
const IDENTIFIER_PREFIX = /[A-Za-z0-9]-$/;
const GLOBAL_CLAIM = /toutes les citations (sont|ont été) vérifiées/i;
// L./R./D. + numéro à tiret (« L.611 s. » désigne une série, pas un article), ou numéro nu
// du Code civil (1100-2600, hors 2020-2035 : années, n° de facture ; hors n° de texte « ord. 2014-326 »).
const ARTICLE = /\b([LRD])\.?\s?(\d+-\d+(?:-\d+)*)\b|\b(1[1-9]\d\d|2[0-5]\d\d)(-\d+)*\b/g;
const TEXT_NUMBER_PREFIX = /(ord\.|ordonnance|loi|décret|n°)\s*(n°\s*)?$/i;

const norm = (s) => s.replace(/\s|\./g, '').toUpperCase();

function articlesIn(text) {
  const out = [];
  for (const m of text.matchAll(ARTICLE)) {
    if (m[1]) out.push({ num: norm(m[1] + m[2]), index: m.index });
    else {
      const year = Number(m[3]);
      if (year >= 2020 && year <= 2035) continue; // années, périodes, n° de facture
      if (TEXT_NUMBER_PREFIX.test(text.slice(Math.max(0, m.index - 16), m.index))) continue;
      out.push({ num: norm(m[0]), index: m.index });
    }
  }
  return out;
}

// Marqueurs d'une ligne, dans l'ordre : dénégations d'abord, puis affirmations qui
// ne chevauchent pas une dénégation (« non vérifiés » n'est pas une affirmation).
function markers(line) {
  const denials = [...line.matchAll(new RegExp(DENIAL.source, 'gi'))].map((m) => ({
    type: 'denial', start: m.index, end: m.index + m[0].length,
  }));
  const claims = [...line.matchAll(new RegExp(CLAIM.source, 'gi'))]
    .map((m) => ({ type: 'claim', start: m.index, end: m.index + m[0].length }))
    .filter((c) => !denials.some((d) => c.start < d.end && d.start < c.end));
  return [...denials, ...claims].sort((a, b) => a.start - b.start);
}

// Un article est couvert par une dénégation si le premier marqueur qui le suit
// (dans les 120 caractères) en est une, ou, faute d'affirmation qui le suive,
// si le dernier marqueur qui le précède en est une (« à vérifier : 1104, 1130 »).
// La recherche porte sur toute la ligne : dans un tableau, le statut est souvent dans
// la cellule voisine (« | L.441-10 | [à vérifier] | »).
function denied(line, index) {
  const ms = markers(line);
  const after = ms.find((m) => m.start > index && m.start <= index + 120);
  if (after) return after.type === 'denial';
  const before = ms.filter((m) => m.end <= index).pop();
  return before?.type === 'denial';
}

export function findSuspects(answer, fetched) {
  const suspects = [];
  for (const [i, line] of answer.split('\n').entries()) {
    if (!CLAIM.test(line)) continue;
    for (const a of articlesIn(line)) {
      if (RANGE_END.test(line.slice(0, a.index)) || RANGE_START.test(line.slice(a.index))) continue;
      if (IDENTIFIER_PREFIX.test(line.slice(Math.max(0, a.index - 2), a.index))) continue;
      if (denied(line, a.index)) continue;
      if (!fetched.has(a.num)) suspects.push({ line: i + 1, num: a.num, text: line.trim().slice(0, 160) });
    }
  }
  return suspects;
}

function check(tracePath) {
  const events = readFileSync(tracePath, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const calls = new Map();
  const errored = new Set();
  let answer = '';
  for (const e of events) {
    for (const c of e.message?.content ?? []) {
      if (c.type === 'tool_use' && /legifrance_get_article$/.test(c.name)) calls.set(c.id, norm(String(c.input?.num ?? '')));
      if (c.type === 'tool_result' && c.is_error) errored.add(c.tool_use_id);
    }
    if (e.type === 'result') answer = e.result ?? '';
  }
  const fetched = new Set([...calls].filter(([id]) => !errored.has(id)).map(([, num]) => num));

  const suspects = findSuspects(answer, fetched);
  const globalClaim = GLOBAL_CLAIM.test(answer);
  const unread = globalClaim
    ? [...new Set(articlesIn(answer).map((a) => a.num))].filter((n) => !fetched.has(n))
    : [];

  console.log(`== ${tracePath}`);
  console.log(`   lus : ${[...fetched].sort().join(' ') || '(aucun)'}`);
  for (const s of suspects) console.log(`   ✗ l.${s.line} « ${s.num} » dit vérifié, non lu : ${s.text}`);
  if (globalClaim && unread.length) console.log(`   ✗ « toutes les citations sont vérifiées », mais non lus : ${unread.join(' ')}`);
  const bad = suspects.length > 0 || (globalClaim && unread.length > 0);
  if (!bad) console.log('   ✓ aucune citation dite vérifiée sans lecture');
  return bad;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const paths = process.argv.slice(2);
  if (!paths.length) {
    console.error('Usage : node evals/check-verified-citations.mjs <trace.jsonl> [...]');
    process.exit(2);
  }
  process.exit(paths.map(check).some(Boolean) ? 1 : 0);
}
