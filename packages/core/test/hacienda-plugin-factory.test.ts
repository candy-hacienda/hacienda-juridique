import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const cliPath = resolve(root, "tools/hacienda-plugin-factory/dist/create-plugin.js");
const addSkillCliPath = resolve(root, "tools/hacienda-plugin-factory/dist/add-skill.js");
const addAgentCliPath = resolve(root, "tools/hacienda-plugin-factory/dist/add-agent.js");
const packageCliPath = resolve(root, "tools/hacienda-plugin-factory/dist/package-plugin.js");
const tscPath = resolve(root, "node_modules/typescript/bin/tsc");

function run(command: string, args: string[]) {
  return spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    windowsHide: true
  });
}

function read(path: string): string {
  return readFileSync(path, "utf8");
}

describe("hacienda plugin factory create CLI", () => {
  beforeAll(() => {
    const result = run(process.execPath, [
      tscPath,
      "-p",
      resolve(root, "tools/hacienda-plugin-factory")
    ]);

    expect(result.status, result.error?.message || result.stderr || result.stdout).toBe(0);
  }, 30000);

  it("cree un skeleton de plugin Hacienda dans un root temporaire", () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "hacienda-plugin-factory-"));
    const result = run(process.execPath, [
      cliPath,
      "--name",
      "hacienda-test-skeleton",
      "--type",
      "legal-domain",
      "--description",
      "Plugin test CLI.",
      "--root",
      tempRoot
    ]);

    expect(result.status, result.stderr || result.stdout).toBe(0);

    const pluginDir = resolve(tempRoot, "plugins/hacienda-test-skeleton");
    expect(existsSync(resolve(pluginDir, "agents"))).toBe(true);

    const manifest = JSON.parse(
      read(resolve(pluginDir, ".claude-plugin/plugin.json"))
    ) as {
      name?: string;
      description?: string;
      author?: { name?: string; url?: string };
      repository?: string;
      license?: string;
    };
    const mcp = JSON.parse(read(resolve(pluginDir, ".mcp.json"))) as {
      mcpServers?: Record<string, unknown>;
    };
    const hooks = JSON.parse(read(resolve(pluginDir, "hooks/hooks.json"))) as {
      hooks?: Record<string, unknown>;
    };

    expect(manifest.name).toBe("hacienda-test-skeleton");
    expect(manifest.description).toBe("Plugin test CLI.");
    expect(manifest.author?.name).toBe("Hacienda");
    expect(manifest.author?.url).toBe("https://hacienda.diy");
    expect(manifest.repository).toBe("https://github.com/jamon8888/hacienda-juridique");
    expect(manifest.license).toBe("AGPL-3.0-or-later");
    expect(Object.keys(mcp.mcpServers ?? {})).toContain("Hacienda Sources Officielles");
    expect(hooks.hooks).toEqual({});

    const readme = read(resolve(pluginDir, "README.md"));
    expect(readme).toContain("Plugin test CLI.");
    expect(readme).toContain("/h-test-skeleton:entretien-demarrage");
    expect(readme).not.toContain("/hacienda-test-skeleton:entretien-demarrage");
    expect(read(resolve(pluginDir, "CLAUDE.md"))).toContain("validation humaine");
    const generatedSkill = read(resolve(pluginDir, "skills/entretien-demarrage/SKILL.md"));
    expect(generatedSkill).toContain("[à vérifier]");
    expect(generatedSkill).toMatch(/^---\n/);
    expect(generatedSkill).not.toContain("\r\n");
  }, 30000);

  it("genere l'alias court h-pi pour le plugin propriete intellectuelle", () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "hacienda-plugin-factory-"));
    const result = run(process.execPath, [
      cliPath,
      "--name",
      "hacienda-propriete-intellectuelle",
      "--type",
      "legal-domain-with-mcp",
      "--description",
      "Plugin PI test.",
      "--root",
      tempRoot
    ]);

    expect(result.status, result.stderr || result.stdout).toBe(0);

    const readme = read(
      resolve(tempRoot, "plugins/hacienda-propriete-intellectuelle/README.md")
    );

    expect(readme).toContain("/h-pi:entretien-demarrage");
    expect(readme).not.toContain("/h-propriete-intellectuelle:entretien-demarrage");
  }, 30000);

  it("ajoute un skill et un agent dans un plugin temporaire", () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "hacienda-plugin-factory-"));
    const createResult = run(process.execPath, [
      cliPath,
      "--name",
      "hacienda-test-skeleton",
      "--type",
      "legal-domain",
      "--description",
      "Plugin test CLI.",
      "--root",
      tempRoot
    ]);

    expect(createResult.status, createResult.stderr || createResult.stdout).toBe(0);

    const addSkillResult = run(process.execPath, [
      addSkillCliPath,
      "--plugin",
      "hacienda-test-skeleton",
      "--skill",
      "analyse-test",
      "--root",
      tempRoot
    ]);
    const addAgentResult = run(process.execPath, [
      addAgentCliPath,
      "--plugin",
      "hacienda-test-skeleton",
      "--agent",
      "veilleur-test",
      "--root",
      tempRoot
    ]);

    expect(addSkillResult.status, addSkillResult.stderr || addSkillResult.stdout).toBe(0);
    expect(addAgentResult.status, addAgentResult.stderr || addAgentResult.stdout).toBe(0);

    const skill = read(
      resolve(tempRoot, "plugins/hacienda-test-skeleton/skills/analyse-test/SKILL.md")
    );
    const agent = read(
      resolve(tempRoot, "plugins/hacienda-test-skeleton/agents/veilleur-test.md")
    );

    expect(skill).toContain("validation humaine");
    expect(skill).toContain("[à vérifier]");
    expect(skill).toContain("conseil juridique final");
    expect(skill).toMatch(/^---\n/);
    expect(skill).not.toContain("\r\n");
    expect(agent).toContain("validation humaine");
    expect(agent).toContain("[à vérifier]");
    expect(agent).toContain("pas de conseil juridique final");
  }, 30000);

  it("refuse d'ajouter un skill ou agent dans un plugin inexistant", () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "hacienda-plugin-factory-"));
    const addSkillResult = run(process.execPath, [
      addSkillCliPath,
      "--plugin",
      "hacienda-plugin-absent",
      "--skill",
      "analyse-test",
      "--root",
      tempRoot
    ]);
    const addAgentResult = run(process.execPath, [
      addAgentCliPath,
      "--plugin",
      "hacienda-plugin-absent",
      "--agent",
      "veilleur-test",
      "--root",
      tempRoot
    ]);

    expect(addSkillResult.status).toBe(1);
    expect(addSkillResult.stderr).toContain("Plugin does not exist or is missing manifest");
    expect(addAgentResult.status).toBe(1);
    expect(addAgentResult.stderr).toContain("Plugin does not exist or is missing manifest");
    expect(existsSync(resolve(tempRoot, "plugins/hacienda-plugin-absent"))).toBe(false);
  }, 30000);

  it("refuse un nom hors prefixe hacienda", () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "hacienda-plugin-factory-"));
    const result = run(process.execPath, [
      cliPath,
      "--name",
      "test-skeleton",
      "--type",
      "legal-domain",
      "--description",
      "Plugin test CLI.",
      "--root",
      tempRoot
    ]);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Plugin name must start with hacienda-");
  }, 30000);

  it("genere une distribution Cowork marketplace avec dossiers installables et ZIP propres", async () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "hacienda-plugin-package-"));
    const outputDir = resolve(tempRoot, "cowork-marketplace");
    const result = run(process.execPath, [packageCliPath, "--out", outputDir]);

    expect(result.status, result.stderr || result.stdout).toBe(0);

    const marketplace = JSON.parse(
      read(resolve(outputDir, ".claude-plugin/marketplace.json"))
    ) as { plugins?: Array<{ name?: string; source?: string }> };
    const pluginNames = marketplace.plugins?.map((plugin) => plugin.name).sort();

    expect(pluginNames).toEqual([
      "hacienda-droit-affaires",
      "hacienda-propriete-intellectuelle",
      "hacienda-recherche-documentaire",
      "hacienda-sources-officielles"
    ]);
    expect(
      marketplace.plugins?.every((plugin) => plugin.source === `./plugins/${plugin.name}`)
    ).toBe(true);

    const piDir = resolve(outputDir, "plugins/hacienda-propriete-intellectuelle");
    const droitAffairesDir = resolve(outputDir, "plugins/hacienda-droit-affaires");
    expect(existsSync(resolve(piDir, ".claude-plugin/plugin.json"))).toBe(true);
    expect(existsSync(resolve(piDir, ".mcp.json"))).toBe(true);
    expect(existsSync(resolve(piDir, "skills/entretien-demarrage/SKILL.md"))).toBe(true);
    expect(existsSync(resolve(piDir, "mcp-server/dist/mcpb-index.cjs"))).toBe(true);
    expect(existsSync(resolve(piDir, "manifest.json"))).toBe(false);
    expect(existsSync(resolve(piDir, "logs/README.md"))).toBe(false);
    expect(existsSync(resolve(piDir, "mcp-server/src/index.ts"))).toBe(false);
    expect(existsSync(resolve(piDir, "mcp-server/dist/index.js"))).toBe(false);
    expect(existsSync(resolve(droitAffairesDir, "mcp-server/dist/mcpb-index.cjs"))).toBe(true);
    expect(existsSync(resolve(droitAffairesDir, "mcp-server/src/index.ts"))).toBe(false);
    expect(existsSync(resolve(droitAffairesDir, "mcp-server/dist/index.js"))).toBe(false);

    const sourcesDir = resolve(outputDir, "plugins/hacienda-sources-officielles");
    expect(existsSync(resolve(sourcesDir, ".claude-plugin/plugin.json"))).toBe(true);
    expect(existsSync(resolve(sourcesDir, "mcp-server/dist/mcpb-index.cjs"))).toBe(false);

    const { readZipEntryNames } = (await import(
      "../../../tools/hacienda-plugin-factory/dist/package-plugin.js"
    )) as {
      readZipEntryNames: (path: string) => string[];
    };
    const piZip = resolve(outputDir, "zips/hacienda-propriete-intellectuelle.zip");
    const piEntries = readZipEntryNames(piZip);

    expect(piEntries).toContain(".claude-plugin/plugin.json");
    expect(piEntries).toContain(".mcp.json");
    expect(piEntries).toContain("mcp-server/dist/mcpb-index.cjs");
    expect(piEntries.some((entry) => entry.startsWith("hacienda-propriete-intellectuelle/"))).toBe(
      false
    );
    expect(piEntries.some((entry) => entry.includes("\\"))).toBe(false);
    expect(piEntries.some((entry) => entry === "manifest.json")).toBe(false);
    expect(piEntries.some((entry) => entry.startsWith("logs/"))).toBe(false);
    expect(piEntries.some((entry) => entry.startsWith("mcp-server/src/"))).toBe(false);
    expect(piEntries.some((entry) => entry.endsWith(".bak"))).toBe(false);

    const droitAffairesZip = resolve(outputDir, "zips/hacienda-droit-affaires.zip");
    const droitAffairesEntries = readZipEntryNames(droitAffairesZip);

    expect(droitAffairesEntries).toContain("mcp-server/dist/mcpb-index.cjs");
    expect(droitAffairesEntries).toContain("commands/h-da/declaration-creance.md");
    expect(droitAffairesEntries.some((entry) => entry.startsWith("evals/"))).toBe(false);
    expect(droitAffairesEntries.some((entry) => entry === "manifest.json")).toBe(false);
    expect(droitAffairesEntries.some((entry) => entry.startsWith("logs/"))).toBe(false);
    expect(droitAffairesEntries.some((entry) => entry.startsWith("mcp-server/src/"))).toBe(false);
    expect(droitAffairesEntries.some((entry) => entry.endsWith(".bak"))).toBe(false);
  }, 30000);
});
