import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  InpiClient,
  type InpiPublicationsRecentesResponse,
} from "../sources/inpi-marques.js";
import { ISO_DATE_OR_TOKEN, pseudonymizedDateResult } from "./date-input.js";

export const InpiMarquesPublicationsRecentesArgsSchema = z.object({
  since: z.string().regex(ISO_DATE_OR_TOKEN),
  classes: z.array(z.string()).optional(),
  motCle: z.string().optional(),
  titulaire: z.string().optional(),
  limite: z.number().int().min(1).max(200).default(50),
});
export type InpiMarquesPublicationsRecentesArgs =
  z.infer<typeof InpiMarquesPublicationsRecentesArgsSchema>;

function joursRestants(dateLimite: string, today = new Date()): number {
  const limite = new Date(dateLimite);
  return Math.ceil((limite.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function severite(jours: number): string {
  if (jours < 30) return "🔴";
  if (jours < 60) return "🟠";
  return "🟡";
}

function format(
  res: InpiPublicationsRecentesResponse,
  args: InpiMarquesPublicationsRecentesArgs
): string {
  const lignes = res.publications.map(p => {
    const j = joursRestants(p.dateOpposition_limite);
    const sev = severite(j);
    return `- ${sev} **${p.signe}** [${p.numero}] · classes ${p.classes.join(", ")} · titulaire ${p.titulaire} · publié ${p.datePublication} · **opposition jusqu'au ${p.dateOpposition_limite}** (${j} j restants)`;
  });
  return [
    `# Publications INPI récentes [INPI Data — publications récentes]`,
    ``,
    `**Fenêtre :** depuis ${args.since}${args.classes?.length ? ` · classes ${args.classes.join(", ")}` : ""}${args.motCle ? ` · motCle "${args.motCle}"` : ""}${args.titulaire ? ` · titulaire "${args.titulaire}"` : ""}`,
    `**Résultats :** ${res.publications.length} sur ${res.total}`,
    `**Base INPI mise à jour :** ${res.dateMaxBase}`,
    ``,
    `**Sévérité (délai opposition CPI L.712-4) :** 🔴 < 30 j · 🟠 30-60 j · 🟡 > 60 j`,
    ``,
    ...lignes,
  ].join("\n");
}

export async function callInpiMarquesPublicationsRecentes(
  args: InpiMarquesPublicationsRecentesArgs,
  client: InpiClient | null
): Promise<string> {
  if (!client) {
    return [
      `**INPI not configured** — INPI_DATA_LOGIN / INPI_DATA_PASSWORD absents.`,
      `Action: ajouter ces secrets dans \`~/.config/Hacienda/credentials.json\` ou dans l'environnement du process MCP.`,
    ].join("\n");
  }
  const res = await client.marquesPublicationsRecentes(args);
  return format(res, args);
}

export function registerInpiMarquesPublicationsRecentes(
  server: McpServer,
  client: InpiClient | null
): void {
  server.tool(
    "inpi_marques_publications_recentes",
    InpiMarquesPublicationsRecentesArgsSchema.shape,
    async (raw) =>
      pseudonymizedDateResult(raw, { since: "filtre" }) ?? {
        content: [{
          type: "text",
          text: await callInpiMarquesPublicationsRecentes(
            InpiMarquesPublicationsRecentesArgsSchema.parse(raw),
            client
          ),
        }],
      }
  );
}
