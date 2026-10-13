import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  EspacenetClient,
  type EspacenetSearchResponse,
} from "../sources/espacenet.js";
import { pseudonymizedDateResult } from "./date-input.js";

export const EspacenetSearchArgsSchema = z.object({
  query: z.string().min(1),
  cib: z.array(z.string()).optional(),
  datePublicationMin: z.string().optional(),
  datePublicationMax: z.string().optional(),
  limite: z.number().int().min(1).max(100).default(25),
});
export type EspacenetSearchArgs = z.infer<typeof EspacenetSearchArgsSchema>;

function formatSearch(
  res: EspacenetSearchResponse,
  args: EspacenetSearchArgs
): string {
  const lignes = res.resultats.map((b) =>
    [
      `- **${b.titre}** [${b.numero}] (${b.type})`,
      `  - déposant : ${b.deposant}`,
      `  - publication : ${b.datePublication} · priorité : ${b.datePriorite ?? "_n/a_"}`,
      `  - classification CIB : ${b.classificationCIB.join(", ") || "_n/a_"}`,
      `  - lien : ${b.urlEspacenet}`,
    ].join("\n")
  );
  return [
    `# Recherche Espacenet [OEB Espacenet]`,
    ``,
    `**Requête :** "${args.query}" · CIB ${args.cib?.join(", ") ?? "toutes"} · publication ${args.datePublicationMin ?? "*"} → ${args.datePublicationMax ?? "*"}`,
    `**Résultats :** ${res.resultats.length} sur ${res.totalCount}`,
    ``,
    ...lignes,
  ].join("\n");
}

export async function callEspacenetSearch(
  args: EspacenetSearchArgs,
  client: EspacenetClient | null
): Promise<string> {
  if (!client) {
    return [
      `**OEB not configured** — OEB_CONSUMER_KEY / OEB_CONSUMER_SECRET absents.`,
      `Action: ajouter ces secrets dans \`~/.config/Hacienda/credentials.json\` ou dans l'environnement du process MCP.`,
    ].join("\n");
  }
  const res = await client.search(args);
  return formatSearch(res, args);
}

export function registerEspacenetSearch(
  server: McpServer,
  client: EspacenetClient | null
): void {
  server.tool(
    "espacenet_search",
    EspacenetSearchArgsSchema.shape,
    async (raw) =>
      pseudonymizedDateResult(raw, { datePublicationMin: "filtre", datePublicationMax: "filtre" }) ?? {
        content: [
          {
            type: "text",
            text: await callEspacenetSearch(
              EspacenetSearchArgsSchema.parse(raw),
              client
            ),
          },
        ],
      }
  );
}
