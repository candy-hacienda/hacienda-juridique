# Packaging Marketplace Cowork

## Objectif

La distribution Cowork Hacienda produit deux artefacts propres :

- un dossier marketplace installable, avec `.claude-plugin/marketplace.json` et
  `plugins/<plugin>/` ;
- un ZIP par plugin, utilisable pour l'upload Cowork / Claude Code quand le
  client installe un plugin isolé.

Ces ZIP ne sont pas des bundles MCPB. Les `.mcpb` restent réservés aux serveurs
MCP locaux installés comme connecteurs Claude Desktop.

## Commande

```bash
npm run plugin:package-cowork
```

Sortie par défaut :

```text
dist-pkg/cowork-marketplace/
  .claude-plugin/marketplace.json
  plugins/
    registry.json
    hacienda-sources-officielles/
    hacienda-recherche-documentaire/
    hacienda-propriete-intellectuelle/
  zips/
    hacienda-sources-officielles.zip
    hacienda-recherche-documentaire.zip
    hacienda-propriete-intellectuelle.zip
```

Pour générer un seul plugin :

```bash
npm run plugin:package-cowork -- --plugin hacienda-propriete-intellectuelle
```

Pour choisir le dossier de sortie :

```bash
npm run plugin:package-cowork -- --out dist-pkg/release-client
```

## Règles D'inclusion

Chaque dossier plugin exporté conserve :

- `.claude-plugin/plugin.json` ;
- `.mcp.json` ;
- `CLAUDE.md` ;
- `README.md` ;
- `skills/**/SKILL.md` et leurs références ;
- `agents/*.md` quand présents ;
- `commands/**/*.md` quand présents (commandes `/h-da:…`) ;
- `hooks/hooks.json` ;
- `scripts/` : les scripts que `hooks/hooks.json` référence (ex. `scripts/inject-regles.cjs`,
  qui injecte les règles du `CLAUDE.md`, non chargé automatiquement) ;
- `mcp-server/dist/mcpb-index.cjs` et `mcp-server/package.json` uniquement
  quand le plugin déclare un serveur stdio embarqué.

Sont exclus des dossiers exportés et des ZIP :

- `manifest.json` MCPB ;
- `.mcpbignore` ;
- `logs/` ;
- `.cache/` ;
- `node_modules/` ;
- sources TypeScript `mcp-server/src/` ;
- `mcp-server/tsconfig.json` ;
- anciens bundles `mcp-server/dist/index.js` et `version.js` ;
- fichiers `.bak`, `.log`, `.zip`, `.rar`, `.mcpb`.

## Validation

Avant distribution :

```bash
npm run plugin:validate
npm run plugin:package-cowork
npm test
npm run typecheck
npm run build
npm run branding:check
git diff --check
```

Pour tester un ZIP localement :

```bash
claude --plugin-dir dist-pkg/cowork-marketplace/zips/hacienda-propriete-intellectuelle.zip --print "plugin charge"
```
