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
