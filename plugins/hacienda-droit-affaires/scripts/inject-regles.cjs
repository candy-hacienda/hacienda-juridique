#!/usr/bin/env node
// Hook SessionStart : injecte dans le contexte les règles transversales du
// CLAUDE.md du plugin, qui n'est pas chargé automatiquement (ni par Claude Code
// ni par Cowork). CLAUDE.md reste la seule source : rien n'est recopié.
// Chaque champ additionalContext est plafonné à 10 000 caractères, d'où deux
// parties : « sorties » (section 2) et « garde-fous » (sections 3 à 10).
// Ne bloque jamais la session : en cas d'anomalie, sortie vide et code 0.
"use strict";
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const PARTS = {
  sorties: { sections: [2], title: "format des sorties et note du relecteur" },
  "garde-fous": { sections: [3, 4, 5, 6, 7, 8, 9, 10], title: "garde-fous, sources et proportionnalité" }
};
const CAP = 10_000;

function main() {
  const part = PARTS[process.argv[2]];
  const root = process.env.CLAUDE_PLUGIN_ROOT;
  if (!part || !root) return;
  const text = readFileSync(join(root, "CLAUDE.md"), "utf8").replace(/\r\n/g, "\n");
  const sections = text.split(/^(?=## \d+\. )/m).filter((block) => /^## \d+\. /.test(block));
  const kept = sections.filter((block) => part.sections.includes(Number(block.match(/^## (\d+)\./)[1])));
  if (kept.length === 0) return;
  const intro =
    `Règles de travail du plugin Hacienda Droit des Affaires (${part.title}), ` +
    "extraites du CLAUDE.md du plugin. Ce sont les conventions de ce plugin pour tous ses skills.\n\n";
  const context = intro + kept.join("").trim();
  if (context.length >= CAP) return;
  process.stdout.write(
    JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: context } })
  );
}

try {
  main();
} catch {
  // Hook sans effet plutôt que session bloquée.
}
