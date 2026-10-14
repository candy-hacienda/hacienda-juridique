import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Cowork refuse à l'installation un plugin qui dépasse ces longueurs
// (« Plugin failed validation »), alors que `claude plugin validate` ne les
// contrôle pas. La limite des skills est aussi celle du format standard utilisé
// par Codex.
const PLUGIN_DESCRIPTION_MAX = 500;
const SKILL_DESCRIPTION_MAX = 1024;
const COMMAND_DESCRIPTION_MAX = 500;

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const pluginsDir = resolve(root, "plugins");

/** Valeur d'une clé du frontmatter, y compris en bloc replié (`key: >`). */
export function frontmatterText(content: string, key: string): string | undefined {
  const stripped = content.replace(/^﻿/, "").replace(/\r\n/g, "\n");
  const frontmatter = stripped.match(/^---\n([\s\S]*?)\n---/)?.[1];
  if (!frontmatter) return undefined;
  const lines = frontmatter.split("\n");
  const start = lines.findIndex((line) => line.startsWith(`${key}:`));
  if (start === -1) return undefined;
  const inline = lines[start].slice(key.length + 1).trim();
  if (!/^[>|]-?$/.test(inline)) return inline.replace(/^["']|["']$/g, "");
  const block: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (line.trim() && !line.startsWith(" ")) break;
    block.push(line.trim());
  }
  return block.filter(Boolean).join(" ");
}

function markdownFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((entry) => {
    const path = resolve(dir, entry);
    if (statSync(path).isDirectory()) return markdownFiles(path);
    return extname(entry) === ".md" ? [path] : [];
  });
}

const plugins = readdirSync(pluginsDir).filter((name) =>
  existsSync(resolve(pluginsDir, name, ".claude-plugin/plugin.json"))
);

describe("limites de longueur des descriptions (installation Cowork)", () => {
  it.each(plugins)("%s respecte les limites", (plugin) => {
    const pluginDir = resolve(pluginsDir, plugin);
    const manifest = JSON.parse(
      readFileSync(resolve(pluginDir, ".claude-plugin/plugin.json"), "utf8")
    ) as { description?: string };
    const overLimit: string[] = [];

    if ((manifest.description ?? "").length > PLUGIN_DESCRIPTION_MAX) {
      overLimit.push(`plugin.json (${manifest.description!.length} > ${PLUGIN_DESCRIPTION_MAX})`);
    }
    for (const file of markdownFiles(resolve(pluginDir, "skills"))) {
      if (!file.endsWith("SKILL.md")) continue;
      const length = frontmatterText(readFileSync(file, "utf8"), "description")?.length ?? 0;
      if (length > SKILL_DESCRIPTION_MAX) overLimit.push(`${file} (${length} > ${SKILL_DESCRIPTION_MAX})`);
    }
    for (const file of markdownFiles(resolve(pluginDir, "commands"))) {
      const length = frontmatterText(readFileSync(file, "utf8"), "description")?.length ?? 0;
      if (length > COMMAND_DESCRIPTION_MAX) overLimit.push(`${file} (${length} > ${COMMAND_DESCRIPTION_MAX})`);
    }

    expect(overLimit).toEqual([]);
  });

  it("lit une description en bloc replié", () => {
    const content = "---\ndescription: >\n  Première ligne\n  seconde ligne.\nversion: \"1\"\n---\n";
    expect(frontmatterText(content, "description")).toBe("Première ligne seconde ligne.");
  });
});
