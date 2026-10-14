import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Le CLAUDE.md d'un plugin n'est pas chargé en contexte (ni par Claude Code ni
// par Cowork) : un hook SessionStart en injecte les règles transversales. Chaque
// champ additionalContext est plafonné à 10 000 caractères, d'où deux hooks.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const pluginRoot = resolve(root, "plugins/hacienda-droit-affaires");
const script = resolve(pluginRoot, "scripts/inject-regles.cjs");
const CAP = 10_000;

function inject(part: string, pluginDir = pluginRoot) {
  const result = spawnSync(process.execPath, [script, part], {
    env: { ...process.env, CLAUDE_PLUGIN_ROOT: pluginDir },
    encoding: "utf8"
  });
  return { ...result, json: result.stdout ? JSON.parse(result.stdout) : null };
}

describe("hook SessionStart des règles transversales (droit des affaires)", () => {
  it("injecte la section 2 (sorties standardisées) sous le plafond", () => {
    const { status, json } = inject("sorties");
    expect(status).toBe(0);
    expect(json.hookSpecificOutput.hookEventName).toBe("SessionStart");
    const context = json.hookSpecificOutput.additionalContext as string;
    expect(context.length).toBeLessThan(CAP);
    expect(context).toContain("Note du relecteur");
    expect(context).toContain("« Vérifié » veut dire « lu dans cette session »");
  });

  it("injecte les sections 3 à 10 (garde-fous, dossier fictif) sous le plafond", () => {
    const { status, json } = inject("garde-fous");
    expect(status).toBe(0);
    const context = json.hookSpecificOutput.additionalContext as string;
    expect(context.length).toBeLessThan(CAP);
    expect(context).toContain("Raisonnement à ne pas tenir");
    expect(context).toContain("Sources prioritaires");
  });

  it("n'injecte ni le modèle de profil (section 1) ni les workspaces désactivés (section 11)", () => {
    for (const part of ["sorties", "garde-fous"]) {
      const context = inject(part).json.hookSpecificOutput.additionalContext as string;
      expect(context).not.toContain("[A CONFIGURER");
      expect(context).not.toContain("Workspaces de dossier");
    }
  });

  it("ne bloque jamais la session : sortie vide si CLAUDE.md est introuvable ou partie inconnue", () => {
    const missing = inject("sorties", resolve(root, "plugins/hacienda-sources-officielles"));
    expect(missing.status).toBe(0);
    expect(missing.stdout).toBe("");
    expect(missing.stderr).toContain("règles non injectées");
    const unknown = inject("inconnue");
    expect(unknown.status).toBe(0);
    expect(unknown.stdout).toBe("");
  });

  it("est branché dans hooks.json via CLAUDE_PLUGIN_ROOT, sans chemin absolu", () => {
    const raw = readFileSync(resolve(pluginRoot, "hooks/hooks.json"), "utf8");
    const hooks = JSON.parse(raw) as {
      hooks: { SessionStart?: Array<{ hooks: Array<{ command: string; args?: string[] }> }> };
    };
    const commands = (hooks.hooks.SessionStart ?? []).flatMap((entry) => entry.hooks);
    const parts = commands.map((hook) => hook.args?.at(-1));
    expect(parts).toEqual(["sorties", "garde-fous"]);
    for (const hook of commands) {
      expect(hook.args?.[0]).toBe("${CLAUDE_PLUGIN_ROOT}/scripts/inject-regles.cjs");
    }
    expect(raw).not.toMatch(/\/Users\/|\/home\//);
    expect(existsSync(script)).toBe(true);
  });
});
